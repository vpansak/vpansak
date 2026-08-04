import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { passwordResets, users } from "../../../../db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Enter your registered email address." }, { status: 400 });
    }

    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      // Return positive message for security privacy
      return Response.json({
        ok: true,
        message: "If an account exists with this email, a 6-digit reset code has been sent.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    await db.insert(passwordResets).values({
      email,
      code,
      expiresAt,
      used: false,
    });

    return Response.json({
      ok: true,
      code, // Returned for user convenience on frontend
      message: `Password reset OTP generated. Your reset code is ${code} (valid for 15 minutes).`,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return Response.json({ error: "Could not process password reset request." }, { status: 500 });
  }
}
