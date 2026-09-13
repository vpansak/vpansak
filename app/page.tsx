"use client";

import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  CreditCard,
  Dumbbell,
  Gift,
  Gamepad2,
  Grid3X3,
  Headphones,
  Heart,
  HeartHandshake,
  Home,
  Laptop,
  LampDesk,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  PackageOpen,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  Sofa,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Store,
  ToyBrick,
  Tag,
  Trash2,
  Truck,
  UserRound,
  Utensils,
  Mail,
  WalletCards,
  X,
  Zap,
  Car,
  Watch,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatalogProduct, catalogProducts } from "./lib/catalog";

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const categories = [
  { name: "All Bottles", value: "All", icon: Grid3X3, color: "#edf2f8" },
  { name: "Core Series", value: "Core Series", icon: Utensils, color: "#e8f2ff" },
  { name: "Steel Series", value: "Steel Series", icon: ShieldCheck, color: "#eeeaff" },
  { name: "Travel Series", value: "Travel Series", icon: Car, color: "#fff0f3" },
  { name: "750ml Bottles", value: "750ml", icon: PackageCheck, color: "#fff3df" },
  { name: "1000ml Bottles", value: "1000ml", icon: PackageCheck, color: "#e9fbf4" },
  { name: "600ml Bottles", value: "600ml", icon: PackageCheck, color: "#fff0fa" },
];

const heroSlides = [
  {
    id: "vpansak-core-750",
    productId: "vpansak-core-750",
    title: "VPANSAK Water Bottle Collection",
    image: "/hero/vpansak-poster-bottles.png",
    alt: "VPANSAK COLLECTION — Premium Bottles for Every Journey",
    linkUrl: "/product/vpansak-core-750"
  },
  {
    id: "vpansak-desk-mat",
    productId: "vpansak-desk-mat",
    title: "VPANSAK Desk Essentials — Desk Mat",
    image: "/hero/vpansak-poster-desk.png",
    alt: "DESK ESSENTIALS — A Cleaner Desk. A Calmer Mind.",
    linkUrl: "/product/vpansak-desk-mat"
  },
  {
    id: "vpansak-laptop-sleeve",
    productId: "vpansak-laptop-sleeve",
    title: "VPANSAK Laptop Sleeve Collection",
    image: "/hero/vpansak-poster-sleeve.png",
    alt: "LAPTOP SLEEVE COLLECTION — Protect Your Tech. Carry Your Style.",
    linkUrl: "/product/vpansak-laptop-sleeve"
  }
];

