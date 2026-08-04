import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
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

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const responseHeaders = new Headers();
    setSessionCookieHeaders(responseHeaders, {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          email: user.email,
          fullName: user.fullName,
          mobile: user.mobile,
          role: user.role,
        },
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
