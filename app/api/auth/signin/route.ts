import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { hashPassword, setSessionCookieHeaders, verifyPassword } from "../../../lib/auth-session";

const ADMIN_EMAIL = "aloksingh84959@gmail.com";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();

    // Special handler for Super Admin: aloksingh84959@gmail.com with password 1207
    if (email === ADMIN_EMAIL && (password === "1207" || password === "1207#")) {
      const [existingAdmin] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
      const passHash = hashPassword("1207");
      const now = new Date().toISOString();

      if (!existingAdmin) {
        await db.insert(users).values({
          email: ADMIN_EMAIL,
          passwordHash: passHash,
          fullName: "Super Admin",
          mobile: "9999999999",
          role: "admin",
          emailVerified: true,
          authProvider: "email",
          lastLoginAt: now,
        }).onConflictDoNothing();
      } else {
        await db.update(users).set({
          role: "admin",
          passwordHash: passHash,
          emailVerified: true,
          lastLoginAt: now,
        }).where(eq(users.email, ADMIN_EMAIL));
      }

      const sessionData = {
        email: ADMIN_EMAIL,
        fullName: "Super Admin",
        role: "admin",
        emailVerified: true,
        authProvider: "email",
      };

      const responseHeaders = new Headers();
      setSessionCookieHeaders(responseHeaders, sessionData);

      return new Response(
        JSON.stringify({
          ok: true,
          user: sessionData,
          redirect: "/admin/manage",
        }),
        {
          status: 200,
          headers: responseHeaders,
        }
      );
    }

    // Regular User Signin
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    if (user.accountStatus === "blocked" || user.accountStatus === "suspended") {
      return Response.json(
        { error: `Your account has been ${user.accountStatus}. Please contact customer support.` },
        { status: 403 }
      );
    }

    // Check email verification for password accounts
    if (!user.emailVerified && user.authProvider === "email") {
      return Response.json(
        {
          error: "Please verify your email before signing in.",
          unverified: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    await db.update(users).set({ lastLoginAt: now }).where(eq(users.email, email));

    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL || user.role === "admin" || user.role === "superadmin";
    const sessionData = {
      email: user.email,
      fullName: user.fullName || user.email.split("@")[0],
      role: isAdmin ? "admin" : user.role || "customer",
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
        redirect: isAdmin ? "/admin/manage" : "/account",
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
