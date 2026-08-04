import { clearSessionCookieHeaders } from "../../../lib/auth-session";

export async function POST() {
  const responseHeaders = new Headers();
  clearSessionCookieHeaders(responseHeaders);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: responseHeaders,
  });
}

export async function GET(request: Request) {
  const responseHeaders = new Headers();
  clearSessionCookieHeaders(responseHeaders);
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return_to") || "/signin";
  responseHeaders.set("Location", returnTo);
  return new Response(null, {
    status: 302,
    headers: responseHeaders,
  });
}
