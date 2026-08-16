"use client";

import { ArrowLeft, BadgeCheck, Check, ChevronLeft, ChevronRight, Eye, Heart, Minus, PackageCheck, Plus, RefreshCw, RotateCcw, Share2, ShieldCheck, ShoppingCart, Sparkles, Star, Truck, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalogProducts } from "../../lib/catalog";

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = catalogProducts.find((item) => item.id === id) ?? catalogProducts[0];
  const related = useMemo(
    () => catalogProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4),
    [product]
  );

  const images = useMemo(() => {
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

  // Reset selected image index when product changes
  useEffect(() => {
    setActiveImgIndex(0);
    fetch(`/api/reviews?product=${encodeURIComponent(product.id)}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
  }, [product.id]);

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
    setPinMessage(`Delivery available for ${cleanPin} • Delivery in 2–3 business days`);
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
        // Swiped left -> next image
        setActiveImgIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swiped right -> prev image
        setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
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
        body: JSON.stringify({ action: "cart", productId: product.id, quantity: qty }),
      });
      if (response.ok) notice("Saved to your account cart");
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
            <small>SHOPPING</small>
          </span>
        </Link>
        <nav>
          <Link href="/">
            <ArrowLeft />
            Back to store
          </Link>
          <Link href="/account">My account</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support</a>

        </nav>
      </header>

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight />
        <Link href="/categories">{product.category}</Link>
        <ChevronRight />
        {product.specifications?.Subcategory && (
          <>
            <span>{product.specifications.Subcategory}</span>
            <ChevronRight />
          </>
        )}
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

              {/* Slider Arrows for Quick Navigation */}
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

              {/* Slider Pagination Dots for Mobile */}
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
            <small>{product.brand} • {product.category}</small>
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
              <span>{product.reviewCount.toLocaleString("en-IN")} verified ratings</span>
            </div>
            <span className="sku-tag sku-text">SKU: {product.sku}</span>
          </div>

          <p className="product-description">{product.description}</p>

          {/* Pricing & Discount */}
          <div className="detail-price price-row">
            <strong className="selling-price">{money(product.price)}</strong>
            <s>{money(product.mrp)}</s>
            <span className="discount-tag">{discountPercent}% OFF</span>
            <small className="price-savings">Save {money(product.mrp - product.price)}</small>
          </div>
          <p className="tax-note">Inclusive of all taxes &amp; free shipping</p>

          {/* Key Highlights Pills */}
          <div className="highlights-pills product-feature-chips">
            <span className="product-feature-chip">SPF 50 PA++++</span>
            <span className="product-feature-chip">Aqua Gel Texture</span>
            <span className="product-feature-chip long-chip">Oil-Free &amp; Fragrance-Free</span>
            <span className="product-feature-chip">1% Hyaluronic Acid</span>
            <span className="product-feature-chip">Lightweight Matte Finish</span>
          </div>

          {/* Offers */}
          <div className="offer-box offers-card">
            <b>Available Offers</b>
            <div className="offer-item">
              <BadgeCheck className="offer-icon" size={16} />
              <div className="offer-text">
                Special discounts &amp; promo codes applicable at checkout
              </div>
            </div>
            <div className="offer-item">
              <BadgeCheck className="offer-icon" size={16} />
              <div className="offer-text">
                Free express delivery on prepaid &amp; COD orders
              </div>
            </div>
            <div className="offer-item">
              <BadgeCheck className="offer-icon" size={16} />
              <div className="offer-text">
                100% Genuine product sourced directly from brand
              </div>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="delivery-box">
            <Truck />
            <div>
              <strong>Delivery & Availability Check</strong>
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
                <small>Enter PIN code to check estimated delivery date & COD availability</small>
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
                  window.location.href = `/login?return_to=${encodeURIComponent(`/checkout?product=${product.id}&qty=${qty}`)}`;
                  return;
                }
                window.location.href = `/checkout?product=${product.id}&qty=${qty}`;
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
                notice("Product link copied");
              }}
              aria-label="Share product"
            >
              <Share2 />
            </button>
          </div>

          {/* Assurance Icons */}
          <div className="product-assurances">
            <span>
              <ShieldCheck /> <b>100% Original</b>
            </span>
            <span>
              <RotateCcw /> <b>7-Day Return Policy</b>
            </span>
            <span>
              <PackageCheck /> <b>Assured Quality</b>
            </span>
          </div>
        </div>
      </section>

      {/* Comprehensive Product Sections */}
      <section className="product-content-grid">
        {/* Product Details & Key Highlights */}
        <article className="content-card">
          <h2>Product Details & Highlights</h2>
          <p>{product.description}</p>
          <ul className="highlights-list">
            <li>
              <strong>SPF 50 PA++++ Protection:</strong> High broad-spectrum defense against skin-damaging UVA & UVB rays.
            </li>
            <li>
              <strong>Lightweight Aqua Gel Texture:</strong> Absorbs quickly without sticky residue or heavy feel.
            </li>
            <li>
              <strong>Oil-Free & Fragrance-Free:</strong> Formulated without fragrance or clogging oils, reducing irritation risk.
            </li>
            <li>
              <strong>Suitable for Multiple Skin Types:</strong> Ideal for Dry, Oily, Combination, Acne-Prone, Normal & Sensitive Skin.
            </li>
            <li>
              <strong>Deep Hydration:</strong> Infused with 1% Hyaluronic Acid to retain skin moisture throughout the day.
            </li>
            <li>
              <strong>Matte Finish:</strong> Leaves a clean, smooth, non-greasy matte appearance under makeup or daily wear.
            </li>
          </ul>
        </article>

        {/* How to Use Section */}
        <article className="content-card how-to-use-card">
          <h2>How to Use</h2>
          <div className="usage-steps">
            <div className="step-item">
              <span className="step-num">01</span>
              <div>
                <strong>Dispense Quantity</strong>
                <p>Take approximately two-finger-length sunscreen gel onto clean fingertips.</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">02</span>
              <div>
                <strong>Even Application</strong>
                <p>Apply evenly on face, neck, ears and all other sun-exposed areas 15–20 minutes before stepping out.</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-num">03</span>
              <div>
                <strong>Reapply Regularly</strong>
                <p>Reapply every 4 hours or immediately after excessive sweating, towel drying, or washing the face.</p>
              </div>
            </div>
          </div>
        </article>

        {/* Ingredients Section */}
        <article className="content-card">
          <h2>Ingredients & Formulation</h2>
          <div className="key-ingredient-box">
            <Sparkles size={20} />
            <div>
              <strong>Key Active Ingredient: 1% Hyaluronic Acid</strong>
              <p>Attracts and locks in essential hydration without adding weight or greasy shine to the skin.</p>
            </div>
          </div>
          <div className="ingredient-matrix">
            <p>
              <strong>Formulated Matrix:</strong> Aqua (Water), Hyaluronic Acid (1%), Niacinamide, Zinc PCA, Vitamin E (Tocopherol), Glycerin, Ethylhexyl Methoxycinnamate, Cyclopentasiloxane, Ammonium Acryloyldimethyltaurate/VP Copolymer, Phenoxyethanol.
            </p>
            <small>Free from parabens, artificial fragrance, mineral oil, and dermatologically tested for daily skincare.</small>
          </div>
        </article>

        {/* Return Policy & Guarantee Section */}
        <article className="content-card return-policy-card">
          <h2>VPANSAK Return Policy & Assurance</h2>
          <div className="return-policy-content">
            <div className="policy-badge">
              <RotateCcw size={24} />
              <div>
                <strong>7 Days Easy Replacement & Return</strong>
                <p>Eligible for return or replacement within 7 days of delivery in case of damaged, defective, or incorrect items.</p>
              </div>
            </div>
            <div className="policy-details">
              <p>
                <Check size={14} /> <strong>Original Condition:</strong> Please retain original packaging, pump seal, and box.
              </p>
              <p>
                <Check size={14} /> <strong>Hassle-Free Support:</strong> Submit a return ticket via our Support Hub with Order ID and photos.
              </p>
              <p>
                <Check size={14} /> <strong>Full Refund Guarantee:</strong> Verified returns receive 100% refund to original payment mode or store credit.
              </p>
            </div>
          </div>
        </article>

        {/* Technical Specifications */}
        <article className="content-card full-width-card">
          <h2>Product Specifications</h2>
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
            <small>CUSTOMER REVIEWS & RATINGS</small>
            <h2>Verified Feedback</h2>
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
                <h3>No written reviews submitted yet</h3>
                <p>Be the first customer to share your detailed experience with this sunscreen.</p>
              </div>
            )}
          </div>

          <form className="review-form" onSubmit={submitReview}>
            <h3>Write a Customer Review</h3>
            <label>
              Display Name
              <input name="name" required placeholder="e.g. Priya S." />
            </label>
            <label>
              Rating
              <select name="rating" defaultValue="5">
                <option value="5">5 — Excellent product</option>
                <option value="4">4 — Very good</option>
                <option value="3">3 — Average</option>
                <option value="2">2 — Below expectation</option>
                <option value="1">1 — Poor quality</option>
              </select>
            </label>
            <label>
              Review Title
              <input name="title" required placeholder="e.g. Non-greasy sunscreen!" />
            </label>
            <label>
              Your Review
              <textarea name="body" required minLength={10} placeholder="Describe texture, absorption, finish, and skin feel..." />
            </label>
            <button type="submit">Submit Review for Approval</button>
            <small>Reviews are verified for authenticity before appearing publicly.</small>
          </form>
        </div>
      </section>

      {/* Similar / Related Products */}
      <section className="related-section">
        <small>YOU MAY ALSO LIKE</small>
        <h2>Similar Skincare & Beauty Products</h2>
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
