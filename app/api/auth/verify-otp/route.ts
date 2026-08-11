import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { otpCodes, profiles, users } from "../../../../db/schema";
import { setSessionCookieHeaders } from "../../../lib/auth-session";
import { getUserFromSupabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim().replace(/\D/g, "");
    const purpose = String(body.purpose || "email_verification").trim();

    if (!email || !code || code.length !== 6) {
      return Response.json({ error: "Please enter a valid 6-digit verification code." }, { status: 400 });
    }

    const db = await getDb();

    // Fetch latest active OTP record for this email and purpose
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose), eq(otpCodes.used, false)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!otpRecord) {
      return Response.json({ error: "No active verification code found. Please request a new code." }, { status: 400 });
    }

    // Check expiration (10 minutes)
    const expiresAt = new Date(otpRecord.expiresAt).getTime();
    if (Date.now() > expiresAt) {
      await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));
      return Response.json({ error: "Verification code has expired. Please request a new code." }, { status: 400 });
    }

    // Check attempt count
    if (otpRecord.attempts >= 5) {
      await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));
      return Response.json(
        { error: "Maximum verification attempts exceeded (5/5). Please request a new code." },
        { status: 400 }
      );
    }

    // Compare code
    if (otpRecord.code !== code) {
      const newAttempts = otpRecord.attempts + 1;
      await db.update(otpCodes).set({ attempts: newAttempts }).where(eq(otpCodes.id, otpRecord.id));

      if (newAttempts >= 5) {
        await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));
        return Response.json(
          { error: "Incorrect verification code. Maximum attempts exceeded. Please request a new code." },
          { status: 400 }
        );
      }

      return Response.json(
        { error: `Incorrect verification code. You have ${5 - newAttempts} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otpRecord.id));

    if (purpose === "email_verification") {
      let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        const remoteUser = await getUserFromSupabase(email);
        if (remoteUser && remoteUser.passwordHash) {
          const [restored] = await db
            .insert(users)
            .values({
              email: remoteUser.email,
              passwordHash: remoteUser.passwordHash,
              fullName: remoteUser.fullName,
              mobile: remoteUser.mobile,
              role: remoteUser.role,
              authProvider: "email",
              emailVerified: true,
              accountStatus: remoteUser.accountStatus || "active",
              securityQuestionId: remoteUser.securityQuestionId,
              securityAnswerHash: remoteUser.securityAnswerHash,
              createdAt: remoteUser.createdAt,
            })
            .returning();
          user = restored;

          await db.insert(profiles).values({
            email: remoteUser.email,
            fullName: remoteUser.fullName,
            mobile: remoteUser.mobile,
            createdAt: remoteUser.createdAt,
          }).onConflictDoUpdate({
            target: profiles.email,
            set: { fullName: remoteUser.fullName, mobile: remoteUser.mobile },
          });
        }
      }

      if (!user) {
        return Response.json({ error: "User account not found." }, { status: 404 });
      }

      const now = new Date().toISOString();
      await db
        .update(users)
        .set({
          emailVerified: true,
          lastLoginAt: now,
          updatedAt: now,
        })
        .where(eq(users.email, email));

      const isAdmin = user.email.toLowerCase() === "aloksingh84959@gmail.com" || user.role === "admin";
      const sessionData = {
        email: user.email,
        fullName: user.fullName || user.email.split("@")[0],
        role: isAdmin ? "admin" : user.role || "customer",
        mobile: user.mobile || "",
        emailVerified: true,
        authProvider: user.authProvider || "email",
      };

      const responseHeaders = new Headers();
      setSessionCookieHeaders(responseHeaders, sessionData);

      return new Response(
        JSON.stringify({
          ok: true,
          message: "Email verified successfully!",
          user: sessionData,
          redirect: isAdmin ? "/admin/manage" : "/account",
        }),
        {
          status: 200,
          headers: responseHeaders,
        }
      );
    }

    // Purpose password_reset
    return Response.json({ ok: true, message: "Code verified successfully.", email }, { status: 200 });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return Response.json({ error: "Could not verify code. Please try again." }, { status: 500 });
  }
}
