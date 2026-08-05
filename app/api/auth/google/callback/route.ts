import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Google OAuth callback error parameter:", error);
    return Response.redirect(new URL("/signin?error=google_cancelled", request.url));
  }

  if (!code) {
    return Response.redirect(new URL("/signin?error=google_failed", request.url));
  }

  try {
    const apiRes = await fetch(new URL("/api/auth/google", request.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok || !data.ok) {
      return Response.redirect(new URL("/signin?error=google_failed", request.url));
    }

    const redirectTarget = data.redirect || "/account";
    const responseHeaders = new Headers();
    const cookies = apiRes.headers.getSetCookie();
    cookies.forEach((c) => responseHeaders.append("Set-Cookie", c));
    responseHeaders.set("Location", redirectTarget);

    return new Response(null, {
      status: 302,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Google OAuth callback processing error:", err);
    return Response.redirect(new URL("/signin?error=google_failed", request.url));
  }
}
