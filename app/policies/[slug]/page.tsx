"use client";

import { ArrowLeft, CheckCircle2, FileText, Mail, ShieldCheck } from "lucide-react";
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
          <Link href="/support">Support</Link>
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

          <footer>
            <Mail size={18} />
            <div>
              <strong>Questions about this policy?</strong>
              <p>
                Contact <a href="mailto:support.vpansak@gmail.com">support.vpansak@gmail.com</a> or visit the{" "}
                <a href="https://vpansaksupporthub.lovable.app" target="_blank" rel="noopener noreferrer">
                  Support Hub
                </a>
                .
              </p>
            </div>
          </footer>
        </article>
      </section>
    </main>
  );
}
