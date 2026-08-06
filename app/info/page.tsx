"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  Gift,
  Globe,
  Headphones,
  HelpCircle,
  Heart,
  Home,
  Info,
  Camera,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  UserCheck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const tocSections = [
  { id: "hero", label: "About VPANSAK" },
  { id: "story", label: "Our Story" },
  { id: "founder", label: "Founder" },
  { id: "mission-vision", label: "Mission & Vision" },
  { id: "core-values", label: "Core Values" },
  { id: "user-services", label: "What Users Can Do" },
  { id: "categories", label: "Product Categories" },
  { id: "shopping-process", label: "How Shopping Works" },
  { id: "payments", label: "Payments & Verification" },
  { id: "delivery", label: "Delivery & Tracking" },
  { id: "returns-refunds", label: "Returns & 5-Min Refund" },
  { id: "seller-program", label: "Sell on VPANSAK (3% Fee)" },
  { id: "support", label: "Support Centre" },
  { id: "contribution", label: "Support Contribution" },
  { id: "security", label: "Security & Safety" },
  { id: "timeline-roadmap", label: "Timeline & Roadmap" },
  { id: "policies", label: "Policy Directory" },
  { id: "faq", label: "FAQ (Searchable)" },
  { id: "contact", label: "Contact Us" },
];

