"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  Mail,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "expired" | "already_used" | "invalid">("loading");
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Resend state
  const [resendEmail, setResendEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");
  const [resendErrorMsg, setResendErrorMsg] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setErrorMessage("This verification link is invalid or no longer available.");
      return;
    }

    let isMounted = true;
    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (data.email) {
          setUserEmail(data.email);
          setResendEmail(data.email);
        }

        if (data.ok && data.code === "VERIFIED") {
          setStatus("success");
        } else if (data.code === "ALREADY_USED") {
          setStatus("already_used");
          setErrorMessage(data.error || "This email verification link has already been used.");
        } else if (data.code === "EXPIRED") {
          setStatus("expired");
          setErrorMessage(data.error || "This verification link has expired. Please request a new verification email.");
        } else {
          setStatus("invalid");
          setErrorMessage(data.error || "This verification link is invalid or no longer available.");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Verification error:", err);
          setStatus("invalid");
          setErrorMessage("Could not connect to verify your email address. Please try again.");
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resendCooldown > 0 || resendBusy) return;

    const emailToUse = (resendEmail || userEmail).trim().toLowerCase();
    if (!emailToUse) {
      setResendErrorMsg("Please enter your registered email address.");
      return;
    }

    setResendBusy(true);
    setResendSuccessMsg("");
    setResendErrorMsg("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResendErrorMsg(data.error || "Could not resend verification email.");
        if (data.remainingSeconds) {
          setResendCooldown(data.remainingSeconds);
        }
        return;
      }

      setResendSuccessMsg(data.message || "A new verification email has been sent. Please check your inbox.");
      setResendCooldown(60);
    } catch {
      setResendErrorMsg("We couldn’t send the verification email right now. Please try again.");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="vp-auth-page">
      <div className="vp-auth-card text-center" style={{ maxWidth: "480px" }}>
        {/* Header: Brand logo */}
        <div className="vp-auth-brand-row" style={{ justifyContent: "center" }}>
          <img src="/vpansak-logo.png" alt="VPANSAK" className="vp-auth-logo" />
          <span className="vp-auth-brand-name">VPANSAK</span>
        </div>

        {/* LOADING STATE */}
        {status === "loading" && (
          <div style={{ padding: "32px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles className="animate-spin" size={28} />
            </div>
            <h1 className="vp-auth-title" style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
              Verifying your email address…
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Please wait while we activate your VPANSAK account.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h1 className="vp-auth-title" style={{ color: "#15803d", marginBottom: "8px" }}>
              ✓ Email Verified
            </h1>

            <p style={{ color: "#334155", fontSize: "1.05rem", fontWeight: "500", marginBottom: "8px" }}>
              Your email has been verified successfully.
            </p>

            <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "28px" }}>
              Your VPANSAK account is ready.
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="vp-auth-submit-btn"
              style={{ backgroundColor: "#16a34a", cursor: "pointer" }}
            >
              Continue to Login
            </button>
          </div>
        )}

        {/* ALREADY USED STATE */}
        {status === "already_used" && (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                backgroundColor: "#dbeafe",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info size={36} />
            </div>

            <h1 className="vp-auth-title" style={{ fontSize: "1.25rem", marginBottom: "12px" }}>
              This email verification link has already been used.
            </h1>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "28px" }}>
              Your email address is already verified and your VPANSAK account is active. Please proceed to login.
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="vp-auth-submit-btn"
              style={{ cursor: "pointer" }}
            >
              Continue to Login
            </button>
          </div>
        )}

        {/* EXPIRED STATE */}
        {status === "expired" && (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={36} />
            </div>

            <h1 className="vp-auth-title" style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
              Verification link expired.
            </h1>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "20px" }}>
              This verification link has expired. Please request a new verification email.
            </p>

            {resendSuccessMsg && (
              <div className="vp-auth-alert success" role="status" style={{ marginBottom: "16px" }}>
                <CheckCircle2 size={18} />
                <p>{resendSuccessMsg}</p>
              </div>
            )}

            {resendErrorMsg && (
              <div className="vp-auth-alert error" role="alert" style={{ marginBottom: "16px" }}>
                <ShieldAlert size={18} />
                <p>{resendErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {!userEmail && (
                <div className="vp-field" style={{ textAlign: "left" }}>
                  <label htmlFor="expired-email">Email Address</label>
                  <div className="vp-input-wrap">
                    <Mail className="vp-input-icon" size={18} />
                    <input
                      id="expired-email"
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={resendBusy}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
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
            </form>

            <div style={{ marginTop: "16px" }}>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
        )}

        {/* INVALID STATE */}
        {status === "invalid" && (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px auto",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldAlert size={36} />
            </div>

            <h1 className="vp-auth-title" style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
              Invalid verification link.
            </h1>

            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "28px" }}>
              {errorMessage || "This verification link is invalid or no longer available."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="vp-auth-submit-btn"
                style={{ cursor: "pointer" }}
              >
                Continue to Login
              </button>

              <Link
                href="/signup"
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
                Create a new account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="vp-auth-loading">Loading VPANSAK verification…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
