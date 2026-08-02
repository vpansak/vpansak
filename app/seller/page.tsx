"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Check, FileCheck2, FileUp, PackagePlus, ShieldCheck, Store, Truck, UploadCloud, Users, WalletCards } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type DocumentKey = "aadhaarFront" | "aadhaarBack" | "panCard" | "selfieVideo";
const documentFields: Array<{ key: DocumentKey; title: string; help: string; accept: string; video?: boolean }> = [
  { key: "aadhaarFront", title: "Aadhaar front", help: "Clear front-side image", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif" },
  { key: "aadhaarBack", title: "Aadhaar back", help: "Clear back-side image", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif" },
  { key: "panCard", title: "PAN card", help: "Clear PAN image", accept: "image/jpeg,image/png,image/webp,image/heic,image/heif" },
  { key: "selfieVideo", title: "Live selfie video", help: "MP4, WebM or MOV — maximum 25 MB", accept: "video/mp4,video/webm,video/quicktime", video: true },
];
const formatBytes = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function SellerPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ applicationId: string; status: string } | null>(null);
  const [error, setError] = useState("");
  const [uploadStage, setUploadStage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Record<DocumentKey, File | null>>({ aadhaarFront: null, aadhaarBack: null, panCard: null, selfieVideo: null });

  const selectedCount = Object.values(selectedFiles).filter(Boolean).length;

  const selectFile = (key: DocumentKey, file: File | null) => {
    setError("");
    if (!file) { setSelectedFiles((current) => ({ ...current, [key]: null })); return; }
    const field = documentFields.find((item) => item.key === key)!;
    const maxSize = field.video ? 25 * 1024 * 1024 : 12 * 1024 * 1024;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const validImage = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(file.type) || ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension);
    const validVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) || ["mp4", "webm", "mov"].includes(extension);
    if ((field.video ? !validVideo : !validImage)) { setSelectedFiles((current) => ({ ...current, [key]: null })); setError(`${field.title}: supported file format select करें।`); return; }
    if (file.size > maxSize) { setSelectedFiles((current) => ({ ...current, [key]: null })); setError(`${field.title} ${field.video ? "25" : "12"} MB से छोटा होना चाहिए।`); return; }
    setSelectedFiles((current) => ({ ...current, [key]: file }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    if (!form.checkValidity()) { form.reportValidity(); setError("सभी required details और consent complete करें।"); return; }
    if (selectedCount !== documentFields.length) { setError(`सभी 4 documents select करें। अभी ${selectedCount}/4 ready हैं।`); return; }
    setSubmitting(true); setUploadStage("Documents securely upload हो रहे हैं…");
    try {
      const response = await fetch("/api/sellers", { method: "POST", body: new FormData(form) });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { applicationId?: string; status?: string; error?: string };
      if (!response.ok || !data.applicationId) { setError(data.error || "Application submit नहीं हुई। Files और internet connection check करके retry करें।"); return; }
      setUploadStage("Application saved successfully");
      setResult({ applicationId: data.applicationId, status: data.status || "Pending Review" });
    } catch {
      setError("Upload पूरा नहीं हुआ। Internet connection check करके फिर submit करें।");
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setUploadStage(""), 1200);
    }
  };

  return (
    <main className="seller-page">
      <header className="seller-header">
        <Link className="shop-brand" href="/"><img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK logo" /><span><strong>VPANSAK</strong><small>SELLER</small></span></Link>
        <Link href="/"><ArrowLeft size={17} /> Back to shopping</Link>
      </header>

      <section className="seller-hero">
        <div><span className="seller-eyebrow"><Store size={16} /> VPANSAK SELLER PROGRAM</span><h1>Grow your business<br /><em>with VPANSAK.</em></h1><p>List your products, reach more customers and manage orders from one simple seller dashboard.</p><a href="#apply">Start registration <ArrowRight size={18} /></a></div>
        <div className="seller-hero-card"><div><BarChart3 /><span><small>BUSINESS GROWTH</small><strong>One dashboard</strong></span></div><div className="mini-chart"><i /><i /><i /><i /><i /></div><ul><li><Check /> Product management</li><li><Check /> Orders &amp; earnings</li><li><Check /> Performance insights</li></ul></div>
      </section>

      <section className="seller-benefits">
        <article><Users /><span><strong>Reach customers</strong><small>Build visibility for your products.</small></span></article>
        <article><PackagePlus /><span><strong>Simple listings</strong><small>Add products and track approval.</small></span></article>
        <article><Truck /><span><strong>Order control</strong><small>Manage packing and fulfilment.</small></span></article>
        <article><WalletCards /><span><strong>Clear earnings</strong><small>Understand fees and payouts.</small></span></article>
      </section>

      <section className="seller-process">
        <div><small>HOW IT WORKS</small><h2>Four steps to start selling.</h2></div>
        <ol><li><span>01</span><strong>Register</strong><p>Share your business and contact details.</p></li><li><span>02</span><strong>Complete KYC</strong><p>Upload identity and business documents securely.</p></li><li><span>03</span><strong>Get approved</strong><p>Our team reviews and verifies your application.</p></li><li><span>04</span><strong>List products</strong><p>Start adding products from your seller dashboard.</p></li></ol>
      </section>

      <section className="seller-application" id="apply">
        <aside><span><ShieldCheck /></span><small>SECURE ONBOARDING</small><h2>Become a VPANSAK Seller</h2><p>Complete the form once. Your KYC documents are stored privately and are only available to the authorized review team.</p><div><BadgeCheck /><span><strong>Manual verification</strong><small>Every application is checked before approval.</small></span></div><div><FileCheck2 /><span><strong>Private documents</strong><small>Documents are never shown publicly.</small></span></div></aside>
        {result ? (
          <div className="seller-success"><span><Check /></span><small>APPLICATION SUBMITTED</small><h2>We have received your details.</h2><p>Save your Application ID. The VPANSAK team will review your KYC and contact you through the registered email or mobile number.</p><strong>{result.applicationId}</strong><div>{result.status}</div><Link href="/">Return to shopping <ArrowRight size={17} /></Link></div>
        ) : (
          <form className="seller-form" onSubmit={submit} noValidate>
            <div className="seller-form-head"><span>01</span><div><small>SELLER REGISTRATION</small><h3>Business &amp; KYC details</h3></div></div>
            <div className="seller-fields">
              <label>Full name *<input name="fullName" required placeholder="Name as per PAN" /></label>
              <label>Mobile number *<input name="mobile" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile number" /></label>
              <label>Email address *<input name="email" required type="email" placeholder="business@example.com" /></label>
              <label>Business name *<input name="businessName" required placeholder="Your shop or company name" /></label>
              <label>Business type *<select name="businessType" required defaultValue=""><option value="" disabled>Select business type</option><option>Individual seller</option><option>Proprietorship</option><option>Partnership</option><option>Private limited</option><option>Other</option></select></label>
              <label>GSTIN <input name="gstin" placeholder="Optional where not applicable" /></label>
            </div>
            <div className="document-title"><UploadCloud /><div><strong>KYC document upload</strong><small>Images maximum 12 MB • Selfie video maximum 25 MB</small></div></div>
            <div className="document-grid">
              {documentFields.map((field) => { const file = selectedFiles[field.key]; return <label className={file ? "file-ready" : ""} key={field.key}><span className="document-icon">{file ? <Check /> : <FileUp />}</span><span><strong>{field.title} *</strong><small>{field.help}</small><em>{file ? <><Check /> Selected: {file.name} • {formatBytes(file.size)}</> : "Tap here to choose file"}</em></span><input type="file" name={field.key} required accept={field.accept} capture={field.video ? "user" : undefined} onChange={(event) => selectFile(field.key, event.target.files?.[0] || null)} /></label>; })}
            </div>
            <div className={selectedCount === 4 ? "document-readiness complete" : "document-readiness"}><div><strong>{selectedCount}/4 documents ready</strong><small>{selectedCount === 4 ? "All documents selected — application submit कर सकते हैं।" : "हर document card पर tap करके file select करें।"}</small></div><span><i style={{ width: `${selectedCount * 25}%` }} /></span></div>
            <label className="consent"><input type="checkbox" required /><span>I confirm that the details are correct and I am authorized to submit these business documents for verification.</span></label>
            {uploadStage && <div className="seller-upload-stage" aria-live="polite"><span /><strong>{uploadStage}</strong></div>}
            {error && <p className="seller-error" role="alert">{error}</p>}
            <button className="seller-submit" type="submit" disabled={submitting}>{submitting ? "Uploading & submitting…" : <>Submit for verification <ArrowRight size={17} /></>}</button>
          </form>
        )}
      </section>

      <footer className="seller-footer"><span>© 2026 VPANSAK Seller</span><a href="mailto:seller.vpansak@gmail.com">seller.vpansak@gmail.com</a></footer>
    </main>
  );
}
