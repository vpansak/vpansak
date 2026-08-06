import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { setSessionCookieHeaders, verifyPassword } from "../../../lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return Response.json(
        { error: "Account not found. No account is registered with this email address.", notFound: true },
        { status: 404 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return Response.json(
        { error: "Incorrect password. Please try again or reset your password." },
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
        redirect: "/account",
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
