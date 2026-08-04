import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
import { hashPassword, setSessionCookieHeaders } from "../../../lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const fullName = String(body.fullName || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 150);
    const mobile = String(body.mobile || "").trim().slice(0, 20);
    const password = String(body.password || "").trim();

    if (!fullName || !email || !password) {
      return Response.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const db = await getDb();
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    await db.insert(users).values({
      email,
      passwordHash,
      fullName,
      mobile,
      role: "customer",
    });

    await db.insert(profiles).values({
      email,
      fullName,
      mobile,
    }).onConflictDoUpdate({
      target: profiles.email,
      set: { fullName, mobile, updatedAt: new Date().toISOString() },
    });

    const responseHeaders = new Headers();
    setSessionCookieHeaders(responseHeaders, {
      email,
      fullName,
      role: "customer",
    });

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          email,
          fullName,
          mobile,
          role: "customer",
        },
      }),
      {
        status: 201,
        headers: responseHeaders,
      }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
