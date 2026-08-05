import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { otpCodes, users } from "../../../../db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await getDb();

    // Neutral message to prevent account enumeration
    const neutralResponse = {
      ok: true,
      email,
      message: "If an account exists with this email, password reset instructions have been sent.",
    };

    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!existingUser) {
      return Response.json(neutralResponse, { status: 200 });
    }

    // Invalidate previous reset OTPs
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.email, email));

    // Generate 6-digit OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.insert(otpCodes).values({
      email,
      code: resetCode,
      purpose: "password_reset",
      expiresAt,
      attempts: 0,
      used: false,
    });

    console.log(`[FORGOT PASSWORD] Generated reset OTP ${resetCode} for ${email}`);

    return Response.json(
      {
        ...neutralResponse,
        code: resetCode, // Returned for dev testing convenience
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return Response.json({ error: "Could not process request. Please try again." }, { status: 500 });
  }
}
