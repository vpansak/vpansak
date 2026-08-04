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

  useEffect(() => {
    // Check if redirected from Google OAuth with id_token or access_token in URL hash
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const idToken = hashParams.get("id_token");
      const accessToken = hashParams.get("access_token");

      if (idToken || accessToken) {
        setBusy(true);
        fetch("/api/auth/google", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ credential: idToken || accessToken }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.ok) {
              setSuccess("Signed in with Google successfully!");
              setTimeout(() => {
                router.push(data.redirect || returnTo);
                router.refresh();
              }, 600);
            } else {
              setError(data.error || "Google Auth failed");
            }
          })
          .catch(() => setError("Google Auth failed"))
          .finally(() => setBusy(false));
      }
    }
  }, [router, returnTo]);

  const launchGoogleOAuthPopup = () => {
    const redirectUri = encodeURIComponent(window.location.origin + "/signin");
    const scope = encodeURIComponent("openid email profile");
    const clientId = "1078992815106-brpsupgvhheqg35tuppbh0qk9c32n1k.apps.googleusercontent.com";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token%20id_token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;
    window.location.href = authUrl;
  };

  const handleGoogleSignIn = () => {
    setBusy(true);
    setError("");
    setSuccess("");

    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: "1078992815106-brpsupgvhheqg35tuppbh0qk9c32n1k.apps.googleusercontent.com",
        callback: async (response: any) => {
          if (response?.credential) {
            try {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
              });
              const data = await res.json();
              if (res.ok) {
                setSuccess("Google account verified! Redirecting...");
                setTimeout(() => {
                  router.push(data.redirect || returnTo);
                  router.refresh();
                }, 600);
              } else {
                setError(data.error || "Google Sign-In failed.");
              }
            } catch {
              setError("Google Sign-In failed.");
            } finally {
              setBusy(false);
            }
          }
        },
      });

      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          launchGoogleOAuthPopup();
        } else {
          setBusy(false);
        }
      });
    } else {
      launchGoogleOAuthPopup();
    }
  };

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
            <ArrowLeft /> Storefront
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

          {(mode === "signin" || mode === "signup") && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: "100%",
                height: 44,
                marginBottom: 16,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </button>
          )}

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