const faqList = [
  { q: "What is VPANSAK?", a: "VPANSAK Shopping is an emerging digital commerce platform created under A & A Group to connect customers with products, verified sellers, secure payment options, delivery tracking and responsive support." },
  { q: "When was VPANSAK launched?", a: "VPANSAK was officially launched on 12 August 2026." },
  { q: "Who founded VPANSAK?", a: "VPANSAK was founded by Alok Singh with the vision of building a transparent, mobile-first marketplace for customers and sellers across India." },
  { q: "Where is VPANSAK based?", a: "VPANSAK is headquartered and developed from Gorakhpur, Uttar Pradesh, India." },
  { q: "How do I create an account?", a: "You can create an account using your email address through the Login / Signup page. Your registered email address acts as your primary account identity." },
  { q: "What should I do if I forget my password?", a: "Click on 'Forgot Password' on the login screen. You can reset your password securely via OTP sent to your registered email address." },
  { q: "Is my email my primary account ID?", a: "Yes. VPANSAK uses your registered email address as your primary account identity. There is no separate customer User ID to memorize." },
  { q: "How do I search for a product?", a: "Use the top sticky search bar on any page to search by product name, category, or keyword." },
  { q: "How do I place an order?", a: "Browse products, select desired quantity, click 'Buy Now' or 'Add to Cart', enter your delivery address, select a payment method, and confirm your order." },
  { q: "Which payment methods are supported?", a: "VPANSAK supports UPI, Debit Cards, Credit Cards, Netbanking, Cash on Delivery (COD), and VPANSAK Gift Cards for eligible products." },
  { q: "Is Cash on Delivery (COD) available?", a: "COD is available on eligible products and delivery locations. Availability is automatically displayed during checkout." },
  { q: "How do I track my order?", a: "Go to 'My Orders' in your Account Dashboard or visit /track and enter your Order ID to view real-time tracking progress." },
  { q: "Can I cancel an order?", a: "Eligible orders can be cancelled directly from your Account Dashboard before the seller or logistics partner processes shipment." },
  { q: "What is the return window?", a: "Eligible products can be returned within a maximum period of 7 days from delivery date, subject to specific product category conditions." },
  { q: "Are all products returnable?", a: "Certain hygiene, personal care, and consumable categories may be non-returnable or replacement-only. Product pages clearly state eligibility." },
  { q: "How do replacements work?", a: "If an eligible item arrives damaged, defective, or incorrect, you can request a replacement. If stock is unavailable, an eligible refund is initiated." },
  { q: "When will my refund be initiated?", a: "Once the returned product pickup is successfully completed and verified, VPANSAK aims to initiate eligible refunds within approximately five minutes." },
  { q: "When will the refund reach my bank account?", a: "Refund initiation occurs within 5 minutes of pickup verification. Final credit timing depends on your bank, UPI provider, or payment gateway (typically 1 to 5 business days)." },
  { q: "How do I contact VPANSAK customer support?", a: "You can reach support via Email (support.vpansak@gmail.com), WhatsApp (+66 94 203 3973), or the official Support Portal (https://vpansaksupporthub.lovable.app)." },
  { q: "How do I raise a support ticket?", a: "Visit the Support Centre in your account dashboard or open the official VPANSAK Support Hub to submit a tracked support ticket." },
  { q: "How do I become a seller on VPANSAK?", a: "Visit /seller, fill in your business and contact details, submit identity verification documents, and await verification." },
  { q: "Which seller documents are required?", a: "Required documents may include Aadhaar, PAN, Bank account details, and GSTIN where applicable under law." },
  { q: "What is the seller platform fee?", a: "VPANSAK applies a transparent platform fee of 3%, subject to applicable seller terms, category rules, and taxes." },
  { q: "How are seller products approved?", a: "Seller product submissions undergo quality, image, pricing, and category review before being published on the marketplace." },
  { q: "What is a VPANSAK Gift Card?", a: "VPANSAK Gift Cards are 12-digit prepaid codes that can be redeemed during checkout for instant order discounts." },
  { q: "What is the Support Contribution program?", a: "The Support Contribution program allows voluntary platform supporters to contribute toward platform development and support initiatives." },
  { q: "When is a contribution certificate issued?", a: "A Certificate of Appreciation is generated after server verification of a contribution payment." },
  { q: "Why is my contribution certificate unavailable?", a: "Certificates remain unavailable for pending, failed, or unverified manual UPI submissions until admin verification is completed." },
  { q: "How does VPANSAK protect account information?", a: "VPANSAK uses server-validated sessions, PBKDF2 password hashing, HTTPS encryption, and server-verified payment gateways." },
  { q: "Where can I read VPANSAK policies?", a: "All policy documents (Privacy, Terms, Return, Refund, Shipping, Seller Policy) are accessible under /policies." },
  { q: "How can I report suspicious activity?", a: "Contact support immediately at support.vpansak@gmail.com or raise a ticket on the Support Hub." },
  { q: "Can I delete my account?", a: "Account deletion can be requested under Privacy & Data settings in your Account Dashboard, subject to active order retention rules." },
  { q: "Can I update my profile details?", a: "Yes, you can update your Full Name, Mobile Number, Profile Photo, and Addresses anytime under /profile." },
  { q: "How do I check my refund status?", a: "Track refund status under 'Payments & Refunds' in your Account Dashboard." },
  { q: "How can I follow VPANSAK on social media?", a: "Follow official updates on Instagram (instagram.com/vpansak) and X (x.com/VPANSAK_)." },
];

