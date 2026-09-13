"use client";

import { ArrowLeft, Award, BookOpen, Calendar, ChevronRight, Heart, HeartHandshake, MapPin, ShieldCheck, Sparkles, UserCheck, Users } from "lucide-react";
import Link from "next/link";

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function FounderPage() {
  return (
    <main className="vp-founder-page">
      {/* Sub Header */}
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>FOUNDER &amp; LEADERSHIP</small>
          </span>
        </Link>
        <nav>
          <Link href="/"><ArrowLeft /> Home</Link>
          <Link href="/cofounder">Co-Founder <ChevronRight /></Link>
        </nav>
      </header>

      {/* Main Hero Banner */}
      <section className="vp-founder-hero">
        <div className="vp-founder-hero-inner">
          <div className="vp-founder-badge-row">
            <span className="vp-hero-chip"><Sparkles size={14} /> Official Profile</span>
            <span className="vp-hero-chip blue"><ShieldCheck size={14} /> Leadership &amp; Vision</span>
          </div>
          <h1>VPANSAK Founder &amp; Executive Team</h1>
          <p className="vp-hero-tagline">
            Building India&apos;s Next-Gen Transparent Digital E-Commerce Ecosystem
          </p>

          <div className="vp-founder-socials">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="vp-x-btn"
            >
              <XIcon size={16} /> @vpansak_official
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="vp-insta-btn"
            >
              <InstagramIcon size={18} /> @vpansak.official
            </a>
            <Link href="/cofounder" className="vp-secondary-btn">
              <Users size={18} /> Meet Executive Co-Leadership
            </Link>
          </div>
        </div>
      </section>

      {/* Profile & Biography Section */}
      <section className="vp-founder-container">
        <div className="vp-founder-grid">
          {/* Left Column: Photo & Quick Bio Card */}
          <aside className="vp-founder-photo-card">
            <div className="vp-hd-photo-wrapper">
              <img
                src="/alok-singh-founder.jpg"
                alt="VPANSAK Founder & Leadership"
                className="vp-hd-founder-img"
              />
              <span className="vp-hd-badge">Verified Leadership Profile</span>
            </div>

            <div className="vp-quick-bio">
              <h3>VPANSAK Leadership</h3>
              <p className="vp-bio-role">Founder &amp; Chief Executive Directorate</p>
              <div className="vp-divider" />
              
              <ul className="vp-info-list">
                <li>
                  <Calendar size={16} />
                  <div>
                    <small>Official Launch Date</small>
                    <strong>12 August 2026</strong>
                  </div>
                </li>
                <li>
                  <MapPin size={16} />
                  <div>
                    <small>Headquarters &amp; Operations</small>
                    <strong>Uttar Pradesh, India</strong>
                  </div>
                </li>
                <li>
                  <Heart size={16} />
                  <div>
                    <small>Organization</small>
                    <strong>VPANSAK Shopping &amp; A&amp;A Group</strong>
                  </div>
                </li>
                <li>
                  <BookOpen size={16} />
                  <div>
                    <small>Company Focus</small>
                    <strong>Direct Brand Retail &amp; Merchant Ecosystem</strong>
                  </div>
                </li>
              </ul>

              <div className="vp-social-card-links" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="vp-card-x-link"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.08)", color: "#f8fafc", border: "1px solid rgba(255, 255, 255, 0.2)", fontSize: "12px", fontWeight: 800, textDecoration: "none" }}
                >
                  <XIcon size={16} /> Follow VPANSAK on X (@vpansak_official)
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="vp-card-insta-link"
                >
                  <InstagramIcon size={16} /> Follow VPANSAK on Instagram
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Founder's Inspiring Journey Story */}
          <div className="vp-founder-story">
            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><BookOpen size={14} /> THE VPANSAK STORY</span>
              <h2>Building India&apos;s Digital Commerce Ecosystem</h2>
              <p>
                VPANSAK was conceptualized with a mission to deliver a completely transparent, high-speed, and customer-first online marketplace for Indian consumers and independent merchants.
              </p>
              <p>
                With a clear focus on technology innovation, merchant empowerment, and verified support operations, VPANSAK continues to expand its reach across India.
              </p>
            </div>

            {/* Leadership & Co-Founding Collaboration */}
            <div className="vp-story-card highlight">
              <span className="vp-section-eyebrow"><HeartHandshake size={14} /> EXECUTIVE COLLABORATION</span>
              <h2>Co-Founding &amp; Executive Leadership</h2>
              <p>
                VPANSAK&apos;s leadership brings together creative direction, technological excellence, and strategic management to deliver a full-scale digital ecosystem featuring e-commerce shopping, merchant seller hubs, trackable support tickets, and community foundation initiatives.
              </p>
              <div className="vp-founders-joint-box">
                <img
                  src="/alok-ayushi-founders.jpg"
                  alt="VPANSAK Co-Founders & Leadership"
                  className="vp-joint-img"
                />
                <div className="vp-joint-copy">
                  <h4>VPANSAK Executive Leadership</h4>
                  <p>Guiding the strategic direction, growth, and customer commitment of VPANSAK.</p>
                  <Link href="/cofounder" className="vp-joint-link">
                    Read Executive Co-Leadership Profile &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Core Values & Pillars */}
            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><Award size={14} /> MISSION &amp; VALUES</span>
              <h2>Pillars of VPANSAK</h2>
              <div className="vp-pillars-grid">
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">01</span>
                  <h4>Customer Trust</h4>
                  <p>Ensuring every order, review, and support request is trackable and authentic.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">02</span>
                  <h4>Merchant Growth</h4>
                  <p>Empowering local Indian businesses and sellers with easy digital onboarding.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">03</span>
                  <h4>Innovation First</h4>
                  <p>Building high-performance e-commerce software backed by clarity and hard work.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">04</span>
                  <h4>Community Foundation</h4>
                  <p>Giving back to society through VPANSAK Support Foundation and verification programs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="vp-founder-cta">
        <div className="vp-cta-box">
          <UserCheck size={36} />
          <h2>Connect with VPANSAK Leadership</h2>
          <p>Have questions, partnerships, or feedback? Follow VPANSAK on social channels or reach out via Support Hub.</p>
          <div className="vp-cta-btns">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="vp-cta-primary"
            >
              <InstagramIcon size={18} /> Follow @vpansak.official
            </a>
            <Link href="/" className="vp-cta-secondary">
              Explore VPANSAK Marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
