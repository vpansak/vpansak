"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Headphones,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

export default function NotFound() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support.vpansak@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterEmail.trim()) {
      setSubmitError("Please enter your email address.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: reporterName.trim() || "Website Visitor",
          email: reporterEmail.trim().toLowerCase(),
          category: "Technical Issue",
          subject: `Broken Page Report: ${currentPath || "Unavailable Route"}`,
          description: `User reported unavailable page at path: ${currentPath || (typeof window !== "undefined" ? window.location.href : "unknown")}.\nAdditional note: ${reportNote.trim() || "No extra details provided."}`,
          priority: "Normal",
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setReportNote("");
      } else {
        const data = await res.json();
        setSubmitError(data.error || "Could not submit report. Please email support directly.");
      }
    } catch {
      setSubmitError("Could not submit report. Please email support directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoSubject = encodeURIComponent(`Broken Page Report: ${currentPath || "Unavailable Page"}`);
  const mailtoBody = encodeURIComponent(
    `Hello VPANSAK Support Team,\n\nI tried visiting the following page which was unavailable:\nPath: ${currentPath}\nURL: ${typeof window !== "undefined" ? window.location.href : ""}\n\nPlease review this issue.\n\nThank you!`
  );

  return (
    <main className="not-found-page">
      {/* Navigation Header */}
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SHOPPING</small>
          </span>
        </Link>
        <nav>
          <Link href="/">
            <ArrowLeft size={14} /> Home
          </Link>
          <Link href="/categories">Categories</Link>
          <Link href="/track">Track Order</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support Hub</a>

        </nav>
      </header>

      {/* Main Not Found Shell */}
      <section className="not-found-hero">
        <div className="not-found-card">
          {/* Animated Graphic Icon - NO raw 404 text */}
          <div className="not-found-icon-wrap">
            <Compass className="not-found-icon" />
          </div>

          <small className="not-found-tag">PAGE UNAVAILABLE</small>
          <h1 className="not-found-title">This Page Not Found</h1>
          <p className="not-found-desc">
            The page or address you requested{" "}
            {currentPath ? <code className="not-found-path">{currentPath}</code> : "on VPANSAK"}{" "}
            is currently unavailable, removed, or may have moved.
          </p>

          {/* Primary Action Button */}
          <div className="not-found-actions">
            <Link href="/" className="btn-return-website">
              <RotateCcw size={16} />
              Return to Website
            </Link>
          </div>

          {/* Divider */}
          <div className="not-found-divider">
            <span>Report & Email Options</span>
          </div>

          {/* Report & Email Options Grid */}
          <div className="not-found-options-grid">
            {/* Option 1: Report Issue */}
            <div className="not-found-option-card">
              <div className="option-icon-box">
                <AlertTriangle size={22} />
              </div>
              <div className="option-info">
                <h3>Report Page Issue</h3>
                <p>Report this broken link directly to our technical support team.</p>
              </div>
              <button
                type="button"
                className="btn-option-secondary"
                onClick={() => setReportOpen(!reportOpen)}
              >
                <Send size={14} />
                {reportOpen ? "Close Report Form" : "Report This Page"}
              </button>
            </div>

            {/* Option 2: Mail Support */}
            <div className="not-found-option-card">
              <div className="option-icon-box email-box">
                <Mail size={22} />
              </div>
              <div className="option-info">
                <h3>Email Support</h3>
                <p>Contact VPANSAK support directly via email for assistance.</p>
                <code className="email-code">support.vpansak@gmail.com</code>
              </div>
              <div className="email-actions">
                <a
                  href={`mailto:support.vpansak@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`}
                  className="btn-option-primary"
                >
                  <Mail size={14} />
                  Send Email
                </a>
                <button
                  type="button"
                  className="btn-copy-email"
                  onClick={handleCopyEmail}
                  title="Copy email address"
                >
                  {copiedEmail ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copiedEmail ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Quick Report Form */}
          {reportOpen && (
            <div className="not-found-report-form-box">
              {submitSuccess ? (
                <div className="report-success-msg">
                  <CheckCircle2 size={24} />
                  <div>
                    <strong>Report Submitted Successfully!</strong>
                    <p>Our support team has logged this issue for path <code>{currentPath}</code>. Thank you for helping us improve VPANSAK.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="report-form">
                  <h4>
                    <AlertTriangle size={16} /> Quick Issue Report
                  </h4>
                  <p>Reporting unavailable link for route: <code>{currentPath || "this page"}</code></p>
                  
                  {submitError && (
                    <div className="report-error-msg">{submitError}</div>
                  )}

                  <div className="form-fields">
                    <label>
                      <span>Your Email Address *</span>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Your Name (Optional)</span>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="full-width">
                    <span>Describe what happened (Optional)</span>
                    <textarea
                      rows={3}
                      placeholder="Tell us what you were trying to access..."
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                    />
                  </label>

                  <div className="form-buttons">
                    <button type="submit" disabled={submitting} className="btn-submit-report">
                      {submitting ? "Submitting..." : "Submit Report"}
                      <Send size={14} />
                    </button>
                    <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer" className="btn-goto-support">
                      <Headphones size={14} /> Open Support Hub
                    </a>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Shortcuts Grid */}
          <div className="not-found-shortcuts">
            <span>Popular Destinations</span>
            <div className="shortcuts-grid">
              <Link href="/">
                <RotateCcw size={16} />
                <span>VPANSAK Store</span>
              </Link>
              <Link href="/categories">
                <ShoppingBag size={16} />
                <span>All Categories</span>
              </Link>
              <Link href="/track">
                <PackageCheck size={16} />
                <span>Order Tracking</span>
              </Link>
              <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">
                <Headphones size={16} />
                <span>Support Hub</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
