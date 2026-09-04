"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, Check, HeartHandshake, PackageCheck, ShieldCheck, Sparkles, Store, Truck } from "lucide-react";
import Link from "next/link";

export default function SellerPage() {
  return (
    <main className="seller-page">
      <header className="seller-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK logo" />
          <span><strong>VPANSAK</strong><small>DIRECT STORE</small></span>
        </Link>
        <Link href="/"><ArrowLeft size={17} /> Back to shopping</Link>
      </header>

      <section className="seller-hero" style={{ minHeight: "480px" }}>
        <div>
          <span className="seller-eyebrow"><ShieldCheck size={16} /> OFFICIAL BRAND POLICY</span>
          <h1>Exclusive D2C Store<br /><em>Not a Multi-Seller Platform.</em></h1>
          <p>
            VPANSAK is a dedicated Direct-to-Consumer (D2C) brand. Unlike open multi-vendor marketplaces (such as Flipkart, Amazon, or Meesho), we do not allow third-party sellers. Every product listed on VPANSAK is produced, quality-checked, and shipped directly by us.
          </p>
          <Link href="/" style={{ width: "max-content", marginTop: "28px", padding: "15px 22px", display: "flex", alignItems: "center", gap: "10px", borderRadius: "7px", background: "#1766ef", color: "white", fontWeight: 900 }}>
            Explore Official VPANSAK Catalog <ArrowRight size={18} />
          </Link>
        </div>
        <div className="seller-hero-card">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <BadgeCheck size={38} style={{ color: "#6eafff" }} />
            <span><small>100% DIRECT BRAND</small><strong>Quality Inspected</strong></span>
          </div>
          <p style={{ color: "#9fb0c7", fontSize: "13px", lineHeight: 1.6 }}>
            By maintaining exclusive control over design, manufacturing, and fulfillment, we eliminate counterfeit goods, unauthorized resellers, and hidden marketplace fees.
          </p>
          <ul style={{ marginTop: "20px" }}>
            <li><Check /> Zero 3rd-party sellers</li>
            <li><Check /> 100% Genuine VPANSAK</li>
            <li><Check /> Direct brand warranty</li>
            <li><Check /> Transparent pricing</li>
          </ul>
        </div>
      </section>

      <section className="seller-benefits">
        <article><ShieldCheck /><span><strong>Zero Counterfeits</strong><small>Only authentic VPANSAK products.</small></span></article>
        <article><PackageCheck /><span><strong>In-House Quality</strong><small>Strict quality control before dispatch.</small></span></article>
        <article><Truck /><span><strong>Direct Fulfillment</strong><small>Shipped straight from VPANSAK hubs.</small></span></article>
        <article><HeartHandshake /><span><strong>Direct Support</strong><small>Fast resolution by our dedicated team.</small></span></article>
      </section>

      <section className="seller-process" style={{ background: "#f8fafc" }}>
        <div>
          <small>WHY WE ARE DIFFERENT</small>
          <h2>Why VPANSAK is not Flipkart, Amazon, or Meesho</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>Direct Brand Products</strong>
            <p>We build, brand, and verify every single product sold on our platform.</p>
          </li>
          <li>
            <span>02</span>
            <strong>No Commission Markup</strong>
            <p>No 3rd-party seller fees or middleman charges, passing maximum savings to you.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Verified Dispatch</strong>
            <p>Every order is packed and dispatched directly from VPANSAK fulfillment centers.</p>
          </li>
          <li>
            <span>04</span>
            <strong>Direct Customer Care</strong>
            <p>Our dedicated internal support officers handle your queries, returns, and refunds.</p>
          </li>
        </ol>
      </section>

      <section className="seller-application" id="apply" style={{ display: "block", textAlign: "center", padding: "80px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", background: "white", padding: "48px 36px", borderRadius: "16px", border: "1px solid #dce3ec", boxShadow: "0 20px 60px #233b5a0d" }}>
          <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", display: "grid", placeItems: "center", borderRadius: "50%", background: "#e8f1ff", color: "#1766ef" }}>
            <Store size={32} />
          </div>
          <small style={{ color: "#1766ef", fontWeight: 900, letterSpacing: ".15em" }}>THIRD-PARTY SELLER NOTICE</small>
          <h2 style={{ fontSize: "32px", margin: "10px 0 16px" }}>Looking to sell on VPANSAK?</h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.7, marginBottom: "28px" }}>
            VPANSAK operates as an exclusive direct-to-consumer store for our own branded products. Third-party vendor registration is currently closed as we do not host third-party seller listings.
          </p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderRadius: "8px", background: "#1766ef", color: "white", fontWeight: 900, textDecoration: "none" }}>
            Return to VPANSAK Storefront <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="seller-footer">
        <span>© 2026 VPANSAK Direct Store • Powered by A&amp;A Group</span>
        <a href="mailto:support.vpansak@gmail.com">support.vpansak@gmail.com</a>
      </footer>
    </main>
  );
}

