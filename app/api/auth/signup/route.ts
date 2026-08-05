import { eq, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { otpCodes, profiles, users } from "../../../../db/schema";
import { hashPassword } from "../../../lib/auth-session";

export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character." };
  }
  return { isValid: true };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const fullName = String(body.fullName || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 150);
    const mobile = String(body.mobile || "").trim().replace(/\D/g, "").slice(0, 15);
    const password = String(body.password || "").trim();
    const confirmPassword = String(body.confirmPassword || "").trim();
    const termsAccepted = body.termsAccepted === "true" || body.termsAccepted === "1" || (body as any).termsAccepted === true;

    if (!termsAccepted) {
      return Response.json({ error: "You must accept the Terms and Conditions and Privacy Policy to create an account." }, { status: 400 });
    }

    if (!fullName || !email || !mobile || !password) {
      return Response.json({ error: "Full Name, Email, Mobile Number and Password are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (mobile.length < 10) {
      return Response.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return Response.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.isValid) {
      return Response.json({ error: passCheck.message }, { status: 400 });
    }

    const db = await getDb();

    // Check duplicate email
    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail) {
      if (existingEmail.emailVerified) {
        return Response.json({ error: "This email address is already registered." }, { status: 409 });
      }
    }

    // Check duplicate mobile number
    const [existingMobile] = await db.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    if (existingMobile && existingMobile.email !== email) {
      return Response.json({ error: "This mobile number is already registered with another account." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    if (existingEmail) {
      // Update existing unverified user password/name/mobile
      await db.update(users).set({
        fullName,
        mobile,
        passwordHash,
        updatedAt: new Date().toISOString(),
      }).where(eq(users.email, email));
    } else {
      // Insert new unverified user
      await db.insert(users).values({
        email,
        passwordHash,
        fullName,
        mobile,
        role: "customer",
        authProvider: "email",
        emailVerified: false,
        accountStatus: "active",
      });
    }

    await db.insert(profiles).values({
      email,
      fullName,
      mobile,
    }).onConflictDoUpdate({
      target: profiles.email,
      set: { fullName, mobile, updatedAt: new Date().toISOString() },
    });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    // Invalidate previous OTPs for this email & purpose
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.email, email));

    // Save new OTP
    await db.insert(otpCodes).values({
      email,
      code: otpCode,
      purpose: "email_verification",
      expiresAt,
      attempts: 0,
      used: false,
    });

    console.log(`[OTP VERIFICATION] Sent 6-digit OTP ${otpCode} to ${email}`);

    return Response.json(
      {
        ok: true,
        email,
        requireOtp: true,
        message: `We sent a 6-digit verification code to ${email.replace(/(.{2})(.*)(?=@)/, (_m, p1, p2) => p1 + "*".repeat(p2.length))}.`,
        otpCode, // Returned for dev testing convenience
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
