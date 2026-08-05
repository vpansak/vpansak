"use client";

import {
  AlertCircle,
  Award,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  HeartHandshake,
  Printer,
  QrCode,
  RefreshCw,
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
    "idle" | "pending_verification" | "verified" | "rejected" | "failed" | "verification_failed" | "refunded" | "invalid_id" | "submitted_ack"
  >("idle");

  const [submittedId, setSubmittedId] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyText, setBusyText] = useState("");
  const [method, setMethod] = useState("razorpay");
  const [copied, setCopied] = useState("");

  // Deep-link certificate/verification search via query string ?certificate=VPC123456
  useEffect(() => {
    const id = query.get("certificate")?.trim().toUpperCase();
    if (!id || !/^VPC\d{6}$/.test(id)) return;
    setLookup(id);
    void checkStatusById(id);
  }, [query]);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(`${label} copied`);
    setTimeout(() => setCopied(""), 1800);
  };

  const checkStatusById = async (id: string) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return;

    setBusy(true);
    setBusyText("Checking status…");
    setError("");
    setCertificate(null);
    setStatusRecord(null);

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
        // Fetch protected certificate endpoint ONLY for verified records
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
              ondismiss: () => reject(new Error("Payment was cancelled.")),
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
      setError(err instanceof Error ? err.message : "Contribution could not be completed.");
    } finally {
      setBusy(false);
      setBusyText("");
    }
  };

  return (
    <main className="foundation-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SUPPORT FUND</small>
          </span>
        </Link>
        <nav>
          <Link href="/">Main store</Link>
          <Link href="/support">Support Hub</Link>
          <a href="mailto:support.vpansak@gmail.com">Contact</a>
        </nav>
      </header>

      <section className="foundation-hero">
        <div>
          <small>VPANSAK SUPPORT FUND</small>
          <h1>Support that creates opportunity.</h1>
          <p>
            Choose a secure contribution method, receive a verifiable Verification ID, and unlock your official Certificate of Appreciation upon backend verification.
          </p>
          <span>
            <ShieldCheck /> Voluntary support • No 80G tax-exemption claim
          </span>
        </div>
        <div className="foundation-mark">
          <HeartHandshake />
          <b>A&amp;A</b>
          <small>COMMUNITY INITIATIVE</small>
        </div>
      </section>

      <section className="support-payment-grid">
        <button className={method === "razorpay" ? "active" : ""} onClick={() => setMethod("razorpay")}>
          <CreditCard />
          <span>
            <strong>Razorpay Automatic</strong>
            <small>Instant verification via UPI, cards &amp; netbanking</small>
          </span>
        </button>
        <a href="https://rzp.io/rzp/suppovpansak" target="_blank" rel="noreferrer">
          <ExternalLink />
          <span>
            <strong>Razorpay Payment Page</strong>
            <small>Open secure hosted payment link</small>
          </span>
        </a>
        <button className={method === "bank" ? "active" : ""} onClick={() => setMethod("bank")}>
          <Banknote />
          <span>
            <strong>Bank Transfer</strong>
            <small>NEFT / IMPS / Direct bank deposit</small>
          </span>
        </button>
        <button className={method === "upi" ? "active" : ""} onClick={() => setMethod("upi")}>
          <QrCode />
          <span>
            <strong>QR / UPI Manual</strong>
            <small>Scan QR code or copy VPANSAK UPI ID</small>
          </span>
        </button>
      </section>

      <section className="support-payment-details">
        {method === "bank" && (
          <article>
            <h3>Bank transfer details</h3>
            <dl>
              <div>
                <dt>Account number</dt>
                <dd>
                  6057110365{" "}
                  <button type="button" onClick={() => copy("6057110365", "Account number")}>
                    <Copy />
                  </button>
                </dd>
              </div>
              <div>
                <dt>IFSC code</dt>
                <dd>
                  KKBK0005359{" "}
                  <button type="button" onClick={() => copy("KKBK0005359", "IFSC")}>
                    <Copy />
                  </button>
                </dd>
              </div>
              <div>
                <dt>Home branch</dt>
                <dd>GORAKHPUR – TARAMANDAL</dd>
              </div>
              <div>
                <dt>Bank UPI ID</dt>
                <dd>
                  8738869635@kotakbank{" "}
                  <button type="button" onClick={() => copy("8738869635@kotakbank", "UPI ID")}>
                    <Copy />
                  </button>
                </dd>
              </div>
            </dl>
          </article>
        )}

        {method === "upi" && (
          <article className="support-qr">
            <img src="/vpansak-support-qr.jpeg" alt="VPANSAK support UPI QR code" />
            <div>
              <h3>Scan and pay</h3>
              <p>Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) or copy the UPI ID below.</p>
              <button type="button" onClick={() => copy("alookk@ptyes", "UPI ID")}>
                <Copy />
                alookk@ptyes
              </button>
            </div>
          </article>
        )}

        {copied && <span className="support-copy-toast">{copied}</span>}
      </section>

      <section className="foundation-shell">
        {/* Left Side: Form */}
        <div className="donation-form">
          <small>SUPPORT CONTRIBUTION</small>
          <h2>{method === "razorpay" ? "Pay securely with Razorpay" : "Submit payment reference"}</h2>
          <p>
            {method === "razorpay"
              ? "Razorpay API payments are verified automatically by the server."
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
              <input
                name="mobile"
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                placeholder="10-digit mobile number"
              />
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
              Never share OTP, UPI PIN, card PIN or passwords. Voluntary support contributions are non-refundable once verified.
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
                placeholder="Enter Verification ID (VPC692515)"
                maxLength={9}
              />
              <button disabled={busy}>{busy ? "Checking…" : "Check Status"}</button>
            </form>

            {statusType === "verified" && certificate && (
              <button type="button" onClick={() => window.print()}>
                <Printer /> Print / Save PDF
              </button>
            )}
          </div>

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
                Save this ID to check your contribution status later. Your certificate will become available only after successful payment verification by our team.
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
                  Your Certificate of Appreciation will become available only after successful payment verification.
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: Verified Certificate Display */}
          {statusType === "verified" && certificate && (
            <article id="certificate" className="donation-certificate">
              <div className="certificate-border">
                <header>
                  <img src="/vpansak-logo-light.jpeg" alt="VPANSAK logo" />
                  <div>
                    <strong>VPANSAK</strong>
                    <span>SUPPORT FUND</span>
                  </div>
                </header>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", margin: "8px 0" }}>
                  <Sparkles />
                  <span style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={13} /> VERIFIED CONTRIBUTION
                  </span>
                </div>

                <small>CERTIFICATE OF APPRECIATION</small>
                <h2>Presented with gratitude to</h2>
                <h1>{certificate.fullName}</h1>
                <p>{certificate.appreciationMessage}</p>

                <div className="certificate-amount">
                  <span>CONTRIBUTION RECORDED</span>
                  <strong>{money(certificate.amount)}</strong>
                  <small>
                    Issued on{" "}
                    {new Date(certificate.verifiedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </small>
                </div>

                <footer>
                  <div className="founder-sign">
                    <img src="/assets/certificate/alok-singh-signature.png" alt="Alok Singh signature" />
                    <b>Alok Singh</b>
                    <span>Founder &amp; Authorized Signatory</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <b style={{ color: "#1766ef", fontSize: 14 }}>{certificate.certificateNumber}</b>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Verification ID: <strong>{certificate.verificationId}</strong></div>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>Permanent Verifiable Certificate ID</span>
                  </div>
                </footer>

                <div className="certificate-status">
                  <CheckCircle2 /> Payment verified successfully • Certificate Ready
                </div>
              </div>
            </article>
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
      </section>

      <section className="foundation-values">
        <article>
          <span>01</span>
          <h3>Automatic verification</h3>
          <p>Razorpay API payments are verified server-side with HMAC signatures before unlocking a certificate.</p>
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
