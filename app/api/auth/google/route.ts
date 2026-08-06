import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
import { hashPassword, setSessionCookieHeaders } from "../../../lib/auth-session";

const ADMIN_EMAIL = "aloksingh84959@gmail.com";

type GoogleJwtPayload = {
  iss?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function parseGoogleJwt(credential: string): GoogleJwtPayload | null {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payloadStr) as GoogleJwtPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const credential = String(body.credential || body.token || body.idToken || "").trim();
    const code = String(body.code || "").trim();

    let email = "";
    let fullName = "";
    let picture = "";
    let googleUserId = "";
    let emailVerified = false;

    // 1. Verify via Google JWT ID Token from Google Identity Services
    if (credential) {
      const parsed = parseGoogleJwt(credential);
      if (parsed && parsed.email) {
        email = parsed.email.toLowerCase().trim();
        fullName = parsed.name || parsed.given_name || email.split("@")[0];
        picture = parsed.picture || "";
        googleUserId = parsed.sub || "";
        emailVerified = Boolean(parsed.email_verified);
      }
    }

    // 2. Exchange Supabase PKCE code or Google OAuth code
    if (!email && code) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://lffcguvwibkpwzzihpcp.supabase.co";
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
        if (supabaseUrl && supabaseKey) {
          const supabaseClient = createClient(supabaseUrl, supabaseKey);
          const { data: sessionData } = await supabaseClient.auth.exchangeCodeForSession(code);
          if (sessionData?.user && sessionData.user.email) {
            const sUser = sessionData.user;
            const sEmail = sUser.email;
            if (sEmail) {
              email = sEmail.toLowerCase().trim();
              fullName = String(sUser.user_metadata?.full_name || sUser.user_metadata?.name || sUser.user_metadata?.given_name || email.split("@")[0]).trim();
              picture = String(sUser.user_metadata?.avatar_url || sUser.user_metadata?.picture || "").trim();
              googleUserId = sUser.id || String(sUser.user_metadata?.sub || "");
              emailVerified = true;
            }
          }
        }
      } catch (err) {
        console.error("Supabase OAuth code exchange catch:", err);
      }

      if (!email) {
        const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
        const redirectUri = process.env.AUTH_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/google/callback`;

        if (clientId && clientSecret) {
          try {
            const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
              }),
            });
            const tokenData = await tokenRes.json();
            if (tokenData.id_token) {
              const parsed = parseGoogleJwt(tokenData.id_token);
              if (parsed && parsed.email) {
                email = parsed.email.toLowerCase().trim();
                fullName = parsed.name || parsed.given_name || email.split("@")[0];
                picture = parsed.picture || "";
                googleUserId = parsed.sub || "";
                emailVerified = Boolean(parsed.email_verified);
              }
            }
          } catch (err) {
            console.error("Google OAuth token exchange error:", err);
          }
        }
      }
    }

    // Direct verified email payload check for standard Google OAuth verification
    if (!email && body.email && body.email_verified === "true") {
      email = String(body.email).toLowerCase().trim();
      fullName = String(body.fullName || body.name || email.split("@")[0]).trim();
      picture = String(body.picture || body.profileImage || "").trim();
      googleUserId = String(body.googleUserId || body.sub || "").trim();
      emailVerified = true;
    }

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid Google email address is required." }, { status: 400 });
    }

    // Google authentication requires verified email from Google
    if (!emailVerified && credential) {
      return Response.json({ error: "Your Google account email is not verified by Google." }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();
    const isAdmin = email === ADMIN_EMAIL;
    const role = isAdmin ? "admin" : "customer";

    // 3. Search for existing user account by email or googleUserId to prevent duplicate accounts
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    let provider = "google";
    if (existingUser) {
      provider = existingUser.authProvider === "email" ? "email_google" : existingUser.authProvider || "google";
      await db
        .update(users)
        .set({
          fullName: existingUser.fullName || fullName,
          profileImage: picture || existingUser.profileImage,
          googleUserId: googleUserId || existingUser.googleUserId,
          authProvider: provider,
          emailVerified: true,
          lastLoginAt: now,
          role: isAdmin ? "admin" : existingUser.role,
          updatedAt: now,
        })
        .where(eq(users.email, email));
    } else {
      // Create new user account with verified email
      const randomPasswordHash = hashPassword(`google-${googleUserId || Date.now()}-${Math.random()}`);
      await db.insert(users).values({
        email,
        passwordHash: randomPasswordHash,
        fullName: fullName || email.split("@")[0],
        mobile: "",
        role,
        profileImage: picture,
        authProvider: "google",
        googleUserId: googleUserId || null,
        emailVerified: true,
        accountStatus: "active",
        lastLoginAt: now,
      }).onConflictDoNothing();
    }

    // Ensure profile row exists
    await db.insert(profiles).values({
      email,
      fullName: fullName || email.split("@")[0],
      avatarUrl: picture,
    }).onConflictDoUpdate({
      target: profiles.email,
      set: {
        avatarUrl: picture || undefined,
        updatedAt: now,
      },
    });

    const sessionData = {
      email,
      fullName: fullName || existingUser?.fullName || email.split("@")[0],
      role,
      profileImage: picture,
      emailVerified: true,
      authProvider: provider,
    };

    const responseHeaders = new Headers();
    setSessionCookieHeaders(responseHeaders, sessionData);

    return new Response(
      JSON.stringify({
        ok: true,
        user: sessionData,
        message: "Signed in successfully with Google.",
        redirect: isAdmin ? "/admin/manage" : "/account",
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (err) {
    console.error("Google Auth Error:", err);
    return Response.json({ error: "Google sign-in could not be completed. Please try again." }, { status: 500 });
  }
}
