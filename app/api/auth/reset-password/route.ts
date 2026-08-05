import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { otpCodes, users } from "../../../../db/schema";
import { hashPassword } from "../../../lib/auth-session";
import { validatePasswordStrength } from "../signup/route";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim().replace(/\D/g, "");
    const newPassword = String(body.newPassword || "").trim();

    if (!email || !code || !newPassword) {
      return Response.json({ error: "Email, reset code and new password are required." }, { status: 400 });
    }

    const passCheck = validatePasswordStrength(newPassword);
    if (!passCheck.isValid) {
      return Response.json({ error: passCheck.message }, { status: 400 });
    }

    const db = await getDb();

    // Verify OTP code
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.email, email), eq(otpCodes.purpose, "password_reset"), eq(otpCodes.used, false)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!otpRecord) {
      return Response.json({ error: "Invalid or expired reset code. Please request a new reset link." }, { status: 400 });
    }

    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));
      return Response.json({ error: "Reset code has expired. Please request a new one." }, { status: 400 });
    }

    if (otpRecord.attempts >= 5) {
      await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));
      return Response.json({ error: "Maximum attempts exceeded. Please request a new reset code." }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      const newAttempts = otpRecord.attempts + 1;
      await db.update(otpCodes).set({ attempts: newAttempts }).where(eq(otpCodes.id, otpRecord.id));
      return Response.json(
        { error: `Incorrect reset code. You have ${5 - newAttempts} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Update password
    const newHash = hashPassword(newPassword);
    const now = new Date().toISOString();

    await db.update(users).set({
      passwordHash: newHash,
      updatedAt: now,
    }).where(eq(users.email, email));

    // Mark OTP as used
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));

    return Response.json(
      {
        ok: true,
        message: "Password updated! You can now sign in with your new password.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return Response.json({ error: "Could not reset password. Please try again." }, { status: 500 });
  }
}
