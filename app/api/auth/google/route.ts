import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { hashPassword, setSessionCookieHeaders } from "../../../lib/auth-session";

const ADMIN_EMAIL = "aloksingh84959@gmail.com";

type GooglePayload = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub?: string;
};

function parseGoogleJwt(credential: string): GooglePayload | null {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload) as GooglePayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const credential = String(body.credential || body.token || body.idToken || "").trim();
    const rawEmail = String(body.email || "").trim().toLowerCase();
    const rawName = String(body.fullName || body.name || "").trim();

    let email = rawEmail;
    let fullName = rawName;

    // 1. Try parsing Google JWT ID Token
    if (credential) {
      const parsed = parseGoogleJwt(credential);
      if (parsed && parsed.email) {
        email = parsed.email.toLowerCase().trim();
        fullName = parsed.name || parsed.given_name || fullName || email.split("@")[0];
      }
    }

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid Google email address is required." }, { status: 400 });
    }

    const db = await getDb();
    const isAdmin = email === ADMIN_EMAIL;
    const role = isAdmin ? "admin" : "customer";

    // 2. Check if user exists in database, or create them
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!existingUser) {
      const randomPasswordHash = hashPassword(`google-auth-${Date.now()}-${Math.random()}`);
      await db.insert(users).values({
        email,
        passwordHash: randomPasswordHash,
        fullName: fullName || email.split("@")[0],
        mobile: "Google Auth",
        role,
      }).onConflictDoNothing();
    } else if (isAdmin && existingUser.role !== "admin") {
      await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
    }

    // 3. Set Session Cookies
    const sessionData = {
      email,
      fullName: fullName || existingUser?.fullName || email.split("@")[0],
      role,
    };

    const responseHeaders = new Headers();
    setSessionCookieHeaders(responseHeaders, sessionData);

    return new Response(
      JSON.stringify({
        ok: true,
        user: sessionData,
        redirect: isAdmin ? "/7380869635" : "/account",
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (err) {
    console.error("Google Auth Error:", err);
    return Response.json({ error: "Google Sign-In failed. Please try again." }, { status: 500 });
  }
}
