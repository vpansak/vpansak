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

  const handleGoogleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lffcguvwibkpwzzihpcp.supabase.co";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZmNndXZ3aWJrcHd6emlocGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NzUxMjMsImV4cCI6MjEwMTM1MTEyM30.lQXIRxcMGpoXVfcXyB_yCArWhBeaExjp5a6y_Uy6Rv8";

      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      const redirectTarget = `${window.location.origin}/api/auth/google/callback${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ""}`;

      const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTarget,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Google sign-in could not be started.");
        setBusy(false);
      }
    } catch {
      setError("Could not connect to Google sign-in. Please try again.");
      setBusy(false);
    }
  };

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

        {/* Divider & Google OAuth Button */}
        <div className="vp-auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="vp-auth-google-btn"
          disabled={busy}
        >
          <svg className="vp-google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

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
