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
            <span className="vp-hero-chip blue"><ShieldCheck size={14} /> Founder &amp; CEO</span>
          </div>
          <h1>Alok Singh</h1>
          <p className="vp-hero-tagline">
            Founder &amp; CEO of VPANSAK • Class 12 Student Innovator from Kanail, Gorakhpur (U.P.)
          </p>

          <div className="vp-founder-socials">
            <a
              href="https://www.instagram.com/aloksingh_._/"
              target="_blank"
              rel="noreferrer"
              className="vp-insta-btn"
            >
              <InstagramIcon size={18} /> @aloksingh_._
            </a>
            <Link href="/cofounder" className="vp-secondary-btn">
              <Users size={18} /> Meet Co-Founder Ayushi Tripathi
            </Link>
          </div>
        </div>
      </section>

      {/* Profile & Biography Section */}
      <section className="vp-founder-container">
        <div className="vp-founder-grid">
          {/* Left Column: HD Photo & Quick Bio Card */}
          <aside className="vp-founder-photo-card">
            <div className="vp-hd-photo-wrapper">
              <img
                src="/alok-singh-founder.jpg"
                alt="Alok Singh - Founder & CEO of VPANSAK"
                className="vp-hd-founder-img"
              />
              <span className="vp-hd-badge">HD Verified Photo</span>
            </div>

            <div className="vp-quick-bio">
              <h3>Alok Singh</h3>
              <p className="vp-bio-role">Founder &amp; Chief Executive Officer</p>
              <div className="vp-divider" />
              
              <ul className="vp-info-list">
                <li>
                  <Calendar size={16} />
                  <div>
                    <small>Date of Birth</small>
                    <strong>13 April 2008</strong>
                  </div>
                </li>
                <li>
                  <MapPin size={16} />
                  <div>
                    <small>Hometown &amp; Roots</small>
                    <strong>Kanail Village, Gorakhpur, Uttar Pradesh, India</strong>
                  </div>
                </li>
                <li>
                  <Heart size={16} />
                  <div>
                    <small>Parents</small>
                    <strong>Arvind Singh (Father) &amp; Niraj Singh (Mother)</strong>
                  </div>
                </li>
                <li>
                  <BookOpen size={16} />
                  <div>
                    <small>Company Origin</small>
                    <strong>Built VPANSAK in Class 12 (School Days)</strong>
                  </div>
                </li>
              </ul>

              <a
                href="https://www.instagram.com/aloksingh_._/"
                target="_blank"
                rel="noreferrer"
                className="vp-card-insta-link"
              >
                <InstagramIcon size={16} /> Follow Alok on Instagram
              </a>
            </div>
          </aside>

          {/* Right Column: Founder's Inspiring Journey Story */}
          <div className="vp-founder-story">
            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><BookOpen size={14} /> THE VPANSAK STORY</span>
              <h2>From Kanail Village to Building India&apos;s Digital Ecosystem</h2>
              <p>
                Alok Singh was born on <strong>13 April 2008</strong> in the small, peaceful village of <strong>Kanail</strong>, located in the <strong>Gorakhpur district of Uttar Pradesh, India</strong>. Guided by the values and blessings of his father, <strong>Arvind Singh</strong>, and mother, <strong>Niraj Singh</strong>, Alok developed a deep passion for technology and digital systems from a very early age.
              </p>
              <p>
                While studying in <strong>Class 12</strong> in school, when most students were focusing solely on textbooks, Alok envisioned creating a complete, transparent, and reliable online marketplace for Indian consumers and small merchants. That vision took shape as <strong>VPANSAK</strong> (Powered by A&amp;A Group).
              </p>
            </div>

            {/* School Roots & Partnership */}
            <div className="vp-story-card highlight">
              <span className="vp-section-eyebrow"><HeartHandshake size={14} /> SCHOOL-BORN COLLABORATION</span>
              <h2>Meeting Co-Founder Ayushi Tripathi</h2>
              <p>
                It was during their school days that Alok Singh met <strong>Ayushi Tripathi</strong>, who became his trusted co-founder in creating VPANSAK. Together, their shared determination and complementary strengths transformed a high-school dream into a full-scale digital ecosystem featuring e-commerce shopping, merchant platforms, trackable support tickets, and community foundation initiatives.
              </p>
              <div className="vp-founders-joint-box">
                <img
                  src="/alok-ayushi-founders.jpg"
                  alt="Alok Singh & Ayushi Tripathi - Founders of VPANSAK"
                  className="vp-joint-img"
                />
                <div className="vp-joint-copy">
                  <h4>Alok Singh &amp; Ayushi Tripathi</h4>
                  <p>Co-founders of VPANSAK, who started building the platform during their school journey.</p>
                  <Link href="/cofounder" className="vp-joint-link">
                    Read Ayushi Tripathi&apos;s Co-Founder Story &rarr;
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
                  <h4>Youth Leadership</h4>
                  <p>Proving that age is no barrier when backed by dedication, clarity, and hard work.</p>
                </div>
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">04</span>
                  <h4>Community Foundation</h4>
                  <p>Giving back to society through VPANSAK Foundation and verification programs.</p>
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
          <h2>Connect with Alok Singh &amp; VPANSAK</h2>
          <p>Have questions, partnerships, or feedback? Follow Alok on Instagram or reach out via Support Hub.</p>
          <div className="vp-cta-btns">
            <a
              href="https://www.instagram.com/aloksingh_._/"
              target="_blank"
              rel="noreferrer"
              className="vp-cta-primary"
            >
              <InstagramIcon size={18} /> Follow @aloksingh_._
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
