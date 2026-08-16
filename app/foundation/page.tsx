"use client";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  HeartHandshake,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

type VerifiedCertificate = {
  verificationId: string;
  certificateNumber: string;
  fullName: string;
  amount: number;
  paymentMethod: string;
  appreciationMessage: string;
  submittedAt: string;
  verifiedAt: string;
  paymentStatus: string;
  founderName: string;
  founderDesignation: string;
  signatureUrl: string;
};

type StatusRecord = {
  verificationId: string;
  paymentStatus: string;
  maskedName: string;
  maskedEmail?: string;
  maskedMobile?: string;
  amount: number;
  paymentMethod: string;
  submittedAt: string;
  verifiedAt?: string | null;
  certificateNumber?: string | null;
  publicRejectionReason?: string | null;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (data: { error?: { description?: string } }) => void) => void;
    };
  }
}

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function formatCertDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "13 AUG 2026";
  }
}

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

function FoundationContent() {
  const query = useSearchParams();

  // Search & Result states
  const [lookup, setLookup] = useState("");
  const [statusRecord, setStatusRecord] = useState<StatusRecord | null>(null);
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [statusType, setStatusType] = useState<
    "idle" | "pending_verification" | "verified" | "rejected" | "failed" | "verification_failed" | "refunded" | "invalid_id" | "submitted_ack" | "cancelled"
  >("idle");

  const [submittedId, setSubmittedId] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyText, setBusyText] = useState("");
  const [method, setMethod] = useState("razorpay");
  const [toast, setToast] = useState("");

  // Central strict verification check for certificate display
  const canShowCertificate =
    statusType === "verified" &&
    certificate !== null &&
    Boolean(certificate.certificateNumber) &&
    certificate.paymentStatus === "verified";

  // Deep-link certificate/verification search via query string ?certificate=VPC123456
  useEffect(() => {
    const id = query.get("certificate")?.trim().toUpperCase();
    if (!id || !/^VPC\d{6}$/.test(id)) return;
    setLookup(id);
    void checkStatusById(id);
  }, [query]);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value);
    setToast(`${label} copied!`);
    setTimeout(() => setToast(""), 1800);
  };

  const handleDownloadCertificate = () => {
    window.print();
  };

  const checkStatusById = async (id: string) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return;

    setBusy(true);
    setBusyText("Checking status…");
    setError("");
    setCertificate(null);
    setStatusRecord(null);
    setStatusType("idle");
    setSubmittedId("");

    try {
      const res = await fetch(`/api/contributions/${encodeURIComponent(cleanId)}/status`);
      const data = await res.json();

      if (!res.ok) {
        setStatusType("invalid_id");
        setError(data.error || "No contribution record was found for this Verification ID.");
        return;
      }

      const rec: StatusRecord = data.statusRecord;
      setStatusRecord(rec);
      const st = rec.paymentStatus.toLowerCase();

      if (st === "verified") {
        const certRes = await fetch(`/api/contributions/${encodeURIComponent(cleanId)}/certificate`);
        const certData = await certRes.json();

        if (certRes.ok && certData.certificate) {
          setCertificate(certData.certificate);
          setStatusType("verified");
        } else {
          setStatusType("invalid_id");
          setError("Certificate data could not be retrieved.");
        }
      } else if (st === "pending_verification") {
        setStatusType("pending_verification");
      } else if (st === "rejected") {
        setStatusType("rejected");
      } else if (st === "refunded") {
        setStatusType("refunded");
      } else {
        setStatusType("failed");
      }
    } catch {
      setStatusType("invalid_id");
      setError("Status lookup unavailable. Please check your network connection.");
    } finally {
      setBusy(false);
      setBusyText("");
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    void checkStatusById(lookup);
  };

  const handleCreateContribution = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const element = e.currentTarget;
    const f = new FormData(element);
    const details = {
      name: String(f.get("name") || "").trim(),
      email: String(f.get("email") || "").trim(),
      mobile: String(f.get("mobile") || "").trim(),
      amount: Number(f.get("amount")),
    };

    setBusy(true);
    setError("");
    setCertificate(null);
    setStatusRecord(null);
    setStatusType("idle");
    setSubmittedId("");

    try {
      if (method === "razorpay") {
        setBusyText("Creating Razorpay order…");
        if (!(await loadRazorpay())) throw new Error("Razorpay SDK failed to load. Please check your internet connection.");

        const start = await fetch("/api/donations/payment/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(details),
        });

        const setup = await start.json();
        if (!start.ok) throw new Error(setup.error || "Payment order creation failed");

        setBusyText("Opening payment gateway…");

        await new Promise<void>((resolve, reject) => {
          const r = new window.Razorpay!({
            key: setup.keyId,
            amount: setup.order.amount,
            currency: "INR",
            name: "VPANSAK Support Fund",
            description: "Voluntary support contribution",
            image: "/vpansak-logo-light.jpeg",
            order_id: setup.order.id,
            prefill: {
              name: details.name,
              email: details.email,
              contact: details.mobile,
            },
            theme: { color: "#1766ef" },
            modal: {
              ondismiss: () => {
                setCertificate(null);
                setStatusRecord(null);
                setStatusType("cancelled");
                setSubmittedId("");
                reject(new Error("Payment cancel kar diya gaya."));
              },
            },
            handler: async (response: Record<string, string>) => {
              setBusyText("Verifying payment on server…");
              const verifyRes = await fetch("/api/donations/payment/verify", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  verificationId: setup.verificationId,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                reject(new Error(verifyData.error || "Payment verification failed on server."));
                return;
              }

              setCertificate(verifyData.certificate);
              setLookup(setup.verificationId);
              setStatusType("verified");
              element.reset();
              resolve();
            },
          });

          r.on("payment.failed", (response) =>
            reject(new Error(response.error?.description || "Payment process failed."))
          );
          r.open();
        });
      } else {
        setBusyText("Submitting payment reference…");
        const transactionId = String(f.get("transactionId") || "").trim();
        if (!transactionId) throw new Error("Please enter your Payment Transaction / UTR ID.");

        const paymentMethod = method === "bank" ? `Bank Transfer (NEFT/IMPS)` : `UPI / QR Code`;

        const res = await fetch("/api/donations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...details,
            paymentMethod,
            transactionId,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed.");

        setSubmittedId(data.verificationId);
        setLookup(data.verificationId);
        setStatusType("submitted_ack");
        element.reset();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Contribution could not be completed.";
      setCertificate(null);
      setStatusRecord(null);
      setSubmittedId("");
      if (msg.includes("cancel")) {
        setStatusType("cancelled");
        setError("Payment cancel kar diya gaya.");
      } else {
        setStatusType("idle");
        setError(msg);
      }
    } finally {
      setBusy(false);
      setBusyText("");
    }
  };

  return (
    <main className="foundation-page">
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}

      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SUPPORT FUND</small>
          </span>
        </Link>
        <nav>
          <Link href="/">
            <ArrowLeft /> Store
          </Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support Hub</a>

        </nav>
      </header>

      <section className="foundation-hero">
        <div>
          <small>VPANSAK COMMUNITY &amp; SUPPORT INITIATIVE</small>
          <h1>Empowering progress through community support.</h1>
          <p>
            Contributions directly power public digital tools, open educational resources, merchant onboarding programs, and community welfare initiatives by VPANSAK.
          </p>
          <span>
            <ShieldCheck /> Transparent • Verified • Official Records
          </span>
        </div>
        <div className="foundation-mark">
          <Award />
          <b>VPANSAK</b>
          <small>SUPPORT FOUNDATION</small>
        </div>
      </section>

      <section className="foundation-shell">
        <div className="support-payment-grid">
          <button
            type="button"
            className={method === "razorpay" ? "active" : ""}
            onClick={() => {
              setMethod("razorpay");
              setError("");
            }}
          >
            <CreditCard color={method === "razorpay" ? "#1766ef" : "#64748b"} size={22} />
            <div>
              <strong style={{ display: "block", color: method === "razorpay" ? "#1766ef" : "#1e293b", fontSize: 13 }}>UPI &amp; Online Payment (Instant)</strong>
              <small style={{ color: "#64748b", fontSize: 11 }}>Cards, NetBanking, UPI, Wallets</small>
            </div>
          </button>

          <button
            type="button"
            className={method === "bank" ? "active" : ""}
            onClick={() => {
              setMethod("bank");
              setError("");
            }}
          >
            <Building2 color={method === "bank" ? "#1766ef" : "#64748b"} size={22} />
            <div>
              <strong style={{ display: "block", color: method === "bank" ? "#1766ef" : "#1e293b", fontSize: 13 }}>Bank Account (NEFT/IMPS)</strong>
              <small style={{ color: "#64748b", fontSize: 11 }}>Direct Kotak Mahindra Bank transfer</small>
            </div>
          </button>

          <button
            type="button"
            className={method === "upi" ? "active" : ""}
            onClick={() => {
              setMethod("upi");
              setError("");
            }}
          >
            <QrCode color={method === "upi" ? "#1766ef" : "#64748b"} size={22} />
            <div>
              <strong style={{ display: "block", color: method === "upi" ? "#1766ef" : "#1e293b", fontSize: 13 }}>Scan QR / UPI</strong>
              <small style={{ color: "#64748b", fontSize: 11 }}>GPay, PhonePe, Paytm, BHIM</small>
            </div>
          </button>
        </div>

        <section style={{ gridColumn: "1 / -1" }}>
          {method === "bank" && (
            <article className="support-payment-details">
              <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>Kotak Mahindra Bank Transfer Details</h3>
              <dl className="support-payment-dl">
                <div>
                  <dt style={{ color: "#64748b", fontSize: 11 }}>Account holder</dt>
                  <dd style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>ALOK SINGH</dd>
                </div>
                <div>
                  <dt style={{ color: "#64748b", fontSize: 11 }}>Account number</dt>
                  <dd style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
                    6057110365{" "}
                    <button type="button" onClick={() => copy("6057110365", "Account number")} style={{ background: 0, border: 0, color: "#1766ef", cursor: "pointer" }}>
                      <Copy size={13} />
                    </button>
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "#64748b", fontSize: 11 }}>IFSC code</dt>
                  <dd style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
                    KKBK0005359{" "}
                    <button type="button" onClick={() => copy("KKBK0005359", "IFSC")} style={{ background: 0, border: 0, color: "#1766ef", cursor: "pointer" }}>
                      <Copy size={13} />
                    </button>
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "#64748b", fontSize: 11 }}>Bank UPI ID</dt>
                  <dd style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
                    8738869635@kotakbank{" "}
                    <button type="button" onClick={() => copy("8738869635@kotakbank", "UPI ID")} style={{ background: 0, border: 0, color: "#1766ef", cursor: "pointer" }}>
                      <Copy size={13} />
                    </button>
                  </dd>
                </div>
              </dl>
            </article>
          )}

          {method === "upi" && (
            <article className="support-qr-box">
              <img src="/vpansak-support-qr.jpeg" alt="VPANSAK support UPI QR code" style={{ width: 140, height: 140, objectFit: "contain", borderRadius: 8, border: "1px solid #cbd5e1" }} />
              <div>
                <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>Scan and pay via UPI</h3>
                <p style={{ margin: "0 0 10px", color: "#475569", fontSize: 13 }}>Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) or copy the UPI ID below.</p>
                <button
                  type="button"
                  onClick={() => copy("alookk@ptyes", "UPI ID")}
                  style={{ background: "#1766ef", color: "white", padding: "8px 14px", borderRadius: 6, border: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Copy size={14} /> alookk@ptyes
                </button>
              </div>
            </article>
          )}
        </section>

        <div className="support-contribution-grid">
          <div className="donation-form">
            <small>SUPPORT CONTRIBUTION</small>
            <h2>{method === "razorpay" ? "Pay securely online" : "Submit payment reference"}</h2>
            <p>
              {method === "razorpay"
                ? "Online payments are verified automatically. Bank/QR payments remain Pending Verification until checked."
                : "Bank and QR contributions require UTR submission and are reviewed by an authorized admin."}
            </p>

            {error && (
              <button type="button" className="support-alert" onClick={() => setError("")}>
                {error}
              </button>
            )}

            <form onSubmit={handleCreateContribution}>
              <label>
                Full name
                <input name="name" required maxLength={100} placeholder="e.g. Alok Singh" />
              </label>
              <label>
                Email address
                <input name="email" type="email" required maxLength={150} placeholder="your.name@example.com" />
              </label>
              <label>
                Mobile number
                <input name="mobile" type="tel" required maxLength={15} placeholder="e.g. 9876543210" />
              </label>
              <label>
                Contribution amount (₹)
                <input name="amount" type="number" min="1" max="1000000" step="1" required placeholder="Amount in INR" />
              </label>

              {method !== "razorpay" && (
                <label>
                  Transaction / UTR ID
                  <input
                    name="transactionId"
                    required
                    maxLength={80}
                    placeholder="Enter 12-digit UTR or Transaction ID"
                  />
                </label>
              )}

              <button disabled={busy}>
                {busy ? (busyText || "Processing…") : method === "razorpay" ? "Pay securely" : "Submit for verification"}
                <Award />
              </button>
            </form>

            <div className="donation-safety">
              <ShieldCheck />
              <p>
                <strong>Payment safety</strong>
                <br />
                Never share OTP, UPI PIN, card PIN or banking password. Contributions are not currently advertised as eligible for 80G tax deduction.
              </p>
            </div>
          </div>

          {/* Right Side: Status Checking & Protection Area */}
          <div className="certificate-area">
            <div className="certificate-toolbar">
              <form onSubmit={handleSearchSubmit}>
                <Search />
                <input
                  value={lookup}
                  onChange={(e) => setLookup(e.target.value.toUpperCase())}
                  placeholder="Enter Verification ID or Certificate No (e.g. VPA-CERT-2026-1000)"
                  maxLength={50}
                />
                <button disabled={busy}>{busy ? "Checking…" : "Check Status"}</button>
              </form>
            </div>

            {/* STATE 0: Cancelled Payment State */}
            {statusType === "cancelled" && (
              <div className="certificate-placeholder" style={{ padding: 28, background: "#fef2f2", borderRadius: 16, border: "1px solid #fecaca", textAlign: "center" }}>
                <XCircle size={32} color="#dc2626" style={{ margin: "0 auto 10px" }} />
                <h3 style={{ color: "#991b1b" }}>Payment Cancelled</h3>
                <p style={{ color: "#7f1d1d", fontSize: 13, maxWidth: 420, margin: "0 auto" }}>
                  The payment process was cancelled before completion. No verified contribution record or certificate was generated.
                </p>
              </div>
            )}

            {/* STATE 1: Submitted Acknowledgement for Manual Payments */}
            {statusType === "submitted_ack" && (
              <div className="certificate-placeholder" style={{ textAlign: "center", padding: 30, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 56, height: 56, margin: "0 auto 12px", borderRadius: "50%", background: "#e0f2fe", display: "grid", placeItems: "center", color: "#0284c7" }}>
                  <Clock size={32} />
                </div>
                <h3 style={{ fontSize: 20, color: "#0f172a" }}>Your payment reference has been submitted for verification.</h3>
                <div style={{ margin: "16px 0", padding: 16, background: "white", borderRadius: 10, border: "1px solid #cbd5e1", display: "inline-block" }}>
                  <small style={{ color: "#64748b", fontWeight: 700 }}>VERIFICATION ID</small>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#1766ef", letterSpacing: "0.05em" }}>{submittedId}</div>
                </div>
                <p style={{ color: "#475569", fontSize: 13, maxWidth: 420, margin: "0 auto 18px" }}>
                  Save this ID to check your contribution status later. Your official 2-page certificate will become available after payment verification.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => copy(submittedId, "Verification ID")}
                    style={{ background: "#1766ef", color: "white", padding: "8px 16px", borderRadius: 8, border: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Copy size={14} /> Copy Verification ID
                  </button>
                  <button
                    type="button"
                    onClick={() => checkStatusById(submittedId)}
                    style={{ background: "#f1f5f9", color: "#334155", padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    Check Status
                  </button>
                </div>
              </div>
            )}

            {/* STATE 2: Pending Verification Card */}
            {statusType === "pending_verification" && statusRecord && (
              <div className="certificate-placeholder" style={{ padding: 28, background: "#fffbe6", borderRadius: 16, border: "1px solid #ffe58f", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Clock color="#d48806" size={28} />
                  <div>
                    <h3 style={{ margin: 0, color: "#873800", fontSize: 18 }}>Payment Under Review</h3>
                    <small style={{ color: "#d48806", fontWeight: 700 }}>Verification ID: {statusRecord.verificationId}</small>
                  </div>
                </div>

                <div style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid #ffe58f", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, margin: "14px 0" }}>
                  <div><span style={{ color: "#8c8c8c" }}>Contributor:</span> <strong style={{ color: "#262626" }}>{statusRecord.maskedName}</strong></div>
                  <div><span style={{ color: "#8c8c8c" }}>Amount:</span> <strong style={{ color: "#262626" }}>{money(statusRecord.amount)}</strong></div>
                  <div><span style={{ color: "#8c8c8c" }}>Payment Method:</span> <strong style={{ color: "#262626" }}>{statusRecord.paymentMethod}</strong></div>
                  <div><span style={{ color: "#8c8c8c" }}>Submitted Date:</span> <strong style={{ color: "#262626" }}>{new Date(statusRecord.submittedAt).toLocaleDateString("en-IN")}</strong></div>
                </div>

                <div style={{ background: "#fff1b8", padding: 12, borderRadius: 8, color: "#613b00", fontSize: 13, lineHeight: 1.5 }}>
                  <p style={{ margin: 0 }}>
                    <strong>Your payment details have been received and are currently being reviewed.</strong>
                  </p>
                  <p style={{ margin: "4px 0 0" }}>
                    Your official 2-page Certificate of Appreciation &amp; Thanking Letter will become available only after successful payment verification.
                  </p>
                </div>
              </div>
            )}

            {/* STATE 3: Verified Status - CLEAN DOWNLOAD CARD (Certificate not bloated on screen) */}
            {canShowCertificate && certificate && (
              <div className="certificate-verified-card">
                <div className="verified-card-header">
                  <div className="verified-badge-icon">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <span className="verified-status-tag">
                      <CheckCircle2 size={12} /> PAYMENT VERIFIED &amp; CONFIRMED
                    </span>
                    <h2>Certificate &amp; Thanking Letter Ready</h2>
                    <p>Official 2-Page Document issued by VPANSAK Support Foundation</p>
                  </div>
                </div>

                <div className="verified-meta-grid">
                  <div className="meta-box">
                    <span>Contributor Name</span>
                    <strong>{certificate.fullName}</strong>
                  </div>
                  <div className="meta-box">
                    <span>Amount Recorded</span>
                    <strong className="amount-text">{money(certificate.amount)}</strong>
                  </div>
                  <div className="meta-box">
                    <span>Certificate Number</span>
                    <strong className="cert-no">{certificate.certificateNumber}</strong>
                  </div>
                  <div className="meta-box">
                    <span>Verification ID</span>
                    <strong>{certificate.verificationId}</strong>
                  </div>
                </div>

                {/* Primary CTA: Download / Print 2-Page Certificate */}
                <div className="verified-card-actions">
                  <button
                    type="button"
                    className="btn-download-cert"
                    onClick={handleDownloadCertificate}
                  >
                    <Download size={18} />
                    Download / Print Official 2-Page Certificate (PDF)
                  </button>
                  <button
                    type="button"
                    className="btn-copy-id"
                    onClick={() => copy(certificate.verificationId, "Verification ID")}
                  >
                    <Copy size={14} />
                    Copy ID
                  </button>
                </div>

                <div className="verified-card-footer">
                  <ShieldCheck size={14} /> Includes Official 2-Page Certificate of Support Contribution &amp; Transparency Letter with Watermark and Founder Signature.
                </div>
              </div>
            )}

            {/* STATE 4: Rejected Status */}
            {statusType === "rejected" && (
              <div className="certificate-placeholder" style={{ padding: 28, background: "#fef2f2", borderRadius: 16, border: "1px solid #fecaca", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <XCircle color="#dc2626" size={28} />
                  <div>
                    <h3 style={{ margin: 0, color: "#991b1b", fontSize: 18 }}>Payment Verification Failed</h3>
                    {statusRecord && <small style={{ color: "#b91c1c", fontWeight: 700 }}>Verification ID: {statusRecord.verificationId}</small>}
                  </div>
                </div>

                <p style={{ color: "#7f1d1d", fontSize: 13, lineHeight: 1.5, margin: "10px 0" }}>
                  Payment verification could not be completed for this contribution reference.
                </p>

                {statusRecord?.publicRejectionReason && (
                  <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #fca5a5", color: "#991b1b", fontSize: 12, margin: "12px 0" }}>
                    <strong>Reason:</strong> {statusRecord.publicRejectionReason}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStatusType("idle");
                    setError("");
                  }}
                  style={{ background: "#dc2626", color: "white", padding: "8px 16px", borderRadius: 8, border: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", marginTop: 8 }}
                >
                  Resubmit Payment Details
                </button>
              </div>
            )}

            {/* STATE 5: Refunded / Failed */}
            {statusType === "refunded" && (
              <div className="certificate-placeholder" style={{ padding: 28, background: "#f1f5f9", borderRadius: 16, border: "1px solid #cbd5e1", textAlign: "center" }}>
                <AlertCircle size={32} color="#64748b" style={{ margin: "0 auto 10px" }} />
                <h3 style={{ color: "#334155" }}>Contribution Refunded</h3>
                <p style={{ color: "#64748b", fontSize: 13 }}>
                  This contribution payment has been refunded. The certificate is no longer available.
                </p>
              </div>
            )}

            {/* STATE 6: Invalid Verification ID */}
            {statusType === "invalid_id" && (
              <div className="certificate-placeholder" style={{ padding: 28, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
                <XCircle size={32} color="#94a3b8" style={{ margin: "0 auto 10px" }} />
                <h3 style={{ color: "#334155" }}>No Record Found</h3>
                <p style={{ color: "#64748b", fontSize: 13 }}>
                  No contribution record was found for Verification ID: <strong>{lookup}</strong>. Please verify the ID and try again.
                </p>
              </div>
            )}

            {/* Default Idle State */}
            {statusType === "idle" && (
              <div className="certificate-placeholder">
                <Award />
                <h3>Check Contribution Status</h3>
                <p>Enter your Verification ID above to check whether your payment has been confirmed by our team.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2-PAGE PRINT / DOWNLOAD CERTIFICATE DOCUMENT */}
      {canShowCertificate && certificate && (
        <article id="certificate-document" className="printable-certificate-document">
          {/* ================= PAGE 1: CERTIFICATE OF SUPPORT CONTRIBUTION ================= */}
          <div className="cert-page cert-page-1 cert-landscape">
            {/* Top Navy Header Banner */}
            <header className="cert-top-banner">
              <div className="cert-banner-left">
                <div className="cert-logo-badge">V</div>
                <div className="cert-brand-text-wrap">
                  <strong className="cert-brand-name">VPANSAK</strong>
                  <span className="cert-brand-tagline">SMART SHOPPING MADE EASY</span>
                </div>
              </div>
              <div className="cert-banner-right">
                <strong className="cert-status-title">PAYMENT VERIFIED</strong>
                <span className="cert-status-sub">Issued after successful contribution confirmation</span>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="cert-main-body">
              {/* Background Watermark V */}
              <div className="cert-watermark-v">
                <img src="/vpansak-logo-dark.jpeg" alt="Watermark" />
              </div>

              {/* Certificate Title */}
              <h1 className="cert-doc-title">Certificate of Support Contribution</h1>
              <p className="cert-doc-subtitle">This certificate is proudly presented to</p>

              {/* Recipient Name */}
              <div className="cert-recipient-wrap">
                <h2 className="cert-recipient-name-bold">{certificate.fullName.toUpperCase()}</h2>
                <div className="cert-name-underline" />
              </div>

              {/* Recognition Text */}
              <p className="cert-recognition-text">
                in recognition of a verified support contribution to VPANSAK
              </p>

              {/* Amount Display */}
              <div className="cert-amount-display">
                INR {certificate.amount.toLocaleString("en-IN")}.00
              </div>

              {/* 4-Column Metadata Card */}
              <div className="cert-meta-card">
                <div className="meta-col">
                  <span className="meta-col-label">CERTIFICATE ID</span>
                  <strong className="meta-col-val">{certificate.certificateNumber}</strong>
                </div>
                <div className="meta-col-divider" />
                <div className="meta-col">
                  <span className="meta-col-label">PAYMENT DATE</span>
                  <strong className="meta-col-val">{formatCertDate(certificate.verifiedAt)}</strong>
                </div>
                <div className="meta-col-divider" />
                <div className="meta-col">
                  <span className="meta-col-label">PAYMENT MODE</span>
                  <strong className="meta-col-val">{(certificate.paymentMethod || "ONLINE").toUpperCase()}</strong>
                </div>
                <div className="meta-col-divider" />
                <div className="meta-col">
                  <span className="meta-col-label">REFERENCE ID</span>
                  <strong className="meta-col-val">{certificate.verificationId}</strong>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <footer className="cert-footer-banner">
              <div className="cert-sig-area">
                <img
                  src="/assets/certificate/alok-singh-signature.png"
                  alt="Alok Singh Signature"
                  className="cert-sig-image"
                />
                <div className="cert-sig-line-gold" />
                <strong className="cert-sig-name-text">Alok Singh</strong>
                <span className="cert-sig-title-text">Founder, VPANSAK</span>
              </div>

              <div className="cert-disclaimer-center">
                <p className="disc-main">Digitally issued by VPANSAK • Verify using the certificate ID on the official website</p>
                <p className="disc-sub">This is an acknowledgement of support, not a tax receipt, investment certificate, or proof of ownership.</p>
              </div>

              <div className="cert-verified-stamp">
                <div className="stamp-circle">
                  <span className="stamp-check">✓</span>
                  <span className="stamp-text">VERIFIED</span>
                </div>
              </div>
            </footer>

            {/* Bottom Edge Accent Bar */}
            <div className="cert-bottom-accent-bar">
              <div className="accent-gold-segment" />
              <div className="accent-navy-segment" />
            </div>
          </div>

          {/* ================= PAGE 2: THANKING NOTE & IMPACT LETTER ================= */}
          <div className="cert-page cert-page-2 cert-landscape">
            {/* Top Navy Header Banner */}
            <header className="cert-top-banner">
              <div className="cert-banner-left">
                <div className="cert-logo-badge">V</div>
                <div className="cert-brand-text-wrap">
                  <strong className="cert-brand-name">VPANSAK SUPPORT FOUNDATION</strong>
                  <span className="cert-brand-tagline">LETTER OF APPRECIATION &amp; FUND TRANSPARENCY</span>
                </div>
              </div>
              <div className="cert-banner-right">
                <strong className="cert-status-title">REF: {certificate.verificationId}</strong>
                <span className="cert-status-sub">DATE: {formatCertDate(certificate.verifiedAt)}</span>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="cert-main-body letter-layout">
              {/* Background Watermark V */}
              <div className="cert-watermark-v">
                <img src="/vpansak-logo-dark.jpeg" alt="Watermark" />
              </div>

              <h2 className="letter-salutation-title">Dear {certificate.fullName},</h2>

              <p className="letter-body-para">
                Namaste! On behalf of the entire team at <strong>VPANSAK</strong> and <strong>A&amp;A Group</strong>, I extend our deepest gratitude for your generous voluntary contribution of <strong>INR {certificate.amount.toLocaleString("en-IN")}.00</strong> (Reference ID: <code>{certificate.verificationId}</code>).
              </p>

              <div className="letter-impact-card">
                <h3 className="impact-card-title"><HeartHandshake size={18} /> Where Your Contribution Goes &amp; Its Direct Impact:</h3>
                <ul className="impact-list">
                  <li>
                    <strong>1. Platform Security &amp; Infrastructure:</strong> Maintaining secure, high-speed cloud servers, database protection, and encrypted payment workflows for users across India.
                  </li>
                  <li>
                    <strong>2. Seller &amp; Small Merchant Empowerment:</strong> Providing free digital onboarding, cataloging support, and growth tools to local Indian shopkeepers and independent sellers.
                  </li>
                  <li>
                    <strong>3. 24x7 Customer Help Desk &amp; Community Care:</strong> Funding human-assisted support desks, transparent order tracking, and community welfare initiatives.
                  </li>
                </ul>
              </div>

              <p className="letter-body-para">
                VPANSAK is built on the principles of total transparency, user trust, and community-first technology. We ensure that every contribution is responsibly utilized to strengthen digital accessibility and customer satisfaction.
              </p>
            </div>

            {/* Footer Section */}
            <footer className="cert-footer-banner">
              <div className="cert-sig-area">
                <img
                  src="/assets/certificate/alok-singh-signature.png"
                  alt="Alok Singh Signature"
                  className="cert-sig-image"
                />
                <div className="cert-sig-line-gold" />
                <strong className="cert-sig-name-text">Alok Singh</strong>
                <span className="cert-sig-title-text">Founder, VPANSAK</span>
              </div>

              <div className="cert-disclaimer-center">
                <p className="disc-main">Official Digital Document • Issued by VPANSAK Support Foundation</p>
                <p className="disc-sub">Recorded in permanent verification ledger • Verification ID: {certificate.verificationId}</p>
              </div>

              <div className="cert-verified-stamp">
                <div className="stamp-circle">
                  <span className="stamp-check">✓</span>
                  <span className="stamp-text">VERIFIED</span>
                </div>
              </div>
            </footer>

            {/* Bottom Edge Accent Bar */}
            <div className="cert-bottom-accent-bar">
              <div className="accent-gold-segment" />
              <div className="accent-navy-segment" />
            </div>
          </div>
        </article>
      )}

      <section className="foundation-values">
        <article>
          <span>01</span>
          <h3>Automatic verification</h3>
          <p>Online payments are verified server-side with secure encryption before unlocking a certificate.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Manual review</h3>
          <p>Bank and QR contributions receive a tracking Verification ID and undergo manual admin verification.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Protected certificates</h3>
          <p>Certificates and founder signatures are returned only for records with confirmed payment status.</p>
        </article>
      </section>
    </main>
  );
}

export default function FoundationPage() {
  return (
    <Suspense
      fallback={
        <main className="foundation-page">
          <section className="foundation-hero">
            <p>Loading VPANSAK Support Fund…</p>
          </section>
        </main>
      }
    >
      <FoundationContent />
    </Suspense>
  );
}
