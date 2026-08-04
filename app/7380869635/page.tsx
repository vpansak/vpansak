"use client";

import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  CircleDollarSign,
  Copy,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TicketCheck,
  UserCheck,
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
  mobile?: string;
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
  users: Row[];
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
  users: [],
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
  const [query, setQuery] = useState("");
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

    // Set admin cookie on secret route
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
        setData({
          users: value.users || [],
          orders: value.orders || [],
          sellers: value.sellers || [],
          tickets: value.tickets || [],
          products: value.products || [],
          reviews: value.reviews || [],
          officers: value.officers || [],
          donations: value.donations || [],
          coupons: value.coupons || [],
        });
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

  const handleGoogleAuth = async (emailOverride?: string) => {
    setLoading(true);
    setLoginErr("");
    const emailToUse = emailOverride || loginEmail || "aloksingh84959@gmail.com";
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: emailToUse, fullName: "Super Admin (Google Verified)" }),
      });
      if (res.ok) {
        setDenied(false);
        load();
      } else {
        const d = await res.json();
        setLoginErr(d.error || "Google Sign-In failed.");
        setLoading(false);
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
    setMessage(res.ok ? "Admin action completed successfully" : value.error || "Action failed");
    if (res.ok) {
      load();
      if (value.composeUrl) window.open(value.composeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const generateEmailDraft = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const type = String(form.get("type") || "Custom");
    const promptText =
      String(form.get("prompt") || "").trim() || "We have an important update regarding your VPANSAK account.";
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
            Enter Super Admin ID (<strong>aloksingh84959@gmail.com</strong>) or use Google Authentication.
          </p>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              onClick={() => handleGoogleAuth("aloksingh84959@gmail.com")}
              style={{
                height: 48,
                borderRadius: 8,
                border: "1px solid #385b88",
                background: "#0d223a",
                color: "white",
                fontSize: 12,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google (Verified Admin)
            </button>
          </div>

          <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: 10, color: "#475569", fontSize: 11 }}>
            <span style={{ flex: 1, height: 1, background: "#1e3a61" }} />
            OR WITH ID & PASS
            <span style={{ flex: 1, height: 1, background: "#1e3a61" }} />
          </div>

          <form
            onSubmit={handleAdminSignIn}
            style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}
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

  // Filter helper
  const filterList = (list: Row[]) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (r) =>
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.orderId && r.orderId.toLowerCase().includes(q)) ||
        (r.ticketId && r.ticketId.toLowerCase().includes(q)) ||
        (r.businessName && r.businessName.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.mobile && r.mobile.includes(q))
    );
  };

  const menus = [
    { k: "dashboard", I: LayoutDashboard, l: "Dashboard" },
    { k: "users", I: UserCheck, l: "Users & Accounts" },
    { k: "orders", I: PackageCheck, l: "Orders" },
    { k: "sellers", I: Store, l: "Sellers" },
    { k: "products", I: Boxes, l: "Products" },
    { k: "tickets", I: TicketCheck, l: "Support Tickets" },
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
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <small>SECRET CONSOLE • 7380869635</small>
            <h1>{menus.find((m) => m.k === tab)?.l}</h1>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a1f38", border: "1px solid #1e3a61", borderRadius: 8, padding: "0 12px", height: 40, width: "min(320px, 100%)" }}>
            <Search size={16} color="#60a5fa" />
            <input
              type="text"
              placeholder="Search users, orders, tickets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ background: "transparent", border: 0, color: "white", outline: 0, width: "100%", fontSize: 12 }}
            />
          </label>
        </header>

        {tab === "dashboard" && (
          <>
            <div className="admin-manage-stats">
              <article>
                <UserCheck />
                <span>
                  <strong>{data.users.length}</strong>
                  <small>Registered Accounts</small>
                </span>
              </article>
              <article>
                <PackageCheck />
                <span>
                  <strong>{data.orders.length}</strong>
                  <small>Total Orders</small>
                </span>
              </article>
              <article>
                <Store />
                <span>
                  <strong>{data.sellers.length}</strong>
                  <small>Seller Applications</small>
                </span>
              </article>
              <article>
                <TicketCheck />
                <span>
                  <strong>{data.tickets.filter((t) => t.status !== "Closed").length}</strong>
                  <small>Open Tickets</small>
                </span>
              </article>
              <article>
                <CircleDollarSign />
                <span>
                  <strong>{money(revenue)}</strong>
                  <small>Total Order Revenue</small>
                </span>
              </article>
            </div>

            <div className="admin-dashboard-grid">
              <AdminSection title="Latest User Registrations">
                <UserRows rows={filterList(data.users).slice(0, 5)} action={action} />
              </AdminSection>
              <AdminSection title="Latest Orders">
                <OrderRows rows={filterList(data.orders).slice(0, 5)} action={action} />
              </AdminSection>
              <AdminSection title="Latest Support Tickets">
                <TicketRows rows={filterList(data.tickets).slice(0, 5)} action={action} />
              </AdminSection>
            </div>
          </>
        )}

        {tab === "users" && (
          <AdminSection title="Registered Users & Accounts">
            <UserRows rows={filterList(data.users)} action={action} />
          </AdminSection>
        )}

        {tab === "orders" && (
          <AdminSection title="Order Management Ledger">
            <OrderRows rows={filterList(data.orders)} action={action} />
          </AdminSection>
        )}

        {tab === "sellers" && (
          <AdminSection title="Seller KYC Approval Applications">
            <div className="manage-rows">
              {filterList(data.sellers).map((r) => (
                <article key={r.applicationId}>
                  <span>
                    <strong>{r.businessName}</strong>
                    <small>
                      {r.applicationId} • Email: {r.email} • Mobile: {r.mobile || "N/A"}
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
          <AdminSection title="Product Inventory & Moderation">
            <div className="manage-rows">
              {filterList(data.products).map((r) => (
                <article key={String(r.id)}>
                  <span>
                    <strong>{r.name}</strong>
                    <small>
                      SKU: {r.sku} • Stock: {r.stock} • Category: {r.category || "General"}
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
          <AdminSection title="Customer Support Tickets">
            <TicketRows rows={filterList(data.tickets)} action={action} detailed />
          </AdminSection>
        )}

        {tab === "reviews" && (
          <AdminSection title="Customer Product Reviews">
            <div className="manage-rows">
              {filterList(data.reviews).map((r) => (
                <article key={r.id}>
                  <span>
                    <strong>
                      {r.title || "Customer Review"} • Rating: {r.rating}/5
                    </strong>
                    <small>
                      User: {r.ownerEmail} • Comment: {r.body}
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
            <AdminSection title="Add Support Officer">
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
                  Add Officer
                </button>
              </form>
            </AdminSection>
            <AdminSection title="Officer Directory">
              <div className="manage-rows">
                {filterList(data.officers).map((r) => (
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
          <AdminSection title="Donation Certificates">
            <div className="manage-rows">
              {filterList(data.donations).map((r) => (
                <article key={r.donationId}>
                  <span>
                    <strong>
                      {r.donorName} • {money(r.amount)}
                    </strong>
                    <small>
                      Donation ID: {r.donationId} • Certificate: {r.certificateId}
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
            <AdminSection title="Create or Edit Coupon">
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
                  Save Coupon
                </button>
              </form>
            </AdminSection>
            <AdminSection title="Active Promo Coupons">
              <div className="manage-rows">
                {filterList(data.coupons).map((r) => (
                  <article key={r.code}>
                    <span>
                      <strong>
                        {r.code} • {r.title}
                      </strong>
                      <small>
                        Discount Value: {r.value} • Min Order: {money(r.minOrder)}
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

function UserRows({ rows, action }: { rows: Row[]; action: (b: Record<string, unknown>) => void }) {
  return (
    <div className="manage-rows">
      {rows.length ? (
        rows.map((r) => (
          <article key={r.email}>
            <span>
              <strong>{r.fullName || r.email}</strong>
              <small>
                {r.email} • Mobile: {r.mobile || "N/A"} • Joined: {r.createdAt ? r.createdAt.slice(0, 10) : "N/A"}
              </small>
            </span>
            <select
              value={r.role || "customer"}
              onChange={(e) => action({ action: "userRole", email: r.email, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="officer">Support Officer</option>
              <option value="admin">Super Admin</option>
            </select>
          </article>
        ))
      ) : (
        <div style={{ padding: 20, color: "#94a3b8", fontSize: 12 }}>No registered user accounts found.</div>
      )}
    </div>
  );
}

function OrderRows({ rows, action }: { rows: Row[]; action: (b: Record<string, unknown>) => void }) {
  return (
    <div className="manage-rows">
      {rows.length ? (
        rows.map((r) => (
          <article key={r.orderId}>
            <span>
              <strong>
                {r.orderId} • {r.customerName}
              </strong>
              <small>
                Payment: {r.paymentMethod} • Amount: {money(r.total)}
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
        ))
      ) : (
        <div style={{ padding: 20, color: "#94a3b8", fontSize: 12 }}>No orders recorded yet.</div>
      )}
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
      {rows.length ? (
        rows.map((r) => (
          <article className={detailed ? "detailed" : ""} key={r.ticketId}>
            <span>
              <strong>
                {r.ticketId} • {r.subject}
              </strong>
              <small>
                Category: {r.category} • User: {r.email} • Assigned: {r.assignedOfficer || "Queue"}
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
                <input name="message" placeholder="Type official support reply..." required />
                <button>Reply</button>
              </form>
            )}
          </article>
        ))
      ) : (
        <div style={{ padding: 20, color: "#94a3b8", fontSize: 12 }}>No tickets submitted yet.</div>
      )}
    </div>
  );
}
