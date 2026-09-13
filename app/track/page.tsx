"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Clock3,
  Copy,
  Download,
  FileCheck,
  FileText,
  Headphones,
  HeartHandshake,
  HelpCircle,
  Layers,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  User,
  Zap,
} from "lucide-react";

type SuperTrackResult = {
  found: boolean;
  type: "order" | "career" | "ticket" | "contribution";
  code: string;
  title: string;
  data: any;
  items?: any[];
  replies?: any[];
  error?: string;
};

const orderStages = ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const money = (n = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function SuperTrackContent() {
  const queryParams = useSearchParams();
  const [inputCode, setInputCode] = useState(queryParams.get("id") || queryParams.get("code") || "");
  const [result, setResult] = useState<SuperTrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const performTrack = async (codeToSearch = inputCode) => {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode || cleanCode.length < 3) {
      setErrorMsg("Please enter a valid tracking code or reference ID (e.g. VPO123456, VPC-CAREER-982341, VPT-89123).");
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/track/super?id=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (res.ok && data.found) {
        setResult(data);
        setErrorMsg("");
        history.replaceState(null, "", `/track?id=${encodeURIComponent(data.code)}`);
      } else {
        setResult(null);
        setErrorMsg(data.error || `No active record found for tracking code "${cleanCode}".`);
      }
    } catch {
      setErrorMsg("Super Tracking service is temporarily unavailable. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCode = queryParams.get("id") || queryParams.get("code");
    if (initialCode) {
      void performTrack(initialCode);
    }
  }, []);

  // Real-time live polling every 4 seconds for active order/ticket tracking
  useEffect(() => {
    if (!result?.code) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/track/super?id=${encodeURIComponent(result.code)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            setResult(data);
          }
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [result?.code]);

  const copyCode = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="track-page" style={{ background: "#081021", color: "#ffffff", minHeight: "100vh" }}>
      {/* Super Header */}
      <header className="sub-header" style={{ background: "#040814", borderColor: "rgba(255, 255, 255, 0.08)" }}>
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small style={{ color: "#38bdf8", fontWeight: 800 }}>SUPER TRACKER</small>
          </span>
        </Link>
        <nav>
          <Link href="/" style={{ color: "#94a3b8" }}><ArrowLeft size={14} /> Back to Store</Link>
          <Link href="/account" style={{ color: "#94a3b8" }}>My Account</Link>
          <Link href="/careers" style={{ color: "#38bdf8", fontWeight: 700 }}>Careers</Link>
        </nav>
      </header>

      {/* Super Hero Section */}
      <section className="track-hero" style={{ padding: "60px 20px 40px", background: "radial-gradient(circle at 50% 0, rgba(37, 99, 235, 0.3), transparent 60%), #040814" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 30, background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          <Zap size={14} /> UNIVERSAL REAL-TIME TRACKING SYSTEM
        </div>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 900, color: "#ffffff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          One Search Bar. <span style={{ color: "#38bdf8" }}>Track Anything.</span>
        </h1>
        <p style={{ maxWidth: 680, margin: "0 auto 24px", color: "#94a3b8", fontSize: 15, lineHeight: 1.6 }}>
          Enter your Order ID (VPO-...), Job Application Code (VPC-CAREER-...), Support Ticket (VPT-...), or Certificate Verification ID.
        </p>

        {/* Universal Search Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performTrack();
          }}
          style={{ maxWidth: 650, margin: "0 auto" }}
        >
          <Search />
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter Order ID, Career Code, Ticket ID, or Certificate..."
            maxLength={60}
            style={{ fontSize: 14 }}
          />
          <button disabled={loading} style={{ background: "#2563eb", fontWeight: 800 }}>
            {loading ? "Tracking..." : "Super Track"}
          </button>
        </form>

        {/* Quick Sample Code Filters */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
          <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>Supported Formats:</span>
          {[
            { label: "Orders (VPO-...)", sample: "VPO" },
            { label: "Careers (VPC-CAREER-...)", sample: "VPC-CAREER" },
            { label: "Tickets (VPT-...)", sample: "VPT" },
            { label: "Certificates (VPC-...)", sample: "VPC-2026" },
          ].map((item) => (
            <span
              key={item.label}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {item.label}
            </span>
          ))}
        </div>

        {errorMsg && (
          <div style={{ maxWidth: 650, margin: "20px auto 0", padding: "12px 18px", borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", fontSize: 13, textAlign: "left", fontWeight: 700 }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </section>

      {/* Main Result Area */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 20px 80px" }}>
        {!result ? (
          /* Guide Cards when no search is active */
          <section className="track-help" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <article style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <PackageCheck style={{ color: "#38bdf8", marginBottom: 10 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Order Shipments</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                Track your package status step-by-step using your <b>VPO Order ID</b>. Includes real-time checkpoint updates.
              </p>
            </article>

            <article style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <Briefcase style={{ color: "#a855f7", marginBottom: 10 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Career Applications</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                Track your job application status using your <b>VPC-CAREER-XXXXXX</b> tracking code or registered email.
              </p>
            </article>

            <article style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <TicketCheck style={{ color: "#22c55e", marginBottom: 10 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Support Tickets</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                Track customer support ticket replies using your <b>VPT Ticket ID</b> generated from the Support Hub.
              </p>
            </article>

            <article style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <Award style={{ color: "#eab308", marginBottom: 10 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Support Certificates</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                Verify support contribution entries and download your official VPC Certificate of Appreciation.
              </p>
            </article>
          </section>
        ) : (
          /* RESULT DISPLAY FOR DETECTED CODE TYPE */
          <div style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: 16, padding: "28px 24px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            {/* Header Result Card */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", background: result.type === "order" ? "rgba(56, 189, 248, 0.15)" : result.type === "career" ? "rgba(168, 85, 247, 0.15)" : result.type === "ticket" ? "rgba(34, 197, 94, 0.15)" : "rgba(234, 179, 8, 0.15)", color: result.type === "order" ? "#38bdf8" : result.type === "career" ? "#c084fc" : result.type === "ticket" ? "#4ade80" : "#fde047", padding: "4px 12px", borderRadius: 14, textTransform: "uppercase" }}>
                    {result.title}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>• Real-Time Verified</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: 0 }}>{result.code}</h2>
                  <button type="button" onClick={copyCode} style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4, fontWeight: 800 }}>CURRENT STATUS</span>
                <span style={{ fontSize: 15, fontWeight: 900, padding: "6px 14px", borderRadius: 8, background: result.data.status === "Delivered" || result.data.status === "Selected" || result.data.status === "Resolved" || result.data.paymentStatus === "verified" ? "rgba(34, 197, 94, 0.2)" : result.data.status === "Rejected" ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.25)", color: result.data.status === "Delivered" || result.data.status === "Selected" || result.data.status === "Resolved" || result.data.paymentStatus === "verified" ? "#4ade80" : result.data.status === "Rejected" ? "#fca5a5" : "#60a5fa", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {result.type === "contribution" ? (result.data.paymentStatus === "verified" ? "Verified" : "Pending Verification") : (result.data.status || "In Processing")}
                </span>
              </div>
            </div>

            {/* TYPE 1: ORDER TRACKING RESULT */}
            {result.type === "order" && (
              <div>
                {/* Live Checkpoint Location Box */}
                <div style={{ padding: "16px 20px", borderRadius: 10, background: "linear-gradient(90deg, #0b2447, #133b70)", border: "1px solid #1f4a86", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <MapPin size={22} style={{ color: "#38bdf8" }} />
                    <div>
                      <small style={{ color: "#93c5fd", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>LIVE CHECKPOINT LOCATION</small>
                      <h4 style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800 }}>{result.data.currentLocation || `${result.data.city || "Delhi"} Fulfillment Hub`}</h4>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#93c5fd", background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 6 }}>
                    Real-time polling active
                  </span>
                </div>

                {/* Progress Bar Timeline */}
                <div style={{ marginBottom: 30 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: "#38bdf8", marginBottom: 16 }}>Shipment Progress Timeline</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, textAlign: "center" }}>
                    {orderStages.map((stageName, idx) => {
                      const currentIdx = orderStages.indexOf(result.data.status);
                      const isPassed = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      return (
                        <div key={stageName} style={{ position: "relative" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isPassed ? "#2563eb" : "#1e293b", color: "#ffffff", border: isCurrent ? "2px solid #38bdf8" : "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 12, fontWeight: 800 }}>
                            {isPassed ? <Check size={14} /> : idx + 1}
                          </div>
                          <span style={{ fontSize: 11, color: isPassed ? "#ffffff" : "#64748b", fontWeight: isPassed ? 700 : 400, display: "block", lineHeight: 1.3 }}>
                            {stageName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Meta Info */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, background: "#1e293b", padding: 18, borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
                  <div><span style={{ color: "#94a3b8" }}>Customer Name:</span> <strong style={{ color: "#ffffff" }}>{result.data.customerName}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Order Total:</span> <strong style={{ color: "#38bdf8" }}>{money(result.data.total)}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Payment Method:</span> <strong style={{ color: "#ffffff" }}>{result.data.paymentMethod}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Destination:</span> <strong style={{ color: "#ffffff" }}>{result.data.city} ({result.data.pinCode})</strong></div>
                </div>

                {/* Itemized Products */}
                {result.items && result.items.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: "#cbd5e1", marginBottom: 10 }}>Ordered Items</h4>
                    <div style={{ display: "grid", gap: 8 }}>
                      {result.items.map((it) => (
                        <div key={it.id || it.productName} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                          <span>{it.productName} (Qty: {it.quantity})</span>
                          <strong style={{ color: "#38bdf8" }}>{money(it.price * it.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TYPE 2: CAREER APPLICATION TRACKING RESULT */}
            {result.type === "career" && (
              <div>
                <div style={{ padding: 20, borderRadius: 12, background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", marginBottom: 28 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                    Candidate Profile: {result.data.fullName}
                  </h4>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "#cbd5e1" }}>
                    Interested Role: <strong>{result.data.interestedRole}</strong> ({result.data.preferredPosition || "General"}) • Work Mode: {result.data.workMode}
                  </p>
                  <small style={{ color: "#c084fc", fontSize: 12 }}>
                    Applied on: {new Date(result.data.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                  </small>
                </div>

                {/* Recruitment Pipeline Timeline */}
                <div style={{ marginBottom: 30 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: "#c084fc", marginBottom: 16 }}>Recruitment Review Pipeline</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, textAlign: "center" }}>
                    {[
                      { title: "Application Submitted", step: 1 },
                      { title: "HR Review & Screening", step: 2 },
                      { title: "Interview / Evaluation", step: 3 },
                      { title: result.data.status === "Selected" ? "Selected" : result.data.status === "Rejected" ? "Rejected" : "Final Decision", step: 4 },
                    ].map((st) => {
                      const currentStatus = result.data.status || "New";
                      const currentStepNum = currentStatus === "Selected" || currentStatus === "Rejected" ? 4 : currentStatus === "Interview" || currentStatus === "Shortlisted" ? 3 : currentStatus === "Under Review" ? 2 : 1;
                      const isDone = currentStepNum >= st.step;
                      return (
                        <div key={st.title}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDone ? (result.data.status === "Rejected" && st.step === 4 ? "#ef4444" : "#a855f7") : "#1e293b", color: "#ffffff", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 12, fontWeight: 800 }}>
                            {isDone ? <Check size={14} /> : st.step}
                          </div>
                          <span style={{ fontSize: 11, color: isDone ? "#ffffff" : "#64748b", fontWeight: isDone ? 700 : 400, display: "block" }}>
                            {st.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div style={{ background: "#1e293b", padding: 18, borderRadius: 10, fontSize: 13 }}>
                  <p style={{ margin: "4px 0" }}>📧 <strong>Email:</strong> {result.data.email}</p>
                  <p style={{ margin: "4px 0" }}>📍 <strong>Location:</strong> {result.data.city}, {result.data.state}</p>
                  <p style={{ margin: "4px 0" }}>🎓 <strong>Qualification:</strong> {result.data.qualification}</p>
                  <p style={{ margin: "4px 0" }}>⏳ <strong>Experience:</strong> {result.data.experienceLevel}</p>
                </div>

                {result.data.status === "Rejected" && (
                  <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#86efac", fontSize: 13 }}>
                    ℹ️ Re-application window is open. You may update your resume and submit a fresh application on the <Link href="/careers" style={{ color: "#38bdf8", fontWeight: 800 }}>Careers Portal</Link>.
                  </div>
                )}
              </div>
            )}

            {/* TYPE 3: SUPPORT TICKET TRACKING RESULT */}
            {result.type === "ticket" && (
              <div>
                <div style={{ padding: 20, borderRadius: 12, background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", marginBottom: 28 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                    Ticket Category: {result.data.category}
                  </h4>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#cbd5e1" }}>
                    Subject: <strong>{result.data.subject}</strong>
                  </p>
                  <small style={{ color: "#4ade80", fontSize: 12 }}>
                    Priority: {result.data.priority} • Assigned Officer: {result.data.assignedOfficer || "Support Team"}
                  </small>
                </div>

                <div style={{ background: "#1e293b", padding: 18, borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
                  <p style={{ margin: "0 0 8px", color: "#94a3b8" }}>Original Customer Query:</p>
                  <p style={{ margin: 0, color: "#ffffff", lineHeight: 1.6 }}>{result.data.description}</p>
                </div>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <a href={`https://vpansaksupporthub.lovable.app/track?id=${result.code}`} target="_blank" rel="noreferrer" style={{ padding: "12px 24px", borderRadius: 8, background: "#2563eb", color: "#ffffff", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    View Full Support Hub Replies <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            )}

            {/* TYPE 4: CONTRIBUTION CERTIFICATE RESULT */}
            {result.type === "contribution" && (
              <div>
                <div style={{ padding: 20, borderRadius: 12, background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.3)", marginBottom: 28 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                    Contributor: {result.data.fullName}
                  </h4>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#cbd5e1" }}>
                    Contribution Amount: <strong style={{ color: "#fde047" }}>{money(result.data.amount)}</strong>
                  </p>
                  <small style={{ color: "#fde047", fontSize: 12 }}>
                    Certificate ID: {result.data.certificateNumber || "Processing Verification"}
                  </small>
                </div>

                {result.data.paymentStatus === "verified" ? (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <CheckCircle2 size={40} style={{ color: "#22c55e", margin: "0 auto 10px" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: "0 0 8px" }}>Certificate Verified & Issued!</h3>
                    <Link href={`/foundation/verify/${result.data.verificationId}`} style={{ padding: "12px 24px", borderRadius: 8, background: "#2563eb", color: "#ffffff", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      Download Certificate of Appreciation <Download size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: 16, borderRadius: 8, background: "rgba(234, 179, 8, 0.15)", color: "#fef08a", fontSize: 13, textAlign: "center" }}>
                    ⏳ Payment verification in progress. Admin verification will generate your Certificate of Appreciation shortly.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px 20px", textAlign: "center", background: "#040814", color: "#64748b", fontSize: 13 }}>
        <p style={{ margin: "0 0 8px" }}>© {new Date().getFullYear()} VPANSAK Super Tracker • Universal Real-Time Lookup System</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 12 }}>
          <Link href="/careers" style={{ color: "#38bdf8", fontWeight: 700 }}>Careers Portal</Link>
          <Link href="/account" style={{ color: "#94a3b8" }}>Account Dashboard</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer" style={{ color: "#94a3b8" }}>Support Hub</a>
        </div>
      </footer>
    </main>
  );
}

export default function SuperTrackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#081021", color: "white" }}>Loading Super Tracker...</div>}>
      <SuperTrackContent />
    </Suspense>
  );
}
