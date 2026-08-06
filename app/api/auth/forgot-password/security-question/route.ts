import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { passwordResets, users } from "../../../../../db/schema";
import { verifySecurityAnswer } from "../../../../lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const answer = String(body.answer || "").trim();

    if (!email || !answer) {
      return Response.json({ error: "Email and Security Answer are required." }, { status: 400 });
    }

    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !user.securityAnswerHash) {
      return Response.json(
        { error: "Security question is not available for this account. Please use email verification." },
        { status: 400 }
      );
    }

    const isValid = verifySecurityAnswer(answer, user.securityAnswerHash);
    if (!isValid) {
      return Response.json(
        { error: "The security answer is incorrect. Please try again or use email verification." },
        { status: 401 }
      );
    }

    // Generate short-lived password reset token (15 mins expiry)
    const resetToken = "RST-" + crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await db.insert(passwordResets).values({
      email: user.email,
      code: resetToken,
      expiresAt,
      used: false,
    });

    return Response.json({
      ok: true,
      email: user.email,
      resetToken,
    });
  } catch (err) {
    console.error("Security question verification error:", err);
    return Response.json({ error: "We couldn’t complete your request right now. Please try again." }, { status: 500 });
  }
}
