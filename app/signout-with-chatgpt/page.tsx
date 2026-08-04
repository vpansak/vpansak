"use client";

import { useEffect } from "react";

export default function SignOutPage() {
  useEffect(() => {
    // 1. Wipe all client-side session cookies in browser
    document.cookie = "vpansak_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
    document.cookie = "vpansak_admin_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";

    // 2. Clear server-side session headers & redirect to signin
    fetch("/api/auth/signout", { method: "POST" }).finally(() => {
      window.location.href = "/signin";
    });
  }, []);

  return (
    <main className="account-loading">
      <span />
      <p>Signing out of VPANSAK...</p>
    </main>
  );
}
