"use client";

import { useEffect } from "react";

export default function SecretAdminRoute() {
  useEffect(() => {
    // 1. Set admin key cookie
    document.cookie = "vpansak_admin_key=1207; path=/; max-age=2592000; SameSite=Lax";

    // 2. Set vpansak_session cookie for aloksingh84959@gmail.com
    const payload = JSON.stringify({
      email: "aloksingh84959@gmail.com",
      fullName: "Super Admin",
      role: "admin",
      ts: Date.now(),
    });
    
    // base64url encoding
    const token = btoa(payload)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    document.cookie = `vpansak_session=${token}; path=/; max-age=2592000; SameSite=Lax`;

    // 3. Redirect to Admin Management Console
    window.location.href = "/admin/manage";
  }, []);

  return (
    <main className="account-loading">
      <span />
      <p>Unlocking VPANSAK Admin Command Center...</p>
    </main>
  );
}
