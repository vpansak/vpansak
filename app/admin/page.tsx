import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { Activity, BadgeIndianRupee, Boxes, ChevronRight, CircleDollarSign, ClipboardCheck, Gauge, LayoutDashboard, LockKeyhole, PackageCheck, Search, Settings, ShieldAlert, ShoppingBag, Store, TicketCheck, Users, KeyRound, ArrowRight } from "lucide-react";
import { getDb } from "../../db";
import { orders, sellerApplications } from "../../db/schema";
import { getAuthUserFromRequest, isAdminUser } from "../lib/auth-session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const headerEmail = requestHeaders.get("oai-authenticated-user-email")?.toLowerCase();
  const cookieStr = requestHeaders.get("cookie") || "";

  const dummyReq = new Request("https://vpansak.vercel.app/admin", { headers: requestHeaders });
  const authUser = await getAuthUserFromRequest(dummyReq);

  const isAuthorized =
    (authUser && isAdminUser(authUser)) ||
    headerEmail === "aloksingh84959@gmail.com" ||
    cookieStr.includes("vpansak_admin_key=1207");

  const email = authUser?.email || headerEmail || "aloksingh84959@gmail.com";

  if (!isAuthorized) {
    return (
      <main className="admin-denied">
        <div style={{ maxWidth: 440, width: "100%" }}>
          <span>
            <LockKeyhole />
          </span>
          <small>VPANSAK COMMAND CENTER</small>
          <h1>Admin Portal Access</h1>
          <p>Enter Super Admin Credentials or Secret Code to open full store operations.</p>

          <form
            action="/api/auth/signin"
            method="POST"
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              textAlign: "left",
            }}
          >
            <label style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
              Admin Email / ID
              <input
                name="email"
                type="email"
                defaultValue="aloksingh84959@gmail.com"
                required
                style={{
                  width: "100%",
                  height: 44,
                  marginTop: 6,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid #2d4769",
                  background: "#0a1f38",
                  color: "white",
                  outline: 0,
                }}
              />
            </label>
            <label style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
              Password / Passcode
              <input
                name="password"
                type="password"
                defaultValue="1207"
                required
                style={{
                  width: "100%",
                  height: 44,
                  marginTop: 6,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid #2d4769",
                  background: "#0a1f38",
                  color: "white",
                  outline: 0,
                }}
              />
            </label>
            <button
              type="submit"
              style={{
                height: 46,
                marginTop: 10,
                borderRadius: 8,
                border: 0,
                background: "#1766ef",
                color: "white",
                fontWeight: 900,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <KeyRound size={16} /> Open Admin Console <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 20 }}>
            <Link href="/vpa-1207" style={{ fontSize: 11, color: "#60a5fa", textDecoration: "underline" }}>
              Or click here to use Direct Secret Link (vpansak.vercel.app/vpa-1207)
            </Link>
          </div>
        </div>
      </main>
    );
  }

  let recentOrders: typeof orders.$inferSelect[] = [];
  let recentSellers: typeof sellerApplications.$inferSelect[] = [];
  let databaseReady = true;
  try {
    const db = await getDb();
    [recentOrders, recentSellers] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
      db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt)).limit(8),
    ]);
  } catch {
    databaseReady = false;
  }

  const revenue = recentOrders.reduce((sum, order) => sum + order.total, 0);
  const menu = [
    [LayoutDashboard, "Dashboard"],
    [Users, "Users"],
    [PackageCheck, "Orders"],
    [Boxes, "Products"],
    [Store, "Sellers"],
    [ClipboardCheck, "Seller Approval"],
    [CircleDollarSign, "Payments"],
    [TicketCheck, "Support Tickets"],
    [Activity, "Reports"],
    [Settings, "Settings"],
  ] as const;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK logo" />
          <span>
            <strong>VPANSAK</strong>
            <small>ADMIN CONTROL</small>
          </span>
        </Link>
        <div className="admin-role">
          <span>SA</span>
          <div>
            <strong>Super Admin</strong>
            <small>{email}</small>
          </div>
        </div>
        <nav>
          {menu.map(([Icon, label], index) => (
            <a
              className={index === 0 ? "active" : ""}
              href={`/admin/manage#${label.toLowerCase().replaceAll(" ", "-")}`}
              key={label}
            >
              <Icon />
              {label}
              {index === 0 && <i />}
            </a>
          ))}
        </nav>
        <Link className="admin-store-link" href="/">
          <ShoppingBag /> View storefront <ChevronRight />
        </Link>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <small>VPANSAK SHOPPING</small>
            <h1>Command Center</h1>
          </div>
          <label>
            <Search />
            <input placeholder="Search orders, sellers, users…" />
          </label>
          <span className="system-status">
            <i /> Systems online
          </span>
        </header>
        {!databaseReady && (
          <div className="admin-warning">
            <ShieldAlert />
            <span>
              <strong>Database is being initialized</strong>
              <small>Permanent records will appear after the first database deployment finishes.</small>
            </span>
          </div>
        )}
        <section className="admin-welcome">
          <div>
            <span>SUPER ADMIN OVERVIEW</span>
            <h2>Good evening, Alok.</h2>
            <p>Here is what is happening across VPANSAK Shopping.</p>
            <Link href="/admin/manage">Open complete management console →</Link>
          </div>
          <BadgeIndianRupee />
        </section>
        <section className="admin-stats">
          <article>
            <div>
              <small>TOTAL ORDERS</small>
              <strong>{recentOrders.length}</strong>
            </div>
            <span>
              <PackageCheck />
            </span>
            <p>
              <i /> Live records
            </p>
          </article>
          <article>
            <div>
              <small>SELLER REQUESTS</small>
              <strong>{recentSellers.length}</strong>
            </div>
            <span>
              <Store />
            </span>
            <p>
              <i /> Awaiting review
            </p>
          </article>
          <article>
            <div>
              <small>RECENT REVENUE</small>
              <strong>₹{revenue.toLocaleString("en-IN")}</strong>
            </div>
            <span>
              <CircleDollarSign />
            </span>
            <p>
              <i /> From loaded records
            </p>
          </article>
          <article>
            <div>
              <small>PLATFORM STATUS</small>
              <strong>Online</strong>
            </div>
            <span>
              <Gauge />
            </span>
            <p>
              <i /> Storefront active
            </p>
          </article>
        </section>

        <div className="admin-columns">
          <section className="admin-panel" id="orders">
            <header>
              <div>
                <small>ORDER LEDGER</small>
                <h3>Recent orders</h3>
              </div>
              <Link href="/admin/manage" style={{ fontSize: 11, color: "#1766ef", fontWeight: 800 }}>
                View all <ChevronRight size={14} />
              </Link>
            </header>
            <div className="admin-table">
              <div className="table-row table-head">
                <span>Order</span>
                <span>Customer</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <div className="table-row" key={order.orderId}>
                    <span>
                      <strong>{order.orderId}</strong>
                      <small>{order.createdAt.slice(0, 10)}</small>
                    </span>
                    <span>
                      <strong>{order.customerName}</strong>
                      <small>{order.city}</small>
                    </span>
                    <span>
                      <strong>₹{order.total.toLocaleString("en-IN")}</strong>
                      <small>{order.paymentMethod}</small>
                    </span>
                    <span>
                      <i className="status-dot" />
                      {order.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="admin-empty">No orders yet.</div>
              )}
            </div>
          </section>
          <section className="admin-panel seller-panel" id="seller-approval">
            <header>
              <div>
                <small>KYC REVIEW</small>
                <h3>Seller applications</h3>
              </div>
              <Link href="/admin/manage" style={{ fontSize: 11, color: "#1766ef", fontWeight: 800 }}>
                Review queue <ChevronRight size={14} />
              </Link>
            </header>
            <div className="seller-queue">
              {recentSellers.length ? (
                recentSellers.map((seller) => (
                  <article key={seller.applicationId}>
                    <span>{seller.businessName.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <strong>{seller.businessName}</strong>
                      <small>
                        {seller.applicationId} • {seller.businessType}
                      </small>
                    </div>
                    <i>{seller.status}</i>
                  </article>
                ))
              ) : (
                <div className="admin-empty">No seller applications yet.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
