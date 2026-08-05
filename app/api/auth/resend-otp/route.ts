import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { otpCodes } from "../../../../db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const purpose = String(body.purpose || "email_verification").trim();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const db = await getDb();

    // Check rate limit: 60 seconds cooldown
    const [lastOtp] = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (lastOtp && lastOtp.createdAt) {
      const lastSentTime = new Date(lastOtp.createdAt).getTime();
      const timeElapsed = (Date.now() - lastSentTime) / 1000;
      if (timeElapsed < 60) {
        const secondsLeft = Math.ceil(60 - timeElapsed);
        return Response.json(
          { error: `Please wait ${secondsLeft} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Invalidate old OTPs for this email and purpose
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose)));

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await db.insert(otpCodes).values({
      email,
      code: otpCode,
      purpose,
      expiresAt,
      attempts: 0,
      used: false,
    });

    console.log(`[RESEND OTP] Sent new 6-digit OTP ${otpCode} to ${email}`);

    return Response.json(
      {
        ok: true,
        message: "A new 6-digit verification code has been sent to your email.",
        otpCode, // Returned for dev convenience
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend OTP error:", err);
    return Response.json({ error: "Could not resend verification code. Please try again." }, { status: 500 });
  }
}
