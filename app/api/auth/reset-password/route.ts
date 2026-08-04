import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { passwordResets, users } from "../../../../db/schema";
import { hashPassword } from "../../../lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    const newPassword = String(body.newPassword || "").trim();

    if (!email || !code || !newPassword) {
      return Response.json({ error: "Email, OTP code and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const db = await getDb();
    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.email, email), eq(passwordResets.code, code), eq(passwordResets.used, false)))
      .orderBy(desc(passwordResets.createdAt))
      .limit(1);

    if (!resetRecord) {
      return Response.json({ error: "Invalid or expired reset code." }, { status: 400 });
    }

    if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      return Response.json({ error: "Reset code has expired. Please request a new code." }, { status: 400 });
    }

    const passwordHash = hashPassword(newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.email, email));
    await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, resetRecord.id));

    return Response.json({
      ok: true,
      message: "Password reset successful! You can now sign in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return Response.json({ error: "Could not reset password. Please try again." }, { status: 500 });
  }
}
