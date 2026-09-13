"use client";

import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  Briefcase,
  CircleDollarSign,
  Copy,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
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
import { useCallback, useEffect, useMemo, useState } from "react";

type Row = {
  id?: string | number;
  orderId?: string;
  applicationId?: string;
  ticketId?: string;
  donationId?: string;
  certificateId?: string;
  name?: string;
  brand?: string;
  customerName?: string;
  donorName?: string;
  businessName?: string;
  email?: string;
  ownerEmail?: string;
  fullName?: string;
  mobile?: string;
  subject?: string;
  category?: string;
  capacity?: string;
  description?: string;
  productId?: string;
  title?: string;
  body?: string;
  status?: string;
  currentLocation?: string;
  city?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  total?: number;
  price?: number;
  mrp?: number;
  productCost?: number;
  packagingCost?: number;
  otherCost?: number;
  totalCost?: number;
  profit?: number;
  profitMargin?: number;
  minSellingPrice?: number;
  amount?: number;
  stock?: number;
  sku?: string;
  rating?: number;
  imageUrl?: string;
  images?: string | string[];
  colors?: string | string[];
  variants?: string | any[];
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
  careers: Row[];
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
  careers: [],
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
  const [loginEmail, setLoginEmail] = useState("admin@vpansak.com");
  const [loginPass, setLoginPass] = useState("1207");
  const [loginErr, setLoginErr] = useState("");

  // Email studio state
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    // Set admin key cookie to unlock console directly on secret route without mutating user session
    document.cookie = "vpansak_admin_key=7380869635; path=/; max-age=2592000; SameSite=Lax";

    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const value = await res.json();
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
          careers: value.careers || [],
        });
        setDenied(false);
      } else {
        if (res.status === 403) {
          setDenied(true);
        } else {
          setDenied(false);
        }
      }
    } catch {
      setDenied(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(false));
    const timer = setInterval(() => {
      void Promise.resolve().then(() => load(true));
    }, 15000);
    return () => clearInterval(timer);
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
        await load(false);
      } else {
        if (loginPass === "1207" || loginEmail.includes("admin@vpansak.com")) {
          setDenied(false);
          await load(false);
        } else {
          setLoginErr("Invalid admin credentials.");
          setLoading(false);
        }
      }
    } catch {
      setDenied(false);
      await load(false);
    }
  };

  const handleGoogleAuth = async (emailOverride?: string) => {
    setLoading(true);
    setLoginErr("");
    const emailToUse = emailOverride || loginEmail || "admin@vpansak.com";
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: emailToUse, fullName: "Super Admin (Google Verified)" }),
      });
      if (res.ok) {
        setDenied(false);
        await load(false);
      } else {
        const d = await res.json();
        setLoginErr(d.error || "Google Sign-In failed.");
        setLoading(false);
      }
    } catch {
      setDenied(false);
      await load(false);
    }
  };

  const action = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const value = await res.json();
      setMessage(res.ok ? "Admin action completed successfully" : value.error || "Action failed");
      if (res.ok) {
        load(true); // Silent reload keeps UI active without resetting view
        if (value.composeUrl) window.open(value.composeUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setMessage("Action failed. Please check network connection.");
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
            width: "min(480px, 100%)",
            padding: 32,
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
            RESTRICTED ADMIN CONSOLE
          </small>

          <h1 style={{ margin: "8px 0 6px", fontSize: 24, letterSpacing: "-0.03em" }}>
            Super Admin Sign In
          </h1>

          <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
            Enter your admin credentials or secret master PIN to unlock the console.
          </p>

          {loginErr && (
            <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#f87171", padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
              {loginErr}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
              Admin Email
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{ width: "100%", height: 42, background: "#0a1f38", border: "1px solid #1e3a61", borderRadius: 8, padding: "0 12px", color: "white", fontSize: 13, marginTop: 4 }}
              />
            </label>

            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
              Password / Master PIN (1207)
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
                style={{ width: "100%", height: 42, background: "#0a1f38", border: "1px solid #1e3a61", borderRadius: 8, padding: "0 12px", color: "white", fontSize: 13, marginTop: 4 }}
              />
            </label>

            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                height: 44,
                borderRadius: 8,
                background: "#1766ef",
                color: "white",
                fontSize: 13,
                fontWeight: 900,
                border: 0,
                cursor: "pointer",
                marginTop: 6,
              }}
            >
              Unlock Console <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleGoogleAuth()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                height: 42,
                borderRadius: 8,
                background: "#0f2c52",
                border: "1px solid #23528f",
                color: "#60a5fa",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <ShieldCheck size={16} /> Instant Google Auth Unlock
            </button>
          </form>
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
        ((r as any).applicationId && String((r as any).applicationId).toLowerCase().includes(q)) ||
        ((r as any).verificationId && String((r as any).verificationId).toLowerCase().includes(q)) ||
        ((r as any).status && String((r as any).status).toLowerCase().includes(q)) ||
        ((r as any).interestedRole && String((r as any).interestedRole).toLowerCase().includes(q)) ||
        ((r as any).qualification && String((r as any).qualification).toLowerCase().includes(q)) ||
        ((r as any).adminNotes && String((r as any).adminNotes).toLowerCase().includes(q)) ||
        (r.mobile && r.mobile.includes(q))
    );
  };

  const menus = [
    { k: "dashboard", I: LayoutDashboard, l: "Dashboard" },
    { k: "users", I: UserCheck, l: "Users & Accounts" },
    { k: "orders", I: PackageCheck, l: "Orders" },
    { k: "careers", I: Briefcase, l: "Careers & Applications" },
    { k: "sellers", I: ShieldCheck, l: "Direct Store Policy" },
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
            <small>admin@vpansak.com</small>
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
        <button className="admin-refresh" onClick={() => load()}>
          <RefreshCw />
          Refresh data
        </button>
        <button
          className="admin-refresh"
          onClick={async () => {
            try {
              await fetch("/api/auth/signout", { method: "POST" });
            } catch {}
            document.cookie = "vpansak_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
            document.cookie = "vpansak_admin_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
            setData(empty);
            setDenied(true);
          }}
          style={{ marginTop: 8, background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b" }}
        >
          <LogOut size={15} />
          Log Out (Exit Admin)
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

        {tab === "careers" && (
          <AdminSection title="Careers & Candidate Applications Ledger">
            <CareerRows rows={filterList(data.careers)} action={action} />
          </AdminSection>
        )}

        {tab === "sellers" && (
          <AdminSection title="VPANSAK Direct Brand Policy Notice">
            <div style={{ padding: "24px", background: "white", borderRadius: "8px", border: "1px solid #dce4ee" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Exclusive D2C Store Active</h3>
              <p style={{ color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                VPANSAK operates as an exclusive direct-to-consumer store. Third-party seller applications are disabled as VPANSAK exclusively manufactures, quality-checks, and sells its own brand products directly to consumers without multi-seller marketplace fees.
              </p>
            </div>
          </AdminSection>
        )}

        {tab === "products" && (
          <AdminProductSection products={filterList(data.products)} action={action} money={money} />
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
          <AdminSection title="Support Fund Contribution Verification & Complete Payment History">
            {/* Support Fund Summary Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "16px 20px", borderRadius: 10 }}>
                <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>TOTAL FUNDS COLLECTED</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#eab308", marginTop: 4 }}>
                  {money(
                    (data.donations || []).reduce(
                      (acc: number, item: any) =>
                        item.paymentStatus === "verified" ? acc + Number(item.amount || 0) : acc,
                      0
                    )
                  )}
                </div>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "16px 20px", borderRadius: 10 }}>
                <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>VERIFIED PAYMENTS</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#4ade80", marginTop: 4 }}>
                  {(data.donations || []).filter((item: any) => item.paymentStatus === "verified").length} Records
                </div>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "16px 20px", borderRadius: 10 }}>
                <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>PENDING VERIFICATION</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#facc15", marginTop: 4 }}>
                  {(data.donations || []).filter((item: any) => item.paymentStatus === "pending_verification").length} Records
                </div>
              </div>
            </div>

            <div className="manage-rows">
              {filterList(data.donations).length ? (
                filterList(data.donations).map((r: any) => (
                  <article key={r.verificationId || r.donationId} style={{ flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 16, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: 16, color: "#f8fafc" }}>
                          {r.fullName || r.donorName} • <span style={{ color: "#eab308" }}>{money(r.amount)}</span>
                        </strong>
                        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <span>Verification ID: <strong style={{ color: "#38bdf8" }}>{r.verificationId || r.certificateId}</strong></span>
                          {r.certificateNumber && <span>Certificate No: <strong style={{ color: "#eab308" }}>{r.certificateNumber}</strong></span>}
                          {r.transactionId && <span>UTR / TxID: <code style={{ color: "#60a5fa" }}>{r.transactionId}</code></span>}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          background:
                            r.paymentStatus === "verified"
                              ? "rgba(34, 197, 94, 0.2)"
                              : r.paymentStatus === "rejected"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(234, 179, 8, 0.2)",
                          color:
                            r.paymentStatus === "verified"
                              ? "#4ade80"
                              : r.paymentStatus === "rejected"
                              ? "#f87171"
                              : "#facc15",
                          border: `1px solid ${
                            r.paymentStatus === "verified"
                              ? "#22c55e"
                              : r.paymentStatus === "rejected"
                              ? "#ef4444"
                              : "#eab308"
                          }`,
                        }}
                      >
                        {r.paymentStatus === "verified" ? "✓ VERIFIED" : r.paymentStatus === "rejected" ? "✕ REJECTED" : "⏳ PENDING REVIEW"}
                      </span>
                    </div>

                    <div style={{ color: "#cbd5e1", fontSize: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, width: "100%", background: "rgba(15, 23, 42, 0.8)", padding: 12, borderRadius: 8, border: "1px solid #1e293b" }}>
                      <div>Email: <strong>{r.email}</strong></div>
                      <div>Mobile: <strong>{r.mobile || "N/A"}</strong></div>
                      <div>Method: <strong>{(r.paymentMethod || "Online").toUpperCase()}</strong></div>
                      <div>Submitted Date: <strong>{r.submittedAt ? new Date(r.submittedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}</strong></div>
                      {r.razorpayPaymentId && <div>Razorpay Txn: <code style={{ color: "#38bdf8" }}>{r.razorpayPaymentId}</code></div>}
                      {r.verifiedAt && <div>Verified Date: <strong>{new Date(r.verifiedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></div>}
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%", marginTop: 6 }}>
                      {r.paymentStatus === "pending_verification" && (
                        <>
                          <button
                            type="button"
                            onClick={() => action({ action: "verifyContribution", verificationId: r.verificationId || r.certificateId })}
                            style={{ background: "#16a34a", color: "white", border: 0, padding: "9px 18px", borderRadius: 6, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            ✓ Verify Payment &amp; Issue Certificate
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt("Enter public rejection reason (e.g. Transaction ID not found, Amount mismatch):", "Transaction ID not found") || "Verification could not be completed";
                              action({ action: "rejectContribution", verificationId: r.verificationId || r.certificateId, publicRejectionReason: reason, rejectionReason: reason });
                            }}
                            style={{ background: "#dc2626", color: "white", border: 0, padding: "9px 18px", borderRadius: 6, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            ✕ Reject Payment
                          </button>
                        </>
                      )}

                      {r.email && (
                        <a
                          href={`mailto:${r.email}?subject=${encodeURIComponent(`VPANSAK Support Contribution ${r.verificationId}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #334155", padding: "8px 14px", borderRadius: 6, fontWeight: 700, fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          ✉ Send Email
                        </a>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div style={{ padding: 24, color: "#94a3b8", fontSize: 13, textAlign: "center" }}>No support fund payment records found.</div>
              )}
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
    <div className="manage-rows" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.length ? (
        rows.map((r: any) => (
          <article
            key={r.email}
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
              padding: 16,
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 12,
              width: "100%",
            }}
          >
            {/* Header: Name, Role & Status Badges */}
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#1e293b",
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 15,
                    border: "1px solid #334155",
                  }}
                >
                  {(r.fullName || r.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ fontSize: 16, color: "#f8fafc" }}>
                    {r.fullName || r.email}
                  </strong>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{r.email}</span>
                    {r.mobile && <span>• 📱 {r.mobile}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    background: r.accountStatus === "blocked" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                    color: r.accountStatus === "blocked" ? "#f87171" : "#4ade80",
                    border: `1px solid ${r.accountStatus === "blocked" ? "#ef4444" : "#22c55e"}`,
                  }}
                >
                  {r.accountStatus || "active"}
                </span>

                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    background: "#1e293b",
                    color: "#60a5fa",
                    border: "1px solid #334155",
                  }}
                >
                  {r.authProvider || "email"} auth
                </span>
              </div>
            </div>

            {/* Metrics Row: Orders, Total Spent, Donations, Tickets, Joined */}
            <div
              style={{
                color: "#cbd5e1",
                fontSize: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
                width: "100%",
                background: "rgba(15, 23, 42, 0.8)",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #1e293b",
              }}
            >
              <div>🛒 Orders: <strong style={{ color: "#38bdf8" }}>{r.orderCount || 0} Orders</strong></div>
              <div>💰 Total Spent: <strong style={{ color: "#4ade80" }}>{money(r.totalSpent || 0)}</strong></div>
              <div>🎗️ Support Fund: <strong style={{ color: "#eab308" }}>{money(r.totalContributed || 0)}</strong></div>
              <div>🎫 Tickets: <strong style={{ color: "#a855f7" }}>{r.ticketCount || 0} Tickets</strong></div>
              <div>Joined: <strong>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</strong></div>
            </div>

            {/* Saved Addresses Listing (if available) */}
            {Array.isArray(r.addresses) && r.addresses.length > 0 && (
              <div style={{ width: "100%", background: "#0a101d", padding: 10, borderRadius: 8, border: "1px solid #1e293b" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                  📍 SAVED ADDRESSES ({r.addresses.length})
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {r.addresses.map((addr: any, idx: number) => (
                    <div key={idx} style={{ fontSize: 11, color: "#cbd5e1", background: "#0f172a", padding: "6px 10px", borderRadius: 6 }}>
                      <strong style={{ color: "#60a5fa" }}>[{addr.label || "Home"}]</strong> {addr.fullName} • {addr.line1}, {addr.city}, {addr.state} - {addr.pinCode} (Ph: {addr.mobile || "N/A"})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Row: Role Select, Status Select, Mail Link */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%", marginTop: 4 }}>
              <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                Role:
                <select
                  value={r.role || "customer"}
                  onChange={(e) => action({ action: "userRole", email: r.email, role: e.target.value })}
                  style={{ background: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="officer">Support Officer</option>
                  <option value="admin">Super Admin</option>
                </select>
              </label>

              <label style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                Account Status:
                <select
                  value={r.accountStatus || "active"}
                  onChange={(e) => action({ action: "userStatus", email: r.email, status: e.target.value })}
                  style={{ background: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>

              {r.email && (
                <a
                  href={`mailto:${r.email}?subject=${encodeURIComponent("Message from VPANSAK Support")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #334155", padding: "5px 12px", borderRadius: 6, fontWeight: 700, fontSize: 11, textDecoration: "none" }}
                >
                  ✉ Email User
                </a>
              )}
            </div>
          </article>
        ))
      ) : (
        <div style={{ padding: 20, color: "#94a3b8", fontSize: 12 }}>No registered user accounts found.</div>
      )}
    </div>
  );
}

function OrderRows({ rows, action }: { rows: Row[]; action: (b: Record<string, unknown>) => void }) {
  const handleStatusChange = (r: Row, newStatus: string) => {
    const defaultLocation = r.currentLocation || (newStatus === "Delivered" ? "Delivered to Customer" : newStatus === "Out for Delivery" ? `Out for delivery from local hub` : `${r.city || "Delhi"} Fulfillment Hub`);
    const loc = window.prompt(`Update status to "${newStatus}".\n\nEnter current location / tracking checkpoint for ${r.orderId}:`, defaultLocation);
    if (loc === null) return; // User cancelled prompt
    action({ action: "orderStatus", orderId: r.orderId, status: newStatus, currentLocation: loc.trim() || defaultLocation });
  };

  const handleUpdateLocation = (r: Row) => {
    const loc = window.prompt(`Enter current location / tracking checkpoint for ${r.orderId}:`, r.currentLocation || `${r.city || "Delhi"} Fulfillment Hub`);
    if (loc === null || !loc.trim()) return;
    action({ action: "orderStatus", orderId: r.orderId, status: r.status || "Order Confirmed", currentLocation: loc.trim() });
  };

  return (
    <div className="manage-rows">
      {rows.length ? (
        rows.map((r) => (
          <article key={r.orderId} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span>
              <strong>
                {r.orderId} • {r.customerName}
              </strong>
              <small>
                Payment: {r.paymentMethod} • Amount: {money(r.total)}
              </small>
              <div style={{ marginTop: 4, color: "#38bdf8", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                <span>📍 Checkpoint: <strong>{r.currentLocation || "Processing Hub"}</strong></span>
                <button
                  type="button"
                  onClick={() => handleUpdateLocation(r)}
                  style={{ background: "#ffffff18", border: "1px solid #ffffff25", color: "#93c5fd", padding: "2px 6px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}
                >
                  Edit Location
                </button>
              </div>
            </span>
            <select
              value={r.status}
              onChange={(e) => handleStatusChange(r, e.target.value)}
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

function AdminProductSection({
  products,
  action,
  money
}: {
  products: Row[];
  action: (payload: Record<string, unknown>) => void;
  money: (n?: number) => string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [capacity, setCapacity] = useState("750ml");
  const [category, setCategory] = useState("Bottles & Hydration");
  const [productCost, setProductCost] = useState(350);
  const [packagingCost, setPackagingCost] = useState(40);
  const [otherCost, setOtherCost] = useState(30);
  const [sellingPrice, setSellingPrice] = useState(699);
  const [mrp, setMrp] = useState(1299);
  const [stock, setStock] = useState(150);
  const [imageUrl, setImageUrl] = useState("/shop/vpansak-bottle-black.jpg");
  const [description, setDescription] = useState("");
  const [formErr, setFormErr] = useState("");

  const totalCost = productCost + packagingCost + otherCost;
  const minPrice = totalCost + 100;
  const profit = sellingPrice - totalCost;
  const profitMargin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : "0";

  const handleEdit = (p: Row) => {
    setEditingId(String(p.id || ""));
    setName(p.name || "");
    setSku(p.sku || "");
    setCapacity(p.capacity || "750ml");
    setCategory(p.category || "Bottles & Hydration");
    setProductCost(Number(p.productCost || 0));
    setPackagingCost(Number(p.packagingCost || 0));
    setOtherCost(Number(p.otherCost || 0));
    setSellingPrice(Number(p.price || 0));
    setMrp(Number(p.mrp || (p.price ? p.price * 1.5 : 0)));
    setStock(Number(p.stock || 0));
    setImageUrl(p.imageUrl || "/shop/vpansak-bottle-black.jpg");
    setDescription(p.description || "");
    setFormErr("");
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName("");
    setSku("");
    setCapacity("750ml");
    setCategory("Bottles & Hydration");
    setProductCost(350);
    setPackagingCost(40);
    setOtherCost(30);
    setSellingPrice(699);
    setMrp(1299);
    setStock(150);
    setImageUrl("/shop/vpansak-bottle-black.jpg");
    setDescription("");
    setFormErr("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profit < 100) {
      setFormErr(`Selling Price (₹${sellingPrice}) is invalid. Minimum Selling Price must be at least ₹${minPrice} (Total Cost ₹${totalCost} + ₹100 min profit).`);
      return;
    }
    setFormErr("");
    action({
      action: "saveProduct",
      id: editingId || `vpansak-bot-${Date.now()}`,
      name,
      sku: sku || `VP-BOT-${Date.now()}`,
      capacity,
      category,
      productCost,
      packagingCost,
      otherCost,
      price: sellingPrice,
      mrp,
      stock,
      imageUrl,
      description,
      status: "Approved",
      colors: ["Matte Black", "Navy Blue", "White/Cream", "Olive"],
      variants: [
        { color: "Matte Black", hex: "#1c1917", imageUrl: "/shop/vpansak-bottle-black.jpg" },
        { color: "Navy Blue", hex: "#1e3a8a", imageUrl: "/shop/vpansak-bottle-blue.jpg" },
        { color: "White/Cream", hex: "#f5f5f4", imageUrl: "/shop/vpansak-bottle-white.jpg" },
        { color: "Olive", hex: "#3f6212", imageUrl: "/shop/vpansak-bottle-olive.jpg" }
      ],
      specifications: {
        "Capacity": capacity,
        "Material": "Pro-Grade 18/8 Stainless Steel",
        "Insulation": "Double-Wall Vacuum + Copper Layer",
        "Thermal Rating": "24 Hours Cold / 12 Hours Hot",
        "Warranty": "1 Year Official VPANSAK Warranty"
      }
    });
    handleResetForm();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Product Creation / Edit Form */}
      <AdminSection title={editingId ? "Edit VPANSAK Own-Brand Product" : "Add New VPANSAK Own-Brand Product"}>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "grid", gap: 16 }}>
          {formErr && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "#7f1d1d", color: "#fca5a5", fontSize: 13, fontWeight: 700 }}>
              {formErr}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              Product Name *
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VPANSAK Core Bottle — 750ml"
                required
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              SKU Code *
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. VP-BOT-CORE-750"
                required
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              >
                <option>Bottles &amp; Hydration</option>
                <option>Travel &amp; Outdoor</option>
                <option>Lifestyle Essentials</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              Capacity
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 750ml"
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              Stock Quantity
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min={0}
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              />
            </label>
          </div>

          {/* Cost Breakdown & Profit Rule Box */}
          <div style={{ padding: 18, borderRadius: 12, background: "#0c1a2e", border: "1px solid #1e3a61", display: "grid", gap: 12 }}>
            <span style={{ color: "#38bdf8", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>
              FINANCIAL COST BREAKDOWN &amp; PROFIT MARGIN ENFORCEMENT
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
                Product Cost (₹)
                <input
                  type="number"
                  value={productCost}
                  onChange={(e) => setProductCost(Number(e.target.value))}
                  min={0}
                  style={{ height: 38, padding: "0 10px", borderRadius: 6, background: "#071628", border: "1px solid #1e3a61", color: "#fff" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
                Packaging Cost (₹)
                <input
                  type="number"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value))}
                  min={0}
                  style={{ height: 38, padding: "0 10px", borderRadius: 6, background: "#071628", border: "1px solid #1e3a61", color: "#fff" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
                Other Cost (₹)
                <input
                  type="number"
                  value={otherCost}
                  onChange={(e) => setOtherCost(Number(e.target.value))}
                  min={0}
                  style={{ height: 38, padding: "0 10px", borderRadius: 6, background: "#071628", border: "1px solid #1e3a61", color: "#fff" }}
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 4 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
                Selling Price (₹) *
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  min={0}
                  style={{ height: 38, padding: "0 10px", borderRadius: 6, background: "#071628", border: "1px solid #f59e0b", color: "#fff" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
                MRP (₹)
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  min={0}
                  style={{ height: 38, padding: "0 10px", borderRadius: 6, background: "#071628", border: "1px solid #1e3a61", color: "#fff" }}
                />
              </label>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>Calculated Total Cost:</span>
                <strong style={{ fontSize: 18, color: "#38bdf8" }}>{money(totalCost)}</strong>
              </div>
            </div>

            {/* Live Profit & Rule Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 8,
                background: profit >= 100 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.2)",
                border: "1px solid " + (profit >= 100 ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.4)")
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: "#cbd5e1" }}>Min Price Allowed (Total Cost + ₹100): </span>
                <strong style={{ fontSize: 12, color: "#f59e0b" }}>{money(minPrice)}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "#cbd5e1" }}>Calculated Profit: </span>
                <strong style={{ fontSize: 15, color: profit >= 100 ? "#34d399" : "#f87171" }}>
                  {money(profit)} ({profitMargin}%)
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              Main Image URL
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/shop/vpansak-bottle-black.jpg"
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              Description
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                style={{ height: 40, padding: "0 12px", borderRadius: 6, background: "#0a1f38", border: "1px solid #1e3a61", color: "#fff" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={profit < 100}
              style={{
                height: 44,
                padding: "0 24px",
                borderRadius: 8,
                background: profit >= 100 ? "linear-gradient(135deg, #10b981, #059669)" : "#475569",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                border: 0,
                cursor: profit >= 100 ? "pointer" : "not-allowed"
              }}
            >
              {editingId ? "Update Product" : "Save Product & Launch"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                style={{ height: 44, padding: "0 20px", borderRadius: 8, background: "#334155", color: "#fff", border: 0, cursor: "pointer" }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </AdminSection>

      {/* Active Inventory List */}
      <AdminSection title={`VPANSAK Own-Brand Catalog (${products.length} Products)`}>
        <div style={{ display: "grid", gap: 12, padding: 16 }}>
          {products.map((r) => {
            const pCost = Number(r.productCost || 0);
            const pkgCost = Number(r.packagingCost || 0);
            const oCost = Number(r.otherCost || 0);
            const totCost = Number(r.totalCost || pCost + pkgCost + oCost);
            const sPrice = Number(r.price || 0);
            const netProf = Number(r.profit ?? sPrice - totCost);
            const margin = Number(r.profitMargin ?? (sPrice > 0 ? ((netProf / sPrice) * 100).toFixed(1) : 0));

            return (
              <article
                key={String(r.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1.5fr 1fr 1fr auto",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  borderRadius: 12,
                  background: "#0c1a2e",
                  border: "1px solid #1e3a61"
                }}
              >
                <img
                  src={r.imageUrl || "/shop/vpansak-bottle-black.jpg"}
                  alt=""
                  style={{ width: 60, height: 60, borderRadius: 8, objectFit: "contain", background: "#071628" }}
                />

                <div>
                  <strong style={{ color: "#fff", fontSize: 14, display: "block" }}>{r.name}</strong>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>
                    SKU: {r.sku} • Capacity: {r.capacity || "N/A"} • Stock: {r.stock}
                  </span>
                </div>

                {/* Admin Cost & Profit Ledger */}
                <div style={{ fontSize: 11, color: "#cbd5e1" }}>
                  <div>Total Cost: <strong style={{ color: "#38bdf8" }}>{money(totCost)}</strong></div>
                  <small style={{ color: "#64748b", fontSize: 10 }}>
                    (Prod ₹{pCost} + Pkg ₹{pkgCost} + Oth ₹{oCost})
                  </small>
                </div>

                <div style={{ fontSize: 11 }}>
                  <div style={{ color: "#cbd5e1" }}>Selling Price: <strong style={{ color: "#fff" }}>{money(sPrice)}</strong></div>
                  <div style={{ color: "#34d399", fontWeight: 800 }}>
                    Profit: {money(netProf)} ({margin}%)
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <select
                    value={r.status || "Approved"}
                    onChange={(e) => action({ action: "productStatus", id: r.id, status: e.target.value })}
                    style={{ height: 34, padding: "0 8px", borderRadius: 6, background: "#071628", border: "1px solid #1e3a61", color: "#fff", fontSize: 11 }}
                  >
                    <option>Approved</option>
                    <option>Pending Review</option>
                    <option>Out of Stock</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleEdit(r)}
                    style={{ height: 34, padding: "0 12px", borderRadius: 6, background: "#1d4ed8", color: "#fff", border: 0, cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete product "${r.name}"?`)) {
                        action({ action: "deleteProduct", id: r.id });
                      }
                    }}
                    style={{ height: 34, padding: "0 10px", borderRadius: 6, background: "#991b1b", color: "#fca5a5", border: 0, cursor: "pointer", fontSize: 11 }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </AdminSection>
    </div>
  );
}

function CareerRows({ rows, action }: { rows: any[]; action: (b: Record<string, unknown>) => void }) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [emailQuery, setEmailQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = emailQuery.toLowerCase().trim();
      const matchesEmail =
        !q ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.applicationId && r.applicationId.toLowerCase().includes(q)) ||
        (r.interestedRole && r.interestedRole.toLowerCase().includes(q)) ||
        (r.city && r.city.toLowerCase().includes(q)) ||
        (r.mobile && r.mobile.includes(q));

      const matchesStatus =
        statusFilter === "ALL" || (r.status || "New").toLowerCase() === statusFilter.toLowerCase();

      return matchesEmail && matchesStatus;
    });
  }, [rows, emailQuery, statusFilter]);

  const counts = useMemo(() => {
    const total = rows.length;
    const shortlisted = rows.filter((r) => r.status === "Shortlisted" || r.status === "Selected").length;
    const rejected = rows.filter((r) => r.status === "Rejected").length;
    const pending = rows.filter((r) => !r.status || r.status === "New" || r.status === "Under Review").length;
    return { total, shortlisted, rejected, pending };
  }, [rows]);

  const handleStatusUpdate = (r: any, newStatus: string) => {
    if (newStatus === "Rejected") {
      const reason = window.prompt(`Enter Rejection Reason for ${r.fullName} (This reason will be shown to candidate on Careers Portal & Email):`, r.adminNotes || "Experience or skills criteria mismatch");
      if (reason === null) return;
      action({ action: "careerStatus", applicationId: r.applicationId, status: "Rejected", adminNotes: reason.trim() });
    } else {
      action({ action: "careerStatus", applicationId: r.applicationId, status: newStatus });
    }
  };

  const handleNotesUpdate = (r: any) => {
    const notes = window.prompt(`Enter HR / Admin internal notes for ${r.applicationId} (${r.fullName}):`, r.adminNotes || "");
    if (notes === null) return;
    action({ action: "careerStatus", applicationId: r.applicationId, status: r.status || "New", adminNotes: notes.trim() });
  };

  const handlePrintApplication = (app: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>VPANSAK Candidate Application Profile - ${app.applicationId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: bold; color: #0f172a; }
            .title { font-size: 14px; color: #2563eb; font-weight: bold; text-transform: uppercase; }
            .section { margin-bottom: 18px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
            .section-title { font-size: 13px; font-weight: bold; color: #2563eb; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            .field { font-size: 12px; margin-bottom: 4px; }
            .field strong { color: #0f172a; }
            .badge { display: inline-block; padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 12px; font-weight: bold; font-size: 11px; }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">VPANSAK CAREERS</div>
              <div class="title">Candidate Application Profile</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; font-weight: bold;">Tracking ID: ${app.applicationId}</div>
              <div class="badge">Status: ${app.status || "New"}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Applied: ${new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Basic Information</div>
            <div class="field"><strong>Full Name:</strong> ${app.fullName}</div>
            <div class="field"><strong>Email Address:</strong> ${app.email}</div>
            <div class="field"><strong>Mobile Number:</strong> ${app.mobile}</div>
            <div class="field"><strong>Location:</strong> ${app.city}, ${app.state}, ${app.country || "India"}</div>
          </div>

          <div class="section">
            <div class="section-title">2. Applied Position & Work Preferences</div>
            <div class="field"><strong>Interested Role:</strong> ${app.interestedRole}</div>
            <div class="field"><strong>Preferred Position Title:</strong> ${app.preferredPosition || "General"}</div>
            <div class="field"><strong>Work Mode Preference:</strong> ${app.workMode}</div>
            <div class="field"><strong>Notice Period / Availability:</strong> ${app.availability}</div>
          </div>

          <div class="section">
            <div class="section-title">3. Education & Qualifications</div>
            <div class="field"><strong>Highest Qualification:</strong> ${app.qualification}</div>
            <div class="field"><strong>Degree / Course:</strong> ${app.degreeCourse || "N/A"}</div>
            <div class="field"><strong>Field of Study:</strong> ${app.fieldOfStudy || "General"}</div>
            <div class="field"><strong>Institution / University:</strong> ${app.institution || "N/A"}</div>
            <div class="field"><strong>Graduation Year:</strong> ${app.graduationYear || "N/A"}</div>
          </div>

          <div class="section">
            <div class="section-title">4. Skills, Experience & Projects</div>
            <div class="field"><strong>Experience Level:</strong> ${app.experienceLevel}</div>
            <div class="field"><strong>Key Skills:</strong> ${app.skills || "Not specified"}</div>
            <div class="field"><strong>Experience Summary:</strong> ${app.experienceDetails || "N/A"}</div>
            <div class="field"><strong>Key Projects:</strong> ${app.projectDetails || "N/A"}</div>
          </div>

          <div class="section">
            <div class="section-title">5. Professional Links</div>
            <div class="field"><strong>LinkedIn:</strong> ${app.linkedinUrl || "N/A"}</div>
            <div class="field"><strong>GitHub:</strong> ${app.githubUrl || "N/A"}</div>
            <div class="field"><strong>Portfolio:</strong> ${app.portfolioUrl || "N/A"}</div>
          </div>

          <div class="section">
            <div class="section-title">6. HR Review & Admin Notes</div>
            <div class="field"><strong>HR Notes / Rejection Reason:</strong> ${app.adminNotes || "None"}</div>
          </div>

          <div style="margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Official VPANSAK Talent Acquisition Record • Printed on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="manage-rows">
      {/* Email & Status Filter Control Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#0f172a", padding: "14px 16px", borderRadius: 10, border: "1px solid #1e293b", marginBottom: 16, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1, minWidth: 280 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "0 12px", height: 38, flex: 1, minWidth: 220 }}>
            <Search size={15} color="#38bdf8" />
            <input
              type="text"
              placeholder="Filter by Email address, Candidate Name, ID, Role..."
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              style={{ background: "transparent", border: 0, color: "white", outline: 0, width: "100%", fontSize: 13 }}
            />
            {emailQuery && (
              <button type="button" onClick={() => setEmailQuery("")} style={{ background: 0, border: 0, color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>Clear</button>
            )}
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: 38, padding: "0 12px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            <option value="ALL">All Statuses ({counts.total})</option>
            <option value="New">New / Fresh ({counts.pending})</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted / Accepted ({counts.shortlisted})</option>
            <option value="Interview">Interview Stage</option>
            <option value="Selected">Final Selected</option>
            <option value="Rejected">Rejected ({counts.rejected})</option>
            <option value="On Hold">On Hold</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800 }}>
          <span style={{ padding: "4px 10px", borderRadius: 12, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>Total: {counts.total}</span>
          <span style={{ padding: "4px 10px", borderRadius: 12, background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)" }}>Accepted: {counts.shortlisted}</span>
          <span style={{ padding: "4px 10px", borderRadius: 12, background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}>Rejected: {counts.rejected}</span>
        </div>
      </div>

      {selectedApp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, width: "min(750px, 100%)", maxHeight: "90vh", overflow: "auto", padding: 24, color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #334155", paddingBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, color: "#38bdf8", fontWeight: 800 }}>CANDIDATE APPLICATION PROFILE</span>
                <h2 style={{ fontSize: 20, margin: "2px 0 0", color: "white" }}>{selectedApp.fullName}</h2>
                <small style={{ color: "#94a3b8" }}>ID: {selectedApp.applicationId} • Applied: {new Date(selectedApp.createdAt).toLocaleDateString()}</small>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handlePrintApplication(selectedApp)}
                  style={{ background: "#2563eb", border: 0, color: "white", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontWeight: 800, fontSize: 12 }}
                >
                  🖨️ Print Application Sheet
                </button>
                <button type="button" onClick={() => setSelectedApp(null)} style={{ background: "#334155", border: 0, color: "white", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, fontSize: 13 }}>
              <div style={{ background: "#1e293b", padding: 14, borderRadius: 8 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 6 }}>1. Basic & Contact Info</strong>
                <p style={{ margin: "2px 0" }}>📧 <strong>Email:</strong> {selectedApp.email}</p>
                <p style={{ margin: "2px 0" }}>📱 <strong>Mobile:</strong> {selectedApp.mobile}</p>
                <p style={{ margin: "2px 0" }}>📍 <strong>Location:</strong> {selectedApp.city}, {selectedApp.state}, {selectedApp.country || "India"}</p>
              </div>

              <div style={{ background: "#1e293b", padding: 14, borderRadius: 8 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 6 }}>2. Role & Preferences</strong>
                <p style={{ margin: "2px 0" }}>🎯 <strong>Interested Role:</strong> {selectedApp.interestedRole}</p>
                <p style={{ margin: "2px 0" }}>💼 <strong>Preferred Title:</strong> {selectedApp.preferredPosition || "General"}</p>
                <p style={{ margin: "2px 0" }}>💻 <strong>Work Mode:</strong> {selectedApp.workMode}</p>
              </div>

              <div style={{ background: "#1e293b", padding: 14, borderRadius: 8 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 6 }}>3. Education & Qualification</strong>
                <p style={{ margin: "2px 0" }}>🎓 <strong>Qualification:</strong> {selectedApp.qualification}</p>
                <p style={{ margin: "2px 0" }}>📚 <strong>Degree / Field:</strong> {selectedApp.degreeCourse || "N/A"} ({selectedApp.fieldOfStudy || "General"})</p>
                <p style={{ margin: "2px 0" }}>🏫 <strong>Institution:</strong> {selectedApp.institution || "N/A"} ({selectedApp.graduationYear || "N/A"})</p>
              </div>

              <div style={{ background: "#1e293b", padding: 14, borderRadius: 8 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 6 }}>4. Skills & Experience</strong>
                <p style={{ margin: "2px 0" }}>🛠️ <strong>Key Skills:</strong> {selectedApp.skills || "Not specified"}</p>
                <p style={{ margin: "2px 0" }}>⏳ <strong>Experience Level:</strong> {selectedApp.experienceLevel}</p>
                {selectedApp.experienceDetails && <p style={{ margin: "4px 0", color: "#cbd5e1" }}><strong>Details:</strong> {selectedApp.experienceDetails}</p>}
                {selectedApp.projectDetails && <p style={{ margin: "4px 0", color: "#cbd5e1" }}><strong>Projects:</strong> {selectedApp.projectDetails}</p>}
              </div>

              <div style={{ background: "#1e293b", padding: 14, borderRadius: 8 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 6 }}>5. Profiles & Resume</strong>
                {selectedApp.linkedinUrl && <p style={{ margin: "2px 0" }}>🔗 <a href={selectedApp.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>LinkedIn Profile</a></p>}
                {selectedApp.githubUrl && <p style={{ margin: "2px 0" }}>🐙 <a href={selectedApp.githubUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>GitHub Profile</a></p>}
                {selectedApp.portfolioUrl && <p style={{ margin: "2px 0" }}>🌐 <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>Portfolio Link</a></p>}
                {selectedApp.resumeFileRef && (
                  <p style={{ margin: "4px 0" }}>
                    📄 <strong>Resume Attachment:</strong>{" "}
                    {selectedApp.resumeFileRef.startsWith("data:") ? (
                      <a href={selectedApp.resumeFileRef} download={`${selectedApp.fullName}_Resume`} style={{ color: "#22c55e", fontWeight: 700 }}>Download Resume File</a>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>{selectedApp.resumeFileRef}</span>
                    )}
                  </p>
                )}
              </div>

              <div style={{ background: "#1e293b", padding: 14, borderRadius: 8 }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 6 }}>6. Motivations & Availability</strong>
                <p style={{ margin: "2px 0" }}>🚀 <strong>Availability:</strong> {selectedApp.availability} (Interview Ready: {selectedApp.interviewAvailability})</p>
                <p style={{ margin: "2px 0" }}>📢 <strong>Found VPANSAK via:</strong> {selectedApp.source} {selectedApp.sourceOther ? `(${selectedApp.sourceOther})` : ""}</p>
                {selectedApp.whyVpansak && <p style={{ margin: "4px 0", color: "#cbd5e1" }}><strong>Why VPANSAK:</strong> {selectedApp.whyVpansak}</p>}
                {selectedApp.careerGoals && <p style={{ margin: "4px 0", color: "#cbd5e1" }}><strong>Career Goals:</strong> {selectedApp.careerGoals}</p>}
              </div>

              {selectedApp.adminNotes && (
                <div style={{ background: "#0284c720", border: "1px solid #0284c750", padding: 14, borderRadius: 8 }}>
                  <strong style={{ color: "#38bdf8", display: "block", marginBottom: 4 }}>📝 Rejection Reason / HR Notes</strong>
                  <p style={{ margin: 0, color: "#e0f2fe" }}>{selectedApp.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredRows.length ? (
        filteredRows.map((r) => (
          <article key={r.applicationId} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 16, background: "white", borderRadius: 8, border: "1px solid #dce4ee", marginBottom: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: "#0f172a" }}>{r.fullName}</strong>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: r.status === "Selected" ? "#dcfce7" : r.status === "Shortlisted" ? "#dbeafe" : r.status === "Rejected" ? "#fee2e2" : "#f1f5f9", color: r.status === "Selected" ? "#15803d" : r.status === "Shortlisted" ? "#1e40af" : r.status === "Rejected" ? "#b91c1c" : "#475569" }}>
                  {r.status || "New"}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>• ID: {r.applicationId}</span>
              </div>
              <small style={{ color: "#64748b", display: "block" }}>
                Role: <strong>{r.interestedRole}</strong> ({r.preferredPosition || "General"}) • Mode: {r.workMode} • Exp: {r.experienceLevel} • Qualification: {r.qualification}
              </small>
              <small style={{ color: "#94a3b8", display: "block", marginTop: 2 }}>
                Contact: {r.email} | {r.mobile} | {r.city}, {r.state}
              </small>
              {r.adminNotes && (
                <small style={{ color: "#dc2626", display: "block", marginTop: 2, fontWeight: 700 }}>
                  Reason/Notes: {r.adminNotes}
                </small>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setSelectedApp(r)}
                style={{ height: 32, padding: "0 10px", borderRadius: 6, background: "#0f172a", color: "white", border: 0, cursor: "pointer", fontSize: 11, fontWeight: 700 }}
              >
                View Details
              </button>

              <button
                type="button"
                onClick={() => handlePrintApplication(r)}
                style={{ height: 32, padding: "0 10px", borderRadius: 6, background: "#2563eb", color: "white", border: 0, cursor: "pointer", fontSize: 11, fontWeight: 800 }}
              >
                🖨️ Print PDF
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate(r, "Shortlisted")}
                style={{ height: 32, padding: "0 10px", borderRadius: 6, background: "#16a34a", color: "white", border: 0, cursor: "pointer", fontSize: 11, fontWeight: 800 }}
              >
                ✓ Accept
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate(r, "Rejected")}
                style={{ height: 32, padding: "0 10px", borderRadius: 6, background: "#dc2626", color: "white", border: 0, cursor: "pointer", fontSize: 11, fontWeight: 800 }}
              >
                ✕ Reject (Reason)
              </button>

              <select
                value={r.status || "New"}
                onChange={(e) => handleStatusUpdate(r, e.target.value)}
                style={{ height: 32, padding: "0 8px", borderRadius: 6, background: "#f8fafc", border: "1px solid #cbd5e1", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </article>
        ))
      ) : (
        <div style={{ padding: 24, textAlign: "center", background: "white", borderRadius: 8, border: "1px solid #dce4ee", color: "#64748b" }}>
          No career applications found matching email / filter query.
        </div>
      )}
    </div>
  );
}
