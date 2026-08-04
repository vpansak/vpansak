import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "vpansak_session";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
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
      return {
        email: parsed.email.toLowerCase().trim(),
        fullName: parsed.fullName || parsed.email.split("@")[0],
        role: parsed.role || "customer",
      };
    }
  } catch {
    // Invalid token
  }
  return null;
}

export async function getAuthUserFromRequest(request: Request): Promise<AuthSessionData | null> {
  // 1. Check ChatGPT header
  const headerEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (headerEmail) {
    const rawName = request.headers.get("oai-authenticated-user-full-name");
    const name = rawName ? decodeURIComponent(rawName) : headerEmail.split("@")[0];
    return { email: headerEmail, fullName: name, role: "customer" };
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/vpansak_session=([^;]+)/);
  if (match && match[1]) {
    return decodeSession(match[1]);
  }

  return null;
}

export function setSessionCookieHeaders(headers: Headers, sessionData: AuthSessionData) {
  const token = encodeSession(sessionData);
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
}

export function clearSessionCookieHeaders(headers: Headers) {
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}
