"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { SECURITY_QUESTIONS } from "../lib/auth-session";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestionId, setSecurityQuestionId] = useState(SECURITY_QUESTIONS[0].id);
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Verification Pending State
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingMaskedEmail, setPendingMaskedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resendError, setResendError] = useState("");

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPendingVerification && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPendingVerification, resendCooldown]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak password", color: "#e11d48" };
    if (score <= 4) return { score: 2, label: "Medium strength", color: "#d97706" };
    return { score: 3, label: "Strong password", color: "#16a34a" };
  };

  const strength = getPasswordStrength(password);

  const handleGoogleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lffcguvwibkpwzzihpcp.supabase.co";
      const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZmNndXZ3aWJrcHd6emlocGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NzUxMjMsImV4cCI6MjEwMTM1MTEyM30.lQXIRxcMGpoXVfcXyB_yCArWhBeaExjp5a6y_Uy6Rv8";

      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      const redirectTarget = `${window.location.origin}/api/auth/google/callback`;

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

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();
    const cleanAnswer = securityAnswer.trim();

    if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
      setError("Full Name must be between 2 and 60 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!cleanPassword) {
      setError("Please enter your password.");
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (strength.score < 2) {
      setError(
        "Password must be at least 8 characters long, contain uppercase, lowercase, number and a special character."
      );
      return;
    }

    if (!cleanAnswer || cleanAnswer.length < 2) {
      setError("Security Answer must be at least 2 characters long.");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          mobile: cleanMobile,
          password: cleanPassword,
          confirmPassword: cleanConfirm,
          securityQuestionId,
          securityAnswer: cleanAnswer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not process registration. Please check your information.");
        return;
      }

      if (data.pending) {
        setPendingEmail(cleanEmail);
        setPendingMaskedEmail(data.maskedEmail || cleanEmail);
        setIsPendingVerification(true);
        setResendCooldown(60);
      } else {
        router.push(data.redirect || "/login");
      }
    } catch {
      setError("We couldn’t complete your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendBusy) return;

    setResendBusy(true);
    setResendMsg("");
    setResendError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResendError(data.error || "Could not resend verification email.");
        if (data.remainingSeconds) {
          setResendCooldown(data.remainingSeconds);
        }
        return;
      }

      setResendMsg(data.message || "Verification email sent. Please check your email.");
      setResendCooldown(60);
    } catch {
      setResendError("We couldn’t send the verification email right now. Please try again.");
    } finally {
      setResendBusy(false);
    }
  };

  // Render "Check your email" view if pending verification
  if (isPendingVerification) {
    return (
      <div className="vp-auth-page">
        <div className="vp-auth-card text-center" style={{ maxWidth: "480px" }}>
          {/* Header logo */}
          <div className="vp-auth-brand-row" style={{ justifyContent: "center" }}>
            <img src="/vpansak-logo.png" alt="VPANSAK" className="vp-auth-logo" />
            <span className="vp-auth-brand-name">VPANSAK</span>
          </div>

          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "16px auto 8px auto",
              borderRadius: "50%",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mail size={32} />
          </div>

          <h1 className="vp-auth-title" style={{ marginBottom: "8px" }}>
            Check your email
          </h1>

          <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "16px" }}>
            We sent a verification link to your email address:
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              backgroundColor: "#f1f5f9",
              borderRadius: "20px",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "20px",
              fontSize: "0.95rem",
            }}
          >
            {pendingMaskedEmail}
          </div>

          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "24px" }}>
            Open the email and select <strong>‘Verify Email & Create Account’</strong> to complete your registration.
          </p>

          {resendMsg && (
            <div className="vp-auth-alert success" role="status" style={{ marginBottom: "16px" }}>
              <CheckCircle2 size={18} />
              <p>{resendMsg}</p>
            </div>
          )}

          {resendError && (
            <div className="vp-auth-alert error" role="alert" style={{ marginBottom: "16px" }}>
              <ShieldAlert size={18} />
              <p>{resendError}</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendBusy}
              className="vp-auth-submit-btn"
              style={{
                backgroundColor: resendCooldown > 0 ? "#94a3b8" : "#2563eb",
                cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
              }}
            >
              {resendBusy ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Sending link…
                </>
              ) : resendCooldown > 0 ? (
                `Resend Verification Email (${resendCooldown}s)`
              ) : (
                "Resend Verification Email"
              )}
            </button>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                color: "#475569",
                fontWeight: "500",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-auth-page">
      <div className="vp-auth-card">
        {/* Header: Logo + Name in same row */}
        <div className="vp-auth-brand-row">
          <img src="/vpansak-logo.png" alt="VPANSAK" className="vp-auth-logo" />
          <span className="vp-auth-brand-name">VPANSAK</span>
        </div>

        {/* Heading */}
        <h1 className="vp-auth-title">Create Account</h1>

        {/* Error Alert */}
        {error && (
          <div className="vp-auth-alert error" role="alert">
            <ShieldAlert size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="vp-auth-form" noValidate>
          {/* Full Name */}
          <div className="vp-field">
            <label htmlFor="signup-name">Full Name</label>
            <div className="vp-input-wrap">
              <User className="vp-input-icon" size={18} />
              <input
                id="signup-name"
                type="text"
                required
                maxLength={60}
                autoComplete="name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="vp-field">
            <label htmlFor="signup-email">Email Address</label>
            <div className="vp-input-wrap">
              <Mail className="vp-input-icon" size={18} />
              <input
                id="signup-email"
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

          {/* Mobile Number */}
          <div className="vp-field">
            <label htmlFor="signup-mobile">Mobile Number</label>
            <div className="vp-input-wrap vp-phone-wrap">
              <Phone className="vp-input-icon" size={18} />
              <span className="vp-phone-prefix">+91</span>
              <input
                id="signup-mobile"
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                disabled={busy}
              />
            </div>
          </div>

          {/* Password */}
          <div className="vp-field">
            <label htmlFor="signup-password">Password</label>
            <div className="vp-input-wrap">
              <Lock className="vp-input-icon" size={18} />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="At least 8 chars (A-Z, a-z, 0-9, @#$)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="vp-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <div className="vp-password-meter">
                <div className="vp-meter-bar">
                  <div
                    className="vp-meter-fill"
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <span style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="vp-field">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="vp-input-wrap">
              <Lock className="vp-input-icon" size={18} />
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="vp-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Security Question */}
          <div className="vp-field">
            <label htmlFor="signup-security-question">Security Question</label>
            <div className="vp-input-wrap">
              <HelpCircle className="vp-input-icon" size={18} />
              <select
                id="signup-security-question"
                value={securityQuestionId}
                onChange={(e) => setSecurityQuestionId(e.target.value)}
                disabled={busy}
              >
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.question}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Answer */}
          <div className="vp-field">
            <label htmlFor="signup-security-answer">Security Answer</label>
            <div className="vp-input-wrap">
              <input
                id="signup-security-answer"
                type="text"
                required
                placeholder="Enter your security answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                disabled={busy}
              />
            </div>
            <p className="vp-field-note">
              Choose an answer you can remember. It may be used to reset your password.
            </p>
          </div>

          {/* Submit Button */}
          <button type="submit" className="vp-auth-submit-btn" disabled={busy}>
            {busy ? (
              <>
                <Sparkles className="animate-spin" size={16} /> Creating account…
              </>
            ) : (
              "Create Account"
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
          <p className="vp-auth-switch-text">
            Already have an account?{" "}
            <Link href="/login" className="vp-auth-switch-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="vp-auth-loading">Loading VPANSAK registration…</div>}>
      <SignupForm />
    </Suspense>
  );
}
