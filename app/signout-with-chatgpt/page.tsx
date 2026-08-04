import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearSessionCookieHeaders } from "../lib/auth-session";

export default async function SignOutPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || "/";
  
  // Clear session cookie
  const resHeaders = new Headers();
  clearSessionCookieHeaders(resHeaders);

  redirect(returnTo);
}
