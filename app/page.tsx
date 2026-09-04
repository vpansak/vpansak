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
  { name: "All", value: "All", icon: Grid3X3, color: "#edf2f8" },
  { name: "Mobiles", value: "Mobile", icon: Smartphone, color: "#e8f2ff" },
  { name: "Electronics", value: "Electronics", icon: Laptop, color: "#eeeaff" },
  { name: "Fashion", value: "Fashion", icon: Shirt, color: "#fff0f3" },
  { name: "Home", value: "Home", icon: Home, color: "#fff3df" },
  { name: "Appliances", value: "Appliances", icon: Zap, color: "#e9fbf4" },
  { name: "Beauty", value: "Beauty", icon: Sparkles, color: "#fff0fa" },
  { name: "Grocery", value: "Grocery", icon: ShoppingBag, color: "#f1f9e7" },
  { name: "Kitchen", value: "Kitchen", icon: Utensils, color: "#fff4e7" },
  { name: "Computers", value: "Computer", icon: Laptop, color: "#e9f3ff" },
  { name: "Accessories", value: "Accessories", icon: PackageOpen, color: "#f4edff" },
  { name: "Lifestyle", value: "Lifestyle", icon: Watch, color: "#eafaf7" },
  { name: "Gaming", value: "Gaming", icon: Gamepad2, color: "#f0ecff" },
  { name: "Furniture", value: "Furniture", icon: Sofa, color: "#fff0e7" },
  { name: "Sports", value: "Sports", icon: Dumbbell, color: "#eaf8ef" },
  { name: "Toys", value: "Toys", icon: ToyBrick, color: "#fff1f1" },
  { name: "Books", value: "Books", icon: BookOpen, color: "#fff7df" },
  { name: "Automotive", value: "Automotive", icon: Car, color: "#edf2f8" },
  { name: "Smart Watches", value: "Electronics", icon: Watch, color: "#e7f4ff" },
  { name: "Audio", value: "Electronics", icon: Headphones, color: "#f4edff" },
  { name: "Study", value: "Books", icon: LampDesk, color: "#fff4dc" },
  { name: "Home Decor", value: "Home", icon: Home, color: "#f5efe8" },
  { name: "Daily Needs", value: "Lifestyle", icon: ShoppingBag, color: "#eaf8ef" },
  { name: "Top Deals", value: "All", icon: Tag, color: "#fff0e5" },
];

