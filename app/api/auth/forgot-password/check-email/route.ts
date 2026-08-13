import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { SECURITY_QUESTIONS } from "../../../../lib/auth-session";
import { getUserFromSupabase } from "../../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await getDb();
    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      const allUsers = await db.select().from(users);
      user = allUsers.find((u: any) => String(u.email || "").toLowerCase().trim() === email);
    }

    if (!user) {
      const remoteUser = await getUserFromSupabase(email);
      if (remoteUser) {
        try {
          await db
            .insert(users)
            .values({
              email: remoteUser.email,
              passwordHash: remoteUser.passwordHash || "NO_HASH",
              fullName: remoteUser.fullName,
              mobile: remoteUser.mobile,
              role: remoteUser.role,
              authProvider: remoteUser.authProvider || "email",
              emailVerified: true,
              accountStatus: remoteUser.accountStatus || "active",
              securityQuestionId: remoteUser.securityQuestionId || null,
              securityAnswerHash: remoteUser.securityAnswerHash || null,
              createdAt: remoteUser.createdAt,
            })
            .onConflictDoUpdate({
              target: users.email,
              set: {
                passwordHash: remoteUser.passwordHash || "NO_HASH",
                fullName: remoteUser.fullName,
                mobile: remoteUser.mobile,
              },
            });
        } catch (e) {
          console.error("SQLite user restore notice:", e);
        }

        const [fetched] = await db.select().from(users).where(eq(users.email, remoteUser.email)).limit(1);
        user = fetched || {
          id: 99999,
          email: remoteUser.email,
          passwordHash: remoteUser.passwordHash,
          fullName: remoteUser.fullName,
          mobile: remoteUser.mobile,
          role: remoteUser.role,
          authProvider: remoteUser.authProvider || "email",
          emailVerified: 1,
          accountStatus: remoteUser.accountStatus || "active",
        } as any;
      }
    }

    if (!user) {
      return Response.json(
        {
          error: "Account not found. No account is registered with this email address.",
          notFound: true,
        },
        { status: 404 }
      );
    }

    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return Response.json(
        { error: "Your account is currently unavailable. Please contact VPANSAK Support." },
        { status: 403 }
      );
    }

    const questionObj = SECURITY_QUESTIONS.find((q) => q.id === user.securityQuestionId);
    const securityQuestion = questionObj ? questionObj.question : (user.securityQuestionId ? SECURITY_QUESTIONS[0].question : null);

    return Response.json({
      ok: true,
      email: user.email,
      hasSecurityQuestion: Boolean(user.securityAnswerHash),
      securityQuestion,
    });
  } catch (err) {
    console.error("Check email error:", err);
    return Response.json({ error: "We couldn’t complete your request right now. Please try again." }, { status: 500 });
  }
}
