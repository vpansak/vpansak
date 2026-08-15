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
          <Link href="/founder">Founder Alok Singh <ChevronRight /></Link>
        </nav>
      </header>

      {/* Main Hero Banner */}
      <section className="vp-founder-hero">
        <div className="vp-founder-hero-inner">
          <div className="vp-founder-badge-row">
            <span className="vp-hero-chip"><Sparkles size={14} /> Official Profile</span>
            <span className="vp-hero-chip blue"><ShieldCheck size={14} /> Co-Founder &amp; Director</span>
          </div>
          <h1>Ayushi Tripathi</h1>
          <p className="vp-hero-tagline">
            Co-Founder &amp; Director of VPANSAK • Standing Shoulder-to-Shoulder with Founder Alok Singh
          </p>

          <div className="vp-founder-socials">
            <a
              href="https://www.instagram.com/tripathiayushi_22/"
              target="_blank"
              rel="noreferrer"
              className="vp-insta-btn"
            >
              <InstagramIcon size={18} /> @tripathiayushi_22
            </a>
            <Link href="/founder" className="vp-secondary-btn">
              <Users size={18} /> View Founder Alok Singh&apos;s Profile
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
                alt="Ayushi Tripathi & Alok Singh - Co-Founders of VPANSAK"
                className="vp-hd-founder-img"
              />
              <span className="vp-hd-badge">Co-Founders Photo</span>
            </div>

            <div className="vp-quick-bio">
              <h3>Ayushi Tripathi</h3>
              <p className="vp-bio-role">Co-Founder &amp; Director</p>
              <div className="vp-divider" />
              
              <ul className="vp-info-list">
                <li>
                  <Calendar size={16} />
                  <div>
                    <small>Date of Birth</small>
                    <strong>12 August 2009</strong>
                  </div>
                </li>
                <li>
                  <MapPin size={16} />
                  <div>
                    <small>Hometown &amp; Roots</small>
                    <strong>Basawanpur Village, Gorakhpur, Uttar Pradesh, India (20 km from Kanail)</strong>
                  </div>
                </li>
                <li>
                  <Heart size={16} />
                  <div>
                    <small>Parents</small>
                    <strong>Sunil Tripathi (Father) &amp; Anamika Tripathi (Mother)</strong>
                  </div>
                </li>
                <li>
                  <BookOpen size={16} />
                  <div>
                    <small>Company Origin</small>
                    <strong>Co-Created VPANSAK in School Days with Alok</strong>
                  </div>
                </li>
              </ul>

              <a
                href="https://www.instagram.com/tripathiayushi_22/"
                target="_blank"
                rel="noreferrer"
                className="vp-card-insta-link"
              >
                <InstagramIcon size={16} /> Follow Ayushi on Instagram
              </a>
            </div>
          </aside>

          {/* Right Column: Filmy & Heartwarming Story */}
          <div className="vp-founder-story">
            {/* Story Card 1: School Connection & Love */}
            <div className="vp-story-card highlight">
              <span className="vp-section-eyebrow"><HeartHandshake size={14} /> SCHOOL DAYS &amp; UNBREAKABLE BOND</span>
              <h2>A School Love Story That Created VPANSAK</h2>
              <p>
                The story of VPANSAK is not just about technology—it is a story of love, dedication, and shared dreams. Ayushi Tripathi and Founder <strong>Alok Singh</strong> first met during their school days. What started in the classroom quickly grew into a deep, beautiful bond filled with trust, affection, and mutual respect.
              </p>
              <p>
                From the very beginning, Ayushi believed in Alok&apos;s vision. In every challenge, every late-night planning session, and every step forward, <strong>Ayushi stood unwaveringly by Alok&apos;s side like a pillar of infinite strength</strong>.
              </p>
            </div>

            {/* Story Card 2: Two Villages, One Vision */}
            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><MapPin size={14} /> GORAKHPUR ROOTS</span>
              <h2>Two Villages Connected by Destiny</h2>
              <p>
                Ayushi belongs to the peaceful village of <strong>Basawanpur in Gorakhpur, Uttar Pradesh</strong>, located just 20 kilometers away from Alok&apos;s home village of <strong>Kanail</strong>. Born on <strong>12 August 2009</strong> to her father <strong>Sunil Tripathi</strong> and mother <strong>Anamika Tripathi</strong>, Ayushi grew up with strong family values and a determination to make a difference.
              </p>
              <p>
                While studying together, Alok and Ayushi decided to channel their energy and love into creating something grand for India. Together, they founded <strong>VPANSAK</strong> (Powered by A&amp;A Group), proving that true love inspires extraordinary achievement.
              </p>
            </div>

            {/* Joint Photo Banner Box */}
            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><Users size={14} /> FOUNDERS SIDE-BY-SIDE</span>
              <h2>Alok &amp; Ayushi — Co-Founders of VPANSAK</h2>
              <div className="vp-founders-joint-box">
                <img
                  src="/alok-ayushi-founders.jpg"
                  alt="Alok Singh & Ayushi Tripathi Together"
                  className="vp-joint-img"
                />
                <div className="vp-joint-copy">
                  <h4>Alok Singh &amp; Ayushi Tripathi</h4>
                  <p>Starting from school desks to building VPANSAK together, standing strong at every milestone.</p>
                  <Link href="/founder" className="vp-joint-link">
                    Explore Founder Alok Singh&apos;s Profile &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Pillars of Ayushi's Contribution */}
            <div className="vp-story-card">
              <span className="vp-section-eyebrow"><Award size={14} /> LEADERSHIP &amp; IMPACT</span>
              <h2>Ayushi&apos;s Core Role at VPANSAK</h2>
              <div className="vp-pillars-grid">
                <div className="vp-pillar-item">
                  <span className="vp-pillar-num">01</span>
                  <h4>Unwavering Strength</h4>
                  <p>Guiding and supporting Founder Alok Singh through every milestone and obstacle.</p>
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
                  <h4>Youth Inspiration</h4>
                  <p>Demonstrating how teamwork, love, and ambition can turn high school dreams into reality.</p>
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
          <h2>Connect with Ayushi Tripathi &amp; VPANSAK</h2>
          <p>Follow Ayushi on Instagram or explore the VPANSAK marketplace and leadership stories.</p>
          <div className="vp-cta-btns">
            <a
              href="https://www.instagram.com/tripathiayushi_22/"
              target="_blank"
              rel="noreferrer"
              className="vp-cta-primary"
            >
              <InstagramIcon size={18} /> Follow @tripathiayushi_22
            </a>
            <Link href="/founder" className="vp-cta-secondary">
              Founder Alok Singh Profile
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
