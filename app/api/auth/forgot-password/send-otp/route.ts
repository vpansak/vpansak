import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { otpCodes, users } from "../../../../../db/schema";

function generateCryptographicOtp(): string {
  const buffer = crypto.randomBytes(4);
  const num = (buffer.readUInt32BE(0) % 900000) + 100000;
  return num.toString();
}

function hashOtp(otp: string): string {
  const salt = "vpansak_secure_otp_salt_2026";
  return crypto.pbkdf2Sync(otp, salt, 10000, 32, "sha256").toString("hex");
}

async function sendEmailJsOtp(toEmail: string, userName: string, otpCode: string): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID || "vpansak";
  const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_di6hvjm";
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || "jjG3XUesW7Yt8McRJ";
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || "G-re211vGlwHrNVCniNgz";

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: toEmail,
          user_name: userName || "VPANSAK User",
          otp_code: otpCode,
          expiry_minutes: "10",
        },
      }),
    });

    if (response.ok) {
      console.log(`[EMAILJS OK] Sent OTP to ${toEmail}`);
      return true;
    } else {
      const errText = await response.text();
      console.error(`[EMAILJS FAIL] ${response.status}: ${errText}`);
      return false;
    }
  } catch (err) {
    console.error("[EMAILJS ERROR]", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return Response.json(
        { error: "Account not found. No account is registered with this email address.", notFound: true },
        { status: 404 }
      );
    }

    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return Response.json(
        { error: "Your account is currently unavailable. Please contact VPANSAK Support." },
        { status: 403 }
      );
    }

    // Check 60-second resend cooldown
    const [lastOtp] = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.email, email))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (lastOtp && !lastOtp.used) {
      const elapsedMs = Date.now() - new Date(lastOtp.createdAt).getTime();
      if (elapsedMs < 60000) {
        const remainingSec = Math.ceil((60000 - elapsedMs) / 1000);
        return Response.json(
          { error: `Please wait ${remainingSec} seconds before requesting another verification code.` },
          { status: 429 }
        );
      }
    }

    // Invalidate previous active OTPs for this user
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.email, email));

    // Generate cryptographic 6-digit OTP
    const otpCode = generateCryptographicOtp();
    const hashedCode = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Save hashed OTP in database
    await db.insert(otpCodes).values({
      email: user.email,
      code: hashedCode,
      purpose: "password_reset",
      expiresAt,
      attempts: 0,
      used: false,
    });

    // Send email via EmailJS server call
    const emailSent = await sendEmailJsOtp(user.email, user.fullName, otpCode);
    if (!emailSent) {
      return Response.json(
        { error: "We couldn’t send the verification code right now. Please try again shortly." },
        { status: 500 }
      );
    }

    // Mask email: e.g. ra***@gmail.com
    const parts = user.email.split("@");
    const maskedUser = parts[0].length <= 2 ? parts[0] + "***" : parts[0].slice(0, 2) + "***";
    const maskedEmail = `${maskedUser}@${parts[1] || ""}`;

    return Response.json({
      ok: true,
      email: user.email,
      maskedEmail,
      message: "A 6-digit verification code has been sent to your registered email address.",
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return Response.json({ error: "We couldn’t complete your request right now. Please try again." }, { status: 500 });
  }
}
