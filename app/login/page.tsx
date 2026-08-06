"use client";

import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to") || searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;

    setError("");
    setIsNotFound(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cleanPassword) {
      setError("Please enter your password.");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not sign in. Please check your credentials.");
        if (data.notFound || res.status === 404) {
          setIsNotFound(true);
        }
        return;
      }

      // Safe internal redirect
      let target = data.redirect || "/";
      if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
        target = returnTo;
      }
      router.push(target);
      router.refresh();
    } catch {
      setError("We couldn’t complete your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vp-auth-page">
      <div className="vp-auth-card">
        {/* Header: Logo + Name in same row */}
        <div className="vp-auth-brand-row">
          <img src="/vpansak-logo.png" alt="VPANSAK" className="vp-auth-logo" />
          <span className="vp-auth-brand-name">VPANSAK</span>
        </div>

        {/* Headings */}
        <h1 className="vp-auth-title">Welcome Back</h1>
        <p className="vp-auth-subtitle">Sign in to continue to your VPANSAK account.</p>

        {/* Error Alert */}
        {error && (
          <div className="vp-auth-alert error" role="alert">
            <ShieldAlert size={18} />
            <div>
              <p>{error}</p>
              {isNotFound && (
                <Link href={`/signup?email=${encodeURIComponent(email)}`} className="vp-auth-alert-action">
                  Create Account now &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="vp-auth-form" noValidate>
          <div className="vp-field">
            <label htmlFor="login-email">Email Address</label>
            <div className="vp-input-wrap">
              <Mail className="vp-input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <div className="vp-field">
            <label htmlFor="login-password">Password</label>
            <div className="vp-input-wrap">
              <Lock className="vp-input-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="vp-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="vp-auth-submit-btn" disabled={busy}>
            {busy ? (
              <>
                <Sparkles className="animate-spin" size={16} /> Logging in…
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="vp-auth-links">
          <Link href="/forgot-password" className="vp-auth-forgot-link">
            Forgot Password?
          </Link>
          <p className="vp-auth-switch-text">
            Don’t have an account?{" "}
            <Link href="/signup" className="vp-auth-switch-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="vp-auth-loading">Loading VPANSAK login…</div>}>
      <LoginForm />
    </Suspense>
  );
}
