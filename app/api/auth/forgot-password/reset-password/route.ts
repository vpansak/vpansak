import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { passwordResets, users } from "../../../../../db/schema";
import { hashPassword, validatePasswordStrength } from "../../../../lib/auth-session";
import { saveUserToSupabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const resetToken = String(body.resetToken || "").trim();
    const password = String(body.password || "").trim();
    const confirmPassword = String(body.confirmPassword || "").trim();

    if (!email || !resetToken || !password) {
      return Response.json({ error: "Missing required password reset fields." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return Response.json({ error: passCheck.error || "Password does not meet complexity requirements." }, { status: 400 });
    }

    const db = await getDb();
    const [tokenRecord] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.code, resetToken))
      .limit(1);

    if (!tokenRecord || tokenRecord.email.toLowerCase() !== email || tokenRecord.used) {
      return Response.json(
        { error: "Invalid or expired password reset authorization. Please request a new reset." },
        { status: 400 }
      );
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return Response.json(
        { error: "Your password reset session has expired. Please start again." },
        { status: 400 }
      );
    }

    const newPasswordHash = hashPassword(password);
    const now = new Date().toISOString();

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        passwordUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(users.email, email));

    await saveUserToSupabase({
      email,
      password_hash: newPasswordHash,
      password_updated_at: now,
      updated_at: now,
    });

    // Mark token used
    await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, tokenRecord.id));

    return Response.json({
      ok: true,
      message: "Your password has been updated successfully. Please log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return Response.json({ error: "We couldn’t complete your request right now. Please try again." }, { status: 500 });
  }
}
