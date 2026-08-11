import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pendingUserRegistrations, profiles, users } from "../../../../db/schema";
import { hashVerificationToken } from "../../../lib/auth-session";
import { saveUserToSupabase } from "../../../lib/supabase";

async function handleVerification(rawToken: string) {
  const token = String(rawToken || "").trim();
  if (!token || token.length < 16) {
    return {
      status: 400,
      body: { ok: false, code: "INVALID", error: "This verification link is invalid or no longer available." },
    };
  }

  const tokenHash = hashVerificationToken(token);
  const db = await getDb();

  // Find pending registration by token hash
  const [pending] = await db
    .select()
    .from(pendingUserRegistrations)
    .where(eq(pendingUserRegistrations.verificationTokenHash, tokenHash))
    .limit(1);

  if (!pending) {
    return {
      status: 404,
      body: { ok: false, code: "INVALID", error: "This verification link is invalid or no longer available." },
    };
  }

  // Check if token has already been used
  if (pending.verificationUsedAt) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "ALREADY_USED",
        error: "This email verification link has already been used.",
        email: pending.email,
      },
    };
  }

  // Check expiration (15 minutes)
  const expiresAtMs = new Date(pending.verificationExpiresAt).getTime();
  if (Date.now() > expiresAtMs) {
    return {
      status: 400,
      body: {
        ok: false,
        code: "EXPIRED",
        error: "This verification link has expired. Please request a new verification email.",
        email: pending.email,
      },
    };
  }

  // Check if account is already activated in `users`
  const [existingUser] = await db.select().from(users).where(eq(users.email, pending.email)).limit(1);
  if (existingUser) {
    // Mark token as used to keep state clean
    await db
      .update(pendingUserRegistrations)
      .set({ verificationUsedAt: new Date().toISOString() })
      .where(eq(pendingUserRegistrations.id, pending.id));

    return {
      status: 200,
      body: {
        ok: false,
        code: "ALREADY_USED",
        error: "This email verification link has already been used.",
        email: pending.email,
      },
    };
  }

  // Create active VPANSAK user account
  const now = new Date().toISOString();

  await db.insert(users).values({
    email: pending.email,
    passwordHash: pending.passwordHash,
    fullName: pending.fullName,
    mobile: pending.mobile,
    role: "customer",
    authProvider: "email",
    emailVerified: true,
    accountStatus: "active",
    securityQuestionId: pending.securityQuestionId,
    securityAnswerHash: pending.securityAnswerHash,
    createdAt: now,
    updatedAt: now,
  });

  // Create profile record
  await db
    .insert(profiles)
    .values({
      email: pending.email,
      fullName: pending.fullName,
      mobile: pending.mobile,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: profiles.email,
      set: { fullName: pending.fullName, mobile: pending.mobile, updatedAt: now },
    });

  // Sync with Supabase if configured
  await saveUserToSupabase({
    email: pending.email,
    password_hash: pending.passwordHash,
    full_name: pending.fullName,
    mobile: pending.mobile,
    role: "customer",
    auth_provider: "email",
    email_verified: 1,
    account_status: "active",
    security_question_id: pending.securityQuestionId,
    security_answer_hash: pending.securityAnswerHash,
    created_at: now,
  });

  // Mark token as used atomically
  await db
    .update(pendingUserRegistrations)
    .set({ verificationUsedAt: now, updatedAt: now })
    .where(eq(pendingUserRegistrations.id, pending.id));

  return {
    status: 200,
    body: {
      ok: true,
      code: "VERIFIED",
      message: "Your email has been verified successfully.",
      email: pending.email,
    },
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const result = await handleVerification(token);
    return Response.json(result.body, { status: result.status });
  } catch (err) {
    console.error("Verify email GET error:", err);
    return Response.json(
      { ok: false, code: "ERROR", error: "Could not process email verification. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const token = String(body.token || "").trim();
    const result = await handleVerification(token);
    return Response.json(result.body, { status: result.status });
  } catch (err) {
    console.error("Verify email POST error:", err);
    return Response.json(
      { ok: false, code: "ERROR", error: "Could not process email verification. Please try again." },
      { status: 500 }
    );
  }
}
