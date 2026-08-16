"use client";

import {
  ArrowLeft, ArrowRight, Briefcase, Compass, HeartHandshake, Headphones,
  HelpCircle, Info, LayoutDashboard, Mail, PackageCheck, Search, ShieldCheck,
  Sparkles, Store, User, Users, Grid3X3
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function UsefulLinksPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const quickButtons = [
    { title: "Founder Alok Singh", badge: "FOUNDER", badgeClass: "founder-badge", icon: User, desc: "Founder & Visionary leading VPANSAK Shopping.", link: "/founder" },
    { title: "Co-Founder Ayushi Tripathi", badge: "CO-FOUNDER", badgeClass: "cofounder-badge", icon: Users, desc: "Co-Founder & Director managing key strategy.", link: "/cofounder" },
    { title: "Track Live Order", badge: "LIVE TRACKING", badgeClass: "live-badge", icon: PackageCheck, desc: "Step-by-step order progress with VPO ID.", link: "/track" },
    { title: "24×7 Support Ticket Hub", badge: "HELP HUB", badgeClass: "help-badge", icon: Headphones, desc: "Create & track customer help tickets.", link: "/support" },
    { title: "Become a Seller", badge: "3% COMMISSION", badgeClass: "merchant-badge", icon: Store, desc: "Register store & sell to nationwide buyers.", link: "/seller" },
    { title: "Seller Dashboard", badge: "PORTAL", badgeClass: "portal-badge", icon: LayoutDashboard, desc: "Manage store products, stock & payouts.", link: "/seller/dashboard" },
    { title: "Support Foundation", badge: "SOCIAL IMPACT", badgeClass: "foundation-badge", icon: HeartHandshake, desc: "Support platform infrastructure & community.", link: "/foundation" },
    { title: "Browse All Categories", badge: "CATALOG", badgeClass: "catalog-badge", icon: Grid3X3, desc: "Mobiles, electronics, fashion & daily offers.", link: "/categories" },
    { title: "Customer FAQs", badge: "KNOWLEDGE BASE", badgeClass: "faq-badge", icon: HelpCircle, desc: "Instant answers on shipping, returns & 5-min refunds.", link: "/info/faq" },
    { title: "Careers at VPANSAK", badge: "HIRING", badgeClass: "hiring-badge", icon: Briefcase, desc: "Explore tech, merchant ops & support roles.", link: "/info/careers" },
    { title: "About VPANSAK HQ", badge: "HEADQUARTERS", badgeClass: "hq-badge", icon: Info, desc: "Digital marketplace vision by A&A Group.", link: "/info/about" },
    { title: "Contact Support & Email", badge: "CONTACT", badgeClass: "contact-badge", icon: Mail, desc: "Direct email and platform support channels.", link: "/info/contact" },
  ];

  const linkCategories = [
    {
      title: "Founders & Leadership",
      icon: User,
      links: [
        { name: "Founder Alok Singh Profile", desc: "Founder & Visionary of VPANSAK", href: "/founder" },
        { name: "Co-Founder Ayushi Tripathi Profile", desc: "Co-Founder & Director of VPANSAK", href: "/cofounder" },
        { name: "About VPANSAK Headquarters", desc: "Company overview and ecosystem", href: "/info/about" },
        { name: "Careers & Opportunities", desc: "Join our technology and business teams", href: "/info/careers" },
        { name: "Direct Contact Information", desc: "Support email and Instagram channels", href: "/info/contact" },
      ],
    },
    {
      title: "Shopping & Delivery Policies",
      icon: ShieldCheck,
      links: [
        { name: "Shipping & Delivery Policy", desc: "Dispatch timelines and live tracking", href: "/policies/shipping-policy" },
        { name: "5-Minute Refund Initiation Policy", desc: "Instant refund dispatch rules", href: "/policies/refund-policy" },
        { name: "7-Day Product Return Policy", desc: "Return conditions and pickup rules", href: "/policies/return-policy" },
        { name: "Privacy Policy & KYC Protection", desc: "User data encryption & privacy", href: "/policies/privacy-policy" },
        { name: "Terms & Conditions of Service", desc: "Platform terms and acceptable use", href: "/policies/terms-and-conditions" },
        { name: "Gift Card Terms & Conditions", desc: "Redemption rules and balance policy", href: "/policies/gift-card-policy" },
      ],
    },
    {
      title: "Business & Merchant Portals",
      icon: Store,
      links: [
        { name: "Become a VPANSAK Seller", desc: "Register store with 3% fee structure", href: "/seller" },
        { name: "Seller Dashboard", desc: "Product inventory, orders & payouts", href: "/seller/dashboard" },
        { name: "Seller Operational Guidelines", desc: "Merchant rules and SLA compliance", href: "/policies/seller-policy" },
        { name: "Merchant Listing Guidelines", desc: "Listing standards and approval rules", href: "/policies/merchant-guidelines" },
        { name: "VPANSAK Support Foundation", desc: "Platform contribution & certificates", href: "/foundation" },
        { name: "Support Contribution Terms", desc: "Voluntary contribution terms", href: "/policies/contribution-terms" },
      ],
    },
    {
      title: "Quick Customer Utilities",
      icon: PackageCheck,
      links: [
        { name: "Live Order Tracking (/track)", desc: "Track VPO order ID timeline", href: "/track" },
        { name: "24/7 Support Ticket Hub (/support)", desc: "Create ticket and view replies", href: "/support" },
        { name: "Customer Frequently Asked Questions", desc: "Help articles and instant answers", href: "/info/faq" },
        { name: "All Marketplace Categories", desc: "Browse 20+ store categories", href: "/categories" },
        { name: "Wishlist & Account Dashboard", desc: "Manage profile, addresses & saved items", href: "/account" },
      ],
    },
  ];

  const filterText = searchTerm.toLowerCase().trim();

  const filteredButtons = quickButtons.filter(
    (btn) =>
      !filterText ||
      btn.title.toLowerCase().includes(filterText) ||
      btn.desc.toLowerCase().includes(filterText) ||
      btn.badge.toLowerCase().includes(filterText)
  );

  const filteredCategories = linkCategories
    .map((cat) => ({
      ...cat,
      links: cat.links.filter(
        (link) =>
          !filterText ||
          link.name.toLowerCase().includes(filterText) ||
          link.desc.toLowerCase().includes(filterText) ||
          cat.title.toLowerCase().includes(filterText)
      ),
    }))
    .filter((cat) => cat.links.length > 0);

  return (
    <main className="info-page legal-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>USEFUL LINKS HUB</small>
          </span>
        </Link>
        <nav>
          <Link href="/">
            <ArrowLeft size={14} /> Store Home
          </Link>
          <Link href="/support">Support Hub</Link>
          <Link href="/track">Track Order</Link>
        </nav>
      </header>

      <section className="info-hero legal-hero">
        <Compass size={36} />
        <small>VPANSAK ALL-IN-ONE DIRECTORY</small>
        <h1>Useful Links & Quick Action Hub</h1>
        <p>Every single link, policy, seller tool, founder profile, and support service across VPANSAK in one place.</p>
      </section>

      <section className="legal-layout" style={{ display: "block" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Search Box */}
          <div className="useful-search-box">
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search any link, policy, seller tool, or founder info..."
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} type="button">
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          {filteredButtons.length > 0 && (
            <div className="legal-useful-buttons-wrapper" style={{ marginTop: 20 }}>
              <div className="legal-section-header">
                <Sparkles className="header-icon" size={20} />
                <div>
                  <h2>Useful Quick Action Buttons (उपयोगी बटन्स)</h2>
                  <p>Instant navigation to founder profiles, order tracking, support, seller portal, and key platform features.</p>
                </div>
              </div>

              <div className="useful-buttons-grid">
                {filteredButtons.map((btn) => {
                  const IconComp = btn.icon;
                  return (
                    <Link key={btn.title} href={btn.link} className={`useful-btn-card ${btn.badgeClass === "founder-badge" || btn.badgeClass === "cofounder-badge" ? "highlight-card" : ""}`}>
                      <div className="btn-card-top">
                        <span className={`card-badge ${btn.badgeClass}`}>{btn.badge}</span>
                        <IconComp size={22} className="card-icon" />
                      </div>
                      <h4>{btn.title}</h4>
                      <p>{btn.desc}</p>
                      <span className="card-action-link">Open Link <ArrowRight size={14} /></span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categorized Master Links */}
          {filteredCategories.length > 0 && (
            <div className="legal-useful-links-wrapper">
              <div className="legal-section-header">
                <Compass className="header-icon" size={20} />
                <div>
                  <h2>Useful Links Directory (उपयोगी लिंक्स डायरेक्टरी)</h2>
                  <p>Complete directory of all platform policies, leadership information, seller tools, and customer services.</p>
                </div>
              </div>

              <div className="useful-links-grid">
                {filteredCategories.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.title} className="useful-link-col">
                      <div className="col-title">
                        <CatIcon size={16} />
                        <span>{cat.title}</span>
                      </div>
                      <ul>
                        {cat.links.map((link) => (
                          <li key={link.name}>
                            <Link href={link.href}>
                              <strong>{link.name}</strong>
                              <small>{link.desc}</small>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredButtons.length === 0 && filteredCategories.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b" }}>
              <Search size={40} style={{ margin: "0 auto 12px", color: "#1766ef" }} />
              <h3>No links matching &quot;{searchTerm}&quot;</h3>
              <p>Try searching for shipping, refund, seller, founder, or support.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
