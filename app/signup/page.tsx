"use client";

import { CheckCircle2, Eye, EyeOff, HelpCircle, Lock, Mail, Phone, ShieldAlert, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
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
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;

    setError("");
    setSuccessMsg("");

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
      setError("Password must be at least 8 characters long, contain uppercase, lowercase, number and a special character.");
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
        setError(data.error || "Could not create account. Please check your information.");
        return;
      }

      setSuccessMsg(data.message || "Your VPANSAK account has been created successfully. You can now log in.");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(cleanEmail)}`);
      }, 2000);
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

        {/* Heading */}
        <h1 className="vp-auth-title">Create Account</h1>

        {/* Error Alert */}
        {error && (
          <div className="vp-auth-alert error" role="alert">
            <ShieldAlert size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="vp-auth-alert success" role="status">
            <CheckCircle2 size={18} />
            <p>{successMsg}</p>
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
