import { clearSessionCookieHeaders } from "../../../lib/auth-session";

export async function POST() {
  const responseHeaders = new Headers();
  clearSessionCookieHeaders(responseHeaders);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: responseHeaders,
  });
}
