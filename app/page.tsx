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
  WalletCards,
  X,
  Zap,
  Car,
  Watch,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatalogProduct, catalogProducts } from "./lib/catalog";

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
  { eyebrow: "VPANSAK SAVINGS FESTIVAL", title: "Premium tech.\nSmarter prices.", copy: "Upgrade your everyday with verified electronics, mobiles and accessories at launch prices.", offer: "Up to 60% off", button: "Explore electronics", category: "Electronics", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "NEW SEASON EDIT", title: "Everyday style,\nmade effortless.", copy: "Fresh fashion picks, useful accessories and easy deals for every plan.", offer: "From ₹399", button: "Shop fashion", category: "Fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=88", theme: "rose" },
  { eyebrow: "HOME REFRESH DAYS", title: "Small upgrades.\nA better home.", copy: "Thoughtful furniture, kitchen and home essentials for comfortable spaces.", offer: "Minimum 40% off", button: "Refresh your home", category: "Home", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=88", theme: "gold" },
  { eyebrow: "MOBILE MEGA DAYS", title: "Faster phones.\nBetter everyday.", copy: "Explore dependable 5G smartphones, accessories and mobile essentials at smart prices.", offer: "From ₹9,999", button: "Shop mobiles", category: "Mobile", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "KITCHEN BESTSELLERS", title: "Cook smarter.\nServe happier.", copy: "Useful cookware, storage and everyday kitchen tools selected for modern homes.", offer: "Up to 55% off", button: "Explore kitchen", category: "Kitchen", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=88", theme: "gold" },
  { eyebrow: "BEAUTY & SELF CARE", title: "Simple care.\nEveryday glow.", copy: "Discover skincare and personal-care essentials for an uncomplicated daily routine.", offer: "Starting ₹299", button: "Shop beauty", category: "Beauty", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=88", theme: "rose" },
  { eyebrow: "GAMING ZONE", title: "Level up.\nPlay your way.", copy: "Controllers, audio and gaming accessories made for relaxed and responsive play.", offer: "Up to 45% off", button: "Enter gaming", category: "Gaming", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "FITNESS PICKS", title: "Move better.\nFeel stronger.", copy: "Practical sports and home-fitness essentials for stretching, training and active days.", offer: "From ₹499", button: "Shop sports", category: "Sports", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=88", theme: "gold" },
  { eyebrow: "STUDY & WORK", title: "Focus more.\nCreate better.", copy: "Laptops, planners and desk essentials that make study and everyday work feel organised.", offer: "Up to 35% off", button: "Explore computers", category: "Computer", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1800&q=88", theme: "blue" },
  { eyebrow: "TOYS & CREATIVITY", title: "Big ideas.\nHappy play.", copy: "Creative toys and building sets for fun, curiosity and screen-free family time.", offer: "From ₹349", button: "Shop toys", category: "Toys", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1800&q=88", theme: "rose" },
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
  const [announcementOpen, setAnnouncementOpen] = useState(true);
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

  return (
    <main className="vp-store">
      {toast && <div className="vp-toast"><Sparkles /><span>{toast}</span></div>}

      <header className={`vp-header-shell ${isCollapsed ? "is-collapsed" : ""}`} id="top">
        <div className="mobile-header-collapsible">
          {announcementOpen && <div className="vp-topbar vp-offer-announcement">
            <span><Gift /> FAST &amp; FREE DELIVERY</span>
            <p><strong>Free shipping on prepaid &amp; COD orders across India</strong><small>Easy returns • 24/7 customer support</small></p>
            <div><Link href="/track">Track order</Link><Link href="/support">Help centre</Link><button type="button" onClick={() => setAnnouncementOpen(false)} aria-label="Close announcement"><X /></button></div>
          </div>}

          <div className="vp-brand-row">
            <Link className="vp-brand" href="/" aria-label="VPANSAK Shopping home"><img src="/vpansak-logo.png" alt="VPANSAK" /><span><strong>VPANSAK</strong><small>SHOPPING</small></span></Link>
            <button className="vp-location" type="button" onClick={() => notify("Add your delivery PIN at checkout")}><MapPin /><span><small>Delivering across</small>India</span><ChevronDown /></button>
            <div className="vp-header-actions">
              <Link href={authUser ? "/account" : "/login"}><UserRound /><span><small>{authUser ? `Hello, ${authUser.fullName || authUser.email.split("@")[0]}` : "Hello, sign in"}</small>My Account</span></Link>
              <Link href={authUser ? "/account" : "/login"}><Heart /><span><small>{wishlist.length} saved</small>Wishlist</span></Link>
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
        {categories.slice(0, 7).map((item) => <button type="button" key={item.name} onClick={() => chooseCategory(item.value)}>{item.name}</button>)}
        <Link href="/seller"><Store /> Become a Seller</Link>
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
        <button type="button" className="vp-banner-seller" onClick={() => { window.location.href = "/seller"; }}><Store /><span><small>SELL ON VPANSAK</small><strong>Take your business online.</strong><b>Start seller registration</b></span><ArrowRight /></button>
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
        <Link href="/support"><Headphones /><span><small>24×7 SUPPORT HUB</small><strong>Create &amp; track a ticket</strong><p>Get structured help for orders, payments, delivery and technical issues.</p></span><ArrowRight /></Link>
        <Link href="/seller"><Store /><span><small>MERCHANT PLATFORM</small><strong>Grow with VPANSAK</strong><p>Register, complete verification and manage your product business.</p></span><ArrowRight /></Link>
        <Link href="/info/about"><CircleHelp /><span><small>VPANSAK ECOSYSTEM</small><strong>Explore our headquarters</strong><p>Shopping, support, foundation and business tools in one place.</p></span><ArrowRight /></Link>
      </section>

      <footer className="vp-footer">
        <div className="vp-footer-main"><div className="vp-footer-brand"><Link className="vp-brand" href="/"><img src="/vpansak-logo.png" alt="VPANSAK" /><span><strong>VPANSAK</strong><small>SHOPPING</small></span></Link><p>A secure, useful and customer-focused digital marketplace by A&amp;A Group.</p><span><ShieldCheck /> Secure shopping experience</span></div><div><strong>SHOP</strong><Link href="/categories">All categories</Link><a href="#catalog">Top offers</a><Link href="/account">Wishlist</Link><Link href="/track">Track order</Link></div><div><strong>HELP</strong><Link href="/support">Support hub</Link><Link href="/info/faq">FAQs</Link><Link href="/policies/refund-policy">Refund policy</Link><Link href="/policies/shipping-policy">Shipping policy</Link></div><div><strong>BUSINESS</strong><Link href="/seller">Become a seller</Link><Link href="/seller/dashboard">Seller dashboard</Link><Link href="/policies/merchant-guidelines">Merchant guidelines</Link><Link href="/foundation">Support Foundation</Link></div><div><strong>COMPANY</strong><Link href="/founder">Founder Alok Singh</Link><Link href="/cofounder">Co-Founder Ayushi Tripathi</Link><Link href="/info/about">About VPANSAK</Link><Link href="/info/careers">Careers</Link><Link href="/info/contact">Contact us</Link></div></div>
        <div className="vp-footer-bottom"><span>© 2026 VPANSAK • Powered by A&amp;A Group</span><div><Link href="/policies/privacy-policy">Privacy</Link><Link href="/policies/terms-and-conditions">Terms</Link><a href="mailto:support.vpansak@gmail.com">support.vpansak@gmail.com</a><a href="https://instagram.com/VPANSAK" target="_blank" rel="noreferrer">Instagram</a></div></div>
      </footer>

      <nav className="vp-bottom-nav" aria-label="Mobile navigation"><a href="#top"><Home /><span>Home</span></a><Link href="/categories"><Grid3X3 /><span>Categories</span></Link><Link href="/foundation" className="vp-donate-item"><HeartHandshake /><span>Donate</span></Link><Link href="/track"><Box /><span>Orders</span></Link><Link href={authUser ? "/account" : "/login"}><UserRound /><span>{authUser ? "Account" : "Sign In"}</span></Link></nav>

      {cartOpen && <div className="vp-overlay" onMouseDown={() => setCartOpen(false)}><aside className="vp-cart" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseDown={(event) => event.stopPropagation()}><header><div><small>MY CART</small><h2>{cartCount} {cartCount === 1 ? "item" : "items"}</h2></div><button type="button" onClick={() => setCartOpen(false)}><X /></button></header><div className="vp-cart-benefit"><Truck /><span><strong>{subtotal >= 499 ? "You unlocked free delivery" : `${money(499 - subtotal)} away from free delivery`}</strong><i><b style={{ width: `${Math.min(100, subtotal / 4.99)}%` }} /></i></span></div><div className="vp-cart-items">{cartItems.length ? cartItems.map((product) => <article key={product.id}><img src={product.imageUrl} alt="" /><div><small>{product.brand}</small><h3>{product.name}</h3><strong>{money(product.price)}</strong><span><button type="button" onClick={() => changeQuantity(product.id, -1)}><Minus /></button><b>{cart[product.id]}</b><button type="button" onClick={() => changeQuantity(product.id, 1)}><Plus /></button></span></div><button type="button" onClick={() => changeQuantity(product.id, -cart[product.id])}><Trash2 /></button></article>) : <div className="vp-cart-empty"><ShoppingCart /><h3>Your cart is waiting</h3><p>Add a useful product from today&apos;s deals.</p><button type="button" onClick={() => setCartOpen(false)}>Continue shopping</button></div>}</div>{cartItems.length > 0 && <div className="vp-cart-summary"><p><span>Price ({cartCount} items)</span><b>{money(subtotal)}</b></p>{discount > 0 && <p><span>Coupon discount</span><b className="green">−{money(discount)}</b></p>}<p><span>Delivery charges</span><b className="green">FREE</b></p><div><span>Total amount</span><strong>{money(finalTotal)}</strong></div><button type="button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Proceed to checkout <ArrowRight /></button><small><ShieldCheck /> Safe and secure checkout</small></div>}</aside></div>}

      {checkoutOpen && <div className="vp-overlay centered" onMouseDown={() => setCheckoutOpen(false)}><div className="vp-checkout" role="dialog" aria-modal="true" aria-label="Secure checkout" onMouseDown={(event) => event.stopPropagation()}><header><div><small>SECURE CHECKOUT</small><h2>Complete your order</h2></div><button type="button" onClick={() => setCheckoutOpen(false)}><X /></button></header><form onSubmit={placeOrder}><section><h3><span>1</span> Delivery address</h3><div className="vp-form-grid"><label>Full name<input name="customerName" required maxLength={100} autoComplete="name" /></label><label>Mobile number<input name="mobile" required inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel" /></label><label className="wide">House number, area and street<input name="address" required maxLength={250} autoComplete="street-address" /></label><label>City<input name="city" required maxLength={80} autoComplete="address-level2" /></label><label>PIN code<input name="pinCode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" /></label></div></section><section><h3><span>2</span> Payment method</h3><div className="vp-payment-options"><label className="disabled"><input type="radio" disabled /><CreditCard /><span><strong>UPI / Cards</strong><small>UPI, Cards &amp; Netbanking</small></span></label><label><input type="radio" name="paymentMethod" value="Cash on Delivery" defaultChecked /><Banknote /><span><strong>Cash on Delivery</strong><small>Pay when the order arrives</small></span></label><label className="disabled"><input type="radio" disabled /><WalletCards /><span><strong>Gift Card</strong><small>Available after wallet activation</small></span></label></div></section><section><h3><span>3</span> Apply coupon</h3><div className="vp-checkout-coupon"><Tag /><input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Enter promo code" /><button type="button" onClick={applyCoupon}>Apply</button></div></section><div className="vp-checkout-total"><span>Payable amount</span><strong>{money(finalTotal)}</strong></div><button className="vp-place-order" type="submit">Place COD order <ShieldCheck /></button><p className="vp-checkout-note"><Clock3 /> Order confirmation is generated immediately with a trackable VPANSAK order ID.</p></form></div></div>}

      {orderPlaced && <div className="vp-overlay centered"><div className="vp-order-success"><span><Check /></span><small>ORDER CONFIRMED</small><h2>Your VPANSAK order is placed.</h2><p>Save this order ID. It opens the complete confirmation-to-delivery timeline.</p><strong>{orderPlaced}</strong><button type="button" onClick={() => { window.location.href = `/track?id=${orderPlaced}`; }}>Track my order <ArrowRight /></button></div></div>}
    </main>
  );
}
