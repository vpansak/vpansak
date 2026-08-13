import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
import { setSessionCookieHeaders, verifyPassword } from "../../../lib/auth-session";
import { getUserFromSupabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
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

        try {
          await db.insert(profiles).values({
            email: remoteUser.email,
            fullName: remoteUser.fullName,
            mobile: remoteUser.mobile,
            createdAt: remoteUser.createdAt,
          }).onConflictDoUpdate({
            target: profiles.email,
            set: { fullName: remoteUser.fullName, mobile: remoteUser.mobile },
          });
        } catch {
          // ignore profile restore error
        }
      }
    }

    if (!user) {
      return Response.json(
        { error: "No account found with this email address. Please check your email or create a new account.", notFound: true },
        { status: 404 }
      );
    }

    if (!user.passwordHash || user.passwordHash === "NO_HASH" || !user.passwordHash.includes(":")) {
      return Response.json(
        { error: "Your account credentials need a password update. Please click 'Forgot Password?' to set your password." },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return Response.json(
        { error: "Incorrect password. Please verify your password or click 'Forgot Password?'." },
        { status: 401 }
      );
    }

    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return Response.json(
        { error: "Your account is currently unavailable. Please contact VPANSAK Support." },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    await db.update(users).set({ lastLoginAt: now }).where(eq(users.email, email));

    const sessionData = {
      email: user.email,
      fullName: user.fullName || user.email.split("@")[0],
      role: user.role || "customer",
      mobile: user.mobile || "",
      profileImage: user.profileImage || "",
      emailVerified: true,
      authProvider: user.authProvider || "email",
    };

    const responseHeaders = new Headers();
    setSessionCookieHeaders(responseHeaders, sessionData);

    return new Response(
      JSON.stringify({
        ok: true,
        user: sessionData,
        redirect: "/",
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (err) {
    console.error("Signin error:", err);
    return Response.json({ error: "Could not sign in. Please try again." }, { status: 500 });
  }
}
