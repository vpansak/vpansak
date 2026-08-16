"use client";

import { ArrowLeft, Banknote, Check, CreditCard, Edit3, MapPin, PackageCheck, Plus, ShieldCheck, Tag, WalletCards } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { catalogProducts } from "../lib/catalog";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (data: { error?: { description?: string } }) => void) => void;
    };
  }
}

type SavedAddress = {
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

type AccountData = {
  email: string;
  user: { fullName: string; mobile: string; email: string };
  addresses: SavedAddress[];
};

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function CheckoutContent() {
  const query = useSearchParams();
  const product = catalogProducts.find((p) => p.id === query.get("product")) || catalogProducts[0];
  const qty = Math.max(1, Math.min(10, Number(query.get("qty")) || 1));
  const subtotal = product.price * qty;

  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Address Form State
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formLine1, setFormLine1] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPinCode, setFormPinCode] = useState("");

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [method, setMethod] = useState("Razorpay");

  const total = Math.max(0, subtotal - discount);
  const items = [{ productId: product.id, quantity: qty }];

  useEffect(() => {
    fetch("/api/account")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setAccountData(data);
          const primary = data.addresses?.find((a: SavedAddress) => a.isPrimary) || data.addresses?.[0];
          if (primary) {
            setSelectedAddress(primary);
            setFormName(primary.fullName || data.user.fullName || "");
            setFormMobile(primary.mobile || data.user.mobile || "");
            setFormLine1(primary.line1 || "");
            setFormCity(primary.city ? `${primary.city}${primary.state ? `, ${primary.state}` : ""}` : "");
            setFormPinCode(primary.pinCode || "");
          } else {
            setFormName(data.user.fullName || "");
            setFormMobile(data.user.mobile || "");
            setIsAddingNew(true);
          }
        }
      })
      .catch(() => {
        window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      });
  }, []);

  const selectAddress = (addr: SavedAddress) => {
    setSelectedAddress(addr);
    setIsEditingAddress(false);
    setIsAddingNew(false);
    setFormName(addr.fullName || accountData?.user.fullName || "");
    setFormMobile(addr.mobile || accountData?.user.mobile || "");
    setFormLine1(addr.line1 || "");
    setFormCity(addr.city ? `${addr.city}${addr.state ? `, ${addr.state}` : ""}` : "");
    setFormPinCode(addr.pinCode || "");
  };

  const applyCoupon = async () => {
    const res = await fetch(`/api/coupons?code=${encodeURIComponent(coupon)}&total=${subtotal}`);
    const data = await res.json();
    if (res.ok) {
      setDiscount(data.coupon?.discount || 0);
      setMessage("Coupon applied successfully");
    } else {
      setDiscount(0);
      setMessage(data.error || "Coupon is not valid");
    }
  };

  const createCod = async (details: Record<string, unknown>) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...details,
        paymentMethod: "Cash on Delivery",
        total,
        items: [{ productId: product.id, productName: product.name, price: product.price, quantity: qty }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not place order");
    setOrderId(data.order.orderId);
  };

  const createOnline = async (details: Record<string, unknown>) => {
    if (!(await loadRazorpay())) throw new Error("Online checkout load nahi hua. Internet check karein.");
    const create = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items, couponCode: coupon }),
    });
    const setup = await create.json();
    if (!create.ok) throw new Error(setup.error || "Payment start nahi hua");

    await new Promise<void>((resolve, reject) => {
      const checkout = new window.Razorpay!({
        key: setup.keyId,
        amount: setup.order.amount,
        currency: "INR",
        name: "VPANSAK",
        description: `Order payment • ${product.name}`,
        image: "/vpansak-logo-light.jpeg",
        order_id: setup.order.id,
        prefill: { name: String(details.customerName), contact: String(details.mobile) },
        theme: { color: "#1766ef" },
        modal: { ondismiss: () => reject(new Error("Payment cancel kar diya gaya.")) },
        handler: async (response: Record<string, string>) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ...details,
              ...response,
              vpOrderId: setup.vpOrderId,
              items,
              couponCode: coupon,
            }),
          });
          const result = await verify.json();
          if (!verify.ok) {
            reject(new Error(result.error || "Payment verification failed"));
            return;
          }
          setOrderId(result.order.orderId);
          resolve();
        },
      });
      checkout.on("payment.failed", (response) => reject(new Error(response.error?.description || "Payment failed")));
      checkout.open();
    });
  };

  const order = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    let details: Record<string, string>;

    if (selectedAddress && !isEditingAddress && !isAddingNew) {
      details = {
        customerName: selectedAddress.fullName,
        mobile: selectedAddress.mobile,
        address: selectedAddress.line1,
        city: selectedAddress.city ? `${selectedAddress.city}${selectedAddress.state ? `, ${selectedAddress.state}` : ""}` : "",
        pinCode: selectedAddress.pinCode,
      };
    } else {
      details = {
        customerName: formName,
        mobile: formMobile,
        address: formLine1,
        city: formCity,
        pinCode: formPinCode,
      };
    }

    try {
      if (method === "Razorpay") await createOnline(details);
      else await createCod(details);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order could not be completed");
    } finally {
      setBusy(false);
    }
  };

  if (orderId) {
    return (
      <main className="checkout-page">
        <header className="sub-header">
          <Link className="shop-brand" href="/">
            <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
            <span><strong>VPANSAK</strong><small>CHECKOUT</small></span>
          </Link>
        </header>
        <section className="checkout-success-page">
          <span><Check /></span>
          <small>ORDER CONFIRMED</small>
          <h1>{method === "Razorpay" ? "Payment successful." : "Your order is ready."}</h1>
          <p>Save this Order ID to view the complete status timeline and delivery updates.</p>
          <strong>{orderId}</strong>
          <Link href={`/track?id=${orderId}`}><PackageCheck />Track order now</Link>
          <Link href="/account">Open my account</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span><strong>VPANSAK</strong><small>SECURE CHECKOUT</small></span>
        </Link>
        <nav>
          <Link href={`/product/${product.id}`}><ArrowLeft />Back to product</Link>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Need help?</a>
        </nav>
      </header>

      <section className="checkout-heading">
        <small>SECURE ORDER CHECKOUT</small>
        <h1>Complete your purchase.</h1>
        <p>Pay securely with UPI, cards, netbanking or choose Cash on Delivery.</p>
      </section>

      <form className="checkout-layout" onSubmit={order}>
        <div className="checkout-details">
          {/* SECTION 1: DELIVERY ADDRESS */}
          <section className="checkout-address-section">
            <header>
              <span>1</span>
              <div>
                <h2>Delivery address</h2>
                <p>Where should this order be delivered?</p>
              </div>
            </header>

            {selectedAddress && !isEditingAddress && !isAddingNew ? (
              <div className="saved-address-card-selected">
                <div className="saved-address-header">
                  <div className="address-badge-row">
                    <span className="address-type-tag"><MapPin size={14} /> {selectedAddress.label || "Saved Address"}</span>
                    {selectedAddress.isPrimary && <span className="primary-pill">Default Delivery</span>}
                  </div>
                  <button
                    type="button"
                    className="btn-edit-address"
                    onClick={() => {
                      setIsEditingAddress(true);
                      setFormName(selectedAddress.fullName);
                      setFormMobile(selectedAddress.mobile);
                      setFormLine1(selectedAddress.line1);
                      setFormCity(selectedAddress.city ? `${selectedAddress.city}${selectedAddress.state ? `, ${selectedAddress.state}` : ""}` : "");
                      setFormPinCode(selectedAddress.pinCode);
                    }}
                  >
                    <Edit3 size={14} /> Edit Address
                  </button>
                </div>

                <div className="address-details-body">
                  <strong>{selectedAddress.fullName}</strong>
                  <p>{selectedAddress.line1}</p>
                  <p>{selectedAddress.city}{selectedAddress.state ? `, ${selectedAddress.state}` : ""} — {selectedAddress.pinCode}</p>
                  <p className="mobile-text">Mobile: <span>{selectedAddress.mobile}</span></p>
                </div>

                <div className="saved-address-actions">
                  <button
                    type="button"
                    className="btn-add-other-address"
                    onClick={() => {
                      setIsAddingNew(true);
                      setFormName(accountData?.user.fullName || "");
                      setFormMobile(accountData?.user.mobile || "");
                      setFormLine1("");
                      setFormCity("");
                      setFormPinCode("");
                    }}
                  >
                    <Plus size={15} /> Add / Use Other Address
                  </button>

                  {accountData && accountData.addresses.length > 1 && (
                    <div className="all-saved-addresses-list">
                      <small>Select from other saved addresses:</small>
                      <div className="address-options-pills">
                        {accountData.addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            className={`address-pill-opt ${selectedAddress.id === addr.id ? "active" : ""}`}
                            onClick={() => selectAddress(addr)}
                          >
                            <MapPin size={12} /> {addr.label} ({addr.line1.slice(0, 22)}…)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="checkout-address-form-wrap">
                {selectedAddress && (
                  <div className="form-back-bar">
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={() => {
                        setIsEditingAddress(false);
                        setIsAddingNew(false);
                      }}
                    >
                      ← Back to Saved Address ({selectedAddress.label})
                    </button>
                  </div>
                )}

                <div className="checkout-address-grid">
                  <label>
                    Full name
                    <input
                      name="customerName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      maxLength={100}
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    Mobile number
                    <input
                      name="mobile"
                      value={formMobile}
                      onChange={(e) => setFormMobile(e.target.value)}
                      required
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </label>
                  <label className="wide">
                    House, area and street
                    <input
                      name="address"
                      value={formLine1}
                      onChange={(e) => setFormLine1(e.target.value)}
                      required
                      maxLength={300}
                      autoComplete="street-address"
                    />
                  </label>
                  <label>
                    City
                    <input
                      name="city"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </label>
                  <label>
                    PIN code
                    <input
                      name="pinCode"
                      value={formPinCode}
                      onChange={(e) => setFormPinCode(e.target.value)}
                      required
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                    />
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: PAYMENT METHOD */}
          <section>
            <header>
              <span>2</span>
              <div>
                <h2>Payment method</h2>
                <p>Online payments are verified before order confirmation.</p>
              </div>
            </header>
            <div className="checkout-payments">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={method === "Razorpay"}
                  onChange={() => setMethod("Razorpay")}
                />
                <CreditCard />
                <span>
                  <strong>UPI / Cards / Netbanking</strong>
                  <small>UPI, Cards, Netbanking &amp; Wallets</small>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={method === "Cash on Delivery"}
                  onChange={() => setMethod("Cash on Delivery")}
                />
                <Banknote />
                <span>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>
              </label>
              <label className="disabled-payment">
                <input type="radio" disabled />
                <WalletCards />
                <span>
                  <strong>Gift Card</strong>
                  <small>Coming soon</small>
                </span>
              </label>
            </div>
          </section>

          {/* SECTION 3: COUPON */}
          <section>
            <header>
              <span>3</span>
              <div>
                <h2>Apply coupon</h2>
                <p>Use an active VPANSAK offer.</p>
              </div>
            </header>
            <div className="standalone-coupon">
              <Tag />
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter promo code" />
              <button type="button" onClick={applyCoupon}>Apply</button>
            </div>
            {message && <p className="checkout-message">{message}</p>}
          </section>
        </div>

        <aside className="checkout-order-card">
          <small>ORDER SUMMARY</small>
          <div className="checkout-product">
            <img src={product.imageUrl} alt={product.name} />
            <span>
              <strong>{product.name}</strong>
              <small>{product.category} • Qty {qty}</small>
            </span>
          </div>
          <dl>
            <div>
              <dt>Item total</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd className="free">FREE</dd>
            </div>
            {discount > 0 && (
              <div>
                <dt>Coupon</dt>
                <dd className="free">−{money(discount)}</dd>
              </div>
            )}
          </dl>
          <div className="standalone-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <button disabled={busy}>
            {busy ? "Please wait…" : method === "Razorpay" ? `Pay ${money(total)} securely` : "Place COD order"}
            <ShieldCheck />
          </button>
          <p><ShieldCheck />VPANSAK never asks for your OTP, UPI PIN or card PIN.</p>
          <div className="checkout-guarantees">
            <span><MapPin />Detailed tracking</span>
            <span><PackageCheck />Support ticket access</span>
          </div>
        </aside>
      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="checkout-page"><section className="checkout-heading"><p>Loading secure checkout…</p></section></main>}>
      <CheckoutContent />
    </Suspense>
  );
}
