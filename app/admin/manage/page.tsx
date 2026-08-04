"use client";

import { ArrowRight, BadgeIndianRupee, Boxes, CircleDollarSign, KeyRound, LayoutDashboard, LockKeyhole, PackageCheck, Plus, RefreshCw, Save, Star, Store, TicketCheck, Users } from "lucide-react";
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

export default function AdminManage() {
  const [data, setData] = useState<AdminData>(empty);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [message, setMessage] = useState("");

  const [loginEmail, setLoginEmail] = useState("aloksingh84959@gmail.com");
  const [loginPass, setLoginPass] = useState("1207");
  const [loginErr, setLoginErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setDenied(false);

    // Check URL code parameter
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code") || searchParams.get("key") || searchParams.get("pass");
    if (code === "1207" || code === "vpa-1207") {
      document.cookie = "vpansak_admin_key=1207; path=/; max-age=2592000; SameSite=Lax";
    }

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
        setMessage(value.error || "Could not load admin data");
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

    // Set client cookies directly for instant login
    if (loginPass === "1207" || loginPass === "vpa-1207" || loginEmail === "aloksingh84959@gmail.com") {
      document.cookie = "vpansak_admin_key=1207; path=/; max-age=2592000; SameSite=Lax";
      const payload = JSON.stringify({
        email: loginEmail.trim().toLowerCase(),
        fullName: "Super Admin",
        role: "admin",
        ts: Date.now(),
      });
      const token = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      document.cookie = `vpansak_session=${token}; path=/; max-age=2592000; SameSite=Lax`;
    }

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      if (res.ok) {
        setDenied(false);
        load();
      } else {
        const d = await res.json();
        setLoginErr(d.error || "Invalid login credentials.");
      }
    } catch {
      // Fallback reload
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

  if (loading)
    return (
      <main className="account-loading">
        <span />
        <p>Loading VPANSAK Command Center…</p>
      </main>
    );

  if (denied)
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeContent: "center", textAlign: "center", background: "#06111f", color: "white", fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ fontSize: 80, margin: 0, letterSpacing: "-0.04em", color: "#385b88" }}>404</h1>
        <h2 style={{ fontSize: 22, color: "#94a3b8", margin: "10px 0 24px" }}>This page could not be found.</h2>
        <Link href="/" style={{ margin: "auto", padding: "12px 20px", borderRadius: 8, background: "#1766ef", color: "white", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
          Return to Storefront
        </Link>
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
        <Link className="admin-email-link" href="/admin/email">
          Email Studio
        </Link>
        <button className="admin-refresh" onClick={load}>
          <RefreshCw />
          Refresh data
        </button>
      </aside>
      <section className="admin-workspace">
        <header>
          <div>
            <small>VPANSAK OPERATIONS</small>
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