function ProductCard({ product, wished, onWish, onAdd, authUser }: { product: CatalogProduct; wished: boolean; onWish: () => void; onAdd: () => void; authUser: unknown }) {
  const discount = Math.round((1 - product.price / product.mrp) * 100);
  const handleBuyNow = (e: React.MouseEvent) => {
    if (!authUser) {
      e.preventDefault();
      window.location.href = `/login?return_to=${encodeURIComponent(`/checkout?product=${product.id}&qty=1`)}`;
    }
  };
  return (
    <article className="vp-product-card">
      <div className="vp-product-media">
        {product.badge && <span className="vp-product-badge">{product.badge}</span>}
        <button className={wished ? "vp-wish active" : "vp-wish"} type="button" onClick={onWish} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><Heart fill={wished ? "currentColor" : "none"} /></button>
        <Link href={`/product/${product.id}`}><img src={product.imageUrl} alt={product.name} loading="lazy" /></Link>
      </div>
      <div className="vp-product-copy">
        <small>{product.brand}</small>
        <h3><Link href={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="vp-rating"><strong>{(product.rating / 10).toFixed(1)} ★</strong><span>{product.reviewCount.toLocaleString("en-IN")}</span><i><BadgeCheck /> Assured</i></div>
        <div className="vp-price"><strong>{money(product.price)}</strong><s>{money(product.mrp)}</s><span>{discount}% off</span></div>
        <p><Truck /> Free delivery in 2–4 days</p>
        <div className="vp-card-actions">
          <button type="button" onClick={onAdd}><ShoppingCart /> Add</button>
          <Link href={`/checkout?product=${product.id}&qty=1`} onClick={handleBuyNow}>Buy now</Link>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [usefulLinksOpen, setUsefulLinksOpen] = useState(false);
  const [usefulSearch, setUsefulSearch] = useState("");
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [hero, setHero] = useState(0);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [authUser, setAuthUser] = useState<{ email: string; fullName: string } | null>(null);

  // Mobile Touch Swipe state for Hero Carousel
  const touchStartX = useMemo(() => ({ current: null as number | null }), []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (data && data.user) {
          setAuthUser(data.user);
          const accRes = await fetch("/api/account");
          if (accRes.ok) {
            const accData = await accRes.json();
            if (Array.isArray(accData.cart)) {
              const userCartObj: Record<string, number> = {};
              for (const item of accData.cart) {
                if (item.productId && item.quantity > 0) {
                  userCartObj[item.productId] = item.quantity;
                }
              }
              setCart(userCartObj);
            }
            if (Array.isArray(accData.wishlist)) {
              const userWishlistArr = accData.wishlist.map((w: { productId: string }) => w.productId).filter(Boolean);
              setWishlist(userWishlistArr);
            }
          }
        } else {
          setAuthUser(null);
          setCart({});
          setWishlist([]);
        }
        setHydrated(true);
      })
      .catch(() => {
        setAuthUser(null);
        setCart({});
        setWishlist([]);
        setHydrated(true);
      });
  }, []);

  // Smooth Auto-slide timer for Hero Carousel
  useEffect(() => {
    if (isHoverPaused) return;
    const timer = window.setInterval(() => {
      setHero((value) => (value + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isHoverPaused]);

  const sideProducts = useMemo(() => {
    const p1 = catalogProducts.find(p => p.id === "vpansak-core-750") || catalogProducts[0];
    const p2 = catalogProducts.find(p => p.id === "vpansak-desk-mat") || catalogProducts[1];
    const p3 = catalogProducts.find(p => p.id === "vpansak-laptop-sleeve") || catalogProducts[2];
    return [p1, p2, p3];
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = catalogProducts.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const searchMatch = !query || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
    return [...rows].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : b.reviewCount - a.reviewCount);
  }, [category, search, sort]);

  const isInfoQuery = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ["info", "about", "vpansak", "founder", "seller", "refund", "return", "support", "contact", "company", "policy"].some((kw) => q.includes(kw));
  }, [search]);

  const suggestions = useMemo(() => search.trim().length > 1 ? catalogProducts.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [], [search]);
  const cartItems = catalogProducts.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const finalTotal = Math.max(0, subtotal - discount);
  const topOffers = catalogProducts.slice(0, 6);
  const trending = catalogProducts.slice(0, 6);
  const budget = catalogProducts.filter((product) => product.price < 1000).slice(0, 6);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };
  
  const addToCart = async (id: string) => {
    if (!authUser) {
      notify("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const nextQty = (cart[id] || 0) + 1;
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cart", productId: id, quantity: nextQty }),
      });
      if (res.ok) {
        setCart((prev) => ({ ...prev, [id]: nextQty }));
        notify("Added to your cart");
      } else {
        notify("Could not add to cart. Please try again.");
      }
    } catch {
      notify("Could not add to cart. Please check your connection.");
    }
  };

  const changeQuantity = async (id: string, change: number) => {
    if (!authUser) {
      notify("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const currentQty = cart[id] || 0;
    const nextQty = Math.max(0, currentQty + change);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cart", productId: id, quantity: nextQty }),
      });
      if (res.ok) {
        setCart((prev) => {
          const updated = { ...prev };
          if (nextQty <= 0) delete updated[id];
          else updated[id] = nextQty;
          return updated;
        });
      } else {
        notify("Could not update cart");
      }
    } catch {
      notify("Could not update cart");
    }
  };

  const toggleWishlist = async (id: string) => {
    if (!authUser) {
      notify("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const exists = wishlist.includes(id);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "wishlist", productId: id }),
      });
      if (res.ok) {
        setWishlist((prev) => (exists ? prev.filter((item) => item !== id) : [...prev, id]));
        notify(exists ? "Removed from wishlist" : "Saved to wishlist");
      } else {
        notify("Could not update wishlist");
      }
    } catch {
      notify("Could not update wishlist");
    }
  };

  const chooseCategory = (value: string) => { setCategory(value); setSearch(""); setMenuOpen(false); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); };

  const applyCoupon = async () => {
    const response = await fetch(`/api/coupons?code=${encodeURIComponent(coupon)}&total=${subtotal}`);
    const result = await response.json() as { coupon?: { discount: number }; error?: string };
    if (result.coupon) { setDiscount(result.coupon.discount); notify("Coupon discount applied!"); }
    else { notify(result.error || "Coupon could not be applied"); }
  };

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authUser) {
      notify("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerName: form.get("customerName"), mobile: form.get("mobile"), address: form.get("address"), city: form.get("city"), pinCode: form.get("pinCode"), paymentMethod: form.get("paymentMethod"), total: finalTotal, items: cartItems.map((product) => ({ productId: product.id, productName: product.name, price: product.price, quantity: cart[product.id] })) }) });
    const result = await response.json() as { order?: { orderId: string }; error?: string };
    if (!response.ok || !result.order) { notify(result.error || "Could not place order"); return; }
    
    for (const product of cartItems) {
      fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cart", productId: product.id, quantity: 0 }),
      }).catch(() => {});
    }

    setOrderPlaced(result.order.orderId); setCart({}); setDiscount(0); setCoupon(""); setCheckoutOpen(false);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const difference = currentY - lastY;

        if (currentY <= 15) {
          setIsCollapsed(false);
        } else if (difference > 10 && currentY > 60) {
          setIsCollapsed(true);
        } else if (difference < -10) {
          setIsCollapsed(false);
        }

        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentHero = heroSlides[hero];

  return (
    <main className="vp-store">
      {toast && <div className="vp-toast"><Sparkles /><span>{toast}</span></div>}

      <header className={`vp-header-shell ${isCollapsed ? "is-collapsed" : ""}`} id="top">
        <div className="mobile-header-collapsible">
          <div className="rakhi-banner-bar" style={{ background: "#081221" }}>
            <span>VPANSAK OFFICIAL STORE</span>
            <strong>Made for the Modern Life • 100% Genuine In-House Brand Products</strong>
            <b onClick={() => window.location.href = "/collections"} style={{ cursor: "pointer" }}>EXPLORE STORE →</b>
          </div>

          <div className="vp-brand-row">
            <Link className="vp-brand" href="/" aria-label="VPANSAK Official home">
              <img src="/vpansak-logo.png" alt="VPANSAK" />
              <span>
                <strong>VPANSAK</strong>
                <small>OFFICIAL STORE</small>
              </span>
            </Link>
            <button className="vp-location" type="button" onClick={() => notify("Express delivery across India")}><MapPin /><span><small>Delivering across</small>India</span><ChevronDown /></button>
            
            <div className="desktop-search-wrap">
              <div className="vp-search-wrap">
                <form className="vp-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search VPANSAK products & collections..." aria-label="Search products" /><button>Search</button></form>
                {(suggestions.length > 0 || isInfoQuery) && <div className="vp-suggestions"><small>SEARCH SUGGESTIONS</small>{isInfoQuery && <Link href="/info" style={{ background: "#edf4ff", borderLeft: "3px solid #1E4DFF" }}><Search /><span>About VPANSAK Official<small>Brand Info, Guarantees &amp; Support</small></span><strong>View Info</strong></Link>}{suggestions.map((product) => <Link key={product.id} href={`/product/${product.id}`}><Search /><span>{product.name}<small>{product.category}</small></span><strong>{money(product.price)}</strong></Link>)}</div>}
              </div>
            </div>

            <div className="vp-header-actions">
              <Link href={authUser ? "/account" : "/login"}><UserRound /><span><small>{authUser ? `Hello, ${authUser.fullName || authUser.email.split("@")[0]}` : "Hello, sign in"}</small>My Account</span></Link>
              <Link href={authUser ? "/account" : "/login"}><Heart /><span><small>{wishlist.length} saved</small>Wishlist</span></Link>
              <Link href={authUser ? "/account" : "/track"} className="vp-header-orders"><Box /><span><small>Track &amp; manage</small>Orders</span></Link>
              <button type="button" onClick={() => setCartOpen(true)}><ShoppingCart /><span><small>{cartCount} items</small>{cartCount ? money(subtotal) : "My Cart"}</span>{cartCount > 0 && <i>{cartCount}</i>}</button>
            </div>
            <button className="vp-mobile-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>

        <div className="mobile-search-sticky">
          <div className="vp-search-wrap">
            <form className="vp-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search VPANSAK products..." aria-label="Search products" /><button>Search</button></form>
            {(suggestions.length > 0 || isInfoQuery) && <div className="vp-suggestions"><small>SEARCH SUGGESTIONS</small>{isInfoQuery && <Link href="/info" style={{ background: "#edf4ff", borderLeft: "3px solid #1E4DFF" }}><Search /><span>About VPANSAK<small>Brand Info &amp; Guarantees</small></span><strong>View Info</strong></Link>}{suggestions.map((product) => <Link key={product.id} href={`/product/${product.id}`}><Search /><span>{product.name}<small>{product.category}</small></span><strong>{money(product.price)}</strong></Link>)}</div>}
          </div>
        </div>
      </header>

      <nav className={menuOpen ? "vp-main-nav open" : "vp-main-nav"} aria-label="Main navigation" style={{ background: "#081221", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/collections" style={{ color: "#FFB020", fontWeight: 700 }}><Menu /> All Collections</Link>
        {categories.map((item) => (
          <button
            type="button"
            key={item.name}
            onClick={() => chooseCategory(item.value)}
            style={{
              color: category === item.value ? "#FFB020" : "#cbd5e1",
              fontWeight: category === item.value ? 700 : 500
            }}
          >
            {item.name}
          </button>
        ))}
        <Link href="/collections" style={{ marginLeft: "auto", color: "#FFB020", fontWeight: 700 }}><ShieldCheck size={14} style={{ display: "inline-block", marginRight: "4px" }} /> VPANSAK Official Store</Link>
      </nav>

      <section className="vp-category-strip" aria-label="Popular departments" style={{ background: "#0F1D35", borderColor: "rgba(255,255,255,0.08)" }}>
        {categories.map(({ name, value, icon: Icon }) => (
          <button
            type="button"
            key={name}
            onClick={() => chooseCategory(value)}
            style={{ color: category === value ? "#FFB020" : "#e2e8f0" }}
          >
            <span style={{ background: category === value ? "rgba(255,176,32,0.15)" : "rgba(255,255,255,0.05)", color: category === value ? "#FFB020" : "#94a3b8" }}><Icon /></span>
            <strong style={{ color: category === value ? "#FFB020" : "#f8fafc" }}>{name}</strong>
            <small style={{ color: "#94a3b8" }}>{name === "All Bottles" ? "VPANSAK Collection" : "Official Series"}</small>
          </button>
        ))}
      </section>

      {/* Main Hero Slider Section (Using Official Uploaded Poster Creatives) */}
      <section className="vp-hero-shell">
        <article
          className="vp-hero"
          style={{ background: "#081221", borderRadius: "12px", overflow: "hidden", position: "relative" }}
          onMouseEnter={() => setIsHoverPaused(true)}
          onMouseLeave={() => setIsHoverPaused(false)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const diffX = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diffX) > 40) {
              if (diffX > 0) setHero((prev) => (prev + 1) % heroSlides.length);
              else setHero((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
            }
            touchStartX.current = null;
          }}
        >
          <Link href={currentHero.linkUrl} style={{ display: "block", width: "100%", height: "100%", position: "relative" }}>
            <img
              className="vp-hero-image"
              src={currentHero.image}
              alt={currentHero.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                background: "#081221",
                transition: "opacity 0.4s ease-in-out"
              }}
            />
            {/* Subtle UI Badge */}
            <span
              style={{
                position: "absolute",
                top: "16px",
                left: "20px",
                background: "rgba(15, 29, 53, 0.85)",
                color: "#FFB020",
                border: "1px solid rgba(255, 176, 32, 0.4)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                backdropFilter: "blur(4px)"
              }}
            >
              VPANSAK OFFICIAL
            </span>
          </Link>

          {/* Navigation Controls */}
          <button
            className="vp-hero-arrow left"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHero((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
            }}
            aria-label="Previous slide"
            style={{
              background: "#0F1D35",
              color: "#FFB020",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              width: "40px",
              height: "44px"
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="vp-hero-arrow right"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHero((prev) => (prev + 1) % heroSlides.length);
            }}
            aria-label="Next slide"
            style={{
              background: "#0F1D35",
              color: "#FFB020",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              width: "40px",
              height: "44px"
            }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Slider Indicators */}
          <div className="vp-hero-dots">
            {heroSlides.map((_, index) => (
              <button
                type="button"
                className={index === hero ? "active" : ""}
                key={index}
                onClick={() => setHero(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={{
                  background: index === hero ? "#FFB020" : "rgba(255, 255, 255, 0.3)",
                  width: index === hero ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px"
                }}
              />
            ))}
          </div>
        </article>

        {/* Right Side Product Showcase Cards (Data from Database) */}
        <aside className="vp-side-deals" style={{ background: "#081221", borderRadius: "12px", gap: "10px" }}>
          {sideProducts.map((p, idx) => {
            if (!p) return null;
            const labels = ["NEW LAUNCH", "DESK ESSENTIALS", "TECH ACCESSORIES"];
            return (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                style={{
                  background: "#0F1D35",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 85px",
                  alignItems: "center",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
              >
                <span>
                  <small style={{ color: "#FFB020", fontWeight: 800, fontSize: "10px", letterSpacing: "0.05em" }}>
                    {labels[idx] || "VPANSAK OFFICIAL"}
                  </small>
                  <strong style={{ color: "#ffffff", fontSize: "13px", margin: "4px 0 2px", display: "block" }}>
                    {p.name.split("—")[0].trim()}
                  </strong>
                  <b style={{ color: "#FFB020", fontSize: "13px", fontWeight: 700 }}>
                    From {money(p.price)}
                  </b>
                </span>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: "75px",
                    height: "75px",
                    objectFit: "contain",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.03)"
                  }}
                />
              </Link>
            );
          })}
        </aside>
      </section>

      <section className="vp-trust-row">
        <div><BadgeCheck /><span><strong>VPANSAK Assured</strong><small>Quality-focused listings</small></span></div>
        <div><Truck /><span><strong>Free delivery</strong><small>On eligible products</small></span></div>
        <div><ShieldCheck /><span><strong>Secure checkout</strong><small>Protected order details</small></span></div>
        <div><RotateCcw /><span><strong>Easy support</strong><small>Ticket-based assistance</small></span></div>
      </section>

      <section className="vp-shelf">
        <header><div><small>LIMITED-TIME PRICES</small><h2>Top offers for you</h2><p>Popular picks with serious savings.</p></div><button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>View all <ArrowRight /></button></header>
        <div className="vp-product-rail">{topOffers.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div>
      </section>

      <section className="vp-banner-grid">
        <button type="button" className="vp-banner-fashion" onClick={() => chooseCategory("Core Series")}><span><small>VPANSAK CORE</small><strong>Core Bottle Series.<br />Everyday hydration.</strong><b>750ml &amp; 1000ml</b><i>Shop now <ArrowRight /></i></span></button>
        <button type="button" className="vp-banner-home" onClick={() => chooseCategory("Steel Series")}><span><small>STEEL SERIES</small><strong>Double-Wall Vacuum.<br />12h Hot / 24h Cold.</strong><b>From ₹799</b><i>Explore Steel <ArrowRight /></i></span></button>
        <button type="button" className="vp-banner-seller" onClick={() => { window.location.href = "/collections"; }}><ShieldCheck /><span><small>VPANSAK DIRECT</small><strong>100% Genuine Brand Bottles.</strong><b>Explore full collection</b></span><ArrowRight /></button>
      </section>

      <section className="vp-shelf">
        <header><div><small>MOST POPULAR BOTTLES</small><h2>Trending Bottle Collection</h2><p>Double-wall vacuum insulated bottles engineered for everyday life.</p></div><span className="vp-live"><i /> In Stock</span></header>
        <div className="vp-product-rail">{trending.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div>
      </section>

      <section className="vp-shelf">
        <header><div><small>EVERYDAY VALUE</small><h2>Bottles under ₹999</h2><p>Premium reusable water bottles at accessible direct-to-consumer prices.</p></div><button onClick={() => { setSort("price-low"); setCategory("All"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>See more <ArrowRight /></button></header>
        <div className="vp-product-rail">{budget.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div>
      </section>

      <section className="vp-catalog" id="catalog">
        <header><div><small>VPANSAK OFFICIAL STORE</small><h2>Official Water Bottle Collection</h2><p>100% original VPANSAK engineered reusable water bottles.</p></div><span>{filteredProducts.length} products</span></header>
        <div className="vp-catalog-toolbar">
          <div><SlidersHorizontal />{["All", "Core Series", "Steel Series", "Travel Series", "750ml", "1000ml", "600ml"].map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Popularity</option><option value="rating">Customer rating</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></label>
        </div>
        {filteredProducts.length ? <div className="vp-catalog-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div> : <div className="vp-empty"><Search /><h3>VPANSAK Direct Catalog Coming Soon</h3><p>Our official brand products are currently being updated. Check back soon for new arrivals!</p><button type="button" onClick={() => { setSearch(""); setCategory("All"); }}>Clear all filters</button></div>}
      </section>

      <section className="vp-track-band">
        <div><PackageCheck /><span><small>LIVE ORDER STATUS</small><h2>From confirmation to delivery, see every step.</h2><p>Your address and mobile stay masked on the tracking page.</p></span></div>
        <form onSubmit={(event) => { event.preventDefault(); const id = String(new FormData(event.currentTarget).get("orderId") || "").trim().toUpperCase(); window.location.href = `/track?id=${encodeURIComponent(id)}`; }}><label><Box /><input name="orderId" required pattern="VPO[0-9]{6}" placeholder="Enter order ID, e.g. VPO123456" /></label><button>Track now <ArrowRight /></button></form>
      </section>

      <section className="vp-service-grid">
        <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer"><Headphones /><span><small>24×7 SUPPORT HUB</small><strong>Create &amp; track a ticket</strong><p>Get structured help for orders, payments, delivery and technical issues.</p></span><ArrowRight /></a>
        <Link href="/seller"><ShieldCheck /><span><small>VPANSAK DIRECT BRAND</small><strong>Direct Brand Guarantee</strong><p>100% genuine products, zero third-party sellers &amp; direct quality care.</p></span><ArrowRight /></Link>
        <Link href="/info/about"><CircleHelp /><span><small>VPANSAK ECOSYSTEM</small><strong>Explore our headquarters</strong><p>Shopping, support, foundation and business tools in one place.</p></span><ArrowRight /></Link>
      </section>

      <footer className="vp-footer">
        <div className="vp-footer-main"><div className="vp-footer-brand"><Link className="vp-brand" href="/"><img src="/vpansak-logo.png" alt="VPANSAK" /><span><strong>VPANSAK</strong><small>SHOPPING</small></span></Link><p>An exclusive Direct-to-Consumer (D2C) brand store by A&amp;A Group.</p><span><ShieldCheck /> Secure shopping experience</span></div><div><strong>SHOP</strong><Link href="/categories">All categories</Link><a href="#catalog">Top offers</a><Link href="/account">Wishlist</Link><Link href="/track">Track order</Link></div><div><strong>HELP</strong><a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support hub</a><Link href="/info/faq">FAQs</Link><Link href="/policies/refund-policy">Refund policy</Link><Link href="/policies/shipping-policy">Shipping policy</Link><Link href="/info/useful-links" onClick={(e) => { e.preventDefault(); setUsefulLinksOpen(true); }}>Useful links</Link></div><div><strong>BRAND &amp; COMMUNITY</strong><Link href="/seller">Direct Store Policy</Link><Link href="/policies/merchant-guidelines">Quality SLA</Link><Link href="/foundation">Support Foundation</Link><Link href="/policies/copyright-terms" style={{ color: "#f97316", fontWeight: 700 }}>Copyright &amp; IP Declaration</Link></div><div><strong>COMPANY</strong><Link href="/info/about">About VPANSAK</Link><Link href="/info/careers">Careers</Link><Link href="/info/contact">Contact us</Link></div></div>
        <div className="vp-footer-bottom"><span>© 2026 VPANSAK • Powered by A&amp;A Group</span><div><Link href="/policies/privacy-policy">Privacy</Link><Link href="/policies/terms-and-conditions">Terms</Link><div className="vp-social-icons"><a href="mailto:support.vpansak@gmail.com" title="support.vpansak@gmail.com" aria-label="Email support"><Mail size={16} /></a><a href="https://instagram.com/VPANSAK" target="_blank" rel="noreferrer" title="Instagram @VPANSAK" aria-label="Instagram"><InstagramIcon size={16} /></a><a href="https://x.com/vpansak_" target="_blank" rel="noreferrer" title="X @vpansak_" aria-label="X @vpansak_"><XIcon size={15} /></a></div></div></div>
      </footer>


      <nav className="vp-bottom-nav" aria-label="Mobile navigation"><a href="#top"><Home /><span>Home</span></a><Link href="/categories"><Grid3X3 /><span>Categories</span></Link><Link href="/foundation" className="vp-donate-item"><HeartHandshake /><span>Donate</span></Link><Link href="/track"><Box /><span>Orders</span></Link><Link href={authUser ? "/account" : "/login"}><UserRound /><span>{authUser ? "Account" : "Sign In"}</span></Link></nav>

      {cartOpen && <div className="vp-overlay" onMouseDown={() => setCartOpen(false)}><aside className="vp-cart" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseDown={(event) => event.stopPropagation()}><header><div><small>MY CART</small><h2>{cartCount} {cartCount === 1 ? "item" : "items"}</h2></div><button type="button" onClick={() => setCartOpen(false)}><X /></button></header><div className="vp-cart-benefit"><Truck /><span><strong>{subtotal >= 499 ? "You unlocked free delivery" : `${money(499 - subtotal)} away from free delivery`}</strong><i><b style={{ width: `${Math.min(100, subtotal / 4.99)}%` }} /></i></span></div><div className="vp-cart-items">{cartItems.length ? cartItems.map((product) => <article key={product.id}><img src={product.imageUrl} alt="" /><div><small>{product.brand}</small><h3>{product.name}</h3><strong>{money(product.price)}</strong><span><button type="button" onClick={() => changeQuantity(product.id, -1)}><Minus /></button><b>{cart[product.id]}</b><button type="button" onClick={() => changeQuantity(product.id, 1)}><Plus /></button></span></div><button type="button" onClick={() => changeQuantity(product.id, -cart[product.id])}><Trash2 /></button></article>) : <div className="vp-cart-empty"><ShoppingCart /><h3>Your cart is waiting</h3><p>Add a useful product from today&apos;s deals.</p><button type="button" onClick={() => setCartOpen(false)}>Continue shopping</button></div>}</div>{cartItems.length > 0 && <div className="vp-cart-summary"><p><span>Price ({cartCount} items)</span><b>{money(subtotal)}</b></p>{discount > 0 && <p><span>Coupon discount</span><b className="green">−{money(discount)}</b></p>}<p><span>Delivery charges</span><b className="green">FREE</b></p><div><span>Total amount</span><strong>{money(finalTotal)}</strong></div><button type="button" onClick={() => { window.location.href = "/checkout"; }}>Proceed to checkout <ArrowRight /></button><small><ShieldCheck /> Safe and secure checkout (Online Payment &amp; COD Available)</small></div>}</aside></div>}

      {checkoutOpen && <div className="vp-overlay centered" onMouseDown={() => setCheckoutOpen(false)}><div className="vp-checkout" role="dialog" aria-modal="true" aria-label="Secure checkout" onMouseDown={(event) => event.stopPropagation()}><header><div><small>SECURE CHECKOUT</small><h2>Complete your order</h2></div><button type="button" onClick={() => setCheckoutOpen(false)}><X /></button></header><form onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const method = String(form.get("paymentMethod") || "");
        if (method.includes("Online") || method.includes("UPI")) {
          window.location.href = "/checkout";
          return;
        }
        placeOrder(e);
      }}><section><h3><span>1</span> Delivery address</h3><div className="vp-form-grid"><label>Full name<input name="customerName" required maxLength={100} autoComplete="name" /></label><label>Mobile number<input name="mobile" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel" /></label><label className="wide">House number, area and street<input name="address" required maxLength={250} autoComplete="street-address" /></label><label>City<input name="city" required maxLength={80} autoComplete="address-level2" /></label><label>PIN code<input name="pinCode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" /></label></div></section><section><h3><span>2</span> Payment method</h3><div className="vp-payment-options"><label><input type="radio" name="paymentMethod" value="Online Payment (UPI/Cards)" defaultChecked /><CreditCard /><span><strong>UPI / Cards / Netbanking</strong><small>UPI, PhonePe, GPay, Cards &amp; Netbanking</small></span></label><label><input type="radio" name="paymentMethod" value="Cash on Delivery" /><Banknote /><span><strong>Cash on Delivery (COD)</strong><small>Pay when the order arrives</small></span></label><label className="disabled"><input type="radio" disabled /><WalletCards /><span><strong>Gift Card</strong><small>Available after wallet activation</small></span></label></div></section><section><h3><span>3</span> Apply coupon</h3><div className="vp-checkout-coupon"><Tag /><input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Enter promo code" /><button type="button" onClick={applyCoupon}>Apply</button></div></section><div className="vp-checkout-total"><span>Payable amount</span><strong>{money(finalTotal)}</strong></div><button className="vp-place-order" type="submit">Proceed to Complete Order <ShieldCheck /></button><p className="vp-checkout-note"><Clock3 /> Order confirmation is generated immediately with a trackable VPANSAK order ID.</p></form></div></div>}

      {orderPlaced && (
        <div className="full-screen-order-success">
          <div className="success-container-card">
            <div className="fullscreen-green-tick">
              <Check size={56} />
            </div>
            <span className="success-badge-eyebrow">
              <Sparkles size={12} /> Order Confirmed
            </span>
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle">
              Thank you! Your order has been placed successfully and is ready for fast dispatch.
            </p>

            <div className="order-id-highlight-box">
              <div>
                <small>VPANSAK ORDER ID</small>
                <strong>{orderPlaced}</strong>
              </div>
              <button
                type="button"
                className="order-id-copy-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(orderPlaced);
                  notify("Order ID copied!");
                }}
              >
                <Copy size={13} /> Copy ID
              </button>
            </div>

            <div className="success-action-buttons">
              <button
                type="button"
                className="btn-track-success"
                onClick={() => {
                  window.location.href = `/track?id=${orderPlaced}`;
                }}
              >
                <PackageCheck size={18} /> Track Order Timeline
              </button>
              <Link href="/account" className="btn-account-success">
                <UserRound size={16} /> Open My Account
              </Link>
              <button
                type="button"
                className="btn-account-success"
                onClick={() => {
                  setOrderPlaced("");
                }}
              >
                <ArrowRight size={16} /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {usefulLinksOpen && (
        <div className="vp-overlay centered" onMouseDown={() => setUsefulLinksOpen(false)}>
          <div className="vp-checkout vp-useful-modal" role="dialog" aria-modal="true" aria-label="Useful Links Directory" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <small>ALL-IN-ONE DIRECTORY</small>
                <h2>Useful Links & Quick Action Hub (उपयोगी लिंक्स)</h2>
              </div>
              <button type="button" onClick={() => setUsefulLinksOpen(false)}>
                <X />
              </button>
            </header>
            <div className="vp-useful-modal-body">
              <p className="vp-useful-modal-intro">
                Every link, policy, seller tool, founder profile, and customer service across VPANSAK in one place.
              </p>

              <div className="useful-search-box">
                <Search size={18} />
                <input
                  type="text"
                  value={usefulSearch}
                  onChange={(e) => setUsefulSearch(e.target.value)}
                  placeholder="Search any link, policy, seller tool, or founder..."
                />
                {usefulSearch && (
                  <button type="button" onClick={() => setUsefulSearch("")}>Clear</button>
                )}
              </div>

              <div className="useful-buttons-grid">
                <Link href="/founder" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card highlight-card">
                  <div className="btn-card-top"><span className="card-badge founder-badge">FOUNDER</span><UserRound size={20} className="card-icon" /></div>
                  <h4>Founder Alok Singh</h4>
                  <p>Founder & Visionary leading VPANSAK Shopping.</p>
                  <span className="card-action-link">View Profile <ArrowRight size={14} /></span>
                </Link>
                <Link href="/cofounder" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card highlight-card">
                  <div className="btn-card-top"><span className="card-badge cofounder-badge">CO-FOUNDER</span><UserRound size={20} className="card-icon" /></div>
                  <h4>Co-Founder Ayushi Tripathi</h4>
                  <p>Co-Founder & Director managing key strategy.</p>
                  <span className="card-action-link">View Profile <ArrowRight size={14} /></span>
                </Link>
                <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card">
                  <div className="btn-card-top"><span className="card-badge help-badge">24×7 HELP</span><Headphones size={20} className="card-icon" /></div>
                  <h4>Support Hub</h4>
                  <p>Main Support Portal at Lovable.</p>
                  <span className="card-action-link">Open Hub <ArrowRight size={14} /></span>
                </a>
                <a href="https://vpansaksupporthub.lovable.app/submit" target="_blank" rel="noreferrer" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card">
                  <div className="btn-card-top"><span className="card-badge help-badge">NEW TICKET</span><Headphones size={20} className="card-icon" /></div>
                  <h4>Create Support Ticket</h4>
                  <p>Submit ticket to support team.</p>
                  <span className="card-action-link">Create Ticket <ArrowRight size={14} /></span>
                </a>
                <a href="https://vpansaksupporthub.lovable.app/track" target="_blank" rel="noreferrer" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card">
                  <div className="btn-card-top"><span className="card-badge live-badge">TRACK TICKET</span><PackageCheck size={20} className="card-icon" /></div>
                  <h4>Track Ticket Status</h4>
                  <p>Track VPT ticket updates.</p>
                  <span className="card-action-link">Track Ticket <ArrowRight size={14} /></span>
                </a>
                <a href="https://vpansaksupporthub.lovable.app/chat" target="_blank" rel="noreferrer" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card">
                  <div className="btn-card-top"><span className="card-badge faq-badge">AI CHAT</span><Sparkles size={20} className="card-icon" /></div>
                  <h4>Smart AI Chat</h4>
                  <p>Interactive AI support chat.</p>
                  <span className="card-action-link">Start Chat <ArrowRight size={14} /></span>
                </a>
                <Link href="/track" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card">
                  <div className="btn-card-top"><span className="card-badge live-badge">LIVE ORDER</span><PackageCheck size={20} className="card-icon" /></div>
                  <h4>Track Live Order</h4>
                  <p>Track order progress with VPO ID.</p>
                  <span className="card-action-link">Track Order <ArrowRight size={14} /></span>
                </Link>
                <Link href="/seller" onClick={() => setUsefulLinksOpen(false)} className="useful-btn-card">
                  <div className="btn-card-top"><span className="card-badge merchant-badge">DIRECT D2C</span><ShieldCheck size={20} className="card-icon" /></div>
                  <h4>VPANSAK Direct Policy</h4>
                  <p>Read about our 100% direct brand store commitment.</p>
                  <span className="card-action-link">Read Policy <ArrowRight size={14} /></span>
                </Link>
              </div>

              <div className="useful-links-grid" style={{ marginTop: 24 }}>
                <div className="useful-link-col">
                  <div className="col-title"><UserRound size={16} /><span>Founders & Leadership</span></div>
                  <ul>
                    <li><Link href="/founder" onClick={() => setUsefulLinksOpen(false)}><strong>Founder Alok Singh Profile</strong><small>Founder & Visionary of VPANSAK</small></Link></li>
                    <li><Link href="/cofounder" onClick={() => setUsefulLinksOpen(false)}><strong>Co-Founder Ayushi Tripathi Profile</strong><small>Co-Founder & Director of VPANSAK</small></Link></li>
                    <li><Link href="/info/about" onClick={() => setUsefulLinksOpen(false)}>About VPANSAK HQ</Link></li>
                    <li><Link href="/info/careers" onClick={() => setUsefulLinksOpen(false)}>Careers & Hiring</Link></li>
                    <li><Link href="/info/contact" onClick={() => setUsefulLinksOpen(false)}>Contact Us</Link></li>
                  </ul>
                </div>
                <div className="useful-link-col">
                  <div className="col-title"><Headphones size={16} /><span>Lovable Support Portals</span></div>
                  <ul>
                    <li><a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer"><strong>VPANSAK Support Hub</strong><small>Main support portal</small></a></li>
                    <li><a href="https://vpansaksupporthub.lovable.app/submit" target="_blank" rel="noreferrer"><strong>Create Support Ticket (/submit)</strong><small>Submit a new ticket</small></a></li>
                    <li><a href="https://vpansaksupporthub.lovable.app/track" target="_blank" rel="noreferrer"><strong>Track Support Ticket (/track)</strong><small>View reply history</small></a></li>
                    <li><a href="https://vpansaksupporthub.lovable.app/chat" target="_blank" rel="noreferrer"><strong>Smart AI Support Chat (/chat)</strong><small>Interactive AI help</small></a></li>
                  </ul>
                </div>
                <div className="useful-link-col">
                  <div className="col-title"><ShieldCheck size={16} /><span>Policies & Guidelines</span></div>
                  <ul>
                    <li><Link href="/policies/shipping-policy" onClick={() => setUsefulLinksOpen(false)}>Shipping & Delivery Policy</Link></li>
                    <li><Link href="/policies/refund-policy" onClick={() => setUsefulLinksOpen(false)}>5-Minute Refund Initiation Policy</Link></li>
                    <li><Link href="/policies/return-policy" onClick={() => setUsefulLinksOpen(false)}>7-Day Product Return Policy</Link></li>
                    <li><Link href="/policies/privacy-policy" onClick={() => setUsefulLinksOpen(false)}>Privacy Policy & Data Security</Link></li>
                    <li><Link href="/policies/terms-and-conditions" onClick={() => setUsefulLinksOpen(false)}>Terms & Conditions</Link></li>
                  </ul>
                </div>
                <div className="useful-link-col">
                  <div className="col-title"><ShieldCheck size={16} /><span>Direct Store &amp; Community</span></div>
                  <ul>
                    <li><Link href="/seller" onClick={() => setUsefulLinksOpen(false)}>VPANSAK Direct Store Policy</Link></li>
                    <li><Link href="/policies/merchant-guidelines" onClick={() => setUsefulLinksOpen(false)}>Direct Quality SLA</Link></li>
                    <li><Link href="/foundation" onClick={() => setUsefulLinksOpen(false)}>VPANSAK Support Foundation</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </main>
  );
}
