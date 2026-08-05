"use client";

import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, Phone, ShieldCheck, Sparkles, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

function sanitizeRedirect(url: string | null): string {
  if (!url) return "/account";
  const trimmed = url.trim();
  // Prevent open-redirect vulnerabilities
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  return "/account";
}

function evaluatePasswordStrength(password: string): { label: "Weak" | "Medium" | "Strong"; score: number; color: string } {
  if (!password) return { label: "Weak", score: 0, color: "#ef4444" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  if (score <= 2) return { label: "Weak", score: 25, color: "#ef4444" };
  if (score <= 4) return { label: "Medium", score: 65, color: "#f59e0b" };
  return { label: "Strong", score: 100, color: "#10b981" };
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeRedirect(searchParams.get("return_to") || searchParams.get("redirectTo"));

  const [mode, setMode] = useState<"signin" | "signup" | "otp" | "forgot" | "reset">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Signup Form State
  const [signupPassword, setSignupPassword] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);

  // OTP Verification State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"email_verification" | "password_reset">("email_verification");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password Reset State
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const initialMode = searchParams.get("mode");
    const errParam = searchParams.get("error");
    if (initialMode === "signup") setMode("signup");
    if (initialMode === "forgot") setMode("forgot");

    if (errParam === "google_cancelled") {
      setError("Google sign-in was cancelled.");
    } else if (errParam === "google_failed") {
      setError("Unable to sign in with Google. Please try again.");
    }
  }, [searchParams]);

  // Resend Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === "otp" && resendTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [mode, resendTimer]);

  // Sync Guest Cart and Wishlist Data after login
  const syncGuestData = async () => {
    try {
      const rawCart = localStorage.getItem("vpansak_cart");
      const rawWishlist = localStorage.getItem("vpansak_wishlist");
      const cart = rawCart ? JSON.parse(rawCart) : [];
      const wishlist = rawWishlist ? JSON.parse(rawWishlist) : [];

      if (cart.length > 0 || wishlist.length > 0) {
        await fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mergeGuestData", cart, wishlist }),
        });
      }
    } catch (err) {
      console.warn("Guest data sync error:", err);
    }
  };

  // Google OAuth Response Handler
  const handleGoogleCredentialResponse = async (credentialString: string) => {
    setGoogleBusy(true);
    setError("");
    setSuccess("Verifying Google account credentials...");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed. Please try again.");

      await syncGuestData();
      setSuccess("You're successfully signed in with Google!");
      setTimeout(() => {
        router.push(data.redirect || returnTo);
        router.refresh();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in with Google. Please try again.");
    } finally {
      setGoogleBusy(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1078992815106-brpsupgvhheqg35tuppbh0qk9c32n1k.apps.googleusercontent.com";

    const initGsi = () => {
      const win = typeof window !== "undefined" ? (window as unknown as Record<string, Record<string, Record<string, { initialize: (opts: Record<string, unknown>) => void }>>>) : undefined;
      if (win?.google?.accounts?.id?.initialize) {
        try {
          win.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response?: Record<string, unknown>) => {
              if (typeof response?.credential === "string") {
                handleGoogleCredentialResponse(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (err) {
          console.error("GSI init notice:", err);
        }
      }
    };

    initGsi();
    const t = setTimeout(initGsi, 1000);
    return () => clearTimeout(t);
  }, []);

  const triggerGoogleSignIn = () => {
    setError("");
    setGoogleBusy(true);

    const win = typeof window !== "undefined" ? (window as unknown as Record<string, Record<string, Record<string, (cb?: (n: Record<string, unknown>) => void) => void>>>) : undefined;
    if (win?.google?.accounts?.id?.prompt) {
      try {
        win.google.accounts.id.prompt((notification?: Record<string, unknown>) => {
          if (notification && (Boolean(notification.isNotDisplayed) || Boolean(notification.isSkippedMoment))) {
            console.log("Google Popup not displayed, falling back to OAuth redirect.");
            redirectToGoogleOAuth();
          } else {
            setGoogleBusy(false);
          }
        });
        return;
      } catch {
        // Fallback to OAuth redirect
      }
    }

    redirectToGoogleOAuth();
  };

  const redirectToGoogleOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1078992815106-brpsupgvhheqg35tuppbh0qk9c32n1k.apps.googleusercontent.com";
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/google/callback`);
    const scope = encodeURIComponent("openid email profile");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  // Handle Sign In Submit
  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.unverified) {
          setOtpEmail(data.email || email);
          setOtpPurpose("email_verification");
          setResendTimer(60);
          setCanResend(false);
          setMode("otp");
          setError("Please verify your email before signing in.");
          return;
        }
        throw new Error(data.error || "Incorrect email or password.");
      }

      await syncGuestData();
      setSuccess("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push(data.redirect || returnTo);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const mobile = String(formData.get("mobile") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();
    const termsAccepted = signupTerms;

    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions and Privacy Policy.");
      setBusy(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, mobile, password, confirmPassword, termsAccepted: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Account creation failed.");
      }

      setOtpEmail(email);
      setOtpPurpose("email_verification");
      setResendTimer(60);
      setCanResend(false);
      setMode("otp");
      setSuccess(data.message || "Account created! We sent a 6-digit verification code to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed.");
    } finally {
      setBusy(false);
    }
  };

  // OTP Digits Handling
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleanVal;
    setOtpDigits(updated);

    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtpDigits(paste.split(""));
      otpInputsRef.current[5]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code, purpose: otpPurpose }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.");
      }

      if (otpPurpose === "password_reset") {
        setSuccess("Code verified successfully! Please enter your new password.");
        setMode("reset");
        return;
      }

      await syncGuestData();
      setSuccess("Email verified successfully! Welcome to VPANSAK.");
      setTimeout(() => {
        router.push(data.redirect || returnTo);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || busy) return;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, purpose: otpPurpose }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not resend verification code.");
      }

      setResendTimer(60);
      setCanResend(false);
      setSuccess(data.message || "A new 6-digit verification code has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend verification code.");
    } finally {
      setBusy(false);
    }
  };

  // Forgot Password Request
  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    setResetEmail(email);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setOtpEmail(email);
      setOtpPurpose("password_reset");
      setResendTimer(60);
      setCanResend(false);
      setSuccess(data.message || "If an account exists with this email, password reset instructions have been sent.");
      setMode("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset request failed.");
    } finally {
      setBusy(false);
    }
  };

  // Reset Password Submit
  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim() || resetEmail;
    const code = String(formData.get("code") || "").trim();
    const newPassword = String(formData.get("newPassword") || "").trim();

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess("Password updated successfully! You can now sign in.");
      setTimeout(() => {
        setMode("signin");
        setError("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setBusy(false);
    }
  };

  const strength = evaluatePasswordStrength(signupPassword);

  return (
    <main className="auth-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SHOPPING</small>
          </span>
        </Link>
        <nav>
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Return to Store
          </Link>
        </nav>
      </header>

      <div className="auth-shell">
        <section className="auth-card">
          {/* Main Top Logo */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img
              src="/vpansak-logo-dark.jpeg"
              alt="VPANSAK Logo"
              style={{ height: 48, width: "auto", borderRadius: 8, margin: "0 auto 10px" }}
            />
          </div>

          <div className="auth-header">
            {mode === "signin" && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Welcome Back</h1>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Sign in to continue shopping on VPANSAK</p>
              </>
            )}

            {mode === "signup" && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Create Your Account</h1>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Join VPANSAK today for fast checkout and order tracking</p>
              </>
            )}

            {mode === "otp" && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Verify your email</h1>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                  We sent a 6-digit verification code to: <strong style={{ color: "#0f172a" }}>{otpEmail.replace(/(.{2})(.*)(?=@)/, (_m, p1, p2) => p1 + "*".repeat(p2.length))}</strong>
                </p>
              </>
            )}

            {mode === "forgot" && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Forgot Password</h1>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Enter your registered email to receive reset instructions</p>
              </>
            )}

            {mode === "reset" && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Set New Password</h1>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Enter the verification code and your new password</p>
              </>
            )}
          </div>

          {/* Navigation Tabs for Sign In & Create Account */}
          {(mode === "signin" || mode === "signup") && (
            <div className="auth-tabs" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={mode === "signin" ? "active" : ""}
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setSuccess("");
                }}
              >
                <LogIn size={16} /> Sign In
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccess("");
                }}
              >
                <UserPlus size={16} /> Create Account
              </button>
            </div>
          )}

          {error && (
            <div className="auth-alert error" onClick={() => setError("")} style={{ cursor: "pointer", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-alert success" onClick={() => setSuccess("")} style={{ cursor: "pointer", marginBottom: 16 }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {/* SIGN IN TAB CONTENT */}
          {mode === "signin" && (
            <div style={{ width: "100%" }}>
              {/* Google Button at Top */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                disabled={googleBusy || busy}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#1f2937",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: googleBusy || busy ? "not-allowed" : "pointer",
                  opacity: googleBusy || busy ? 0.7 : 1,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  marginBottom: 18,
                }}
              >
                {googleBusy ? (
                  <span style={{ fontSize: 13, color: "#4b5563" }}>Connecting to Google...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "#94a3b8", fontSize: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{ padding: "0 10px", textTransform: "lowercase" }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              <form onSubmit={handleSignIn} className="auth-form">
                <label>
                  <span>Email Address</span>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      maxLength={150}
                    />
                  </div>
                </label>

                <label>
                  <span>Password</span>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, margin: "6px 0 14px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#475569", fontWeight: 500 }}>
                    <input type="checkbox" name="remember" defaultChecked style={{ borderRadius: 4 }} />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="link-btn"
                    style={{ color: "#2563eb", fontWeight: 600, fontSize: 13 }}
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button disabled={busy || googleBusy} className="auth-submit-btn" style={{ height: 44, borderRadius: 10 }}>
                  {busy ? "Signing in..." : "Sign In"} <LogIn size={16} />
                </button>

                <div className="auth-footer-prompt" style={{ marginTop: 16, textAlign: "center" }}>
                  <span>Don&apos;t have an account? </span>
                  <button
                    type="button"
                    className="link-btn bold"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SIGN UP TAB CONTENT */}
          {mode === "signup" && (
            <div style={{ width: "100%" }}>
              {/* Google Button at Top */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                disabled={googleBusy || busy}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#1f2937",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: googleBusy || busy ? "not-allowed" : "pointer",
                  opacity: googleBusy || busy ? 0.7 : 1,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  marginBottom: 18,
                }}
              >
                {googleBusy ? (
                  <span style={{ fontSize: 13, color: "#4b5563" }}>Connecting to Google...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "#94a3b8", fontSize: 12 }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{ padding: "0 10px", textTransform: "lowercase" }}>or sign up with email</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              <form onSubmit={handleSignUp} className="auth-form">
                <label>
                  <span>Full Name</span>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input name="fullName" placeholder="Enter your full name" required maxLength={100} />
                  </div>
                </label>

                <label>
                  <span>Email Address</span>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      maxLength={150}
                    />
                  </div>
                </label>

                <label>
                  <span>Mobile Number</span>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      name="mobile"
                      type="tel"
                      placeholder="10-digit mobile number"
                      required
                      maxLength={15}
                    />
                  </div>
                </label>

                <label>
                  <span>Password</span>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 chars (A-z, 0-9, @#$)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {signupPassword.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: strength.color, marginBottom: 2 }}>
                        <span>Password Strength:</span>
                        <span>{strength.label}</span>
                      </div>
                      <div style={{ width: "100%", height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${strength.score}%`, height: "100%", background: strength.color, transition: "all 0.3s ease" }} />
                      </div>
                    </div>
                  )}
                </label>

                <label>
                  <span>Confirm Password</span>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      required
                      minLength={8}
                    />
                  </div>
                </label>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginTop: 6, fontSize: 12, color: "#475569" }}>
                  <input
                    type="checkbox"
                    checked={signupTerms}
                    onChange={(e) => setSignupTerms(e.target.checked)}
                    required
                    style={{ marginTop: 2, borderRadius: 4 }}
                  />
                  <span>
                    I agree to the <Link href="/policies/terms" target="_blank" style={{ color: "#2563eb", textDecoration: "underline" }}>Terms and Conditions</Link> and <Link href="/policies/privacy" target="_blank" style={{ color: "#2563eb", textDecoration: "underline" }}>Privacy Policy</Link>
                  </span>
                </label>

                <button disabled={busy || googleBusy} className="auth-submit-btn" style={{ height: 44, borderRadius: 10, marginTop: 10 }}>
                  {busy ? "Creating Account..." : "Create Account"} <UserPlus size={16} />
                </button>

                <div className="auth-footer-prompt" style={{ marginTop: 16, textAlign: "center" }}>
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    className="link-btn bold"
                    onClick={() => {
                      setMode("signin");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OTP VERIFICATION VIEW */}
          {mode === "otp" && (
            <div className="otp-container" style={{ textAlign: "center", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "20px 0 24px" }}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpInputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: 44,
                      height: 52,
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: "center",
                      borderRadius: 10,
                      border: "2px solid #cbd5e1",
                      outline: "none",
                      background: "#f8fafc",
                      color: "#0f172a",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={busy || otpDigits.join("").length !== 6}
                className="auth-submit-btn"
                style={{ height: 44, borderRadius: 10, width: "100%", marginBottom: 16 }}
              >
                {busy ? "Verifying..." : "Verify Email"} <ShieldCheck size={16} />
              </button>

              <div style={{ fontSize: 13, color: "#64748b" }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={busy}
                    style={{ color: "#2563eb", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Resend verification code
                  </button>
                ) : (
                  <span>Resend code in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="auth-form" style={{ width: "100%" }}>
              <label>
                <span>Registered Email Address</span>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    name="email"
                    type="email"
                    defaultValue={resetEmail}
                    placeholder="name@example.com"
                    required
                    maxLength={150}
                  />
                </div>
              </label>

              <button disabled={busy} className="auth-submit-btn" style={{ height: 44, borderRadius: 10 }}>
                {busy ? "Sending Instructions..." : "Send Reset Instructions"} <KeyRound size={16} />
              </button>

              <div className="auth-footer-prompt" style={{ marginTop: 16, textAlign: "center" }}>
                <button
                  type="button"
                  className="link-btn bold"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccess("");
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD VIEW */}
          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="auth-form" style={{ width: "100%" }}>
              <label>
                <span>Email Address</span>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    name="email"
                    type="email"
                    defaultValue={resetEmail}
                    placeholder="name@example.com"
                    required
                    maxLength={150}
                  />
                </div>
              </label>

              <label>
                <span>6-Digit Reset Code</span>
                <div className="input-with-icon">
                  <KeyRound size={16} />
                  <input
                    name="code"
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                  />
                </div>
              </label>

              <label>
                <span>New Password</span>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters (A-z, 0-9, @#$)"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button disabled={busy} className="auth-submit-btn" style={{ height: 44, borderRadius: 10 }}>
                {busy ? "Updating Password..." : "Update Password & Sign In"} <CheckCircle2 size={16} />
              </button>

              <div className="auth-footer-prompt" style={{ marginTop: 16, textAlign: "center" }}>
                <button
                  type="button"
                  className="link-btn bold"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccess("");
                  }}
                >
                  ← Cancel & Back to Sign In
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <div className="account-loading">
            <span />
            <p>Loading VPANSAK Authentication...</p>
          </div>
        </main>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
