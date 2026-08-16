"use client";

import { 
  ArrowLeft, CheckCircle2, FileText, Mail, ShieldCheck, User, Users, PackageCheck, 
  Headphones, Store, LayoutDashboard, HeartHandshake, HelpCircle, Briefcase, 
  ArrowRight, Grid3X3, Info, Sparkles, Compass
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type PolicyContent = {
  title: string;
  intro: string;
  sections: Array<{ h: string; p: string }>;
};

const policyDatabase: Record<string, PolicyContent> = {
  "privacy-policy": {
    title: "Privacy Policy",
    intro: "How VPANSAK Shopping collects, uses and protects customer and seller information.",
    sections: [
      {
        h: "1. Information We Collect",
        p: "We collect details provided by users during account creation, checkout, address saving, support tickets, product reviews, and seller applications. This includes Full Name, Email Address, Mobile Number, Shipping Address, and Order Details. Sensitive data like passwords are encrypted.",
      },
      {
        h: "2. How Information is Used",
        p: "Information is used exclusively to fulfill orders, process payments, provide order tracking, handle customer support, verify seller KYC, prevent fraud, and send essential account notifications. We do not sell or rent personal information to third parties.",
      },
      {
        h: "3. Seller Document & KYC Privacy",
        p: "Seller identification documents (Aadhaar, PAN, GSTIN, Bank Details) are stored securely and accessed strictly for verification and payout workflows. Private identity documents are never displayed publicly.",
      },
      {
        h: "4. Data Retention & User Rights",
        p: "Users can request profile updates or account deletion through their Account Dashboard settings. Transaction and tax records are retained only as required by Indian accounting and legal regulations.",
      },
    ],
  },

  "terms-and-conditions": {
    title: "Terms & Conditions",
    intro: "Official terms of service for VPANSAK Shopping, Seller Portal and Support Services.",
    sections: [
      {
        h: "1. Platform Usage",
        p: "Users must provide accurate registration details and maintain account security. Automated abuse, fraud, account sharing, unauthorized scraping, and illegal listings are strictly prohibited.",
      },
      {
        h: "2. Product Orders & Pricing",
        p: "Product pricing, MRP, discounts, and stock availability are subject to seller updates. VPANSAK reserves the right to cancel orders in case of pricing errors, unserviceable locations, or stock depletion.",
      },
      {
        h: "3. Payment Verification & Security",
        p: "Online payments must be server-verified by approved payment gateways before order processing. VPANSAK staff will never ask for your OTP, UPI PIN, ATM PIN, or Internet Banking password.",
      },
      {
        h: "4. Intellectual Property & Brand Rules",
        p: "All brand names, logos, website layout, graphics, and trademarks belong to VPANSAK and A & A Group. Unauthorized commercial copying is prohibited.",
      },
    ],
  },

  "return-policy": {
    title: "Return Policy",
    intro: "Clear policy for customer returns, eligibility, conditions and pickup verification.",
    sections: [
      {
        h: "1. Maximum 7 Days Return Window",
        p: "Eligible products can be returned within a maximum period of 7 days from the delivery date, provided the item meets condition requirements.",
      },
      {
        h: "2. Return Eligibility & Exclusions",
        p: "Returns are accepted for damaged items, manufacturing defects, missing accessories, or wrong products delivered. Personal hygiene, innerwear, perishable food items, and final-sale items may be non-returnable.",
      },
      {
        h: "3. Condition of Returned Goods",
        p: "Products must be returned unused, in original condition, with intact tags, original brand box, user manuals, and all included accessories.",
      },
      {
        h: "4. Requesting a Return",
        p: "Returns must be requested through 'My Orders' in your Account Dashboard or by contacting customer support with your Order ID and photographic evidence.",
      },
    ],
  },

  "refund-policy": {
    title: "Refund Policy",
    intro: "Official 5-minute refund initiation workflow and payment credit guidelines.",
    sections: [
      {
        h: "1. Official Refund Initiation Wording",
        p: "Once the returned product pickup is successfully completed and verified, VPANSAK aims to initiate eligible refunds within approximately five minutes.",
      },
      {
        h: "2. Payment Provider Credit Timelines",
        p: "Refund initiation within 5 minutes means the refund instruction is immediately sent to the payment gateway. The refunded amount will appear in your bank account, card, or UPI wallet within 1 to 5 business days depending on your financial institution.",
      },
      {
        h: "3. Cash on Delivery (COD) Refunds",
        p: "For COD orders, refunds are issued to the customer's verified UPI ID or Bank Account details provided during the refund ticket workflow.",
      },
      {
        h: "4. Order Cancellation Refunds",
        p: "Orders cancelled prior to dispatch receive an immediate automatic refund initiation to the original payment source.",
      },
    ],
  },

  "shipping-policy": {
    title: "Shipping & Delivery Policy",
    intro: "Information on order dispatch, estimated delivery timelines and live tracking.",
    sections: [
      {
        h: "1. Order Confirmation & Tracking",
        p: "Upon order placement, a unique Order ID (e.g. VPO123456) is generated. Real-time order progress can be tracked anytime at /track.",
      },
      {
        h: "2. Shipping Timelines",
        p: "Orders are typically packed and dispatched within 24 to 48 hours by verified sellers. Delivery timelines range from 2 to 7 business days depending on delivery location.",
      },
      {
        h: "3. Delivery Status Stages",
        p: "Order tracking follows clear stages: Order Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered.",
      },
      {
        h: "4. Undeliverable Packages",
        p: "If a package cannot be delivered after multiple attempts or due to an invalid address, it is returned to the seller and an eligible refund is initiated.",
      },
    ],
  },

  "seller-policy": {
    title: "Seller Policy & Guidelines",
    intro: "Rules, verification requirements, 3% platform fee, and merchant performance standards.",
    sections: [
      {
        h: "1. Seller Application & Verification",
        p: "All sellers must submit valid business details, identity documents (Aadhaar, PAN, Bank Details), and pass review before listing products.",
      },
      {
        h: "2. Transparent 3% Platform Fee",
        p: "VPANSAK applies a 3% platform fee on completed seller orders, subject to seller agreement terms, category rules, and applicable taxes.",
      },
      {
        h: "3. Product Approval Standards",
        p: "All product listings undergo quality, image, pricing, and category compliance review before public display. Counterfeit or illegal items are strictly banned.",
      },
      {
        h: "4. Fulfillment & Order Dispatch",
        p: "Approved sellers must dispatch orders within agreed SLA timelines and ensure secure packaging. High cancellation rates may lead to seller suspension.",
      },
    ],
  },

  "gift-card-policy": {
    title: "Gift Card Policy",
    intro: "Terms for purchasing, redeeming, and managing VPANSAK Gift Cards.",
    sections: [
      {
        h: "1. Gift Card Redemption",
        p: "VPANSAK Gift Cards contain a 12-digit code that can be applied at checkout for instant order discounts.",
      },
      {
        h: "2. Balance & Partial Usage",
        p: "If the order total is less than the gift card value, remaining balance stays available for future purchases.",
      },
      {
        h: "3. Validity & Restrictions",
        p: "Gift cards cannot be converted into cash or transferred to bank accounts unless required by applicable law.",
      },
    ],
  },

  "contribution-terms": {
    title: "Support Contribution Terms",
    intro: "Guidelines for voluntary contributions to VPANSAK platform development.",
    sections: [
      {
        h: "1. Voluntary Platform Contribution",
        p: "Contributions to VPANSAK are strictly voluntary to support platform development, server infrastructure, and support hub expansion.",
      },
      {
        h: "2. Certificate of Appreciation",
        p: "Contributors receive a verified Certificate of Appreciation after payment verification is confirmed.",
      },
      {
        h: "3. No Investment or Return Promises",
        p: "Contributions are not equity investments, stock purchases, or profit-sharing products. They carry no financial returns.",
      },
    ],
  },
};

// Map slug aliases to canonical keys
const slugAliases: Record<string, string> = {
  terms: "terms-and-conditions",
  "terms-and-conditions": "terms-and-conditions",
  "privacy-policy": "privacy-policy",
  privacy: "privacy-policy",
  "return-policy": "return-policy",
  returns: "return-policy",
  "refund-policy": "refund-policy",
  refunds: "refund-policy",
  "shipping-policy": "shipping-policy",
  shipping: "shipping-policy",
  "seller-policy": "seller-policy",
  "merchant-guidelines": "seller-policy",
  "seller-guidelines": "seller-policy",
  "gift-card-policy": "gift-card-policy",
  "contribution-terms": "contribution-terms",
};

const directoryLinks = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-and-conditions", title: "Terms & Conditions" },
  { slug: "return-policy", title: "Return Policy" },
  { slug: "refund-policy", title: "Refund Policy" },
  { slug: "shipping-policy", title: "Shipping Policy" },
  { slug: "seller-policy", title: "Seller Policy" },
  { slug: "gift-card-policy", title: "Gift Card Policy" },
  { slug: "contribution-terms", title: "Contribution Terms" },
];

