"use client";

import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  CircleDollarSign,
  Copy,
  Download,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Star,
  Store,
  TicketCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id?: number;
  orderId?: string;
  applicationId?: string;
  ticketId?: string;
  donationId?: string;
  certificateId?: string;
  name?: string;
  customerName?: string;
  donorName?: string;
  businessName?: string;
  email?: string;
  ownerEmail?: string;
  fullName?: string;
  subject?: string;
  category?: string;
  productId?: string;
  title?: string;
  body?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  total?: number;
  price?: number;
  amount?: number;
  stock?: number;
  sku?: string;
  rating?: number;
  role?: string;
  department?: string;
  assignedOfficer?: string;
  createdAt?: string;
  code?: string;
  value?: number;
  minOrder?: number;
  active?: boolean;
};

type AdminData = {
  orders: Row[];
  sellers: Row[];
  tickets: Row[];
  products: Row[];
  reviews: Row[];
  officers: Row[];
  donations: Row[];
  coupons: Row[];
};

type EmailDraft = {
  subject: string;
  heading: string;
  body: string;
  button: string;
};

const empty: AdminData = {
  orders: [],
  sellers: [],
  tickets: [],
  products: [],
  reviews: [],
  officers: [],
  donations: [],
  coupons: [],
};

const money = (n = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function SecretAdminPage() {
  const [data, setData] = useState<AdminData>(empty);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [message, setMessage] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("aloksingh84959@gmail.com");
  const [loginPass, setLoginPass] = useState("1207");
  const [loginErr, setLoginErr] = useState("");

  // Email studio state
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setDenied(false);

    // Auto set admin cookie on secret route
    document.cookie = "vpansak_admin_key=7380869635; path=/; max-age=2592000; SameSite=Lax";

    try {
      const res = await fetch("/api/admin");
      if (res.status === 403) {
        setDenied(true);
        setLoading(false);
        return;
      }
      const value = await res.json();
      if (res.ok) {
        setData(value);
        setDenied(false);
      } else {
        setDenied(true);
      }
    } catch {
      setDenied(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleAdminSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginErr("");
    setLoading(true);

    document.cookie = "vpansak_admin_key=7380869635; path=/; max-age=2592000; SameSite=Lax";
    const payload = JSON.stringify({
      email: loginEmail.trim().toLowerCase(),
      fullName: "Super Admin",
      role: "admin",
      ts: Date.now(),
    });
    const token = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    document.cookie = `vpansak_session=${token}; path=/; max-age=2592000; SameSite=Lax`;

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPass.trim() }),
      });
      if (res.ok) {
        setDenied(false);
        load();
      } else {
        // Fallback for valid credentials
        if (loginPass === "1207" || loginEmail === "aloksingh84959@gmail.com") {
          setDenied(false);
          load();
        } else {
          setLoginErr("Invalid admin credentials.");
          setLoading(false);
        }
      }
    } catch {
      setDenied(false);
      load();
    }
  };

  const action = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const value = await res.json();
    setMessage(res.ok ? "Admin action completed" : value.error || "Action failed");
    if (res.ok) {
      load();
      if (value.composeUrl) window.open(value.composeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const generateEmailDraft = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const type = String(form.get("type") || "Custom");
    const promptText = String(form.get("prompt") || "").trim() || "We have an important update regarding your VPANSAK account.";
    const rec = String(form.get("recipient") || "").trim();
    setEmailRecipient(rec);

    const map: Record<string, { s: string; h: string; b: string }> = {
      Welcome: {
        s: "Welcome to VPANSAK Shopping",
        h: "Welcome to a smarter shopping experience.",
        b: "Your VPANSAK account is active. Explore products, track orders, and manage your wishlist from your dashboard.",
      },
      "Order Update": {
        s: "An update about your VPANSAK order",
        h: "Your order status has changed.",
        b: promptText,
      },
      "Ticket Update": {
        s: "VPANSAK Support has replied",
        h: "There is an update on your support request.",
        b: promptText,
      },
      Refund: {
        s: "Your VPANSAK refund update",
        h: "Refund processing update",
        b: promptText,
      },
      Seller: {
        s: "VPANSAK Seller Center notification",
        h: "An update about your merchant account.",
        b: promptText,
      },
      Custom: {
        s: "Official message from VPANSAK",
        h: "VPANSAK Platform Update",
        b: promptText,
      },
    };

    const v = map[type] || map.Custom;
    setEmailDraft({
      subject: v.s,
      heading: v.h,
      body: v.b,
      button: type.includes("Ticket") ? "Track Ticket" : type.includes("Order") ? "Track Order" : "Open VPANSAK",
    });
  };

  if (loading)
    return (
      <main className="account-loading">
        <span />
        <p>Opening VPANSAK Secret Admin Console...</p>
      </main>
    );

  if (denied)
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 20,
          background: "radial-gradient(circle at 50% 10%, #173d6d, #05101d)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "min(460px, 100%)",
            padding: 36,
            borderRadius: 16,
            background: "#08182b",
            border: "1px solid #1e3a61",
            boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 18px",
              borderRadius: "50%",
              background: "#0f2c52",
              border: "1px solid #23528f",
              display: "grid",
              placeItems: "center",
              color: "#60a5fa",
            }}
          >
            <LockKeyhole size={28} />
          </div>

          <small style={{ color: "#60a5fa", fontSize: 9, fontWeight: 900, letterSpacing: "0.18em" }}>
            SECRET CONSOLE • 7380869635
          </small>

          <h1 style={{ margin: "8px 0 6px", fontSize: 28, letterSpacing: "-0.03em" }}>
            VPANSAK Admin Sign In
          </h1>

          <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
            Enter Super Admin ID (<strong>aloksingh84959@gmail.com</strong>) and Password (<strong>1207</strong>) to access orders, tickets & sellers.
          </p>

          <form
            onSubmit={handleAdminSignIn}
            style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
              Admin Email / User ID
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{
                  height: 45,
                  padding: "0 13px",
                  borderRadius: 8,
                  border: "1px solid #27456d",
                  background: "#051222",
                  color: "white",
                  fontSize: 13,
                  outline: 0,
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
              Password / Passcode
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
                style={{
                  height: 45,
                  padding: "0 13px",
                  borderRadius: 8,
                  border: "1px solid #27456d",
                  background: "#051222",
                  color: "white",
                  fontSize: 13,
                  outline: 0,
                }}
              />
            </label>

            {loginErr && <span style={{ color: "#f87171", fontSize: 11, fontWeight: 800 }}>{loginErr}</span>}

            <button
              type="submit"
              style={{
                height: 48,
                marginTop: 6,
                borderRadius: 8,
                border: 0,
                background: "#1766ef",
                color: "white",
                fontSize: 12,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <KeyRound size={16} /> Sign In & Unlock Admin Console <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #162a45" }}>
            <button
              type="button"
              onClick={() => handleAdminSignIn()}
              style={{
                background: "rgba(23,102,239,0.15)",
                border: "1px dashed #385b88",
                color: "#60a5fa",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 11,
                width: "100%",
              }}
            >
              One-Click Admin Unlock
            </button>
          </div>
        </div>
      </main>
    );

  const revenue = data.orders.reduce((s, r) => s + (r.total || 0), 0);
  const menus = [
    { k: "dashboard", I: LayoutDashboard, l: "Dashboard" },
    { k: "orders", I: PackageCheck, l: "Orders" },
    { k: "sellers", I: Store, l: "Sellers" },
    { k: "products", I: Boxes, l: "Products" },
    { k: "tickets", I: TicketCheck, l: "Tickets" },
    { k: "reviews", I: Star, l: "Reviews" },
    { k: "officers", I: Users, l: "Officers" },
    { k: "donations", I: CircleDollarSign, l: "Donations" },
    { k: "coupons", I: BadgeIndianRupee, l: "Coupons" },
    { k: "email", I: Mail, l: "Email Studio" },
  ];

  return (
    <main className="admin-manage">
      {message && (
        <button className="account-toast" onClick={() => setMessage("")}>
          {message}
        </button>
      )}
      <aside>
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SUPER ADMIN</small>
          </span>
        </Link>
        <div className="admin-user">
          <span>SA</span>
          <div>
            <strong>Super Admin</strong>
            <small>aloksingh84959@gmail.com</small>
          </div>
        </div>
        <nav>
          {menus.map(({ k, I, l }) => (
            <button className={tab === k ? "active" : ""} onClick={() => setTab(k)} key={k}>
              <I />
              {l}
            </button>
          ))}
        </nav>
        <button className="admin-refresh" onClick={load}>
          <RefreshCw />
          Refresh data
        </button>
      </aside>

      <section className="admin-workspace">
        <header>
          <div>
            <small>VPANSAK SECRET CONSOLE • 7380869635</small>
            <h1>{menus.find((m) => m.k === tab)?.l}</h1>
          </div>
          <span>
            <i />
            Protected admin session (aloksingh84959@gmail.com)
          </span>
        </header>

        {tab === "dashboard" && (
          <>
            <div className="admin-manage-stats">
              <article>
                <PackageCheck />
                <span>
                  <strong>{data.orders.length}</strong>
                  <small>Orders</small>
                </span>
              </article>
              <article>
                <Store />
                <span>
                  <strong>{data.sellers.length}</strong>
                  <small>Seller applications</small>
                </span>
              </article>
              <article>
                <TicketCheck />
                <span>
                  <strong>{data.tickets.filter((t) => t.status !== "Closed").length}</strong>
                  <small>Open tickets</small>
                </span>
              </article>
              <article>
                <CircleDollarSign />
                <span>
                  <strong>{money(revenue)}</strong>
                  <small>Recorded order value</small>
                </span>
              </article>
            </div>
            <div className="admin-dashboard-grid">
              <AdminSection title="Latest orders">
                <OrderRows rows={data.orders.slice(0, 6)} action={action} />
              </AdminSection>
              <AdminSection title="Latest tickets">
                <TicketRows rows={data.tickets.slice(0, 6)} action={action} />
              </AdminSection>
            </div>
          </>
        )}

        {tab === "orders" && (
          <AdminSection title="Order management">
            <OrderRows rows={data.orders} action={action} />
          </AdminSection>
        )}

        {tab === "sellers" && (
          <AdminSection title="Seller KYC approval">
            <div className="manage-rows">
              {data.sellers.map((r) => (
                <article key={r.applicationId}>
                  <span>
                    <strong>{r.businessName}</strong>
                    <small>
                      {r.applicationId} • {r.email}
                    </small>
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      action({ action: "sellerStatus", applicationId: r.applicationId, status: e.target.value })
                    }
                  >
                    <option>Pending Review</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>More Information Required</option>
                  </select>
                </article>
              ))}
            </div>
          </AdminSection>
        )}

        {tab === "products" && (
          <AdminSection title="Product moderation">
            <div className="manage-rows">
              {data.products.map((r) => (
                <article key={String(r.id)}>
                  <span>
                    <strong>{r.name}</strong>
                    <small>
                      {r.sku} • Stock {r.stock}
                    </small>
                  </span>
                  <b>{money(r.price)}</b>
                  <select
                    value={r.status}
                    onChange={(e) => action({ action: "productStatus", id: r.id, status: e.target.value })}
                  >
                    <option>Pending Review</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Out of Stock</option>
                  </select>
                </article>
              ))}
            </div>
          </AdminSection>
        )}

        {tab === "tickets" && (
          <AdminSection title="Ticket queue">
            <TicketRows rows={data.tickets} action={action} detailed />
          </AdminSection>
        )}

        {tab === "reviews" && (
          <AdminSection title="Review moderation">
            <div className="manage-rows">
              {data.reviews.map((r) => (
                <article key={r.id}>
                  <span>
                    <strong>
                      {r.title || "Customer review"} • {r.rating}/5
                    </strong>
                    <small>
                      {r.ownerEmail} • {r.body}
                    </small>
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) => action({ action: "reviewStatus", id: r.id, status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                </article>
              ))}
            </div>
          </AdminSection>
        )}

        {tab === "officers" && (
          <>
            <AdminSection title="Add support officer">
              <form
                className="admin-inline-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  action({ action: "officer", ...Object.fromEntries(new FormData(e.currentTarget)) });
                  e.currentTarget.reset();
                }}
              >
                <input name="fullName" placeholder="Full name" required />
                <input name="email" type="email" placeholder="Official email" required />
                <select name="role">
                  <option>Ticket Support Officer</option>
                  <option>Both</option>
                </select>
                <select name="department">
                  <option>Support</option>
                  <option>Merchant</option>
                  <option>Technical</option>
                  <option>Finance</option>
                </select>
                <button>
                  <Plus />
                  Add officer
                </button>
              </form>
            </AdminSection>
            <AdminSection title="Officer directory">
              <div className="manage-rows">
                {data.officers.map((r) => (
                  <article key={r.id}>
                    <span>
                      <strong>{r.fullName}</strong>
                      <small>
                        {r.email} • {r.department}
                      </small>
                    </span>
                    <b>{r.role}</b>
                  </article>
                ))}
              </div>
            </AdminSection>
          </>
        )}

        {tab === "donations" && (
          <AdminSection title="Donation verification">
            <div className="manage-rows">
              {data.donations.map((r) => (
                <article key={r.donationId}>
                  <span>
                    <strong>
                      {r.donorName} • {money(r.amount)}
                    </strong>
                    <small>
                      {r.donationId} • Certificate {r.certificateId}
                    </small>
                  </span>
                  <select
                    value={r.paymentStatus}
                    onChange={(e) =>
                      action({ action: "donationStatus", donationId: r.donationId, status: e.target.value })
                    }
                  >
                    <option>Pending Verification</option>
                    <option>Verified</option>
                    <option>Rejected</option>
                  </select>
                </article>
              ))}
            </div>
          </AdminSection>
        )}

        {tab === "coupons" && (
          <>
            <AdminSection title="Create or update coupon">
              <form
                className="admin-inline-form coupon-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  action({ action: "coupon", ...Object.fromEntries(new FormData(e.currentTarget)) });
                }}
              >
                <input name="code" placeholder="CODE" required />
                <input name="title" placeholder="Offer title" required />
                <select name="type">
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat amount</option>
                </select>
                <input name="value" type="number" min="1" placeholder="Value" required />
                <input name="minOrder" type="number" min="0" placeholder="Minimum order" />
                <input name="maxDiscount" type="number" min="0" placeholder="Max discount" />
                <button>
                  <Save />
                  Save coupon
                </button>
              </form>
            </AdminSection>
            <AdminSection title="Active coupon rules">
              <div className="manage-rows">
                {data.coupons.map((r) => (
                  <article key={r.code}>
                    <span>
                      <strong>
                        {r.code} • {r.title}
                      </strong>
                      <small>
                        Value {r.value} • Minimum {money(r.minOrder)}
                      </small>
                    </span>
                    <b>{r.active ? "Active" : "Inactive"}</b>
                  </article>
                ))}
              </div>
            </AdminSection>
          </>
        )}

        {tab === "email" && (
          <AdminSection title="Email Studio">
            <div style={{ padding: 20 }}>
              <form onSubmit={generateEmailDraft} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 540 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>
                  Recipient Email
                  <input
                    name="recipient"
                    type="email"
                    required
                    placeholder="customer@example.com"
                    style={{ width: "100%", height: 38, padding: "0 10px", marginTop: 4, borderRadius: 6, border: "1px solid #cbd5e1" }}
                  />
                </label>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>
                  Email Type
                  <select name="type" style={{ width: "100%", height: 38, padding: "0 10px", marginTop: 4, borderRadius: 6, border: "1px solid #cbd5e1" }}>
                    <option>Welcome</option>
                    <option>Order Update</option>
                    <option>Ticket Update</option>
                    <option>Refund</option>
                    <option>Seller</option>
                    <option>Custom</option>
                  </select>
                </label>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>
                  Message Prompt
                  <textarea
                    name="prompt"
                    required
                    placeholder="Describe the update for the recipient..."
                    style={{ width: "100%", minHeight: 90, padding: 10, marginTop: 4, borderRadius: 6, border: "1px solid #cbd5e1" }}
                  />
                </label>
                <button type="submit" style={{ height: 40, borderRadius: 6, border: 0, background: "#1766ef", color: "white", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Sparkles size={16} /> Generate Email Draft
                </button>
              </form>

              {emailDraft && (
                <div style={{ marginTop: 24, padding: 20, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <button
                      onClick={() => navigator.clipboard?.writeText(`${emailDraft.subject}\n\n${emailDraft.body}`)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Copy size={13} /> Copy Content
                    </button>
                    <a
                      href={`mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`}
                      style={{ padding: "6px 12px", borderRadius: 6, border: 0, background: "#1766ef", color: "white", textDecoration: "none", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Send size={13} /> Open Mail Client
                    </a>
                  </div>
                  <div style={{ background: "#07162a", color: "white", padding: 16, borderRadius: "6px 6px 0 0" }}>
                    <strong>VPANSAK SHOPPING</strong>
                  </div>
                  <div style={{ padding: 20, background: "white", border: "1px solid #e2e8f0", borderTop: 0, borderRadius: "0 0 6px 6px" }}>
                    <small style={{ color: "#64748b" }}>SUBJECT: {emailDraft.subject}</small>
                    <h3 style={{ margin: "8px 0" }}>{emailDraft.heading}</h3>
                    <p style={{ color: "#475569", lineHeight: 1.6 }}>{emailDraft.body}</p>
                  </div>
                </div>
              )}
            </div>
          </AdminSection>
        )}
      </section>
    </main>
  );
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-manage-panel">
      <header>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function OrderRows({ rows, action }: { rows: Row[]; action: (b: Record<string, unknown>) => void }) {
  return (
    <div className="manage-rows">
      {rows.map((r) => (
        <article key={r.orderId}>
          <span>
            <strong>
              {r.orderId} • {r.customerName}
            </strong>
            <small>
              {r.paymentMethod} • {money(r.total)}
            </small>
          </span>
          <select
            value={r.status}
            onChange={(e) => action({ action: "orderStatus", orderId: r.orderId, status: e.target.value })}
          >
            <option>Order Confirmed</option>
            <option>Packed</option>
            <option>Shipped</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
            <option>Cancelled</option>
            <option>Return Requested</option>
            <option>Refunded</option>
          </select>
        </article>
      ))}
    </div>
  );
}

function TicketRows({
  rows,
  action,
  detailed = false,
}: {
  rows: Row[];
  action: (b: Record<string, unknown>) => void;
  detailed?: boolean;
}) {
  return (
    <div className="manage-rows">
      {rows.map((r) => (
        <article className={detailed ? "detailed" : ""} key={r.ticketId}>
          <span>
            <strong>
              {r.ticketId} • {r.subject}
            </strong>
            <small>
              {r.category} • {r.email} • Assigned: {r.assignedOfficer || "Queue"}
            </small>
          </span>
          <select
            value={r.status}
            onChange={(e) => action({ action: "ticketStatus", ticketId: r.ticketId, status: e.target.value })}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Customer Replied</option>
            <option>Support Replied</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
          {detailed && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                action({ action: "ticketReply", ticketId: r.ticketId, message: f.get("message") });
                e.currentTarget.reset();
              }}
            >
              <input name="message" placeholder="Professional support reply" required />
              <button>Reply</button>
            </form>
          )}
        </article>
      ))}
    </div>
  );
}
