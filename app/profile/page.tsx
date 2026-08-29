"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Box,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Gift,
  Headphones,
  Heart,
  Home,
  KeyRound,
  Layers,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  PackageCheck,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Suspense, ChangeEvent } from "react";
import { catalogProducts } from "../lib/catalog";

type UserRecord = {
  id: number;
  email: string;
  fullName: string;
  mobile: string;
  role: string;
  profileImage: string | null;
  emailVerified: boolean;
  accountStatus: string;
  authProvider: string;
  createdAt: string;
};

type AddressItem = {
  id: number;
  label: string;
  fullName: string;
  mobile: string;
  line1: string;
  city: string;
  state: string;
  pinCode: string;
  isPrimary: boolean;
};

type OrderItem = {
  orderId: string;
  total: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  customerName?: string;
  mobile?: string;
  address?: string;
  city?: string;
  pinCode?: string;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type ReviewItem = {
  id: number;
  productId: string;
  displayName: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  createdAt: string;
};

type TicketItem = {
  ticketId: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
};

type SellerApp = {
  applicationId: string;
  businessName: string;
  status: string;
  createdAt: string;
};

type AccountData = {
  email: string;
  user: UserRecord;
  profile: { fullName: string; mobile: string; avatarUrl?: string } | null;
  addresses: AddressItem[];
  wishlist: Array<{ id: number; productId: string }>;
  cart: Array<{ id: number; productId: string; quantity: number }>;
  orders: OrderItem[];
  notifications: NotificationItem[];
  reviews?: ReviewItem[];
  tickets?: TicketItem[];
  sellerApp?: SellerApp | null;
};

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

const maskMobile = (mobile: string) => {
  const clean = mobile.replace(/\D/g, "");
  if (clean.length < 10) return mobile || "Not set";
  return `******${clean.slice(-4)}`;
};

let globalAccountCache: AccountData | null = null;

export function ProfileContent({ paramsTab }: { paramsTab?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTabFromUrl = paramsTab || searchParams.get("tab") || "overview";
  const [tab, setTab] = useState(activeTabFromUrl);

  useEffect(() => {
    if (paramsTab) setTab(paramsTab);
    else if (searchParams.get("tab")) setTab(searchParams.get("tab")!);
  }, [paramsTab, searchParams]);

  const [data, setData] = useState<AccountData | null>(globalAccountCache);
  const [loading, setLoading] = useState<boolean>(!globalAccountCache);
  const [unauthorized, setUnauthorized] = useState(false);
  const [message, setMessage] = useState("");

  // Modals & Sub-states
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vpansak-recently-viewed");
      if (stored) setRecentlyViewed(JSON.parse(stored));
    } catch {}
  }, []);

  const handleAvatarFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultUrl = String(event.target.result);
          setAvatarPreview(resultUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadAccount = useCallback(async () => {
    if (!globalAccountCache) setLoading(true);
    try {
      const res = await fetch("/api/account");
      if (res.status === 401) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      const val = await res.json();
      if (res.ok) {
        globalAccountCache = val;
        setData(val);
      } else {
        setMessage(val.error || "Could not load account details");
      }
    } catch {
      setMessage("Could not load account details");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const runAction = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const val = await res.json();
      if (res.ok) {
        setMessage(val.message || "Updated successfully!");
        await loadAccount();
        setEditModalOpen(false);
      } else {
        setMessage(val.error || "Could not complete request");
      }
    } catch {
      setMessage("Failed to submit request");
    }
  };

  const wishProducts = useMemo(
    () => data?.wishlist.map((item) => catalogProducts.find((p) => p.id === item.productId)).filter(Boolean) || [],
    [data]
  );

  const cartProducts = useMemo(
    () =>
      data?.cart
        .map((item) => ({ item, product: catalogProducts.find((p) => p.id === item.productId) }))
        .filter((row) => row.product) || [],
    [data]
  );

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    let list = [...data.orders];
    if (orderFilter === "active") list = list.filter((o) => !["Delivered", "Cancelled", "Returned"].includes(o.status));
    else if (orderFilter === "delivered") list = list.filter((o) => o.status === "Delivered");
    else if (orderFilter === "cancelled") list = list.filter((o) => o.status === "Cancelled");

    if (orderSearch.trim()) {
      const q = orderSearch.trim().toLowerCase();
      list = list.filter((o) => o.orderId.toLowerCase().includes(q));
    }
    return list;
  }, [data?.orders, orderFilter, orderSearch]);

  const changeTab = (nextTab: string) => {
    setTab(nextTab);
    const basePath = pathname && pathname.startsWith("/account") ? "/account" : "/profile";
    const targetUrl = `${basePath}${nextTab === "overview" ? "" : `/${nextTab}`}`;
    if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
      window.history.pushState(null, "", targetUrl);
    }
  };

  const subPageTitleMap: Record<string, { title: string; subtitle: string; category: string }> = {
    orders: { title: "My Orders", subtitle: "Track, return and manage your purchase history", category: "PURCHASE HISTORY" },
    wishlist: { title: "My Wishlist", subtitle: "Your saved products and price drop updates", category: "SAVED ITEMS" },
    cart: { title: "Saved Cart", subtitle: "Items added to your persistent shopping cart", category: "SHOPPING CART" },
    "recently-viewed": { title: "Recently Viewed", subtitle: "Products you recently inspected", category: "BROWSING HISTORY" },
    reviews: { title: "Product Reviews", subtitle: "Ratings and reviews submitted by you", category: "MY FEEDBACK" },
    addresses: { title: "Address Book", subtitle: "Manage your delivery and billing addresses", category: "DELIVERY ADDRESSES" },
    edit: { title: "Edit Profile", subtitle: "Update your full name, mobile number and photo", category: "PERSONAL INFORMATION" },
    security: { title: "Account Security", subtitle: "Password settings and active authentication sessions", category: "ACCOUNT PROTECTION" },
    payments: { title: "Payments & Refunds", subtitle: "Online payment logs and refund status", category: "TRANSACTION HISTORY" },
    coupons: { title: "Coupons & Offers", subtitle: "Redeem promotional codes and view gift vouchers", category: "OFFERS & PROMOS" },
    notifications: { title: "Notifications", subtitle: "Account alerts and order status notifications", category: "INBOX" },
    support: { title: "Support Tickets", subtitle: "Customer support tickets and resolution center", category: "HELP CENTRE" },
    seller: { title: "Seller Dashboard", subtitle: "Merchant application and seller portal", category: "MERCHANT ECOSYSTEM" },
    privacy: { title: "Privacy & Data", subtitle: "Export your account data or manage privacy preferences", category: "DATA CONTROL" },
  };

  if (loading) {
    return (
      <main className="account-loading-skeleton">
        <div className="skeleton-container">
          <div className="skeleton-card header" />
          <div className="skeleton-grid">
            <div className="skeleton-sidebar" />
            <div className="skeleton-main" />
          </div>
        </div>
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="account-signin">
        <div>
          <img src="/vpansak-logo-light.jpeg" alt="VPANSAK" />
          <small>SECURE CUSTOMER ACCOUNT</small>
          <h1>Sign in to view your profile.</h1>
          <p>Your orders, saved addresses, wishlist and account settings remain protected.</p>
          <Link
            href={`/login?return_to=${encodeURIComponent(pathname || "/profile")}`}
            className="account-signin-button"
          >
            <LogIn /> Sign in securely
          </Link>
          <Link href="/">Continue browsing store</Link>
          <span>
            <ShieldCheck /> Protected VPANSAK identity
          </span>
        </div>
      </main>
    );
  }

  const user = data?.user || {
    id: 1,
    email: data?.email || "",
    fullName: data?.profile?.fullName || "",
    mobile: data?.profile?.mobile || "",
    role: "customer",
    profileImage: null,
    emailVerified: true,
    accountStatus: "active",
    authProvider: "email",
    createdAt: new Date().toISOString(),
  };

  const isAdminUser =
    user.email.toLowerCase() === "aloksingh84959@gmail.com" ||
    ["admin", "superadmin", "founder", "officer", "cofounder"].includes(user.role?.toLowerCase() || "");

  const initials = (user.fullName || user.email || "VP")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="profile-dashboard-page">
      {message && (
        <div className="profile-toast-bar">
          <Sparkles />
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>MY ACCOUNT</small>
          </span>
        </Link>
        <nav>
          {isAdminUser && (
            <Link href="/7380869635" className="header-admin-btn">
              <ShieldAlert size={14} /> Admin Hub Console
            </Link>
          )}
          <Link href="/">
            <Home size={15} /> Store
          </Link>
          <Link href="/track">
            <PackageCheck size={15} /> Track Order
          </Link>
          <button
            onClick={() => (window.location.href = "/signout?return_to=%2Flogin")}
            className="header-logout-btn"
          >
            <LogOut size={14} /> Log Out
          </button>
        </nav>
      </header>

      <div className="profile-shell">
        {/* OVERVIEW DASHBOARD VIEW */}
        {tab === "overview" ? (
          <>
            {/* TOP PROFILE CARD */}
            <section className="top-profile-card">
              <div className="profile-avatar-wrap">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} className="profile-avatar-img" />
                ) : (
                  <span className="profile-avatar-initials">{initials}</span>
                )}
                <button
                  type="button"
                  className="avatar-edit-badge"
                  onClick={() => changeTab("edit")}
                  title="Edit Profile"
                >
                  <UserCheck size={14} />
                </button>
              </div>

              <div className="profile-details-column">
                <div className="profile-name-row">
                  <h2>{user.fullName || user.email.split("@")[0]}</h2>
                  {isAdminUser ? (
                    <span className="badge-admin-superuser">
                      <ShieldAlert size={12} /> {user.email.toLowerCase() === "aloksingh84959@gmail.com" ? "Admin Superuser (Alok Singh)" : `${(user.role || "Officer").toUpperCase()} Account`}
                    </span>
                  ) : (
                    <span className="badge-active">
                      <CheckCircle2 size={12} /> Active Account
                    </span>
                  )}
                  {user.emailVerified && (
                    <span className="badge-verified">
                      <ShieldCheck size={12} /> Verified Account
                    </span>
                  )}
                </div>

                <div className="profile-meta-grid">
                  <span>
                    <UserRound size={13} /> <b>Email:</b> {user.email || "Not provided"}
                  </span>
                  <span>
                    <UserCheck size={13} /> <b>Mobile:</b> {user.mobile || "Not set"}
                  </span>
                  <span>
                    <Clock size={13} /> <b>Member since:</b> {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              <button type="button" className="edit-profile-btn" onClick={() => changeTab("edit")}>
                <UserRound size={15} /> Edit Profile
              </button>
            </section>

            {/* QUICK ACTIONS GRID */}
            <section className="quick-actions-grid">
              <button type="button" className="quick-action-card" onClick={() => changeTab("orders")}>
                <Box className="qa-icon blue" />
                <div>
                  <strong>My Orders</strong>
                  <small>{data?.orders.length || 0} Total Orders</small>
                </div>
                <ChevronRight size={16} />
              </button>

              <button type="button" className="quick-action-card" onClick={() => changeTab("wishlist")}>
                <Heart className="qa-icon red" />
                <div>
                  <strong>Wishlist</strong>
                  <small>{data?.wishlist.length || 0} Saved Items</small>
                </div>
                <ChevronRight size={16} />
              </button>

              <button type="button" className="quick-action-card" onClick={() => changeTab("addresses")}>
                <MapPin className="qa-icon green" />
                <div>
                  <strong>Saved Addresses</strong>
                  <small>{data?.addresses.length || 0} Saved</small>
                </div>
                <ChevronRight size={16} />
              </button>

              <button type="button" className="quick-action-card" onClick={() => changeTab("support")}>
                <Headphones className="qa-icon orange" />
                <div>
                  <strong>Support Tickets</strong>
                  <small>{data?.tickets?.length || 0} Tickets</small>
                </div>
                <ChevronRight size={16} />
              </button>
            </section>

            {/* RECENT ACTIVITY & PRIMARY ADDRESS */}
            <div className="overview-cards-row">
              <article className="overview-card">
                <header>
                  <h3>Recent Orders</h3>
                  <button onClick={() => changeTab("orders")}>View all orders &rarr;</button>
                </header>
                {data?.orders.length ? (
                  data.orders.slice(0, 3).map((order) => (
                    <div className="overview-order-item" key={order.orderId}>
                      <div>
                        <strong>{order.orderId}</strong>
                        <small>{new Date(order.createdAt).toLocaleDateString("en-IN")}</small>
                      </div>
                      <span className="status-pill">{order.status}</span>
                      <b>{money(order.total)}</b>
                      <button onClick={() => setSelectedOrder(order)}>Details</button>
                    </div>
                  ))
                ) : (
                  <div className="pane-empty">
                    <Box size={32} />
                    <h4>No orders placed yet</h4>
                    <Link href="/">Start shopping</Link>
                  </div>
                )}
              </article>

              <article className="overview-card">
                <header>
                  <h3>Primary Address</h3>
                  <button onClick={() => changeTab("addresses")}>Manage &rarr;</button>
                </header>
                {data?.addresses.find((a) => a.isPrimary) ? (
                  (() => {
                    const pa = data.addresses.find((a) => a.isPrimary)!;
                    return (
                      <div className="primary-address-view">
                        <strong>{pa.label}</strong> • {pa.fullName}
                        <p>{pa.line1}</p>
                        <p>
                          {pa.city}, {pa.state} — {pa.pinCode}
                        </p>
                        <small>Mobile: {pa.mobile}</small>
                      </div>
                    );
                  })()
                ) : (
                  <div className="pane-empty">
                    <MapPin size={32} />
                    <h4>No primary address set</h4>
                    <button onClick={() => changeTab("addresses")}>Add Address</button>
                  </div>
                )}
              </article>
            </div>

            {/* ACCOUNT NAVIGATION HUB GRID */}
            <section className="hub-section">
              <div className="hub-section-title">
                <h3>Account Quick Hub</h3>
                <p>Click any section below to open its dedicated page</p>
              </div>
              <div className="hub-grid">
                {isAdminUser && (
                  <Link href="/7380869635" className="hub-card admin-hub-special-card">
                    <div className="hub-card-icon admin-gold"><ShieldAlert size={20} /></div>
                    <div className="hub-card-info">
                      <strong>VPANSAK Admin Hub</strong>
                      <small>Superuser System Portal &amp; Management</small>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                )}

                <button type="button" className="hub-card" onClick={() => changeTab("edit")}>
                  <div className="hub-card-icon"><UserRound size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Edit Profile</strong>
                    <small>Personal &amp; contact info</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("addresses")}>
                  <div className="hub-card-icon"><MapPin size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Address Book</strong>
                    <small>{data?.addresses.length || 0} Saved addresses</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("security")}>
                  <div className="hub-card-icon"><Lock size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Account Security</strong>
                    <small>Password &amp; authentication</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("payments")}>
                  <div className="hub-card-icon"><CreditCard size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Payments &amp; Refunds</strong>
                    <small>Transactions &amp; refunds</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("coupons")}>
                  <div className="hub-card-icon"><Tag size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Coupons &amp; Offers</strong>
                    <small>Discount promos &amp; cards</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("notifications")}>
                  <div className="hub-card-icon"><Bell size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Notifications</strong>
                    <small>System &amp; order alerts</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("reviews")}>
                  <div className="hub-card-icon"><Star size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Product Reviews</strong>
                    <small>Your ratings &amp; feedback</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("seller")}>
                  <div className="hub-card-icon"><Store size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Seller Portal</strong>
                    <small>Become a merchant</small>
                  </div>
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="hub-card" onClick={() => changeTab("privacy")}>
                  <div className="hub-card-icon"><ShieldCheck size={20} /></div>
                  <div className="hub-card-info">
                    <strong>Privacy &amp; Data</strong>
                    <small>Data export &amp; privacy</small>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          </>
        ) : (
          /* DEDICATED SUBPAGE VIEW */
          <>
            <header className="subpage-header-bar">
              <div className="subpage-header-top">
                <button type="button" onClick={() => changeTab("overview")} className="btn-back-dashboard">
                  <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="subpage-header-title">
                  <small>{subPageTitleMap[tab]?.category || "ACCOUNT SECTION"}</small>
                  <h1>{subPageTitleMap[tab]?.title || "Account Details"}</h1>
                  <p>{subPageTitleMap[tab]?.subtitle || "Manage your account settings in one place."}</p>
                </div>
              </div>

              {/* HORIZONTAL QUICK TABS NAV */}
              <nav className="subpage-tabs-nav">
                {isAdminUser && (
                  <Link href="/vpa-admin" className="admin-tab-nav-btn">
                    <ShieldAlert size={15} /> Admin Hub
                  </Link>
                )}
                <button className={tab === "overview" ? "active" : ""} onClick={() => changeTab("overview")}>
                  <Home size={15} /> Dashboard
                </button>
                <button className={tab === "orders" ? "active" : ""} onClick={() => changeTab("orders")}>
                  <Box size={15} /> My Orders
                </button>
                <button className={tab === "wishlist" ? "active" : ""} onClick={() => changeTab("wishlist")}>
                  <Heart size={15} /> Wishlist
                </button>
                <button className={tab === "addresses" ? "active" : ""} onClick={() => changeTab("addresses")}>
                  <MapPin size={15} /> Addresses
                </button>
                <button className={tab === "edit" ? "active" : ""} onClick={() => changeTab("edit")}>
                  <UserRound size={15} /> Edit Profile
                </button>
                <button className={tab === "security" ? "active" : ""} onClick={() => changeTab("security")}>
                  <Lock size={15} /> Security
                </button>
                <button className={tab === "payments" ? "active" : ""} onClick={() => changeTab("payments")}>
                  <CreditCard size={15} /> Payments
                </button>
                <button className={tab === "coupons" ? "active" : ""} onClick={() => changeTab("coupons")}>
                  <Tag size={15} /> Coupons
                </button>
                <button className={tab === "notifications" ? "active" : ""} onClick={() => changeTab("notifications")}>
                  <Bell size={15} /> Notifications
                </button>
                <button className={tab === "support" ? "active" : ""} onClick={() => changeTab("support")}>
                  <Headphones size={15} /> Support
                </button>
                <button className={tab === "seller" ? "active" : ""} onClick={() => changeTab("seller")}>
                  <Store size={15} /> Seller
                </button>
                <button className={tab === "privacy" ? "active" : ""} onClick={() => changeTab("privacy")}>
                  <ShieldCheck size={15} /> Privacy
                </button>
              </nav>
            </header>

            {/* DEDICATED FULL WIDTH CONTENT REGION */}
            <section className="profile-dedicated-content">
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>DASHBOARD OVERVIEW</small>
                  <h1>Welcome back, {user.fullName || user.email.split("@")[0]}</h1>
                  <p>Manage your orders, addresses, wishlist and security settings in one place.</p>
                </div>

                <div className="overview-cards-row">
                  <article className="overview-card">
                    <header>
                      <h3>Recent Orders</h3>
                      <button onClick={() => changeTab("orders")}>View all</button>
                    </header>
                    {data?.orders.length ? (
                      data.orders.slice(0, 3).map((order) => (
                        <div className="overview-order-item" key={order.orderId}>
                          <div>
                            <strong>{order.orderId}</strong>
                            <small>{new Date(order.createdAt).toLocaleDateString("en-IN")}</small>
                          </div>
                          <span className="status-pill">{order.status}</span>
                          <b>{money(order.total)}</b>
                          <button onClick={() => setSelectedOrder(order)}>Details</button>
                        </div>
                      ))
                    ) : (
                      <div className="pane-empty">
                        <Box size={32} />
                        <h4>No orders placed yet</h4>
                        <Link href="/">Start shopping</Link>
                      </div>
                    )}
                  </article>

                  <article className="overview-card">
                    <header>
                      <h3>Primary Address</h3>
                      <button onClick={() => changeTab("addresses")}>Manage</button>
                    </header>
                    {data?.addresses.find((a) => a.isPrimary) ? (
                      (() => {
                        const pa = data.addresses.find((a) => a.isPrimary)!;
                        return (
                          <div className="primary-address-view">
                            <strong>{pa.label}</strong> • {pa.fullName}
                            <p>{pa.line1}</p>
                            <p>
                              {pa.city}, {pa.state} — {pa.pinCode}
                            </p>
                            <small>Mobile: {pa.mobile}</small>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="pane-empty">
                        <MapPin size={32} />
                        <h4>No primary address set</h4>
                        <button onClick={() => changeTab("addresses")}>Add Address</button>
                      </div>
                    )}
                  </article>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === "orders" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>PURCHASE HISTORY</small>
                  <h1>My Orders</h1>
                </div>

                <div className="order-filter-bar">
                  <div className="search-box">
                    <Search size={15} />
                    <input
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search by Order ID (e.g. VPO123456)..."
                    />
                  </div>

                  <div className="filter-pills">
                    {["all", "active", "delivered", "cancelled"].map((f) => (
                      <button
                        key={f}
                        className={orderFilter === f ? "active" : ""}
                        onClick={() => setOrderFilter(f)}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="orders-list">
                  {filteredOrders.length ? (
                    filteredOrders.map((order) => (
                      <article className="order-card" key={order.orderId}>
                        <div className="order-card-header">
                          <div>
                            <strong>{order.orderId}</strong>
                            <small>Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}</small>
                          </div>
                          <span className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="order-card-body">
                          <div>
                            <small>PAYMENT METHOD</small>
                            <strong>{order.paymentMethod}</strong>
                          </div>
                          <div>
                            <small>TOTAL AMOUNT</small>
                            <b className="total-amount">{money(order.total)}</b>
                          </div>
                          <div className="order-actions">
                            <Link href={`/track?id=${order.orderId}`} className="btn-track">
                              <PackageCheck size={14} /> Track Order
                            </Link>
                            <button onClick={() => setSelectedOrder(order)} className="btn-details">
                              View Details
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="pane-empty">
                      <Box size={40} />
                      <h3>No orders found</h3>
                      <p>You haven&apos;t placed any matching orders yet.</p>
                      <Link href="/">Explore Marketplace</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {tab === "wishlist" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>SAVED ITEMS</small>
                  <h1>My Wishlist</h1>
                </div>

                {wishProducts.length ? (
                  <div className="products-grid">
                    {wishProducts.map(
                      (p) =>
                        p && (
                          <article className="product-item-card" key={p.id}>
                            <img src={p.imageUrl} alt={p.name} />
                            <div className="product-item-info">
                              <small>{p.category}</small>
                              <h3>{p.name}</h3>
                              <strong>{money(p.price)}</strong>
                              <Link href={`/product/${p.id}`} className="btn-view">
                                View Product
                              </Link>
                            </div>
                            <button
                              type="button"
                              className="btn-remove-wish"
                              onClick={() => runAction({ action: "wishlist", productId: p.id })}
                              title="Remove from wishlist"
                            >
                              <Trash2 size={16} />
                            </button>
                          </article>
                        )
                    )}
                  </div>
                ) : (
                  <div className="pane-empty">
                    <Heart size={40} />
                    <h3>Your wishlist is empty</h3>
                    <p>Save items you like to track prices and availability.</p>
                    <Link href="/">Discover Products</Link>
                  </div>
                )}
              </div>
            )}

            {/* CART TAB */}
            {tab === "cart" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>PERSISTENT SHOPPING CART</small>
                  <h1>Saved Cart</h1>
                </div>

                {cartProducts.length ? (
                  <div className="products-grid">
                    {cartProducts.map(
                      ({ item, product }) =>
                        product && (
                          <article className="product-item-card" key={product.id}>
                            <img src={product.imageUrl} alt={product.name} />
                            <div className="product-item-info">
                              <small>Quantity: {item.quantity}</small>
                              <h3>{product.name}</h3>
                              <strong>{money(product.price * item.quantity)}</strong>
                              <Link href={`/product/${product.id}`} className="btn-view">
                                View Product
                              </Link>
                            </div>
                            <button
                              type="button"
                              className="btn-remove-wish"
                              onClick={() => runAction({ action: "cart", productId: product.id, quantity: 0 })}
                            >
                              <Trash2 size={16} />
                            </button>
                          </article>
                        )
                    )}
                  </div>
                ) : (
                  <div className="pane-empty">
                    <ShoppingCart size={40} />
                    <h3>Your saved cart is empty</h3>
                    <Link href="/">Start Shopping</Link>
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {tab === "addresses" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>DELIVERY ADDRESSES</small>
                  <h1>Address Book</h1>
                </div>

                <div className="address-section">
                  <form
                    className="add-address-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      runAction({
                        action: "address",
                        label: f.get("label"),
                        fullName: f.get("fullName"),
                        mobile: f.get("mobile"),
                        line1: f.get("line1"),
                        city: f.get("city"),
                        state: f.get("state"),
                        pinCode: f.get("pinCode"),
                        isPrimary: f.get("isPrimary") === "on",
                      });
                      e.currentTarget.reset();
                    }}
                  >
                    <h3>
                      <Plus size={18} /> Add New Address
                    </h3>
                    <div className="form-grid-2">
                      <label>
                        Label (e.g. Home, Work)
                        <input name="label" required maxLength={30} placeholder="Home" />
                      </label>
                      <label>
                        Full Name
                        <input name="fullName" required maxLength={100} placeholder="Full Name" />
                      </label>
                      <label>
                        Mobile Number
                        <input
                          name="mobile"
                          required
                          pattern="[6-9][0-9]{9}"
                          maxLength={10}
                          placeholder="10-digit mobile"
                        />
                      </label>
                      <label>
                        PIN Code
                        <input name="pinCode" required pattern="[0-9]{6}" maxLength={6} placeholder="6-digit PIN" />
                      </label>
                      <label className="wide">
                        House / Street Address
                        <input name="line1" required maxLength={250} placeholder="House no, area, street" />
                      </label>
                      <label>
                        City
                        <input name="city" required maxLength={80} placeholder="City" />
                      </label>
                      <label>
                        State
                        <input name="state" required maxLength={80} placeholder="State" />
                      </label>
                    </div>

                    <label className="checkbox-label">
                      <input type="checkbox" name="isPrimary" /> Set as primary delivery address
                    </label>

                    <button type="submit" className="btn-save-address">
                      <Save size={15} /> Save Address
                    </button>
                  </form>

                  <div className="addresses-list">
                    {data?.addresses.map((a) => (
                      <article className="address-card" key={a.id}>
                        <div className="address-card-header">
                          <strong>{a.label}</strong>
                          {a.isPrimary && <span className="primary-pill">PRIMARY</span>}
                        </div>
                        <h4>{a.fullName}</h4>
                        <p>{a.line1}</p>
                        <p>
                          {a.city}, {a.state} — {a.pinCode}
                        </p>
                        <p className="address-mobile">Mobile: {a.mobile}</p>
                        <button
                          type="button"
                          className="btn-delete-address"
                          onClick={() => setDeleteAddressId(a.id)}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {tab === "payments" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>TRANSACTION HISTORY</small>
                  <h1>Payments &amp; Refunds</h1>
                </div>

                <div className="payments-list">
                  {data?.orders.length ? (
                    data.orders.map((o) => (
                      <article className="payment-row-card" key={o.orderId}>
                        <CreditCard className="pay-icon" />
                        <div className="pay-details">
                          <strong>Order {o.orderId}</strong>
                          <small>Method: {o.paymentMethod} • {new Date(o.createdAt).toLocaleDateString("en-IN")}</small>
                        </div>
                        <span className="pay-status">{o.status === "Cancelled" ? "Refund Eligible" : "Paid"}</span>
                        <b className="pay-amount">{money(o.total)}</b>
                      </article>
                    ))
                  ) : (
                    <div className="pane-empty">
                      <CreditCard size={40} />
                      <h3>No transaction history</h3>
                      <p>Your online payments and refunds will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COUPONS TAB */}
            {tab === "coupons" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>OFFERS &amp; PROMOS</small>
                  <h1>Coupons &amp; Gift Cards</h1>
                </div>

                <div className="coupons-container">
                  <div className="coupon-redeem-card">
                    <Tag size={20} />
                    <div>
                      <h3>Verify Promo Code</h3>
                      <p>Enter any promo code below to check instant eligibility and discount value.</p>
                    </div>
                    <form
                      className="coupon-input-group"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.elements.namedItem("testCode") as HTMLInputElement)?.value.trim().toUpperCase();
                        if (!input) return;
                        fetch(`/api/coupons?code=${input}&total=1000`)
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.coupon) {
                              setMessage(`Coupon '${data.coupon.code}' is active! (${data.coupon.title})`);
                            } else {
                              setMessage(data.error || "Coupon is invalid or inactive.");
                            }
                          });
                      }}
                    >
                      <input name="testCode" placeholder="ENTER PROMO CODE" style={{ textTransform: "uppercase" }} required />
                      <button type="submit">Verify Code</button>
                    </form>
                  </div>

                  <div className="available-coupons-grid">
                    {[
                      { code: "RAKHI79", title: "₹79 OFF", min: "Min Order: ₹399 • Rakhi Special" },
                      { code: "RAKHI15", title: "15% OFF", min: "Min Order: ₹899 • Sibling Offer" },
                      { code: "SIBLING100", title: "₹100 OFF", min: "Min Order: ₹799 • Rakhi Mega" },
                      { code: "WELCOME50", title: "₹50 OFF", min: "Min Order: ₹499 • First order" },
                      { code: "VPANSAK100", title: "₹100 OFF", min: "Min Order: ₹999 • Storewide" },
                      { code: "FESTIVE200", title: "₹200 OFF", min: "Min Order: ₹1,999 • Rakshabandhan special" },
                    ].map((c) => (
                      <article className="coupon-item" key={c.code}>
                        <span>{c.code}</span>
                        <strong>{c.title}</strong>
                        <small>{c.min}</small>
                        <button
                          type="button"
                          className="btn-use-coupon"
                          onClick={() => {
                            navigator.clipboard?.writeText(c.code);
                            setMessage(`Coupon code '${c.code}' copied! Use it on Checkout.`);
                          }}
                        >
                          Copy Code
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {tab === "security" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>ACCOUNT PROTECTION</small>
                  <h1>Security Settings</h1>
                </div>

                <form
                  className="security-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const cp = String(f.get("currentPassword"));
                    const np = String(f.get("newPassword"));
                    const cnp = String(f.get("confirmPassword"));

                    if (np !== cnp) {
                      setMessage("New password and confirm password do not match");
                      return;
                    }
                    runAction({ action: "changePassword", currentPassword: cp, newPassword: np });
                    e.currentTarget.reset();
                  }}
                >
                  <h3>
                    <KeyRound size={18} /> Change Password
                  </h3>
                  <label>
                    Current Password
                    <input type="password" name="currentPassword" required />
                  </label>
                  <label>
                    New Password
                    <input type="password" name="newPassword" required minLength={6} />
                  </label>
                  <label>
                    Confirm New Password
                    <input type="password" name="confirmPassword" required minLength={6} />
                  </label>
                  <button type="submit" className="btn-update-password">
                    <Lock size={15} /> Update Password
                  </button>
                </form>

                <div className="security-session-info">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Active Login Session</strong>
                    <p>Current Browser • Authenticated Session Active</p>
                  </div>
                  <span className="badge-active">ACTIVE</span>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {tab === "notifications" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>INBOX</small>
                  <h1>Notifications</h1>
                </div>

                <div className="notifications-list">
                  {data?.notifications.length ? (
                    data.notifications.map((n) => (
                      <div className={`notification-item ${n.read ? "read" : "unread"}`} key={n.id}>
                        <Bell size={18} />
                        <div>
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <small>{new Date(n.createdAt).toLocaleString("en-IN")}</small>
                        </div>
                        {!n.read && (
                          <button onClick={() => runAction({ action: "readNotification", id: n.id })}>
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="pane-empty">
                      <Bell size={40} />
                      <h3>No notifications yet</h3>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EDIT PROFILE TAB */}
            {tab === "edit" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>PERSONAL INFORMATION</small>
                  <h1>Edit Profile</h1>
                </div>

                <form
                  className="profile-edit-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    runAction({
                      action: "profile",
                      fullName: f.get("fullName"),
                      mobile: f.get("mobile"),
                      avatarUrl: avatarPreview !== "" ? avatarPreview : user.profileImage || "",
                    });
                  }}
                >
                  <label>
                    Email Address (Read only)
                    <input value={user.email} disabled />
                  </label>

                  <label>
                    Full Name
                    <input name="fullName" defaultValue={user.fullName} required maxLength={100} />
                  </label>

                  <label>
                    Mobile Number
                    <input
                      name="mobile"
                      defaultValue={user.mobile}
                      required
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                    />
                  </label>

                  <div className="avatar-upload-field">
                    <label>Profile Photo</label>
                    <div className="avatar-upload-box">
                      <div className="avatar-preview-circle">
                        {avatarPreview || user.profileImage ? (
                          <img src={avatarPreview || user.profileImage!} alt={user.fullName} />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div className="avatar-upload-actions">
                        <label className="btn-choose-file">
                          <Upload size={15} /> Select Photo File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileSelect}
                            style={{ display: "none" }}
                          />
                        </label>
                        {(avatarPreview || user.profileImage) && (
                          <button
                            type="button"
                            className="btn-remove-photo"
                            onClick={() => setAvatarPreview("")}
                          >
                            Remove Photo
                          </button>
                        )}
                        <small>Choose any JPG, PNG or WEBP image file directly from your device.</small>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-save-profile">
                    <Save size={16} /> Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* RECENTLY VIEWED TAB */}
            {tab === "recently-viewed" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>BROWSING HISTORY</small>
                  <h1>Recently Viewed Products</h1>
                </div>

                {recentlyViewed.length ? (
                  <div>
                    <button
                      className="btn-clear-history"
                      onClick={() => {
                        localStorage.removeItem("vpansak-recently-viewed");
                        setRecentlyViewed([]);
                      }}
                    >
                      Clear History
                    </button>
                  </div>
                ) : (
                  <div className="pane-empty">
                    <Eye size={40} />
                    <h3>No recently viewed products</h3>
                    <Link href="/">Discover Products</Link>
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {tab === "reviews" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>MY FEEDBACK</small>
                  <h1>Product Reviews</h1>
                </div>

                {data?.reviews?.length ? (
                  <div className="reviews-list">
                    {data.reviews.map((r) => (
                      <article className="review-item-card" key={r.id}>
                        <div className="review-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < r.rating ? "#f59e0b" : "none"}
                              color="#f59e0b"
                            />
                          ))}
                          <span className="review-status">{r.status}</span>
                        </div>
                        <h4>{r.title}</h4>
                        <p>{r.body}</p>
                        <small>Submitted {new Date(r.createdAt).toLocaleDateString("en-IN")}</small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="pane-empty">
                    <Star size={40} />
                    <h3>No reviews submitted</h3>
                  </div>
                )}
              </div>
            )}

            {/* SELLER TAB */}
            {tab === "seller" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>MERCHANT ECOSYSTEM</small>
                  <h1>Seller Status</h1>
                </div>

                <div className="seller-status-box">
                  <Store size={36} />
                  {data?.sellerApp ? (
                    <div>
                      <h3>Application Status: {data.sellerApp.status}</h3>
                      <p>Business Name: {data.sellerApp.businessName}</p>
                      <p>Application ID: {data.sellerApp.applicationId}</p>
                    </div>
                  ) : (
                    <div>
                      <h3>Become a Verified Seller on VPANSAK</h3>
                      <p>Sell your products to thousands of customers across India.</p>
                      <Link href="/seller" className="btn-apply-seller">
                        Start Seller Application
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUPPORT TAB */}
            {tab === "support" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>HELP CENTRE</small>
                  <h1>Support Tickets</h1>
                </div>

                <div className="support-tickets-list">
                  {data?.tickets?.length ? (
                    data.tickets.map((t) => (
                      <div className="ticket-card" key={t.ticketId}>
                        <div>
                          <strong>{t.ticketId}</strong> • {t.subject}
                          <small>Category: {t.category}</small>
                        </div>
                        <span className="ticket-status">{t.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="pane-empty">
                      <Headphones size={40} />
                      <h3>No active support tickets</h3>
                      <Link href="/support">Open Support Ticket</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {tab === "privacy" && (
              <div className="tab-pane">
                <div className="pane-title">
                  <small>DATA CONTROL</small>
                  <h1>Privacy &amp; Data Settings</h1>
                </div>

                <div className="privacy-card-list">
                  <article className="privacy-card">
                    <ShieldCheck size={20} />
                    <div>
                      <strong>Download Account Data</strong>
                      <p>Download a copy of your verified profile details, addresses, and order history.</p>
                    </div>
                    <button onClick={() => setMessage("Account data download package prepared.")}>Download</button>
                  </article>

                  <article className="privacy-card danger">
                    <ShieldAlert size={20} />
                    <div>
                      <strong>Delete VPANSAK Account</strong>
                      <p>Permanently delete your account profile and credentials. Active orders cannot be deleted.</p>
                    </div>
                    <button onClick={() => setDeleteAccountModalOpen(true)}>Delete Account</button>
                  </article>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="vp-overlay centered" onMouseDown={() => setSelectedOrder(null)}>
          <div className="order-details-modal" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <small>ORDER DETAILS</small>
                <h2>{selectedOrder.orderId}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </header>
            <div className="order-modal-body">
              <div className="info-row">
                <span>Date: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}</span>
                <span>Status: <strong>{selectedOrder.status}</strong></span>
              </div>
              <div className="info-row">
                <span>Payment Method: {selectedOrder.paymentMethod}</span>
                <span>Total: <strong>{money(selectedOrder.total)}</strong></span>
              </div>
              <div className="modal-actions">
                <Link href={`/track?id=${selectedOrder.orderId}`} className="btn-primary">
                  <PackageCheck size={14} /> Full Track Page
                </Link>
                <button onClick={() => window.print()} className="btn-secondary">
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ADDRESS CONFIRMATION MODAL */}
      {deleteAddressId && (
        <div className="vp-overlay centered" onMouseDown={() => setDeleteAddressId(null)}>
          <div className="delete-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Remove Address</h3>
            <p>Are you sure you want to remove this saved address?</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteAddressId(null)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => {
                  runAction({ action: "deleteAddress", id: deleteAddressId });
                  setDeleteAddressId(null);
                }}
              >
                Remove Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="vp-overlay centered" onMouseDown={() => setEditModalOpen(false)}>
          <div className="profile-edit-modal" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <h3>Edit Profile</h3>
              <button onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                runAction({
                  action: "profile",
                  fullName: f.get("fullName"),
                  mobile: f.get("mobile"),
                  avatarUrl: avatarPreview !== "" ? avatarPreview : user.profileImage || "",
                });
              }}
            >
              <label>
                Full Name
                <input name="fullName" defaultValue={user.fullName} required maxLength={100} />
              </label>
              <label>
                Mobile Number
                <input
                  name="mobile"
                  defaultValue={user.mobile}
                  required
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                />
              </label>

              <div className="avatar-upload-field">
                <label>Profile Photo</label>
                <div className="avatar-upload-box">
                  <div className="avatar-preview-circle">
                    {avatarPreview || user.profileImage ? (
                      <img src={avatarPreview || user.profileImage!} alt={user.fullName} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="avatar-upload-actions">
                    <label className="btn-choose-file">
                      <Upload size={15} /> Select Photo File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        style={{ display: "none" }}
                      />
                    </label>
                    {(avatarPreview || user.profileImage) && (
                      <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={() => setAvatarPreview("")}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage({ paramsTab }: { paramsTab?: string }) {
  return (
    <Suspense
      fallback={
        <main className="account-loading-skeleton">
          <div className="skeleton-container">
            <p>Loading your VPANSAK profile…</p>
          </div>
        </main>
      }
    >
      <ProfileContent paramsTab={paramsTab} />
    </Suspense>
  );
}
