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
    title: "VPANSAK Direct Brand Policy & Quality Standard",
    intro: "Operating policy, quality guarantees, and direct-to-consumer fulfillment rules.",
    sections: [
      {
        h: "1. Exclusive Direct-to-Consumer Model",
        p: "VPANSAK is an exclusive D2C brand store. Unlike third-party marketplaces (such as Flipkart, Amazon, or Meesho), we do not allow external vendors or third-party sellers.",
      },
      {
        h: "2. 100% Original Brand Guarantee",
        p: "Every product sold on VPANSAK is manufactured, quality-inspected, and packaged directly by VPANSAK to ensure zero counterfeits and maximum authenticity.",
      },
      {
        h: "3. Transparent Pricing (No Middleman Markup)",
        p: "By eliminating 3rd-party marketplace commissions and seller fees, VPANSAK offers fair, direct-from-brand pricing on all items.",
      },
      {
        h: "4. Direct Fulfillment & Support",
        p: "All orders are fulfilled directly from VPANSAK warehouses with real-time tracking, 7-day returns, and 5-minute refund processing.",
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
    title: "Support Foundation Contribution Terms",
    intro: "Guidelines regarding voluntary platform contributions and Certificate of Appreciation.",
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

  "copyright-terms": {
    title: "VPANSAK Comprehensive Copyright & Intellectual Property Declaration",
    intro: "Exhaustive legal notice, brand ownership rights, digital asset copyright, trademark protection, and intellectual property governance of VPANSAK and parent entity A&A Group.",
    sections: [
      {
        h: "1. Sole Brand Ownership & Proprietary Rights",
        p: "All names, wordmarks, visual assets, original digital works, software programs, user interface designs, sound effects, typography, brand identity tokens, and technical documentation associated with VPANSAK and VPANSAK Shopping are the exclusive property of VPANSAK and parent organization A&A Group. Unlawful reproduction, copying, distribution, or imitation is prohibited by national and international copyright statutes.",
      },
      {
        h: "2. Registered & Unregistered Trademark Ownership",
        p: "The brand name 'VPANSAK', 'VPANSAK Shopping', 'VPANSAK Core', 'VPANSAK Foundation', 'VPANSAK D2C', 'A&A Group', along with all associated stylized logos, emblems, geometric badges, and taglines are trademarks and service marks owned exclusively by VPANSAK and A&A Group. No right, license, or permission is granted to any party to use these marks in commercial, promotional, or public contexts without prior explicit written authorization from executive management.",
      },
      {
        h: "3. Logo Design, Crest, & Brand Assets Copyright",
        p: "The official VPANSAK V-emblem logo, shield emblem, poster artwork, promotional banners, vector icons, custom photography, product color swatches, color palettes (including Deep Navy #0B192C, Flame Orange #F97316, and Dark Glass Aesthetics), and associated digital art assets are original artistic works protected under the Indian Copyright Act, 1957, the Universal Copyright Convention (UCC), and the Berne Convention for the Protection of Literary and Artistic Works.",
      },
      {
        h: "4. Source Code, Algorithm, & Platform Software Copyright",
        p: "The complete underlying codebase powering VPANSAK Shopping — including Next.js server and client components, React hooks, custom state management algorithms, database schema definitions (Drizzle ORM & Supabase integrations), API route handlers, authentication procedures, and build scripts — is proprietary software code protected under computer software copyright regulations. Reverse engineering, decompilation, code extraction, mirror creation, or unauthorized code re-use is strictly illegal.",
      },
      {
        h: "5. High-Resolution Product Photography & Poster Rights",
        p: "All high-resolution product photography, 3D renderings, lifestyle studio shots, studio posters, hero slider graphics, desktop product hover zoom assets, and marketing imagery featured across VPANSAK digital properties are copyrighted works of VPANSAK. Copying, hotlinking, embedding, or re-publishing these images on third-party marketplace platforms, social media handles, or printed marketing material without written consent constitutes willful copyright infringement.",
      },
      {
        h: "6. D2C Storefront Design System & CSS Layout Ownership",
        p: "The overall visual look and feel, layout arrangement, CSS design system tokens, glassmorphism UI components, button styling, color schemes, micro-animation timings, interactive modals, navigation bars, and mobile-responsive layouts of the VPANSAK website represent proprietary commercial design assets. Imitating the site's trade dress or creating derivative websites with confusingly similar visual aesthetics is strictly prohibited.",
      },
      {
        h: "7. VPANSAK Core Bottle Collection Technical Specs Protection",
        p: "All technical specifications, capacity ratings (e.g. 750ml), material composition details (18/8 Pro-Grade Stainless Steel, copper vacuum insulation metrics, powder-coating formulations), structural engineering descriptions, ergonomic handle designs, and product catalog descriptions for the VPANSAK Core Bottle collection are copyrighted intellectual assets. Unauthorized copying of product copy or specification sheets is prohibited.",
      },
      {
        h: "8. Support Foundation & Contribution Certificate Rights",
        p: "The official VPANSAK Support Foundation seal, verified contribution certificate templates, digital signature layouts, appreciation messaging, and certificate identification verification numbering schemas are protected intellectual assets. Falsifying, replicating, or issuing fake VPANSAK appreciation certificates is a punishable offense under digital fraud and copyright laws.",
      },
      {
        h: "9. Prohibition of Automated Web Scraping & Data Mining",
        p: "Automated extraction, scraping, crawling, harvesting, data-mining, or indexing of product catalogs, price points, stock quantities, customer reviews, seller details, or code assets from VPANSAK servers using bots, scrapers, AI training models, or automated scripts without prior written consent from VPANSAK is expressly prohibited.",
      },
      {
        h: "10. Anti-Counterfeiting & Unauthorized Re-selling Directives",
        p: "Products bearing the VPANSAK brand name may only be sold through authorized VPANSAK D2C channels and verified merchants. Manufacturing, importing, selling, or distributing counterfeit, knockoff, or unauthorized replica VPANSAK goods will result in immediate civil litigation, criminal complaints, and seizure of counterfeit inventory under trademark enforcement laws.",
      },
      {
        h: "11. Domain Names & Digital Namespace Exclusive Ownership",
        p: "The web domain names, URLs, subdomains, hosting namespaces, and server infrastructure associated with VPANSAK (including vpansak.com, vpansak.vercel.app, and official app endpoints) are exclusively registered properties. Cybersquatting, domain squatting, typo-squatting, or creating confusingly named domains mimicking VPANSAK is subject to UDRP domain recovery procedures.",
      },
      {
        h: "12. DMCA & Indian Copyright Act (1957) Compliance",
        p: "VPANSAK respects intellectual property rights and adheres strictly to the Copyright Act, 1957 (India), the Information Technology Act, 2000, and the Digital Millennium Copyright Act (DMCA). If you believe any content hosted on VPANSAK infringes upon your copyright, you may submit a formal takedown notice to our Legal Counsel with full proof of ownership.",
      },
      {
        h: "13. Digital Rights Management & Technical Protection Measures",
        p: "VPANSAK employs technical protection measures (TPM), access tokens, encryption algorithms, API rate-limiting, and server security headers to protect its digital assets and user data. Bypassing, disabling, or tampering with these protective security controls constitutes a direct breach of digital copyright protection laws.",
      },
      {
        h: "14. Merchant & Seller Content Ownership Governance",
        p: "Sellers and merchants submitting product listings, images, or business descriptions to VPANSAK grant VPANSAK a non-exclusive, worldwide, royalty-free license to host, display, index, and promote such content. Sellers warrant that all uploaded content is original or fully licensed, indemnifying VPANSAK against third-party copyright claims.",
      },
      {
        h: "15. Customer Reviews, Media Uploads & User Generated Content Rights",
        p: "By submitting customer reviews, product ratings, feedback text, or uploaded photos to VPANSAK, users grant VPANSAK a perpetual, irrevocable, worldwide license to publish, display, adapt, and use such content for promotional, analytical, and customer support purposes across VPANSAK platforms.",
      },
      {
        h: "16. Social Media & External Channel Brand Handle Governance",
        p: "Official VPANSAK social media handles (including Instagram @VPANSAK, X @vpansak_, GitHub repos, and YouTube channels) are official commercial communications channels of VPANSAK and A&A Group. Creating fake impersonation accounts or misrepresenting identity using VPANSAK brand assets is illegal.",
      },
      {
        h: "17. Packaging, Typography, & Print Asset Protections",
        p: "All physical packaging designs, product unboxing boxes, printed care cards, thank-you notes, invoice templates, shipping labels, and typography selections used for VPANSAK products are protected works of industrial design and visual copyright.",
      },
      {
        h: "18. Commercial Distribution & Exclusive Franchise Rights",
        p: "No individual or corporate entity may claim exclusive or non-exclusive distribution, retail, or franchise rights to VPANSAK products without an executed commercial agreement signed by an authorized director of A&A Group.",
      },
      {
        h: "19. Unauthorized Reverse Engineering & Decompilation Prohibition",
        p: "Users, developers, and competitors are strictly prohibited from decompiling, disassembling, reverse engineering, or attempting to reconstruct the source code, database structures, or internal algorithms of VPANSAK web applications.",
      },
      {
        h: "20. Legal Remedies & Injunction Rights for Infringement",
        p: "In the event of copyright or trademark infringement, VPANSAK reserves the right to seek emergency ex-parte court injunctions, statutory damages, legal cost reimbursements, account suspension, and destruction of infringing goods without prior notice.",
      },
      {
        h: "21. International Copyright Protection & Berne Convention Adherence",
        p: "VPANSAK intellectual property is protected globally across over 180 signatory countries under the Berne Convention, TRIPS Agreement (Trade-Related Aspects of Intellectual Property Rights), and WIPO treaties. Infringements occurring outside India will be prosecuted under local jurisdiction laws.",
      },
      {
        h: "22. Corporate Identity of A&A Group & Subsidiary Governance",
        p: "A&A Group is the parent corporate entity overseeing VPANSAK Shopping, VPANSAK Foundation, and affiliated brand divisions. Corporate assets, corporate structure documentation, and strategic roadmaps remain confidential trade secrets and intellectual property of A&A Group.",
      },
      {
        h: "23. Trademark Misuse & Brand Dilution Standards",
        p: "Using the VPANSAK trademark in keyword advertising, meta tags, Google Ads campaigns, domain names, or deceptive link descriptions that cause consumer confusion or dilute brand reputation is actionable under trademark anti-dilution laws.",
      },
      {
        h: "24. Copyright License Grant & User Interface Access Limits",
        p: "VPANSAK grants end-users a limited, personal, non-transferable, revocable license to access and use the website for personal shopping purposes. No right to re-sell, license, or commercialize the platform content is transferred.",
      },
      {
        h: "25. Third-Party Vendor & Partner Content Protections",
        p: "Third-party logos, payment gateway marks (Razorpay, UPI, PhonePe, GPay), and partner badges displayed on VPANSAK belong to their respective registered owners. They are used under fair commercial display guidelines and remain protected by their respective copyright holders.",
      },
      {
        h: "26. Copyright Infringement Reporting SLA & Procedure",
        p: "To report potential copyright violations, submit a written notice containing details of the copyrighted work, URL location on VPANSAK, proof of ownership, and contact information to support.vpansak@gmail.com. We investigate all notices within 48 hours.",
      },
      {
        h: "27. Cease & Desist Issuance Authority",
        p: "VPANSAK Legal Operations retains authority to issue formal Cease & Desist notices, domain registrar takedown requests, hosting provider suspension requests, and search engine removal notices against infringing entities.",
      },
      {
        h: "28. Statutory Damages & Criminal Prosecution Provisions",
        p: "Willful copyright infringement for commercial advantage is a cognizable criminal offense under Section 63 of the Indian Copyright Act, carrying potential imprisonment up to 3 years and mandatory fines.",
      },
      {
        h: "29. Moral Rights & Integrity of Creative Works",
        p: "Authors and creators of VPANSAK original content retain moral rights under copyright law. Modifying, distorting, or misrepresenting VPANSAK brand narratives or creative content in a manner prejudicial to brand honor is prohibited.",
      },
      {
        h: "30. Protection of Marketing Campaigns & Promotional Copy",
        p: "All copywriting, promotional hero text, tagline phrasing (e.g. 'Ultra-Modern D2C Direct Store', 'Pure Hydration Redefined'), email campaign templates, and marketing collateral created by VPANSAK are protected literary works.",
      },
      {
        h: "31. Trademark Enforcement in Digital Advertising & Metadata",
        p: "Bidding on 'VPANSAK' or derivative brand terms in pay-per-click (PPC) search engine campaigns by unauthorized third parties or competitors is strictly prohibited as misleading brand diversion.",
      },
      {
        h: "32. Domain Squatting & Cybersquatting Prevention Policy",
        p: "VPANSAK actively monitors global domain registries for unauthorized registrations containing 'vpansak' or confusingly similar variants, initiating immediate UDRP recovery proceedings.",
      },
      {
        h: "33. Intellectual Property Rights in Software Updates & Releases",
        p: "All updates, enhancements, bug fixes, features, component libraries, and new iterations released on VPANSAK automatically become part of VPANSAK proprietary intellectual property upon deployment.",
      },
      {
        h: "34. Security Vulnerability Reporting & IP Rights",
        p: "Ethical security researchers reporting platform vulnerabilities under responsible disclosure guidelines do not receive IP rights or license to extract database records. Unauthorized data retention is illegal.",
      },
      {
        h: "35. Trade Secret Protection for Internal Logistics & Sourcing",
        p: "VPANSAK internal supply chain logistics, product sourcing networks, merchant commission formulas, quality control protocols, and customer fulfillment algorithms are protected commercial trade secrets.",
      },
      {
        h: "36. Proprietary Hydration Thermal Performance Data Copyright",
        p: "All laboratory testing data, thermal retention charts (e.g. 24h cold / 12h hot performance), and insulation scientific descriptions published by VPANSAK represent proprietary research data.",
      },
      {
        h: "37. Brand Partner Co-branding & Asset Usage Rules",
        p: "Co-branded collaborations or promotional partnerships require a formal brand usage agreement detailing approved logo clear space, color formats, placement guidelines, and campaign duration.",
      },
      {
        h: "38. Protection of Customer Support Knowledge Base & Documentation",
        p: "The VPANSAK Support Hub, help center articles, return process guides, seller onboarding documentation, and customer service scripts are copyrighted instructional assets.",
      },
      {
        h: "39. Copyright Governance for API Documentation & Integrations",
        p: "Internal API specifications, webhook payloads, integration schemas, and developer endpoint signatures are proprietary technical assets reserved strictly for authorized platform integration partners.",
      },
      {
        h: "40. Rights Reserved in Future Product Extensions & Innovations",
        p: "VPANSAK and A&A Group reserve all rights in upcoming product lines, brand extensions, mobile application software, digital wallet features, and lifestyle collections under development.",
      },
      {
        h: "41. Electronic Signatures & Digital Certificate Verification Rights",
        p: "Digital verification IDs, hash signatures, QR verification targets, and electronic certificates generated on VPANSAK are cryptographically signed legal proof of authenticity owned by VPANSAK.",
      },
      {
        h: "42. Ownership of Analytics Models & Consumer Behavior Insights",
        p: "All aggregated telemetry data, customer preference insights, purchase trend models, and recommendation algorithms engineered on VPANSAK are exclusive proprietary business intelligence assets.",
      },
      {
        h: "43. Multi-Channel Brand Asset Distribution Terms",
        p: "Brand assets provided to media outlets, journalists, or review publications for press coverage must be used verbatim without modification and credited to 'VPANSAK Official'.",
      },
      {
        h: "44. Employee & Contractor Intellectual Property Assignment",
        p: "All works created by employees, designers, software engineers, or independent contractors during their engagement with VPANSAK or A&A Group are work-for-hire assigned exclusively to VPANSAK.",
      },
      {
        h: "45. Jurisdiction, Governing Law & Dispute Forum",
        p: "This Copyright Declaration and all intellectual property disputes arising hereunder shall be governed exclusively by the laws of India, under the jurisdiction of courts in New Delhi / Uttar Pradesh.",
      },
      {
        h: "46. Severability & Survival of Intellectual Property Terms",
        p: "If any clause of this Intellectual Property Protection Declaration is found invalid or unenforceable, remaining clauses shall continue in full force and effect to protect VPANSAK assets.",
      },
      {
        h: "47. Non-Waiver of Copyright & Trademark Rights",
        p: "Failure or delay by VPANSAK to enforce any copyright, trademark, or proprietary right in a specific instance shall not constitute a waiver of such rights for future violations.",
      },
      {
        h: "48. Modifications & Real-time Policy Updates",
        p: "VPANSAK reserves the right to update or modify this Copyright & Intellectual Property Protection Declaration at any time. Continued use of VPANSAK services constitutes acceptance of updated terms.",
      },
      {
        h: "49. Official IP Legal Contact & Corporate Counsel Registry",
        p: "For official intellectual property inquiries, trademark licensing requests, or formal legal notices, contact VPANSAK Legal Operations at legal.vpansak@gmail.com or support.vpansak@gmail.com.",
      },
      {
        h: "50. Final Overriding Declaration of Exclusive Copyright",
        p: "© 2026 VPANSAK & A&A Group. All Rights Reserved Nationwide and Worldwide. No part of this publication, website content, brand design, product catalog, or software system may be reproduced, stored in a retrieval system, or transmitted in any form or by any means — electronic, mechanical, photocopying, recording, or otherwise — without the prior written permission of VPANSAK and A&A Group executive leadership.",
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
  "copyright-terms": "copyright-terms",
  copyright: "copyright-terms",
  "ip-notice": "copyright-terms",
};

const directoryLinks = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-and-conditions", title: "Terms & Conditions" },
  { slug: "return-policy", title: "Return Policy" },
  { slug: "refund-policy", title: "Refund Policy" },
  { slug: "shipping-policy", title: "Shipping Policy" },
  { slug: "seller-policy", title: "Seller Policy" },
  { slug: "copyright-terms", title: "Copyright & IP Notice" },
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