const heroSlides = [
  { eyebrow: "🪔 RAKSHABANDHAN SPECIAL GIFT SALE", title: "Premium tech.\nSmarter prices.", copy: "Upgrade your everyday with verified electronics, mobiles and Rakhi gift picks at launch prices.", offer: "Up to 60% OFF + Sibling Coupons", button: "Explore Rakhi Deals", category: "Electronics", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "📿 RAKHI FESTIVE FASHION EDIT", title: "Everyday style,\nmade effortless.", copy: "Fresh festive fashion picks, traditional wear and easy Rakhi coupon savings for brothers & sisters.", offer: "Rakhi Specials From ₹399", button: "Shop Festive Fashion", category: "Fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=88", theme: "rose" },
  { eyebrow: "🎁 SIBLING CELEBRATION HOME UPGRADE", title: "Small upgrades.\nA better home.", copy: "Thoughtful decor, sweet kitchenware and home essentials for warm festive celebrations.", offer: "Minimum 40% OFF", button: "Refresh your home", category: "Home", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=88", theme: "gold" },
  { eyebrow: "📱 RAKSHABANDHAN MOBILE SURPRISE", title: "Faster phones.\nBetter everyday.", copy: "Gift dependable 5G smartphones, wireless audio and mobile accessories to your sibling.", offer: "From ₹9,999 + Rakhi Discounts", button: "Shop Rakhi Mobiles", category: "Mobile", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "🍲 FESTIVE SWEETS & KITCHEN BESTSELLERS", title: "Cook festive feasts.\nShare sweet moments.", copy: "Useful cookware, festive dessert makers and kitchen tools selected for modern homes.", offer: "Up to 55% OFF", button: "Explore kitchen", category: "Kitchen", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=88", theme: "gold" },
  { eyebrow: "✨ RAKHI BEAUTY & GLOW GIFT HAMPERS", title: "Skincare hampers.\nEveryday glow.", copy: "Discover luxury skincare and beauty hampers perfect for Rakhi gifting.", offer: "Starting ₹299", button: "Shop beauty hampers", category: "Beauty", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=88", theme: "rose" },
  { eyebrow: "🎮 RAKSHABANDHAN GAMING & GADGETS", title: "Surprise gifts.\nPlay your way.", copy: "Next-gen controllers, immersive audio and gaming accessories for brothers.", offer: "Up to 45% OFF", button: "Enter gaming", category: "Gaming", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "🏋️ HEALTH & FITNESS RAKHI GIFTS", title: "Move better.\nFeel stronger.", copy: "Practical sports, smartwatch and fitness gear for active brothers and sisters.", offer: "From ₹499", button: "Shop sports", category: "Sports", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=88", theme: "gold" },
  { eyebrow: "💻 WORK & STUDY RAKHI GIFTS", title: "Focus more.\nAchieve better.", copy: "Laptops, smart backpacks and desk essentials for your sibling's work and study.", offer: "Up to 35% OFF", button: "Explore laptops", category: "Computer", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "🧸 RAKSHABANDHAN TOYS & KIDS GIFTS", title: "Big smiles.\nHappy play.", copy: "Creative building sets, toys and fun gifts for younger brothers and sisters.", offer: "From ₹349", button: "Shop toys", category: "Toys", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1800&q=88", theme: "rose" },
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
  const [hydrated, setHydrated] = useState(false);
  const [authUser, setAuthUser] = useState<{ email: string; fullName: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (data && data.user) {
          setAuthUser(data.user);
          // Fetch authenticated user's isolated DB cart & wishlist
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

  useEffect(() => { const timer = window.setInterval(() => setHero((value) => (value + 1) % heroSlides.length), 6500); return () => window.clearInterval(timer); }, []);

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
  const trending = catalogProducts.slice(8, 14);
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

  const isFestiveTheme = true;

  return (
    <main className="vp-store festive-theme-active">
      {toast && <div className="vp-toast"><Sparkles /><span>{toast}</span></div>}

      <header className={`vp-header-shell ${isCollapsed ? "is-collapsed" : ""}`} id="top">
        <div className="mobile-header-collapsible">
          <Link href="/event" className="rakhi-banner-bar">
            <span>🪔 RAKSHABANDHAN LUCKY WHEEL</span>
            <strong>Spin & Win Up to 90% OFF Discount Vouchers & Free Rakhi Hampers!</strong>
            <b>SPIN & WIN →</b>
          </Link>

          <div className="vp-brand-row">
            <Link className="vp-brand" href="/" aria-label="VPANSAK Shopping home"><img src="/vpansak-logo.png" alt="VPANSAK" /><span><strong>VPANSAK</strong><small>SHOPPING</small></span></Link>
            <button className="vp-location" type="button" onClick={() => notify("Add your delivery PIN at checkout")}><MapPin /><span><small>Delivering across</small>India</span><ChevronDown /></button>
            
            <div className="desktop-search-wrap">
              <div className="vp-search-wrap">
                <form className="vp-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for products, brands and categories" aria-label="Search products" /><button>Search</button></form>
                {(suggestions.length > 0 || isInfoQuery) && <div className="vp-suggestions"><small>SEARCH SUGGESTIONS</small>{isInfoQuery && <Link href="/info" style={{ background: "#edf4ff", borderLeft: "3px solid #1766ef" }}><Search /><span>About VPANSAK Shopping<small>Company Info, Founders, Refunds, Sellers &amp; Policies</small></span><strong>View Info</strong></Link>}{suggestions.map((product) => <Link key={product.id} href={`/product/${product.id}`}><Search /><span>{product.name}<small>{product.category}</small></span><strong>{money(product.price)}</strong></Link>)}</div>}
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
            <form className="vp-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for products, brands and categories" aria-label="Search products" /><button>Search</button></form>
            {(suggestions.length > 0 || isInfoQuery) && <div className="vp-suggestions"><small>SEARCH SUGGESTIONS</small>{isInfoQuery && <Link href="/info" style={{ background: "#edf4ff", borderLeft: "3px solid #1766ef" }}><Search /><span>About VPANSAK Shopping<small>Company Info, Founders, Refunds, Sellers &amp; Policies</small></span><strong>View Info</strong></Link>}{suggestions.map((product) => <Link key={product.id} href={`/product/${product.id}`}><Search /><span>{product.name}<small>{product.category}</small></span><strong>{money(product.price)}</strong></Link>)}</div>}
          </div>
        </div>
      </header>

      <nav className={menuOpen ? "vp-main-nav open" : "vp-main-nav"} aria-label="Main navigation">
        <Link href="/categories"><Menu /> All Categories</Link>
        <Link href="/event" style={{ color: "#be123c", fontWeight: "bold" }}><Sparkles size={14} /> 🪔 Lucky Wheel Event</Link>
        {categories.slice(0, 6).map((item) => <button type="button" key={item.name} onClick={() => chooseCategory(item.value)}>{item.name}</button>)}
        <Link href="/seller"><ShieldCheck size={14} /> VPANSAK Direct Store</Link>
      </nav>

      <section className="vp-category-strip" aria-label="Popular departments">
        {categories.slice(0, 8).map(({ name, value, icon: Icon, color }) => <button type="button" key={name} onClick={() => chooseCategory(value)}><span style={{ background: color }}><Icon /></span><strong>{name}</strong><small>{name === "All" ? `${categories.length - 1}+ categories` : "Top offers"}</small></button>)}
      </section>

      <section className="vp-hero-shell">
        <article className={`vp-hero vp-hero-${currentHero.theme}`}>
          <img className="vp-hero-image" src={currentHero.image} alt="" aria-hidden="true" />
          <div className="vp-hero-shade" aria-hidden="true" />
          <div className="vp-hero-copy"><span>{currentHero.eyebrow}</span><h1>{currentHero.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1><p>{currentHero.copy}</p><strong>{currentHero.offer}</strong><button type="button" onClick={() => chooseCategory(currentHero.category)}>{currentHero.button} <ArrowRight /></button></div>
          <button className="vp-hero-arrow left" type="button" onClick={() => setHero((hero - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous offer"><ChevronLeft /></button>
          <button className="vp-hero-arrow right" type="button" onClick={() => setHero((hero + 1) % heroSlides.length)} aria-label="Next offer"><ChevronRight /></button>
          <div className="vp-hero-dots">{heroSlides.map((slide, index) => <button type="button" className={index === hero ? "active" : ""} key={slide.title} onClick={() => setHero(index)} aria-label={`Offer ${index + 1}`} />)}</div>
        </article>
        <aside className="vp-side-deals"><Link href="/product/nova-5g-phone"><span><small>NEW LAUNCH</small><strong>Nova X1 5G</strong><b>From ₹12,999</b></span><img src={catalogProducts[8].imageUrl} alt="Nova smartphone" /></Link><Link href="/product/airbook-laptop"><span><small>WORK &amp; STUDY</small><strong>Thin laptops</strong><b>Up to 26% off</b></span><img src={catalogProducts[9].imageUrl} alt="Laptop" /></Link></aside>
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
        <button type="button" className="vp-banner-fashion" onClick={() => chooseCategory("Fashion")}><span><small>STYLE STORE</small><strong>New looks.<br />Everyday prices.</strong><b>Min. 45% off</b><i>Shop now <ArrowRight /></i></span></button>
        <button type="button" className="vp-banner-home" onClick={() => chooseCategory("Home")}><span><small>HOME UPGRADE</small><strong>Make every corner<br />work better.</strong><b>From ₹549</b><i>Explore home <ArrowRight /></i></span></button>
        <button type="button" className="vp-banner-seller" onClick={() => { window.location.href = "/seller"; }}><ShieldCheck /><span><small>VPANSAK DIRECT</small><strong>100% Genuine Brand Products.</strong><b>Explore our direct store</b></span><ArrowRight /></button>
      </section>

      <section className="vp-shelf">
        <header><div><small>MOST LOVED THIS WEEK</small><h2>Trending across VPANSAK</h2><p>High-interest products from trusted departments.</p></div><span className="vp-live"><i /> Updated today</span></header>
        <div className="vp-product-rail">{trending.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div>
      </section>

      <section className="vp-shelf">
        <header><div><small>SMART VALUE PICKS</small><h2>Useful finds under ₹999</h2><p>Everyday products that stay within budget.</p></div><button onClick={() => { setSort("price-low"); setCategory("All"); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>See more <ArrowRight /></button></header>
        <div className="vp-product-rail">{budget.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div>
      </section>

      <section className="vp-catalog" id="catalog">
        <header><div><small>COMPLETE MARKETPLACE</small><h2>Explore all products</h2><p>Search, filter and compare value across the catalog.</p></div><span>{filteredProducts.length} products</span></header>
        <div className="vp-catalog-toolbar">
          <div><SlidersHorizontal />{["All", "Mobile", "Electronics", "Fashion", "Home", "Kitchen", "Computer", "Gaming"].map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Popularity</option><option value="rating">Customer rating</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></label>
        </div>
        {filteredProducts.length ? <div className="vp-catalog-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product.id)} authUser={authUser} />)}</div> : <div className="vp-empty"><Search /><h3>No matching products found</h3><p>Try a broader search or clear the selected department.</p><button type="button" onClick={() => { setSearch(""); setCategory("All"); }}>Clear all filters</button></div>}
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
        <div className="vp-footer-main"><div className="vp-footer-brand"><Link className="vp-brand" href="/"><img src="/vpansak-logo.png" alt="VPANSAK" /><span><strong>VPANSAK</strong><small>SHOPPING</small></span></Link><p>An exclusive Direct-to-Consumer (D2C) brand store by A&amp;A Group.</p><span><ShieldCheck /> Secure shopping experience</span></div><div><strong>SHOP</strong><Link href="/categories">All categories</Link><a href="#catalog">Top offers</a><Link href="/account">Wishlist</Link><Link href="/track">Track order</Link></div><div><strong>HELP</strong><a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support hub</a><Link href="/info/faq">FAQs</Link><Link href="/policies/refund-policy">Refund policy</Link><Link href="/policies/shipping-policy">Shipping policy</Link><Link href="/info/useful-links" onClick={(e) => { e.preventDefault(); setUsefulLinksOpen(true); }}>Useful links</Link></div><div><strong>BRAND &amp; COMMUNITY</strong><Link href="/seller">Direct Store Policy</Link><Link href="/policies/merchant-guidelines">Quality SLA</Link><Link href="/foundation">Support Foundation</Link></div><div><strong>COMPANY</strong><Link href="/info/about">About VPANSAK</Link><Link href="/info/careers">Careers</Link><Link href="/info/contact">Contact us</Link></div></div>
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

      {/* Floating Raksha Bandhan Lucky Wheel Shortcut Button */}
      <Link href="/event" className="rakhi-floating-event-btn" title="Raksha Bandhan Lucky Wheel">
        <span className="text-lg animate-bounce">🪔</span>
        <span className="font-extrabold text-xs">Lucky Wheel</span>
      </Link>
    </main>
  );
}
