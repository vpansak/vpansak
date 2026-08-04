"use client";

import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, Phone, ShieldCheck, Sparkles, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to") || "/account";

  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot / Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    const initialMode = searchParams.get("mode");
    if (initialMode === "signup") setMode("signup");
    if (initialMode === "forgot") setMode("forgot");
  }, [searchParams]);

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
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      setSuccess("Signed in successfully! Redirecting...");
      setTimeout(() => {
        router.push(returnTo);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, email, mobile, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Account creation failed");
      }

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push(returnTo);
        router.refresh();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

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
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset request failed");
      }

      if (data.code) {
        setGeneratedCode(data.code);
      }
      setSuccess(data.message || "Reset code generated!");
      setMode("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setBusy(false);
    }
  };

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
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password update failed");
      }

      setSuccess("Password updated! You can now sign in with your new password.");
      setTimeout(() => {
        setMode("signin");
        setError("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>AUTHENTICATION</small>
          </span>
        </Link>
        <nav>
          <Link href="/">
            <ArrowLeft /> Return to store
          </Link>
        </nav>
      </header>

      <div className="auth-shell">
        <section className="auth-card">
          <div className="auth-header">
            <div className="auth-badge">
              <ShieldCheck />
              <span>VPANSAK SECURE AUTH</span>
            </div>

            {mode === "signin" && (
              <>
                <h1>Sign in to your account</h1>
                <p>Access your orders, wishlist, saved addresses and customer support.</p>
              </>
            )}

            {mode === "signup" && (
              <>
                <h1>Create a new account</h1>
                <p>Register to start shopping, tracking orders, and receiving special offers.</p>
              </>
            )}

            {mode === "forgot" && (
              <>
                <h1>Forgot password</h1>
                <p>Enter your email address and we will generate a password reset code.</p>
              </>
            )}

            {mode === "reset" && (
              <>
                <h1>Set new password</h1>
                <p>Enter the 6-digit code and your new password to complete the reset.</p>
              </>
            )}
          </div>

          <div className="auth-tabs">
            <button
              className={mode === "signin" ? "active" : ""}
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccess("");
              }}
            >
              <LogIn /> Sign In
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess("");
              }}
            >
              <UserPlus /> Sign Up
            </button>
            <button
              className={mode === "forgot" || mode === "reset" ? "active" : ""}
              onClick={() => {
                setMode("forgot");
                setError("");
                setSuccess("");
              }}
            >
              <KeyRound /> Forgot Password
            </button>
          </div>

          {error && (
            <div className="auth-alert error" onClick={() => setError("")}>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-alert success" onClick={() => setSuccess("")}>
              <CheckCircle2 /> {success}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="auth-form">
              <label>
                <span>Email address</span>
                <div className="input-with-icon">
                  <Mail />
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
                  <Lock />
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
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>

              <div className="auth-options">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button disabled={busy} className="auth-submit-btn">
                {busy ? "Signing in..." : "Sign in to account"} <LogIn />
              </button>

              <div className="auth-footer-prompt">
                <span>Don't have an account?</span>
                <button
                  type="button"
                  className="link-btn bold"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Register now
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="auth-form">
              <label>
                <span>Full name</span>
                <div className="input-with-icon">
                  <User />
                  <input name="fullName" placeholder="Alok Singh" required maxLength={100} />
                </div>
              </label>

              <label>
                <span>Email address</span>
                <div className="input-with-icon">
                  <Mail />
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
                <span>Mobile number</span>
                <div className="input-with-icon">
                  <Phone />
                  <input
                    name="mobile"
                    type="tel"
                    placeholder="9876543210"
                    required
                    maxLength={15}
                  />
                </div>
              </label>

              <label>
                <span>Password</span>
                <div className="input-with-icon">
                  <Lock />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>

              <label>
                <span>Confirm password</span>
                <div className="input-with-icon">
                  <Lock />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                  />
                </div>
              </label>

              <button disabled={busy} className="auth-submit-btn">
                {busy ? "Creating account..." : "Create new account"} <UserPlus />
              </button>

              <div className="auth-footer-prompt">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="link-btn bold"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <label>
                <span>Your registered email</span>
                <div className="input-with-icon">
                  <Mail />
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

              <button disabled={busy} className="auth-submit-btn">
                {busy ? "Sending reset code..." : "Send reset code"} <KeyRound />
              </button>

              <div className="auth-footer-prompt">
                <span>Already have a code?</span>
                <button
                  type="button"
                  className="link-btn bold"
                  onClick={() => {
                    setMode("reset");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Enter code & reset
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="auth-form">
              {generatedCode && (
                <div className="otp-display-box">
                  <Sparkles />
                  <div>
                    <small>DEMO RESET CODE</small>
                    <strong>{generatedCode}</strong>
                  </div>
                </div>
              )}

              <label>
                <span>Email address</span>
                <div className="input-with-icon">
                  <Mail />
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
                <span>6-digit OTP code</span>
                <div className="input-with-icon">
                  <KeyRound />
                  <input
                    name="code"
                    placeholder="123456"
                    defaultValue={generatedCode}
                    required
                    maxLength={8}
                  />
                </div>
              </label>

              <label>
                <span>New password</span>
                <div className="input-with-icon">
                  <Lock />
                  <input
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>

              <button disabled={busy} className="auth-submit-btn">
                {busy ? "Updating password..." : "Update password & sign in"} <CheckCircle2 />
              </button>
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
            <p>Loading sign in page...</p>
          </div>
        </main>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
