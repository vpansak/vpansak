"use client";

import { ArrowLeft, CheckCircle2, Eye, EyeOff, HelpCircle, KeyRound, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

type Step = "EMAIL" | "OPTIONS" | "SECURITY_QUESTION" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialCode = searchParams.get("code") || searchParams.get("otp") || searchParams.get("token") || "";

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState(initialEmail);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  // OTP inputs state (6 boxes)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (initialCode && initialCode.length === 6 && /^\d+$/.test(initialCode)) {
      const parts = initialCode.split("");
      setOtp(parts);
      setStep("OTP");
      if (initialEmail) {
        const p = initialEmail.split("@");
        const masked = p[0].length <= 2 ? p[0] + "***" : p[0].slice(0, 2) + "***";
        setMaskedEmail(`${masked}@${p[1] || ""}`);
      }
    }
  }, [initialCode, initialEmail]);

  // New password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Resend timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Check Email
  const handleCheckEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setError("");
    setIsNotFound(false);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Account not found.");
        if (data.notFound || res.status === 404) {
          setIsNotFound(true);
        }
        return;
      }

      setEmail(cleanEmail);
      if (data.securityQuestion) {
        setSecurityQuestion(data.securityQuestion);
      }
      setStep("OPTIONS");
    } catch {
      setError("We couldn’t complete your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Select Security Question option
  const handleSelectSecurityQuestion = () => {
    setError("");
    setStep("SECURITY_QUESTION");
  };

  // Select Email OTP option
  const handleSelectOtp = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not send verification code.");
        return;
      }

      setMaskedEmail(data.maskedEmail || email);
      setResendTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setStep("OTP");
    } catch {
      setError("We couldn’t complete your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Submit Security Question Answer
  const handleVerifySecurityQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setError("");
    if (!securityAnswer.trim()) {
      setError("Please enter your security answer.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password/security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answer: securityAnswer }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The security answer is incorrect.");
        return;
      }

      setResetToken(data.resetToken);
      setStep("NEW_PASSWORD");
    } catch {
      setError("We couldn’t complete your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // OTP Box Change Handler
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    // Handle multi-character paste
    if (cleanVal.length > 1) {
      const nextOtp = [...otp];
      for (let i = 0; i < 6 && i < cleanVal.length; i++) {
        nextOtp[i] = cleanVal[i];
      }
      setOtp(nextOtp);
      const focusIndex = Math.min(5, cleanVal.length);
      otpRefs.current[focusIndex]?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = cleanVal[0];
    setOtp(nextOtp);

    // Auto advance
    if (index < 5 && cleanVal) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // OTP KeyDown Handler for backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "The verification code is incorrect.");
        return;
      }

      setResetToken(data.resetToken);
      setStep("NEW_PASSWORD");
    } catch {
      setError("We couldn’t complete your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Submit New Password
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setError("");

    if (!newPassword.trim()) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resetToken,
          password: newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not update password.");
        return;
      }

      setSuccessMsg(data.message || "Your password has been updated successfully. Please log in with your new password.");
      setStep("SUCCESS");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 2500);
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

        {/* Success Alert */}
        {successMsg && (
          <div className="vp-auth-alert success" role="status">
            <CheckCircle2 size={18} />
            <p>{successMsg}</p>
          </div>
        )}

        {/* STEP 1: Email Check */}
        {step === "EMAIL" && (
          <>
            <h1 className="vp-auth-title">Reset Password</h1>
            <p className="vp-auth-subtitle">Enter your registered email address to continue.</p>

            <form onSubmit={handleCheckEmail} className="vp-auth-form" noValidate>
              <div className="vp-field">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="vp-input-wrap">
                  <Mail className="vp-input-icon" size={18} />
                  <input
                    id="forgot-email"
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

              <button type="submit" className="vp-auth-submit-btn" disabled={busy}>
                {busy ? (
                  <>
                    <Sparkles className="animate-spin" size={16} /> Checking account…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Choose Reset Method */}
        {step === "OPTIONS" && (
          <>
            <h1 className="vp-auth-title">Choose Verification Method</h1>
            <p className="vp-auth-subtitle">Choose how you want to verify your account</p>

            <div className="vp-reset-options">
              {securityQuestion && (
                <button type="button" className="vp-option-card" onClick={handleSelectSecurityQuestion} disabled={busy}>
                  <HelpCircle className="vp-option-icon" size={24} />
                  <div>
                    <strong>Security Question</strong>
                    <small>Answer your saved security question.</small>
                  </div>
                </button>
              )}

              <button type="button" className="vp-option-card" onClick={handleSelectOtp} disabled={busy}>
                <Mail className="vp-option-icon" size={24} />
                <div>
                  <strong>{busy ? "Sending verification code…" : "Email OTP"}</strong>
                  <small>Receive a verification code on your registered email.</small>
                </div>
              </button>
            </div>

            <button type="button" className="vp-auth-back-btn" onClick={() => setStep("EMAIL")}>
              <ArrowLeft size={16} /> Change email address
            </button>
          </>
        )}

        {/* STEP 3A: Security Question Verification */}
        {step === "SECURITY_QUESTION" && (
          <>
            <h1 className="vp-auth-title">Answer Security Question</h1>
            <p className="vp-auth-subtitle">Answer your security question</p>

            <form onSubmit={handleVerifySecurityQuestion} className="vp-auth-form" noValidate>
              <div className="vp-field">
                <label>Question</label>
                <div className="vp-question-display">{securityQuestion}</div>
              </div>

              <div className="vp-field">
                <label htmlFor="sec-answer">Security Answer</label>
                <div className="vp-input-wrap">
                  <input
                    id="sec-answer"
                    type="text"
                    required
                    placeholder="Enter your security answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>

              <button type="submit" className="vp-auth-submit-btn" disabled={busy}>
                {busy ? (
                  <>
                    <Sparkles className="animate-spin" size={16} /> Verifying answer…
                  </>
                ) : (
                  "Verify Answer"
                )}
              </button>
            </form>

            <button type="button" className="vp-auth-back-btn" onClick={() => setStep("OPTIONS")}>
              <ArrowLeft size={16} /> Use email verification instead
            </button>
          </>
        )}

        {/* STEP 3B: OTP Verification */}
        {step === "OTP" && (
          <>
            <h1 className="vp-auth-title">Verify Your Email</h1>
            <p className="vp-auth-subtitle">
              We sent a 6-digit verification code to <strong>{maskedEmail}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="vp-auth-form" noValidate>
              <div className="vp-field">
                <label>Verification Code</label>
                <div className="vp-otp-boxes">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={busy}
                      className="vp-otp-input"
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="vp-auth-submit-btn" disabled={busy}>
                {busy ? (
                  <>
                    <Sparkles className="animate-spin" size={16} /> Verifying code…
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>

            <div className="vp-otp-actions">
              {canResend ? (
                <button type="button" className="vp-resend-btn" onClick={handleSelectOtp} disabled={busy}>
                  Resend code
                </button>
              ) : (
                <span className="vp-resend-timer">Resend code in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
              )}

              {securityQuestion && (
                <button type="button" className="vp-auth-switch-link" onClick={() => setStep("SECURITY_QUESTION")}>
                  Use security question instead
                </button>
              )}
            </div>

            <button type="button" className="vp-auth-back-btn" onClick={() => setStep("OPTIONS")}>
              <ArrowLeft size={16} /> Change reset method
            </button>
          </>
        )}

        {/* STEP 4: New Password */}
        {step === "NEW_PASSWORD" && (
          <>
            <h1 className="vp-auth-title">Create New Password</h1>
            <p className="vp-auth-subtitle">Choose a strong password for your VPANSAK account.</p>

            <form onSubmit={handleUpdatePassword} className="vp-auth-form" noValidate>
              <div className="vp-field">
                <label htmlFor="new-password">New Password</label>
                <div className="vp-input-wrap">
                  <Lock className="vp-input-icon" size={18} />
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Min 8 chars (A-Z, a-z, 0-9, @#$)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="vp-password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="vp-field">
                <label htmlFor="confirm-new-password">Confirm New Password</label>
                <div className="vp-input-wrap">
                  <Lock className="vp-input-icon" size={18} />
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
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

              <button type="submit" className="vp-auth-submit-btn" disabled={busy}>
                {busy ? (
                  <>
                    <Sparkles className="animate-spin" size={16} /> Updating password…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 5: Success State */}
        {step === "SUCCESS" && (
          <div className="vp-auth-success-state">
            <CheckCircle2 className="vp-success-icon" size={48} />
            <h2>Password Reset Complete</h2>
            <p>Your password has been updated successfully. Redirecting you to login…</p>
            <Link href={`/login?email=${encodeURIComponent(email)}`} className="vp-auth-submit-btn">
              Back to Login
            </Link>
          </div>
        )}

        {/* Bottom Back to Login Link */}
        {step !== "SUCCESS" && (
          <div className="vp-auth-links">
            <p className="vp-auth-switch-text">
              Remembered your password?{" "}
              <Link href="/login" className="vp-auth-switch-link">
                Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="vp-auth-loading">Loading VPANSAK password reset…</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
