"use client";

import { ArrowRight, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  return (
    <main className="seller-dashboard-empty">
      <div>
        <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", display: "grid", placeItems: "center", borderRadius: "50%", background: "#0a203b", color: "#68a3f7", border: "1px solid #2b4e79" }}>
          <ShieldCheck size={36} />
        </div>
        <small style={{ color: "#7896b9", letterSpacing: ".15em", fontWeight: 900 }}>VPANSAK DIRECT BRAND STORE</small>
        <h1 style={{ fontSize: "28px", margin: "10px 0 16px" }}>VPANSAK is an Exclusive D2C Brand</h1>
        <p style={{ color: "#8da2bb", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
          Third-party seller registration and merchant dashboards are disabled. VPANSAK exclusively manufactures, quality-inspects, and fulfills its own brand catalog directly to customers with zero third-party seller markups.
        </p>
        <Link href="/" style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "8px", background: "#1766ef", color: "white", fontWeight: 900, textDecoration: "none" }}>
          Go to VPANSAK Storefront <ArrowRight size={18} />
        </Link>
        <Link href="/seller" style={{ display: "inline-block", marginTop: "14px", color: "#7896b9", fontSize: "12px", textDecoration: "underline" }}>
          Read Direct Brand Policy
        </Link>
      </div>
    </main>
  );
}

