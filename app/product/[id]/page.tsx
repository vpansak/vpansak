"use client";

import { ArrowLeft, BadgeCheck, Check, ChevronLeft, ChevronRight, CreditCard, Eye, Heart, Minus, PackageCheck, Plus, RefreshCw, RotateCcw, Share2, ShieldCheck, ShoppingCart, Sparkles, Star, Truck, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalogProducts } from "../../lib/catalog";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = catalogProducts.find((item) => item.id === id);
  const related = useMemo(
    () => product ? catalogProducts.filter((item) => item.id !== product.id).slice(0, 4) : catalogProducts.slice(0, 4),
    [product]
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colors?.[0]?.name || "Matte Black"
  );

  const images = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length) return product.images;
    return [product.imageUrl];
  }, [product]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);
  const [toast, setToast] = useState("");
  const [pincode, setPincode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Desktop Hover Zoom state
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Mobile Touch Swipe state
  const touchStartX = useRef<number | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Array<{ id: number; displayName: string; rating: number; title: string; body: string; createdAt: string }>>([]);

  // Reset selected image index & color when product changes
  useEffect(() => {
    if (!product) return;
    setActiveImgIndex(0);
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
    fetch(`/api/reviews?product=${encodeURIComponent(product.id)}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
  }, [product?.id]);

  if (!product) {
    return (
      <main className="product-page" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <ShieldCheck size={48} style={{ color: "#1766ef", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", margin: "8px 0" }}>Product Not Found</h2>
          <p style={{ color: "#64748b", margin: "8px 0 24px" }}>The requested VPANSAK bottle is currently unavailable or updating.</p>
          <Link href="/" style={{ padding: "12px 24px", background: "#1766ef", color: "white", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}>
            Return to Storefront
          </Link>
        </div>
      </main>
    );
  }

  const activeImage = images[activeImgIndex] || product.imageUrl;

  const notice = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  const handlePincodeCheck = () => {
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPinMessage("Please enter a valid 6-digit PIN code");
      return;
    }
    setPinMessage(`Delivery available for ${cleanPin} • Express delivery in 2–3 business days`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        setActiveImgIndex((prev) => (prev + 1) % images.length);
      } else {
        setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  };

  const handleColorSelect = (colorName: string, imageIndex?: number) => {
    setSelectedColor(colorName);
    if (typeof imageIndex === "number" && images[imageIndex]) {
      setActiveImgIndex(imageIndex);
    }
  };

  const [authUser, setAuthUser] = useState<unknown | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (data && data.user) {
          setAuthUser(data.user);
          const accRes = await fetch("/api/account");
          if (accRes.ok) {
            const accData = await accRes.json();
            if (Array.isArray(accData.wishlist)) {
              setWish(accData.wishlist.some((w: { productId: string }) => w.productId === product.id));
            }
          }
        }
      })
      .catch(() => {});
  }, [product.id]);

  const add = async () => {
    if (!authUser) {
      notice("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cart", productId: product.id, quantity: qty, color: selectedColor }),
      });
      if (response.ok) notice(`Added ${product.name} (${selectedColor}) to cart`);
      else notice("Cart could not be saved");
    } catch {
      notice("Cart could not be saved");
    }
  };

  const toggleWish = async () => {
    if (!authUser) {
      notice("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const nextWishState = !wish;
    setWish(nextWishState);
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "wishlist", productId: product.id }),
      });
      if (response.ok) {
        notice(nextWishState ? "Saved to wishlist" : "Removed from wishlist");
      } else {
        setWish(!nextWishState);
        notice("Could not update wishlist");
      }
    } catch {
      setWish(!nextWishState);
      notice("Could not update wishlist");
    }
  };

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authUser) {
      notice("Please sign in to continue.");
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        displayName: form.get("name"),
        rating: Number(form.get("rating")),
        title: form.get("title"),
        body: form.get("body"),
      }),
    });
    const data = await response.json();
    notice(response.ok ? "Review submitted for approval" : data.error || "Could not submit review");
    if (response.ok) formElement.reset();
  };

  const discountPercent = Math.round((1 - product.price / product.mrp) * 100);

  return (
    <main className="product-page">
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>OFFICIAL STORE</small>
          </span>
        </Link>
        <nav>
          <Link href="/collections">
            <ArrowLeft size={16} style={{ display: "inline-block", marginRight: "4px" }} />
            All Bottles
          </Link>
          <Link href="/account">My Account</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support Hub</a>
        </nav>
      </header>

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href="/collections">Water Bottles</Link>
        <ChevronRight size={14} />
        <strong>{product.name}</strong>
      </nav>

      {/* Main Product Showcase Section */}
      <section className="product-detail">
        <div className="product-gallery-container">
          <div className="product-gallery">
            <div className="thumbs">
              {images.map((src, idx) => (
                <button
                  className={idx === activeImgIndex ? "active" : ""}
                  key={`${src}-${idx}`}
                  onClick={() => setActiveImgIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={src} alt={`${product.name} view ${idx + 1}`} />
                </button>
              ))}
            </div>

            {/* Interactive Image Box with Hover Zoom and Mobile Touch Swipe */}
            <div
              className="main-product-image"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={activeImage}
                alt={product.name}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isHovering ? "scale(2.2)" : "scale(1)",
                }}
              />

              {/* Image badges & controls */}
              <div className="image-overlay-controls">
                <span className="zoom-hint">
                  <Eye size={12} /> {isHovering ? "Hover zoomed" : "Hover to zoom • Swipe on mobile"}
                </span>
                <button
                  className="full-zoom-btn"
                  onClick={() => setIsZoomOpen(true)}
                  title="Expand image"
                  type="button"
                >
                  <Sparkles size={13} /> Enlarge
                </button>
              </div>

              {/* Slider Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    className="gallery-nav-btn prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="gallery-nav-btn next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIndex((prev) => (prev + 1) % images.length);
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Mobile Dots */}
              {images.length > 1 && (
                <div className="mobile-slider-dots">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={idx === activeImgIndex ? "dot active" : "dot"}
                      onClick={() => setActiveImgIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Purchase Summary */}
        <div className="product-summary product-details-card">
          <div className="product-meta-header product-meta-top">
            <small style={{ fontWeight: 700, letterSpacing: "0.05em", color: "#1766ef" }}>
              VPANSAK OFFICIAL • REUSABLE COLLECTION
            </small>
            <span className="stock-badge in-stock">
              <Check size={12} /> {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <h1 className="product-title">{product.name}</h1>

          <div className="detail-rating rating-sku-row">
            <div className="rating-group">
              <strong>
                {(product.rating / 10).toFixed(1)} <Star fill="currentColor" size={12} />
              </strong>
              <span>{product.reviewCount.toLocaleString("en-IN")} verified buyer reviews</span>
            </div>
            <span className="sku-tag sku-text">SKU: {product.sku}</span>
          </div>

          <p className="product-description">{product.description}</p>

          {/* Pricing & Savings */}
          <div className="detail-price price-row">
            <strong className="selling-price">{money(product.price)}</strong>
            <s>{money(product.mrp)}</s>
            <span className="discount-tag">{discountPercent}% OFF</span>
            <small className="price-savings">Save {money(product.mrp - product.price)}</small>
          </div>
          <p className="tax-note">Inclusive of all taxes • Free express shipping nationwide</p>

          {/* Color Swatch Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="color-selector-section" style={{ margin: "20px 0" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
                Select Color Variant: <span style={{ color: "#1766ef" }}>{selectedColor}</span>
              </label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                {product.colors.map((c, idx) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleColorSelect(c.name, idx % images.length)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: isSelected ? "2px solid #1766ef" : "1px solid #cbd5e1",
                        background: isSelected ? "#eff6ff" : "#ffffff",
                        cursor: "pointer",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: "13px",
                        color: isSelected ? "#1e40af" : "#334155",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          backgroundColor: c.hex,
                          border: "1px solid rgba(0,0,0,0.15)",
                          display: "inline-block",
                        }}
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Capacity / Size Selection */}
          {product.capacity && (
            <div className="capacity-section" style={{ margin: "16px 0 24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
                Capacity:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <span
                  style={{
                    padding: "8px 16px",
                    background: "#0f172a",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {product.capacity}
                </span>
              </div>
            </div>
          )}

          {/* Key Highlights Pills */}
          <div className="highlights-pills product-feature-chips">
            <span className="product-feature-chip">100% Leakproof Lid</span>
            <span className="product-feature-chip">24 hrs Cold / 12 hrs Hot</span>
            <span className="product-feature-chip long-chip">304 Food-Grade Stainless Steel</span>
            <span className="product-feature-chip">BPA & Toxin Free</span>
            <span className="product-feature-chip">Sweat-Proof Coating</span>
          </div>

          {/* Offers */}
          <div className="offer-box offers-card">
            <b>VPANSAK Brand Guarantees</b>
            <div className="offer-item">
              <BadgeCheck className="offer-icon" size={16} />
              <div className="offer-text">
                1-Year Official Warranty against manufacturing defects &amp; thermal failure
              </div>
            </div>
            <div className="offer-item">
              <BadgeCheck className="offer-icon" size={16} />
              <div className="offer-text">
                Free Express Delivery nationwide + Secure COD &amp; Online Checkout
              </div>
            </div>
            <div className="offer-item">
              <BadgeCheck className="offer-icon" size={16} />
              <div className="offer-text">
                Direct from VPANSAK — 100% Authentic product guaranteed
              </div>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="delivery-box">
            <Truck />
            <div>
              <strong>Check Delivery Availability</strong>
              <label>
                <input
                  placeholder="Enter 6-digit PIN code"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePincodeCheck()}
                />
                <button type="button" onClick={handlePincodeCheck}>
                  Check
                </button>
              </label>
              {pinMessage ? (
                <small className={pinMessage.includes("valid") ? "pin-err" : "pin-ok"}>{pinMessage}</small>
              ) : (
                <small>Enter your PIN code to check express delivery time</small>
              )}
            </div>
          </div>

          {/* Purchase Actions & Quantity Selector */}
          <div className="purchase-row">
            <div className="detail-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                <Minus />
              </button>
              <b>{qty}</b>
              <button onClick={() => setQty(Math.min(10, qty + 1))} aria-label="Increase quantity">
                <Plus />
              </button>
            </div>
            <button className="add-detail" onClick={add}>
              <ShoppingCart /> Add to Cart
            </button>
            <button
              className="buy-detail"
              onClick={() => {
                if (!authUser) {
                  window.location.href = `/login?return_to=${encodeURIComponent(`/checkout?product=${product.id}&qty=${qty}&color=${encodeURIComponent(selectedColor)}`)}`;
                  return;
                }
                window.location.href = `/checkout?product=${product.id}&qty=${qty}&color=${encodeURIComponent(selectedColor)}`;
              }}
            >
              Buy Now
            </button>
            <button
              className={wish ? "wish-detail active" : "wish-detail"}
              onClick={toggleWish}
              aria-label="Add to wishlist"
            >
              <Heart fill={wish ? "currentColor" : "none"} />
            </button>
            <button
              className="share-detail"
              onClick={() => {
                navigator.clipboard?.writeText(location.href);
                notice("VPANSAK bottle link copied");
              }}
              aria-label="Share product"
            >
              <Share2 />
            </button>
          </div>

          {/* Assurance Icons */}
          <div className="product-assurances">
            <span>
              <CreditCard /> <b>UPI &amp; Card Payments</b>
            </span>
            <span>
              <ShieldCheck /> <b>1-Year Warranty</b>
            </span>
            <span>
              <RotateCcw /> <b>7-Day Easy Replacement</b>
            </span>
            <span>
              <PackageCheck /> <b>Prepaid &amp; COD Available</b>
            </span>
          </div>
        </div>
      </section>

      {/* Comprehensive Product Sections */}
      <section className="product-content-grid">
        {/* Product Details & Key Highlights */}
        <article className="content-card">
          <h2>Engineering &amp; Design Highlights</h2>
          <p>{product.description}</p>
          <ul className="highlights-list">
            <li>
              <strong>Double-Wall Vacuum Insulation:</strong> Keeps beverages icy cold for up to 24 hours or steaming hot for up to 12 hours without external condensation.
            </li>
            <li>
              <strong>304 Food-Grade Stainless Steel:</strong> Crafted from premium rust-resistant 18/8 stainless steel that preserves pure taste with zero metallic flavor transfer.
            </li>
            <li>
              <strong>100% Leakproof Airtight Seal:</strong> Precision silicone gasket lid allows you to toss the bottle into backpacks or gym bags without risk of spills.
            </li>
            <li>
              <strong>Durable Matte Powder Coating:</strong> Offers a tactile, slip-free grip resistant to scratches, sweat, and daily wear.
            </li>
            <li>
              <strong>BPA-Free &amp; Eco-Friendly:</strong> 100% free of BPA, phthalates, and toxins. Replace single-use plastics with a bottle designed to last years.
            </li>
            <li>
              <strong>Ergonomic Carry Handle:</strong> Integrated carry loop or strap makes hydration effortless during workouts, commutes, and outdoor travel.
            </li>
          </ul>
        </article>

        {/* Care & Maintenance */}
        <article className="content-card how-to-use-card">
          <h2>Care &amp; Cleaning Instructions</h2>
          <div className="usage-steps">
            <div className="step-item">
              <span className="step-num">01</span>
              <div>
                <strong>First Use Wash</strong>
                <p>Rinse bottle and lid thoroughly with warm soapy water before filling for the first time.</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">02</span>
              <div>
                <strong>Daily Cleaning</strong>
                <p>Hand wash with a bottle brush. Avoid abrasive scrubbers to preserve the premium powder coating finish.</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">03</span>
              <div>
                <strong>Drying &amp; Storage</strong>
                <p>Store bottle with the cap off to allow internal air circulation and keep internal walls fresh.</p>
              </div>
            </div>
          </div>
        </article>

        {/* Materials & Safety Section */}
        <article className="content-card">
          <h2>Materials &amp; Eco Commitment</h2>
          <div className="key-ingredient-box">
            <Sparkles size={20} />
            <div>
              <strong>Built for Sustainability</strong>
              <p>One VPANSAK bottle prevents hundreds of single-use plastic bottles from polluting landfills each year.</p>
            </div>
          </div>
          <div className="ingredient-matrix">
            <p>
              <strong>Material Composition:</strong> Body: 18/8 (304) Stainless Steel • Cap: Food-grade Polypropylene (PP5) &amp; BPA-Free Silicone Seal.
            </p>
            <small>Tested and certified for safe daily contact with hot and cold beverages.</small>
          </div>
        </article>

        {/* Return Policy & Guarantee Section */}
        <article className="content-card return-policy-card">
          <h2>VPANSAK 1-Year Guarantee &amp; Return Policy</h2>
          <div className="return-policy-content">
            <div className="policy-badge">
              <RotateCcw size={24} />
              <div>
                <strong>7 Days Replacement &amp; 1-Year Warranty</strong>
                <p>Includes full replacement coverage for insulation defects, leaks, or transit damages.</p>
              </div>
            </div>
            <div className="policy-details">
              <p>
                <Check size={14} /> <strong>Hassle-Free Support:</strong> Reach out to VPANSAK Support Hub with your Order ID for instant assistance.
              </p>
              <p>
                <Check size={14} /> <strong>Guaranteed Quality:</strong> Every bottle undergoes double-layer vacuum pressure testing before shipping.
              </p>
            </div>
          </div>
        </article>

        {/* Technical Specifications */}
        <article className="content-card full-width-card">
          <h2>Technical Specifications</h2>
          <dl className="spec-dl">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      {/* Customer Reviews & Ratings */}
      <section className="review-section">
        <div className="review-head">
          <div>
            <small>VERIFIED VPANSAK REVIEWS</small>
            <h2>Customer Experience</h2>
          </div>
          <div className="score">
            <strong>{(product.rating / 10).toFixed(1)}</strong>
            <span>★</span>
            <small>{product.reviewCount} total ratings</small>
          </div>
        </div>

        <div className="review-layout">
          <div className="review-list">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id}>
                  <div>
                    <strong>{review.displayName}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <h3>{review.title}</h3>
                  <p>{review.body}</p>
                  <small>{new Date(review.createdAt).toLocaleDateString("en-IN")}</small>
                </article>
              ))
            ) : (
              <div className="no-reviews">
                <Star size={28} />
                <h3>No customer reviews submitted yet</h3>
                <p>Be the first owner of this VPANSAK bottle to leave your review!</p>
              </div>
            )}
          </div>

          <form className="review-form" onSubmit={submitReview}>
            <h3>Write a VPANSAK Bottle Review</h3>
            <label>
              Display Name
              <input name="name" required placeholder="e.g. Rahul M." />
            </label>
            <label>
              Rating
              <select name="rating" defaultValue="5">
                <option value="5">5 — Superior quality & insulation</option>
                <option value="4">4 — Very good bottle</option>
                <option value="3">3 — Decent</option>
                <option value="2">2 — Below expectations</option>
                <option value="1">1 — Poor</option>
              </select>
            </label>
            <label>
              Review Title
              <input name="title" required placeholder="e.g. Keeps water cold all day long!" />
            </label>
            <label>
              Your Review
              <textarea name="body" required minLength={10} placeholder="Tell us about thermal performance, finish, durability..." />
            </label>
            <button type="submit">Submit Review for Approval</button>
            <small>Reviews are verified for authenticity prior to publishing.</small>
          </form>
        </div>
      </section>

      {/* Similar / Related Products */}
      <section className="related-section">
        <small>EXPLORE THE VPANSAK RANGE</small>
        <h2>More Reusable Bottles</h2>
        <div>
          {related.map((item) => (
            <Link href={`/product/${item.id}`} key={item.id}>
              <img src={item.imageUrl} alt={item.name} />
              <span>
                <small>{item.category}</small>
                <strong>{item.name}</strong>
                <b>{money(item.price)}</b>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Fullscreen Image Zoom Modal */}
      {isZoomOpen && (
        <div className="zoom-modal-backdrop" onClick={() => setIsZoomOpen(false)}>
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-modal-close" onClick={() => setIsZoomOpen(false)} aria-label="Close modal">
              <X size={20} />
            </button>
            <img src={activeImage} alt={`${product.name} enlarged preview`} />
            <div className="zoom-modal-thumbs">
              {images.map((src, idx) => (
                <button
                  key={`zoom-thumb-${idx}`}
                  className={idx === activeImgIndex ? "active" : ""}
                  onClick={() => setActiveImgIndex(idx)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
