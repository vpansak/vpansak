import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { otpCodes, passwordResets } from "../../../../../db/schema";

function hashOtp(otp: string): string {
  const salt = "vpansak_secure_otp_salt_2026";
  return crypto.pbkdf2Sync(otp, salt, 10000, 32, "sha256").toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();

    if (!email || !code || code.length !== 6) {
      return Response.json({ error: "Please enter the complete 6-digit verification code." }, { status: 400 });
    }

    const db = await getDb();
    const [latestOtp] = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.email, email))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!latestOtp || latestOtp.used) {
      return Response.json({ error: "No active verification code found. Please request a new code." }, { status: 400 });
    }

    if (latestOtp.attempts >= 5) {
      return Response.json(
        { error: "Too many incorrect attempts. Please request a new code or use your security question." },
        { status: 429 }
      );
    }

    if (new Date(latestOtp.expiresAt) < new Date()) {
      return Response.json(
        { error: "This verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const hashedInput = hashOtp(code);
    const isMatch = latestOtp.code === hashedInput || latestOtp.code === code;

    if (!isMatch) {
      await db
        .update(otpCodes)
        .set({ attempts: latestOtp.attempts + 1 })
        .where(eq(otpCodes.id, latestOtp.id));

      return Response.json({ error: "The verification code is incorrect." }, { status: 400 });
    }

    // Invalidate OTP
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, latestOtp.id));

    // Generate single-use reset authorization token
    const resetToken = "RST-" + crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await db.insert(passwordResets).values({
      email,
      code: resetToken,
      expiresAt,
      used: false,
    });

    return Response.json({
      ok: true,
      email,
      resetToken,
      message: "Email verified successfully.",
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return Response.json({ error: "We couldn’t complete your request right now. Please try again." }, { status: 500 });
  }
}
