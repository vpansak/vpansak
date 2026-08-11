import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pendingUserRegistrations, users } from "../../../../db/schema";
import {
  generateVerificationToken,
  hashVerificationToken,
  maskEmail,
  sendVerificationEmail,
} from "../../../lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await getDb();

    // Check if an active account already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return Response.json(
        { error: "This email address is already verified. Please log in instead." },
        { status: 400 }
      );
    }

    // Find pending registration
    const [pending] = await db
      .select()
      .from(pendingUserRegistrations)
      .where(eq(pendingUserRegistrations.email, email))
      .limit(1);

    if (!pending || pending.verificationUsedAt) {
      return Response.json(
        { error: "No pending registration found for this email address. Please register first." },
        { status: 404 }
      );
    }

    // 60-second cooldown check
    const lastUpdateMs = new Date(pending.updatedAt || pending.createdAt).getTime();
    const elapsedMs = Date.now() - lastUpdateMs;
    if (elapsedMs < 60000) {
      const remainingSec = Math.ceil((60000 - elapsedMs) / 1000);
      return Response.json(
        {
          error: `Please wait ${remainingSec} seconds before requesting another verification email.`,
          remainingSeconds: remainingSec,
        },
        { status: 429 }
      );
    }

    // Generate new secure verification token
    const rawToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Update pending registration record with new token and timestamp
    await db
      .update(pendingUserRegistrations)
      .set({
        verificationTokenHash: tokenHash,
        verificationExpiresAt: expiresAt,
        updatedAt: now.toISOString(),
      })
      .where(eq(pendingUserRegistrations.id, pending.id));

    // Construct verification URL
    let baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      const origin = request.headers.get("origin") || request.headers.get("host");
      if (origin) {
        baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
      } else {
        baseUrl = "https://vpansak.vercel.app";
      }
    }
    baseUrl = baseUrl.replace(/\/+$/, "");

    const verificationLink = `${baseUrl}/verify-email?token=${rawToken}`;

    // Send new verification email via EmailJS
    const emailResult = await sendVerificationEmail(email, pending.fullName, verificationLink);

    if (!emailResult.success) {
      return Response.json(
        { error: "We couldn’t send the verification email right now. Please try again shortly." },
        { status: 500 }
      );
    }

    return Response.json(
      {
        ok: true,
        email,
        maskedEmail: maskEmail(email),
        message: "A new verification email has been sent. Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend verification error:", err);
    return Response.json({ error: "Could not resend verification email. Please try again." }, { status: 500 });
  }
}
