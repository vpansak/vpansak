"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Heart,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatalogProduct, catalogProducts } from "../lib/catalog";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function ProductCollectionCard({
  product,
  wished,
  onWish,
  onAdd
}: {
  product: CatalogProduct;
  wished: boolean;
  onWish: () => void;
  onAdd: () => void;
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const activeVariant = product.variants?.[selectedVariantIndex] || {
    color: "Matte Black",
    hex: "#1c1917",
    imageUrl: product.imageUrl
  };
  const discount = Math.round((1 - product.price / product.mrp) * 100);

  return (
    <article className="vp-product-card collection-card" style={{ borderRadius: 16 }}>
      <div className="vp-product-media" style={{ height: 260 }}>
        <span className="vp-product-badge">VPANSAK Official</span>
        <button
          className={wished ? "vp-wish active" : "vp-wish"}
          type="button"
          onClick={onWish}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart fill={wished ? "currentColor" : "none"} />
        </button>
        <Link href={`/product/${product.id}`}>
          <img src={activeVariant.imageUrl || product.imageUrl} alt={product.name} loading="lazy" />
        </Link>
      </div>

      <div className="vp-product-copy" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <small style={{ color: "#06b6d4", fontWeight: 800 }}>{product.capacity} • Insulated</small>
          <div className="vp-rating" style={{ margin: 0 }}>
            <strong>{(product.rating / 10).toFixed(1)} ★</strong>
          </div>
        </div>

        <h3 style={{ height: 44, fontSize: 15, margin: "6px 0 10px" }}>
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Color Swatches */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 0 14px" }}>
          <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 4 }}>Color:</span>
          {product.variants?.map((v, idx) => (
            <button
              key={v.color}
              type="button"
              onClick={() => setSelectedVariantIndex(idx)}
              title={v.color}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: v.hex,
                border: idx === selectedVariantIndex ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.3)",
                boxShadow: idx === selectedVariantIndex ? "0 0 8px #6366f1" : "none",
                cursor: "pointer"
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: "#cbd5e1", marginLeft: 4, fontWeight: 700 }}>
            {activeVariant.color}
          </span>
        </div>

        <div className="vp-price" style={{ margin: "12px 0" }}>
          <strong style={{ fontSize: 20 }}>{money(product.price)}</strong>
          <s>{money(product.mrp)}</s>
          <span>{discount}% OFF</span>
        </div>

        <p style={{ margin: "6px 0 14px", color: "#94a3b8", fontSize: 11 }}>
          <Truck size={13} style={{ color: "#10b981" }} /> Free 2-Day Express Delivery
        </p>

        <div className="vp-card-actions" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button" onClick={onAdd} style={{ height: 38, fontSize: 12 }}>
            <ShoppingCart size={14} /> Add to Cart
          </button>
          <Link
            href={`/checkout?product=${product.id}&qty=1`}
            style={{
              height: 38,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CollectionsPage() {
  const [productsList, setProductsList] = useState<CatalogProduct[]>(catalogProducts);
  const [selectedCapacity, setSelectedCapacity] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");
  const [authUser, setAuthUser] = useState<{ email: string; fullName: string } | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length) {
          setProductsList(data.products);
        }
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (selectedCapacity === "All") return productsList;
    return productsList.filter((p) => p.capacity === selectedCapacity);
  }, [productsList, selectedCapacity]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const addToCart = (id: string) => {
    if (!authUser) {
      notify("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    notify("Added to cart");
  };

  const toggleWishlist = (id: string) => {
    if (!authUser) {
      notify("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    notify(wishlist.includes(id) ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <main className="vp-store product-page" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {toast && (
        <div className="vp-toast">
          <Sparkles />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sub-header">
        <Link className="vp-brand" href="/" style={{ color: "#fff", textDecoration: "none" }}>
          <img src="/vpansak-logo.png" alt="VPANSAK" style={{ width: 36, height: 36 }} />
          <span>
            <strong>VPANSAK</strong>
            <small style={{ color: "#06b6d4" }}>OFFICIAL STORE</small>
          </span>
        </Link>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/" style={{ color: "#cbd5e1", fontSize: 13, textDecoration: "none" }}>
            Home
          </Link>
          <Link href="/collections" style={{ color: "#6366f1", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
            Collections
          </Link>
          <Link href={authUser ? "/account" : "/login"} style={{ color: "#cbd5e1", fontSize: 13, textDecoration: "none" }}>
            {authUser ? "My Account" : "Sign In"}
          </Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <strong>VPANSAK Collection — Reusable Water Bottles</strong>
      </div>

      {/* Hero Banner */}
      <section
        style={{
          width: "min(1420px, calc(100% - 32px))",
          margin: "0 auto 30px",
          padding: "48px 36px",
          borderRadius: 24,
          background: "linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0c1427 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          color: "#fff"
        }}
      >
        <span
          style={{
            color: "#06b6d4",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase"
          }}
        >
          VPANSAK OFFICIAL COLLECTION
        </span>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 54px)",
            margin: "12px 0 16px",
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: "-0.03em"
          }}
        >
          Made for the Modern Life.
        </h1>
        <p
          style={{
            maxWidth: 620,
            color: "#cbd5e1",
            fontSize: 15,
            lineHeight: 1.65,
            margin: "0 0 24px"
          }}
        >
          Discover VPANSAK&apos;s flagship reusable water bottle collection. Crafted with 18/8 pro-grade stainless steel, double-wall vacuum copper insulation, and minimal luxury branding.
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#34d399", fontSize: 13, fontWeight: 700 }}>
            <BadgeCheck size={18} /> 100% VPANSAK Genuine
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#818cf8", fontSize: 13, fontWeight: 700 }}>
            <ShieldCheck size={18} /> 1-Year Official Warranty
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>
            <PackageCheck size={18} /> Leakproof &amp; BPA Free
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <div
        style={{
          width: "min(1420px, calc(100% - 32px))",
          margin: "0 auto",
          padding: 24,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <div>
            <span style={{ color: "#06b6d4", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em" }}>
              OUR PRODUCTS
            </span>
            <h2 style={{ fontSize: 26, margin: "4px 0 0", color: "#fff" }}>
              VPANSAK Reusable Bottles ({filtered.length})
            </h2>
          </div>

          {/* Capacity Pills */}
          <div style={{ display: "flex", gap: 8 }}>
            {["All", "600ml", "750ml", "1000ml"].map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => setSelectedCapacity(cap)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid " + (selectedCapacity === cap ? "#6366f1" : "rgba(255,255,255,0.12)"),
                  background: selectedCapacity === cap ? "#6366f1" : "rgba(255,255,255,0.04)",
                  color: selectedCapacity === cap ? "#fff" : "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {cap === "All" ? "All Sizes" : cap}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20
          }}
        >
          {filtered.map((product) => (
            <ProductCollectionCard
              key={product.id}
              product={product}
              wished={wishlist.includes(product.id)}
              onWish={() => toggleWishlist(product.id)}
              onAdd={() => addToCart(product.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
