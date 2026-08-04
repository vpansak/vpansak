import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "vpansak_session";
const ADMIN_EMAIL = "aloksingh84959@gmail.com";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export type AuthSessionData = {
  email: string;
  fullName: string;
  role: string;
};

export function encodeSession(data: AuthSessionData): string {
  const payload = JSON.stringify({ ...data, ts: Date.now() });
  return Buffer.from(payload).toString("base64url");
}

export function decodeSession(token: string | null | undefined): AuthSessionData | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === "string") {
      const email = parsed.email.toLowerCase().trim();
      const isAdmin = email === ADMIN_EMAIL || parsed.role === "admin" || parsed.role === "superadmin";
      return {
        email,
        fullName: parsed.fullName || (isAdmin ? "Super Admin" : email.split("@")[0]),
        role: isAdmin ? "admin" : parsed.role || "customer",
      };
    }
  } catch {
    // Invalid token
  }
  return null;
}

export function isAdminUser(session: AuthSessionData | null | string): boolean {
  if (!session) return false;
  if (typeof session === "string") {
    return session.toLowerCase().trim() === ADMIN_EMAIL;
  }
  return session.email.toLowerCase().trim() === ADMIN_EMAIL || session.role === "admin" || session.role === "superadmin";
}

export async function getAuthUserFromRequest(request: Request): Promise<AuthSessionData | null> {
  // 1. Check ChatGPT header
  const headerEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (headerEmail) {
    const rawName = request.headers.get("oai-authenticated-user-full-name");
    const name = rawName ? decodeURIComponent(rawName) : headerEmail.split("@")[0];
    const isAdmin = headerEmail === ADMIN_EMAIL;
    return { email: headerEmail, fullName: name, role: isAdmin ? "admin" : "customer" };
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/vpansak_session=([^;]+)/);
  if (match && match[1]) {
    const session = decodeSession(match[1]);
    if (session) return session;
  }

  // 3. Check admin key cookie or query secret
  if (cookieHeader.includes("vpansak_admin_key=1207") || cookieHeader.includes("vpansak_admin_key=7380869635")) {
    return { email: ADMIN_EMAIL, fullName: "Super Admin", role: "admin" };
  }

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code") || url.searchParams.get("key") || url.searchParams.get("pass");
    if (code === "1207" || code === "vpa-1207" || code === "7380869635") {
      return { email: ADMIN_EMAIL, fullName: "Super Admin", role: "admin" };
    }
  } catch {
    // URL parsing fallback
  }

  return null;
}

export function setSessionCookieHeaders(headers: Headers, sessionData: AuthSessionData) {
  const token = encodeSession(sessionData);
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
  if (isAdminUser(sessionData)) {
    headers.append(
      "Set-Cookie",
      `vpansak_admin_key=1207; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );
  }
}

export function clearSessionCookieHeaders(headers: Headers) {
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  headers.append(
    "Set-Cookie",
    `vpansak_admin_key=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}
