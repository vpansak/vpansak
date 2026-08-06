import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
import { hashPassword, hashSecurityAnswer, SECURITY_QUESTIONS, validatePasswordStrength } from "../../../lib/auth-session";
import { saveUserToSupabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const rawMobile = String(body.mobile || "").trim();
    const mobile = rawMobile.replace(/\D/g, "").slice(-10);
    const password = String(body.password || "").trim();
    const confirmPassword = String(body.confirmPassword || "").trim();
    const securityQuestionId = String(body.securityQuestionId || "").trim();
    const securityAnswer = String(body.securityAnswer || "").trim();

    if (!fullName || fullName.length < 2 || fullName.length > 60) {
      return Response.json({ error: "Full Name must be between 2 and 60 characters." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!mobile || mobile.length !== 10) {
      return Response.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    if (!password) {
      return Response.json({ error: "Please enter your password." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return Response.json({ error: passCheck.error || "Password does not meet complexity requirements." }, { status: 400 });
    }

    const validQuestion = SECURITY_QUESTIONS.find((q) => q.id === securityQuestionId);
    if (!validQuestion) {
      return Response.json({ error: "Please select a valid security question." }, { status: 400 });
    }

    if (!securityAnswer || securityAnswer.length < 2) {
      return Response.json({ error: "Security Answer must be at least 2 characters long." }, { status: 400 });
    }

    const db = await getDb();

    // Check duplicate email
    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail) {
      return Response.json(
        { error: "This email address is already associated with a VPANSAK account. Please log in or reset your password." },
        { status: 409 }
      );
    }

    // Check duplicate mobile number
    const [existingMobile] = await db.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    if (existingMobile) {
      return Response.json(
        { error: "This mobile number is already associated with another account." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const securityAnswerHash = hashSecurityAnswer(securityAnswer);
    const now = new Date().toISOString();

    await db.insert(users).values({
      email,
      passwordHash,
      fullName,
      mobile,
      role: "customer",
      authProvider: "email",
      emailVerified: true,
      accountStatus: "active",
      securityQuestionId,
      securityAnswerHash,
      createdAt: now,
      updatedAt: now,
    });

    await saveUserToSupabase({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      mobile,
      role: "customer",
      auth_provider: "email",
      email_verified: 1,
      account_status: "active",
      security_question_id: securityQuestionId,
      security_answer_hash: securityAnswerHash,
      created_at: now,
    });

    await db.insert(profiles).values({
      email,
      fullName,
      mobile,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: profiles.email,
      set: { fullName, mobile, updatedAt: now },
    });

    return Response.json(
      {
        ok: true,
        message: "Your VPANSAK account has been created successfully. You can now log in.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
