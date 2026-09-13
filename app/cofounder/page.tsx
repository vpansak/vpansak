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

export default function CoFounderPage() {
  return (
    <main className="vp-founder-page">
      {/* Sub Header */}
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>CO-FOUNDER &amp; LEADERSHIP</small>
          </span>
        </Link>
        <nav>
          <Link href="/"><ArrowLeft /> Home</Link>
          <Link href="/founder">VPANSAK Founder <ChevronRight /></Link>
        </nav>
      </header>

      {/* Main Hero Banner */}
      <section className="vp-founder-hero">
        <div className="vp-founder-hero-inner">
          <div className="vp-founder-badge-row">
            <span className="vp-hero-chip"><Sparkles size={14} /> Official Profile</span>
            <span className="vp-hero-chip blue"><ShieldCheck size={14} /> Co-Founder &amp; Director</span>
          </div>
          <h1>Executive Co-Founder &amp; Director</h1>
          <p className="vp-hero-tagline">
            Co-Founder &amp; Strategic Director of VPANSAK Shopping Platform
          </p>

          <div className="vp-founder-socials">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="vp-insta-btn"
            >
              <InstagramIcon size={18} /> @vpansak.official
            </a>
            <Link href="/founder" className="vp-secondary-btn">
              <Users size={18} /> View VPANSAK Founder Profile
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
                src="/alok-ayushi-founders.jpg"
                alt="VPANSAK Executive Co-Leadership"
                className="vp-hd-founder-img"
              />
              <span className="vp-hd-badge">Co-Leadership Profile</span>
            </div>

            <div className="vp-quick-bio">
              <h3>VPANSAK Co-Leadership</h3>
              <p className="vp-bio-role">Co-Founder &amp; Strategic Director</p>
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
                    <small>Operations Base</small>
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
                    <small>Core Responsibilities</small>
                    <strong>Platform Governance &amp; Experience</strong>
                  </div>
                </li>
              </ul>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="vp-card-insta-link"
              >
                <InstagramIcon size={16} /> Follow VPANSAK on Instagram
              </a>
            </div>
          </aside>

          {/* Right Column */}
          <div className="vp-founder-story">
            <div className="vp-story-card highlight">
              <span className="vp-section-eyebrow"><HeartHandshake size={14} /> SHARED VISION &amp; DEDICATION</span>
              <h2>Building VPANSAK Together</h2>
              <p>
                The story of VPANSAK is built on shared dedication, teamwork, and a vision to empower shoppers and sellers across India. From early planning to full platform execution, our co-leadership team has driven customer trust, operational excellence, and brand integrity.
              </p>
            </div>

            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><MapPin size={14} /> REGIONAL ROOTS &amp; EXPANSION</span>
              <h2>Developed in Uttar Pradesh, India</h2>
              <p>
                Headquartered and built out of Uttar Pradesh, VPANSAK operates as part of <strong>A&amp;A Group</strong>, providing digital retail access, merchant tools, trackable support tickets, and community welfare programs.
              </p>
            </div>

            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><Users size={14} /> EXECUTIVE TEAM</span>
              <h2>VPANSAK Co-Leadership</h2>
              <div className="vp-founders-joint-box">
                <img
                  src="/alok-ayushi-founders.jpg"
                  alt="VPANSAK Co-Leadership Team"
                  className="vp-joint-img"
                />
                <div className="vp-joint-copy">
                  <h4>VPANSAK Executive Directorate</h4>
                  <p>Building high-speed shopping experiences with complete transparency and customer focus.</p>
                  <Link href="/founder" className="vp-joint-link">
                    Explore VPANSAK Founder Profile &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><Award size={14} /> LEADERSHIP &amp; IMPACT</span>
              <h2>Core Strategic Pillars</h2>
              <div className="vp-pillars-grid">
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">01</span>
                  <h4>Brand Governance</h4>
                  <p>Ensuring absolute transparency, security, and quality control for consumers.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">02</span>
                  <h4>Customer Experience</h4>
                  <p>Shaping VPANSAK&apos;s focus on customer satisfaction, trust, and transparent support.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">03</span>
                  <h4>Shared Vision</h4>
                  <p>Co-building a platform that brings commerce, sellers, and community initiatives together.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">04</span>
                  <h4>Community Foundation</h4>
                  <p>Supporting transparent community welfare and verified contributor initiatives.</p>
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
          <h2>Connect with VPANSAK Directorate</h2>
          <p>Follow VPANSAK on Instagram or explore the VPANSAK marketplace and leadership stories.</p>
          <div className="vp-cta-btns">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="vp-cta-primary"
            >
              <InstagramIcon size={18} /> Follow @vpansak.official
            </a>
            <Link href="/founder" className="vp-cta-secondary">
              VPANSAK Founder Profile
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
