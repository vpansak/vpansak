"use client";

import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CustomAdminLoginPage() {
  const [email, setEmail] = useState("aloksingh84959@gmail.com");
  const [password, setPassword] = useState("1207");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    // Set browser session cookies
    document.cookie = "vpansak_admin_key=7380869635; path=/; max-age=2592000; SameSite=Lax";
    const payload = JSON.stringify({
      email: email.trim().toLowerCase(),
      fullName: "Super Admin",
      role: "admin",
      ts: Date.now(),
    });
    const token = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    document.cookie = `vpansak_session=${token}; path=/; max-age=2592000; SameSite=Lax`;

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (res.ok) {
        window.location.href = "/admin/manage";
      } else {
        const data = await res.json();
        if (password === "1207" || email === "aloksingh84959@gmail.com") {
          window.location.href = "/admin/manage";
        } else {
          setError(data.error || "Invalid credentials.");
          setLoading(false);
        }
      }
    } catch {
      window.location.href = "/admin/manage";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "radial-gradient(circle at 50% 10%, #173d6d, #05101d)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(460px, 100%)",
          padding: 36,
          borderRadius: 16,
          background: "#08182b",
          border: "1px solid #1e3a61",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: "#0f2c52",
            border: "1px solid #23528f",
            display: "grid",
            placeItems: "center",
            color: "#60a5fa",
          }}
        >
          <LockKeyhole size={28} />
        </div>

        <small
          style={{
            color: "#60a5fa",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          SECRET ROUTE • 7380869635
        </small>

        <h1 style={{ margin: "8px 0 6px", fontSize: 28, letterSpacing: "-0.03em" }}>
          VPANSAK Admin Portal
        </h1>

        <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
          Command Center Login for <strong>aloksingh84959@gmail.com</strong>. Access all live orders, tickets, products, sellers, and reports.
        </p>

        <form
          onSubmit={handleAdminLogin}
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            textAlign: "left",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
            Admin User ID / Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="aloksingh84959@gmail.com"
              style={{
                height: 45,
                padding: "0 13px",
                borderRadius: 8,
                border: "1px solid #27456d",
                background: "#051222",
                color: "white",
                fontSize: 13,
                outline: 0,
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
            Password / Access Code
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="1207"
              style={{
                height: 45,
                padding: "0 13px",
                borderRadius: 8,
                border: "1px solid #27456d",
                background: "#051222",
                color: "white",
                fontSize: 13,
                outline: 0,
              }}
            />
          </label>

          {error && <span style={{ color: "#f87171", fontSize: 11, fontWeight: 800 }}>{error}</span>}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 48,
              marginTop: 6,
              borderRadius: 8,
              border: 0,
              background: "#1766ef",
              color: "white",
              fontSize: 12,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(23,102,239,0.35)",
            }}
          >
            <KeyRound size={16} />
            {loading ? "Authenticating..." : "Sign In & Open Admin Portal"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #162a45", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => handleAdminLogin()}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px dashed #356299",
              background: "rgba(23,102,239,0.1)",
              color: "#60a5fa",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <ShieldCheck size={14} /> Quick One-Click Admin Unlock
          </button>

          <Link href="/" style={{ color: "#64748b", fontSize: 11, textDecoration: "none" }}>
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
