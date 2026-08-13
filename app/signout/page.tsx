"use client";

import { useEffect } from "react";

export default function SignOutPage() {
  useEffect(() => {
    // 1. Wipe session cookies
    document.cookie = "vpansak_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
    document.cookie = "vpansak_admin_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";

    // 2. Clear client-side local & session storage
    try {
      localStorage.removeItem("vpansak-cart");
      localStorage.removeItem("vpansak-wishlist");
      localStorage.removeItem("vpansak_guest_cart");
      localStorage.removeItem("vpansak_guest_wishlist");
      localStorage.removeItem("vpansak-recently-viewed");
      sessionStorage.clear();
    } catch {
      /* ignore */
    }

    // 3. Clear server-side session and redirect to login
    fetch("/api/auth/signout", { method: "POST" }).finally(() => {
      window.location.href = "/login";
    });
  }, []);

  return (
    <main className="account-loading">
      <span />
      <p>Signing out of VPANSAK...</p>
    </main>
  );
}