export default function InfoPage() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return faqList;
    const q = faqSearch.toLowerCase().trim();
    return faqList.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
  }, [faqSearch]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="info-page-shell">
      {/* HEADER BREADCRUMB / TOPBAR */}
      <div className="info-top-bar">
        <div className="info-container flex-between">
          <div className="info-brand-tag">
            <Link href="/" className="info-back-link">
              <Home size={15} /> Store Home
            </Link>
            <span>/</span>
            <strong>About VPANSAK Information Hub</strong>
          </div>
          <div className="info-launch-badge">
            <Sparkles size={13} /> Launched 12 August 2026 • Gorakhpur, UP
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="info-hero-section">
        <div className="info-container">
          <div className="info-hero-content">
            <span className="info-eyebrow">ABOUT VPANSAK</span>
            <h1>Building a More Reliable and Accessible Shopping Experience</h1>
            <p>
              VPANSAK is a modern shopping platform founded by <strong>Alok Singh</strong> and launched on{" "}
              <strong>12 August 2026</strong>. Created under <strong>A &amp; A Group</strong>, the platform is being
              developed to connect customers with quality products, verified sellers, secure payment options, live order
              tracking and responsive customer support through one unified digital experience.
            </p>

            <div className="info-hero-highlights">
              <span>
                <CheckCircle2 size={15} /> Founded in Gorakhpur, Uttar Pradesh
              </span>
              <span>
                <CheckCircle2 size={15} /> Launched 12 August 2026
              </span>
              <span>
                <CheckCircle2 size={15} /> Verified Seller Onboarding (3% Fee)
              </span>
              <span>
                <CheckCircle2 size={15} /> Max 7-Day Returns &amp; 5-Min Refund Initiation
              </span>
            </div>

            <div className="info-hero-actions">
              <Link href="/" className="btn-hero-primary">
                <ShoppingBag size={16} /> Start Shopping
              </Link>
              <Link href="/categories" className="btn-hero-secondary">
                Browse Categories
              </Link>
              <Link href="/seller" className="btn-hero-secondary">
                <Store size={16} /> Become a Seller
              </Link>
              <a
                href="https://vpansaksupporthub.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-outline"
              >
                <Headphones size={16} /> Contact Support <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER WITH SIDEBAR TOC & CONTENT */}
      <div className="info-container info-body-grid">
        {/* MOBILE TOC TOGGLER */}
        <div className="mobile-toc-toggle-bar">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Layers size={16} /> On This Page ({tocSections.find((s) => s.id === activeSection)?.label})
            <ChevronDown size={16} style={{ transform: mobileMenuOpen ? "rotate(180deg)" : "none" }} />
          </button>
          {mobileMenuOpen && (
            <div className="mobile-toc-dropdown">
              {tocSections.map((s) => (
                <button
                  key={s.id}
                  className={activeSection === s.id ? "active" : ""}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DESKTOP STICKY SIDEBAR TABLE OF CONTENTS */}
        <aside className="desktop-toc-sidebar">
          <div className="toc-box">
            <h4>ON THIS PAGE</h4>
            <nav>
              {tocSections.map((s) => (
                <button
                  key={s.id}
                  className={activeSection === s.id ? "active" : ""}
                  onClick={() => scrollToSection(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="toc-support-card">
            <Headphones size={24} />
            <strong>Need Assistance?</strong>
            <p>Our support hub is ready to help with orders, refunds and seller onboarding.</p>
            <a
              href="https://vpansaksupporthub.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-toc-support"
            >
              Open Support Hub
            </a>
          </div>
        </aside>

        {/* MAIN DETAILED CONTENT REGION */}
        <main className="info-main-article">
          {/* ABOUT SECTION */}
          <section id="about" className="info-card-block">
            <h2>About VPANSAK</h2>
            <p className="lead">
              VPANSAK Shopping is an emerging digital commerce platform created to make online shopping more organized,
              transparent and accessible. The platform brings customers, products, verified sellers, payment options, order
              tracking and support tools together in one connected place.
            </p>
            <p>
              VPANSAK was founded by <strong>Alok Singh</strong> and officially launched on <strong>12 August 2026</strong>.
              The platform operates associated with <strong>A &amp; A Group</strong> and is developed from Gorakhpur,
              Uttar Pradesh, India.
            </p>
            <p>
              The goal of VPANSAK is not only to display products, but to build a complete shopping ecosystem. Customers
              can create accounts using their email, discover catalog products, save items to wishlists, place orders,
              choose payment methods, track delivery progress, and access structured support.
            </p>
          </section>

          {/* QUICK FACTS GRID */}
          <section id="facts" className="info-card-block">
            <h2>Quick Facts</h2>
            <div className="quick-facts-grid">
              <div className="fact-item">
                <Building size={20} />
                <div>
                  <small>BRAND NAME</small>
                  <strong>VPANSAK Shopping</strong>
                </div>
              </div>
              <div className="fact-item">
                <Users size={20} />
                <div>
                  <small>GROUP AFFILIATION</small>
                  <strong>A &amp; A Group</strong>
                </div>
              </div>
              <div className="fact-item">
                <UserCheck size={20} />
                <div>
                  <small>FOUNDER</small>
                  <strong>Alok Singh (Founder)</strong>
                </div>
              </div>
              <div className="fact-item">
                <Clock size={20} />
                <div>
                  <small>LAUNCH DATE</small>
                  <strong>12 August 2026</strong>
                </div>
              </div>
              <div className="fact-item">
                <MapPin size={20} />
                <div>
                  <small>HEADQUARTERS</small>
                  <strong>Gorakhpur, UP, India</strong>
                </div>
              </div>
              <div className="fact-item">
                <Tag size={20} />
                <div>
                  <small>SELLER FEE</small>
                  <strong>3% Platform Fee</strong>
                </div>
              </div>
            </div>
          </section>

          {/* OUR STORY */}
          <section id="story" className="info-card-block">
            <h2>Our Story</h2>
            <p>
              VPANSAK began with the idea that an online marketplace should be easy to use, transparent and accountable.
              Customers should understand what they are buying, how they are paying, where their order is, and how to get
              assistance when a problem occurs.
            </p>
            <p>
              The platform was designed with a mobile-first approach because many customers access digital services
              primarily through smartphones. From product discovery and account management to payment verification and
              support tracking, the aim is to keep every important action clear and accessible.
            </p>
            <p>
              On 12 August 2026, VPANSAK formally began its journey as a shopping platform under the leadership of founder
              Alok Singh.
            </p>
          </section>

          {/* FOUNDER SECTION */}
          <section id="founder" className="info-card-block founder-card-block">
            <div className="founder-header">
              <div className="founder-avatar-block">AS</div>
              <div>
                <h2>Alok Singh</h2>
                <span className="founder-title">Founder • VPANSAK</span>
                <small>Gorakhpur, Uttar Pradesh</small>
              </div>
            </div>
            <p>
              Alok Singh founded VPANSAK with the aim of creating a customer-focused digital shopping platform supported by
              structured seller verification, transparent order processes and accessible customer support.
            </p>
            <blockquote className="founder-quote">
              “Our goal is to build a shopping platform where customers can understand every important stage—from product
              selection and payment to delivery and support.”
            </blockquote>
          </section>

          {/* MISSION & VISION */}
          <section id="mission-vision" className="info-card-block">
            <h2>Mission &amp; Vision</h2>
            <div className="mv-grid">
              <div className="mv-box">
                <h3>Our Mission</h3>
                <p>
                  To build a secure, transparent and customer-focused shopping platform that connects users with products,
                  verified sellers, responsible payment processes, order tracking and accessible support.
                </p>
                <ul>
                  <li>Customer convenience in discovery &amp; ordering</li>
                  <li>Transparent delivery &amp; refund status tracking</li>
                  <li>Seller accountability &amp; onboarding review</li>
                  <li>Server-verified payment security</li>
                </ul>
              </div>

              <div className="mv-box">
                <h3>Our Vision</h3>
                <p>
                  To develop VPANSAK into a trusted digital commerce ecosystem that serves customers across India and
                  supports responsible growth for verified sellers.
                </p>
                <ul>
                  <li>Nationwide product availability &amp; delivery</li>
                  <li>Expanded seller participation across categories</li>
                  <li>Enhanced logistics and tracking integrations</li>
                  <li>Smarter search and recommendation features</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CORE VALUES */}
          <section id="core-values" className="info-card-block">
            <h2>Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <ShieldCheck size={24} className="icon-blue" />
                <h3>Trust</h3>
                <p>We aim to earn customer confidence through clear information, consistent processes and reliable communication.</p>
              </div>
              <div className="value-card">
                <Lock size={24} className="icon-blue" />
                <h3>Security</h3>
                <p>Accounts, payments, verification systems and sensitive user data are handled through safe technical practices.</p>
              </div>
              <div className="value-card">
                <FileCheck size={24} className="icon-blue" />
                <h3>Transparency</h3>
                <p>Order, payment, return, refund and support statuses are understandable and traceable without confusion.</p>
              </div>
              <div className="value-card">
                <Heart size={24} className="icon-blue" />
                <h3>Customer First</h3>
                <p>Platform design decisions prioritize ease of use, support accessibility and customer clarity.</p>
              </div>
              <div className="value-card">
                <Award size={24} className="icon-blue" />
                <h3>Quality</h3>
                <p>Products, sellers and platform features pass appropriate review before public availability.</p>
              </div>
              <div className="value-card">
                <Sparkles size={24} className="icon-blue" />
                <h3>Innovation</h3>
                <p>VPANSAK continuously improves shopping, seller management, support tracking and user experiences.</p>
              </div>
            </div>
          </section>

          {/* WHAT USERS CAN DO */}
          <section id="user-services" className="info-card-block">
            <h2>What Users Can Do on VPANSAK</h2>
            <div className="user-services-list">
              <span><CheckCircle2 size={16} /> Create an account using verified email</span>
              <span><CheckCircle2 size={16} /> Browse product categories &amp; search catalog</span>
              <span><CheckCircle2 size={16} /> Save items to wishlist &amp; multi-device cart</span>
              <span><CheckCircle2 size={16} /> Manage multiple delivery addresses</span>
              <span><CheckCircle2 size={16} /> Select preferred payment method (Online &amp; COD)</span>
              <span><CheckCircle2 size={16} /> Track live order status step-by-step</span>
              <span><CheckCircle2 size={16} /> Request eligible return within max 7 days</span>
              <span><CheckCircle2 size={16} /> Track 5-minute refund initiation status</span>
              <span><CheckCircle2 size={16} /> Open and track support tickets on Support Hub</span>
              <span><CheckCircle2 size={16} /> Apply to become a verified seller (3% Fee)</span>
              <span><CheckCircle2 size={16} /> Manage profile and account security settings</span>
              <span><CheckCircle2 size={16} /> Submit product reviews and feedback</span>
            </div>
          </section>

          {/* PRODUCT CATEGORIES */}
          <section id="categories" className="info-card-block">
            <h2>Product Categories</h2>
            <p>Explore a wide variety of product categories available on VPANSAK Shopping:</p>
            <div className="category-pills-grid">
              <span>Mobiles &amp; 5G Phones</span>
              <span>Electronics &amp; Smart Watches</span>
              <span>Laptops &amp; Computers</span>
              <span>Fashion &amp; Apparel</span>
              <span>Beauty &amp; Personal Care</span>
              <span>Home &amp; Kitchen</span>
              <span>Furniture &amp; Living</span>
              <span>Sports &amp; Fitness</span>
              <span>Books &amp; Learning</span>
              <span>Groceries &amp; Daily Needs</span>
              <span>Toys &amp; Games</span>
              <span>Automotive Accessories</span>
            </div>
            <div className="center-btn-row">
              <Link href="/categories" className="btn-inline-primary">
                Browse All Categories
              </Link>
            </div>
          </section>

          {/* HOW SHOPPING WORKS */}
          <section id="shopping-process" className="info-card-block">
            <h2>How Shopping Works</h2>
            <div className="steps-flow-grid">
              <div className="step-card">
                <b>01</b>
                <h4>Discover Products</h4>
                <p>Search or browse catalog categories for your desired items.</p>
              </div>
              <div className="step-card">
                <b>02</b>
                <h4>Review Details</h4>
                <p>Check product specifications, MRP, price, and stock status.</p>
              </div>
              <div className="step-card">
                <b>03</b>
                <h4>Add to Cart / Buy Now</h4>
                <p>Select items and click Buy Now or Add to Cart.</p>
              </div>
              <div className="step-card">
                <b>04</b>
                <h4>Delivery Address</h4>
                <p>Select or enter your primary delivery address.</p>
              </div>
              <div className="step-card">
                <b>05</b>
                <h4>Choose Payment</h4>
                <p>Select UPI, Cards, Netbanking, COD, or Gift Card.</p>
              </div>
              <div className="step-card">
                <b>06</b>
                <h4>Place &amp; Track</h4>
                <p>Receive order confirmation and track shipping progress.</p>
              </div>
            </div>
          </section>

          {/* ACCOUNT & PROFILE SYSTEM */}
          <section id="account-system" className="info-card-block">
            <h2>Account &amp; Profile System</h2>
            <p>
              VPANSAK uses your <strong>registered email address</strong> as your primary account identity. There is no
              separate customer User ID to memorize.
            </p>
            <div className="info-callout">
              <ShieldCheck size={20} />
              <div>
                <strong>Primary Account Identity</strong>
                <p>
                  Your email address securely connects your orders, saved addresses, wishlist, cart, notifications, and
                  support history across all devices.
                </p>
              </div>
            </div>
          </section>

          {/* PAYMENTS & VERIFICATION */}
          <section id="payments" className="info-card-block">
            <h2>Payment Options &amp; Verification</h2>
            <p>VPANSAK supports convenient payment options for online shopping:</p>
            <ul>
              <li><strong>UPI Payments:</strong> Google Pay, PhonePe, Paytm, BHIM, and bank UPI.</li>
              <li><strong>Cards &amp; Netbanking:</strong> Visa, Mastercard, RuPay, and major Indian banks.</li>
              <li><strong>Cash on Delivery (COD):</strong> Available on eligible products and locations.</li>
              <li><strong>VPANSAK Gift Cards:</strong> 12-digit prepaid codes redeemable during checkout.</li>
            </ul>

            <div className="info-callout warning">
              <ShieldAlert size={20} />
              <div>
                <strong>Payment Security Notice</strong>
                <p>
                  VPANSAK support will never ask for your UPI PIN, card PIN, CVV, or banking password. Do not share your PIN
                  or banking passwords with anyone.
                </p>
              </div>
            </div>
          </section>

          {/* DELIVERY & TRACKING */}
          <section id="delivery" className="info-card-block">
            <h2>Delivery &amp; Order Tracking</h2>
            <p>
              Orders placed on VPANSAK are processed through verified logistics partners. Every order progresses through
              clear fulfillment stages:
            </p>
            <div className="tracking-stages-row">
              <span className="stage-pill">Order Placed</span> →
              <span className="stage-pill">Confirmed</span> →
              <span className="stage-pill">Packed</span> →
              <span className="stage-pill">Shipped</span> →
              <span className="stage-pill">Out for Delivery</span> →
              <span className="stage-pill">Delivered</span>
            </div>
            <p className="small-text">
              Estimated delivery dates appear during checkout and in your Order Tracking page at <code>/track</code>.
            </p>
          </section>

          {/* RETURNS & REFUNDS */}
          <section id="returns-refunds" className="info-card-block">
            <h2>Returns &amp; 5-Minute Refund Initiation</h2>
            <div className="return-policy-box">
              <h3>Maximum 7 Days Return Window</h3>
              <p>
                Eligible products can be returned within a maximum period of <strong>7 days</strong> from delivery date,
                subject to product category guidelines and condition verification.
              </p>
            </div>

            <h3>Official Refund Initiation Wording</h3>
            <blockquote className="refund-official-quote">
              “Once the returned product pickup is successfully completed and verified, VPANSAK aims to initiate eligible
              refunds within approximately five minutes. The time required for the refunded amount to appear in the
              customer’s bank account, card, UPI account or wallet may vary depending on the payment provider or financial
              institution.”
            </blockquote>

            <p>
              <em>Important Note:</em> Refund initiation means VPANSAK submits the refund instruction to the payment gateway
              within 5 minutes. The final credit time to your bank account or card typically ranges from 1 to 5 business days
              depending on banking channels.
            </p>
          </section>

          {/* SELL WITH VPANSAK */}
          <section id="seller-program" className="info-card-block">
            <h2>Sell with VPANSAK (3% Platform Fee)</h2>
            <p>
              VPANSAK offers a structured marketplace program for verified sellers, merchants, and small businesses to list
              their products and reach customers across India.
            </p>

            <div className="fee-highlight-card">
              <Tag size={28} />
              <div>
                <h3>Transparent 3% Platform Fee</h3>
                <p>
                  VPANSAK applies a 3% platform fee on successful seller orders, subject to seller agreement terms, category
                  guidelines, taxes, and shipping arrangements.
                </p>
              </div>
            </div>

            <h3>Seller Verification Stages</h3>
            <ol>
              <li>Seller application submission at <code>/seller</code></li>
              <li>Identity &amp; document review (Aadhaar, PAN, Bank, GSTIN if applicable)</li>
              <li>Business details verification</li>
              <li>Approval &amp; Seller Dashboard activation</li>
            </ol>

            <Link href="/seller" className="btn-inline-primary">
              Apply to Become a Seller
            </Link>
          </section>

          {/* SUPPORT CENTRE */}
          <section id="support" className="info-card-block">
            <h2>Customer Support Centre</h2>
            <p>VPANSAK provides dedicated support channels for order queries, returns, and seller assistance:</p>
            <div className="support-channels-grid">
              <a
                href="https://vpansaksupporthub.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="support-channel-card"
              >
                <Globe size={24} />
                <div>
                  <strong>Official Support Hub</strong>
                  <small>vpansaksupporthub.lovable.app</small>
                </div>
                <ExternalLink size={16} />
              </a>

              <a href="mailto:support.vpansak@gmail.com" className="support-channel-card">
                <Mail size={24} />
                <div>
                  <strong>Email Support</strong>
                  <small>support.vpansak@gmail.com</small>
                </div>
              </a>

              <a href="https://wa.me/66942033973" target="_blank" rel="noopener noreferrer" className="support-channel-card">
                <Phone size={24} />
                <div>
                  <strong>WhatsApp Support</strong>
                  <small>+66 94 203 3973</small>
                </div>
                <ExternalLink size={16} />
              </a>
            </div>
          </section>

          {/* SUPPORT CONTRIBUTION PROGRAM */}
          <section id="contribution" className="info-card-block">
            <h2>Support Contribution Program</h2>
            <p>
              The VPANSAK Support Contribution program allows voluntary platform supporters to contribute toward platform
              development and support initiatives.
            </p>
            <ul>
              <li>Contribution is voluntary and is not a product purchase or investment.</li>
              <li>Does not guarantee financial returns, profit sharing, or equity.</li>
              <li>A <strong>Certificate of Appreciation</strong> is issued after payment verification.</li>
              <li>Manual UPI payments generate a Verification ID and require admin verification before certificate issuance.</li>
            </ul>
          </section>

          {/* SECURITY & SAFETY */}
          <section id="security" className="info-card-block">
            <h2>Account Security &amp; Safety Tips</h2>
            <div className="safety-tips-box">
              <h3>
                <ShieldCheck size={20} /> Essential Account Safety Tips
              </h3>
              <ul>
                <li>Never share your account password or email OTP with anyone.</li>
                <li>VPANSAK support will never ask for your UPI PIN, ATM PIN, or banking passwords.</li>
                <li>Always verify that the browser URL is <code>vpansak.vercel.app</code> before entering login details.</li>
                <li>Log out from shared or public computers after completing your shopping session.</li>
              </ul>
            </div>
          </section>

          {/* TIMELINE & ROADMAP */}
          <section id="timeline-roadmap" className="info-card-block">
            <h2>Timeline &amp; Future Roadmap</h2>
            <div className="timeline-list">
              <div className="timeline-item">
                <span className="timeline-date">12 August 2026</span>
                <strong>VPANSAK Shopping Launch</strong>
                <p>VPANSAK officially begins operations under founder Alok Singh in Gorakhpur, UP.</p>
              </div>
              <div className="timeline-item planned">
                <span className="timeline-date">Future Vision</span>
                <strong>Nationwide Expansion &amp; Mobile App</strong>
                <p>Expanding verified seller network, building native mobile apps, and introducing AI recommendations.</p>
              </div>
            </div>
          </section>

          {/* POLICIES DIRECTORY */}
          <section id="policies" className="info-card-block">
            <h2>Official Policy Directory</h2>
            <p>Review VPANSAK policy documents for complete terms and rules:</p>
            <div className="policy-links-grid">
              <Link href="/policies/privacy-policy">Privacy Policy</Link>
              <Link href="/policies/terms">Terms and Conditions</Link>
              <Link href="/policies/return-policy">Return Policy</Link>
              <Link href="/policies/refund-policy">Refund Policy</Link>
              <Link href="/policies/shipping-policy">Shipping Policy</Link>
              <Link href="/policies/seller-policy">Seller Policy</Link>
            </div>
          </section>

          {/* FAQ SECTION WITH SEARCH */}
          <section id="faq" className="info-card-block">
            <h2>Frequently Asked Questions (FAQ)</h2>
            <div className="faq-search-box">
              <Search size={16} />
              <input
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs (e.g. refund, return, seller fee, founder)..."
              />
            </div>

            <div className="faq-accordion-list">
              {filteredFaqs.length ? (
                filteredFaqs.map((faq, idx) => (
                  <div className="faq-accordion-item" key={idx}>
                    <button
                      className={`faq-question ${expandedFaq === idx ? "expanded" : ""}`}
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        style={{ transform: expandedFaq === idx ? "rotate(180deg)" : "none" }}
                      />
                    </button>
                    {expandedFaq === idx && <div className="faq-answer"><p>{faq.a}</p></div>}
                  </div>
                ))
              ) : (
                <p className="no-faq-match">No FAQs match your search query &quot;{faqSearch}&quot;.</p>
              )}
            </div>
          </section>

          {/* CONTACT SECTION */}
          <section id="contact" className="info-card-block">
            <h2>Contact VPANSAK</h2>
            <div className="contact-details-box">
              <p><strong>Public Business Name:</strong> VPANSAK Shopping</p>
              <p><strong>Group Affiliation:</strong> A &amp; A Group</p>
              <p><strong>Founder:</strong> Alok Singh (Founder)</p>
              <p><strong>Location:</strong> Gorakhpur, Uttar Pradesh, India</p>
              <p><strong>Customer Support Email:</strong> support.vpansak@gmail.com</p>
              <p><strong>WhatsApp Support:</strong> +66 94 203 3973</p>
              <p><strong>Official Support Portal:</strong> https://vpansaksupporthub.lovable.app</p>
              <p><strong>Instagram:</strong> https://instagram.com/vpansak</p>
              <p><strong>X (Twitter):</strong> https://x.com/VPANSAK_</p>
            </div>

            <div className="contact-actions-row">
              <a href="mailto:support.vpansak@gmail.com" className="btn-contact">
                <Mail size={15} /> Email Support
              </a>
              <a href="https://wa.me/66942033973" target="_blank" rel="noopener noreferrer" className="btn-contact">
                <Phone size={15} /> WhatsApp Support
              </a>
              <a
                href="https://vpansaksupporthub.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact primary"
              >
                <Globe size={15} /> Open Support Hub
              </a>
              <a href="https://instagram.com/vpansak" target="_blank" rel="noopener noreferrer" className="btn-contact">
                <Camera size={15} /> Instagram
              </a>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="info-final-cta">
            <h2>Ready to Explore VPANSAK?</h2>
            <p>Browse available products, manage your account, track orders, apply as a seller or contact support.</p>
            <div className="cta-btn-group">
              <Link href="/" className="btn-cta-primary">Start Shopping</Link>
              <Link href="/categories" className="btn-cta-secondary">Browse Categories</Link>
              <Link href="/seller" className="btn-cta-secondary">Become a Seller</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
