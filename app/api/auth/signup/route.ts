import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pendingUserRegistrations, profiles, users } from "../../../../db/schema";
import {
  generateVerificationToken,
  hashPassword,
  hashSecurityAnswer,
  hashVerificationToken,
  maskEmail,
  SECURITY_QUESTIONS,
  sendVerificationEmail,
  validatePasswordStrength,
} from "../../../lib/auth-session";
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
      return Response.json(
        { error: passCheck.error || "Password does not meet complexity requirements." },
        { status: 400 }
      );
    }

    const validQuestion = SECURITY_QUESTIONS.find((q) => q.id === securityQuestionId);
    if (!validQuestion) {
      return Response.json({ error: "Please select a valid security question." }, { status: 400 });
    }

    if (!securityAnswer || securityAnswer.length < 2) {
      return Response.json({ error: "Security Answer must be at least 2 characters long." }, { status: 400 });
    }

    const db = await getDb();

    // Check duplicate active email
    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail) {
      return Response.json(
        { error: "An account is already registered with this email address. Please log in instead." },
        { status: 409 }
      );
    }

    // Check duplicate active mobile number
    const [existingMobile] = await db.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    if (existingMobile) {
      return Response.json(
        { error: "This mobile number is already associated with an existing active account." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const securityAnswerHash = hashSecurityAnswer(securityAnswer);
    const rawToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Save pending registration safely
    const [existingPending] = await db
      .select()
      .from(pendingUserRegistrations)
      .where(eq(pendingUserRegistrations.email, email))
      .limit(1);

    if (existingPending) {
      await db
        .update(pendingUserRegistrations)
        .set({
          fullName,
          mobile,
          passwordHash,
          securityQuestionId,
          securityAnswerHash,
          verificationTokenHash: tokenHash,
          verificationExpiresAt: expiresAt,
          verificationUsedAt: null,
          updatedAt: now.toISOString(),
        })
        .where(eq(pendingUserRegistrations.email, email));
    } else {
      await db.insert(pendingUserRegistrations).values({
        fullName,
        email,
        mobile,
        passwordHash,
        securityQuestionId,
        securityAnswerHash,
        verificationTokenHash: tokenHash,
        verificationExpiresAt: expiresAt,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }

    // Insert/upsert into active users table immediately so account is permanent
    await db
      .insert(users)
      .values({
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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash,
          fullName,
          mobile,
          securityQuestionId,
          securityAnswerHash,
          updatedAt: now.toISOString(),
        },
      });

    // Create profile record
    await db
      .insert(profiles)
      .values({
        email,
        fullName,
        mobile,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .onConflictDoUpdate({
        target: profiles.email,
        set: { fullName, mobile, updatedAt: now.toISOString() },
      });

    // Save/Backup to Supabase Cloud Database immediately
    await saveUserToSupabase({
      email,
      passwordHash,
      fullName,
      mobile,
      role: "customer",
      securityQuestionId,
      securityAnswerHash,
      emailVerified: 1,
      accountStatus: "active",
      createdAt: now.toISOString(),
    });

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

    // Send verification email via EmailJS
    const emailResult = await sendVerificationEmail(email, fullName, verificationLink);

    if (!emailResult.success) {
      return Response.json(
        { error: "We couldn’t send the verification email right now. Please try again shortly." },
        { status: 500 }
      );
    }

    return Response.json(
      {
        ok: true,
        pending: true,
        email,
        maskedEmail: maskEmail(email),
        message: "Verification email sent. Please check your email to complete your VPANSAK registration.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ error: "Could not process registration. Please try again." }, { status: 500 });
  }
}