export default function PolicyPage() {
  const { slug } = useParams<{ slug: string }>();
  const canonicalKey = slugAliases[slug || ""] || slug;
  const policy = policyDatabase[canonicalKey];

  if (!policy) {
    return (
      <main className="legal-page">
        <div className="legal-missing">
          <FileText size={40} />
          <h1>Policy Not Found</h1>
          <p>The requested policy document could not be located.</p>
          <Link href="/info" className="btn-primary">
            Return to Info Hub
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="legal-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>TRUST CENTER</small>
          </span>
        </Link>
        <nav>
          <Link href="/">
            <ArrowLeft size={14} /> Store
          </Link>
          <Link href="/info">Info Hub</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support</a>
        </nav>
      </header>

      <section className="legal-hero">
        <ShieldCheck size={32} />
        <small>VPANSAK TRUST CENTER</small>
        <h1>{policy.title}</h1>
        <p>{policy.intro}</p>
        <span>Official Operational Document • VPANSAK Shopping</span>
      </section>

      <section className="legal-layout">
        <aside>
          <strong>POLICY DIRECTORY</strong>
          {directoryLinks.map((item) => (
            <Link
              key={item.slug}
              className={canonicalKey === item.slug ? "active" : ""}
              href={`/policies/${item.slug}`}
            >
              {item.title}
            </Link>
          ))}

          <strong className="sidebar-group-title">QUICK UTILITIES</strong>
          <Link href="/track"><PackageCheck size={13} style={{ marginRight: 6 }} /> Track Order Status</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer"><Headphones size={13} style={{ marginRight: 6 }} /> Support Hub</a>
          <Link href="/seller"><Store size={13} style={{ marginRight: 6 }} /> Become a Seller</Link>
          <Link href="/foundation"><HeartHandshake size={13} style={{ marginRight: 6 }} /> Support Foundation</Link>
        </aside>

        <article>
          <div className="legal-notice">
            <CheckCircle2 size={18} />
            <p>This document explains VPANSAK platform policies. For order-specific support, contact support.vpansak@gmail.com.</p>
          </div>

          {policy.sections.map((s) => (
            <section key={s.h} className="legal-section-block">
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}

          {/* Useful Quick Action Buttons Section */}
          <section className="legal-useful-buttons-wrapper">
            <div className="legal-section-header">
              <Sparkles className="header-icon" size={20} />
              <div>
                <h2>Useful Quick Action Buttons (उपयोगी बटन्स)</h2>
                <p>Instant navigation to founder profiles, order tracking, support, seller portal, and key platform features.</p>
              </div>
            </div>

            <div className="useful-buttons-grid">
              <Link href="/founder" className="useful-btn-card highlight-card">
                <div className="btn-card-top">
                  <span className="card-badge founder-badge">FOUNDER</span>
                  <User size={22} className="card-icon" />
                </div>
                <h4>Founder Alok Singh</h4>
                <p>Founder & Visionary leading VPANSAK Shopping & A&A Group initiatives.</p>
                <span className="card-action-link">View Profile <ArrowRight size={14} /></span>
              </Link>

              <Link href="/cofounder" className="useful-btn-card highlight-card">
                <div className="btn-card-top">
                  <span className="card-badge cofounder-badge">CO-FOUNDER</span>
                  <Users size={22} className="card-icon" />
                </div>
                <h4>Co-Founder Ayushi Tripathi</h4>
                <p>Co-Founder & Director managing key operational strategies.</p>
                <span className="card-action-link">View Profile <ArrowRight size={14} /></span>
              </Link>

              <Link href="/track" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge live-badge">LIVE TRACKING</span>
                  <PackageCheck size={22} className="card-icon" />
                </div>
                <h4>Track Live Order</h4>
                <p>Track your package status step-by-step using your VPO Order ID.</p>
                <span className="card-action-link">Track Now <ArrowRight size={14} /></span>
              </Link>

              <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge help-badge">24×7 HELP</span>
                  <Headphones size={22} className="card-icon" />
                </div>
                <h4>Support Hub</h4>
                <p>Create & track support tickets for orders, refunds, and inquiries.</p>
                <span className="card-action-link">Get Support <ArrowRight size={14} /></span>
              </a>

              <Link href="/seller" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge merchant-badge">3% COMMISSION</span>
                  <Store size={22} className="card-icon" />
                </div>
                <h4>Become a Seller</h4>
                <p>Register as a merchant, complete KYC, and start selling products.</p>
                <span className="card-action-link">Register Store <ArrowRight size={14} /></span>
              </Link>

              <Link href="/seller/dashboard" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge portal-badge">PORTAL</span>
                  <LayoutDashboard size={22} className="card-icon" />
                </div>
                <h4>Seller Dashboard</h4>
                <p>Manage product listings, stock levels, orders, and payout status.</p>
                <span className="card-action-link">Open Dashboard <ArrowRight size={14} /></span>
              </Link>

              <Link href="/foundation" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge foundation-badge">SOCIAL IMPACT</span>
                  <HeartHandshake size={22} className="card-icon" />
                </div>
                <h4>Support Foundation</h4>
                <p>Contribute to platform expansion, infrastructure & community projects.</p>
                <span className="card-action-link">Support Us <ArrowRight size={14} /></span>
              </Link>

              <Link href="/categories" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge catalog-badge">CATALOG</span>
                  <Grid3X3 size={22} className="card-icon" />
                </div>
                <h4>Browse Categories</h4>
                <p>Explore electronics, fashion, home essentials & daily top offers.</p>
                <span className="card-action-link">Shop Store <ArrowRight size={14} /></span>
              </Link>

              <Link href="/info/faq" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge faq-badge">KNOWLEDGE BASE</span>
                  <HelpCircle size={22} className="card-icon" />
                </div>
                <h4>Customer FAQs</h4>
                <p>Instant answers to shipping, 5-min refunds, 7-day returns & payments.</p>
                <span className="card-action-link">Read FAQs <ArrowRight size={14} /></span>
              </Link>

              <Link href="/info/careers" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge hiring-badge">HIRING</span>
                  <Briefcase size={22} className="card-icon" />
                </div>
                <h4>Careers at VPANSAK</h4>
                <p>Join our technology, support, and merchant operations teams.</p>
                <span className="card-action-link">View Openings <ArrowRight size={14} /></span>
              </Link>

              <Link href="/info/about" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge hq-badge">HEADQUARTERS</span>
                  <Info size={22} className="card-icon" />
                </div>
                <h4>About VPANSAK HQ</h4>
                <p>Learn about our digital marketplace, vision, and company ethos.</p>
                <span className="card-action-link">Learn More <ArrowRight size={14} /></span>
              </Link>

              <Link href="/info/contact" className="useful-btn-card">
                <div className="btn-card-top">
                  <span className="card-badge contact-badge">CONTACT</span>
                  <Mail size={22} className="card-icon" />
                </div>
                <h4>Contact Support</h4>
                <p>Direct communication channels for customer and business inquiries.</p>
                <span className="card-action-link">Contact Us <ArrowRight size={14} /></span>
              </Link>
            </div>
          </section>

          {/* Useful Links Directory Section */}
          <section className="legal-useful-links-wrapper">
            <div className="legal-section-header">
              <Compass className="header-icon" size={20} />
              <div>
                <h2>Useful Links Directory (उपयोगी लिंक्स की विस्तृत डायरेक्टरी)</h2>
                <p>Complete directory of leadership profiles, customer policies, seller portals, and customer utilities.</p>
              </div>
            </div>

            <div className="useful-links-grid">
              <div className="useful-link-col">
                <div className="col-title">
                  <User size={16} />
                  <span>Founders & Leadership</span>
                </div>
                <ul>
                  <li><Link href="/founder"><strong>Founder Alok Singh Profile</strong><small>Founder & Visionary of VPANSAK</small></Link></li>
                  <li><Link href="/cofounder"><strong>Co-Founder Ayushi Tripathi Profile</strong><small>Co-Founder & Director of VPANSAK</small></Link></li>
                  <li><Link href="/info/about">About VPANSAK Headquarters</Link></li>
                  <li><Link href="/info/careers">Careers & Hiring Opportunities</Link></li>
                  <li><Link href="/info/contact">Direct Contact & Support Email</Link></li>
                </ul>
              </div>

              <div className="useful-link-col">
                <div className="col-title">
                  <ShieldCheck size={16} />
                  <span>Shopping & Delivery Policies</span>
                </div>
                <ul>
                  <li><Link href="/policies/shipping-policy">Shipping & Delivery Policy</Link></li>
                  <li><Link href="/policies/refund-policy">5-Minute Refund Initiation Policy</Link></li>
                  <li><Link href="/policies/return-policy">7-Day Product Return Policy</Link></li>
                  <li><Link href="/policies/privacy-policy">Privacy Policy & Data Security</Link></li>
                  <li><Link href="/policies/terms-and-conditions">Terms & Conditions of Service</Link></li>
                  <li><Link href="/policies/gift-card-policy">Gift Card Terms & Conditions</Link></li>
                </ul>
              </div>

              <div className="useful-link-col">
                <div className="col-title">
                  <Store size={16} />
                  <span>Business & Merchant Portals</span>
                </div>
                <ul>
                  <li><Link href="/seller">Become a VPANSAK Seller (3% Fee)</Link></li>
                  <li><Link href="/seller/dashboard">Seller Dashboard & Merchant Tools</Link></li>
                  <li><Link href="/policies/seller-policy">Seller Policy & Operational Rules</Link></li>
                  <li><Link href="/policies/merchant-guidelines">Merchant Guidelines & Listing SLA</Link></li>
                  <li><Link href="/foundation">VPANSAK Support Foundation</Link></li>
                  <li><Link href="/policies/contribution-terms">Support Contribution Terms</Link></li>
                </ul>
              </div>

              <div className="useful-link-col">
                <div className="col-title">
                  <PackageCheck size={16} />
                  <span>Quick Utilities & Support</span>
                </div>
                <ul>
                  <li><Link href="/track">Live Order Tracking (/track)</Link></li>
                  <li><a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer"><strong>VPANSAK Support Hub</strong><small>Main support center</small></a></li>
                  <li><Link href="/info/faq">Customer Frequently Asked Questions</Link></li>
                  <li><Link href="/categories">All Marketplace Categories</Link></li>
                  <li><Link href="/account">Wishlist & Customer Account</Link></li>
                </ul>
              </div>
            </div>
          </section>

          <footer>
            <Mail size={18} />
            <div>
              <strong>Questions about platform policies?</strong>
              <p>
                Contact <a href="mailto:support.vpansak@gmail.com">support.vpansak@gmail.com</a> or visit the{" "}
                <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">
                  Support Hub
                </a>.
              </p>
            </div>
          </footer>
        </article>
      </section>
    </main>
  );
}
