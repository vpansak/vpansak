"use client";

import { BarChart3, Boxes, ChevronRight, CircleDollarSign, ClipboardCheck, LogIn, PackagePlus, RefreshCw, Save, Settings, ShieldCheck, Store, Truck, Upload } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";

type App = { applicationId: string; fullName: string; businessName: string; businessType: string; status: string; createdAt: string };
type Product = { id: string; name: string; category: string; imageUrl: string; price: number; mrp: number; stock: number; sku: string; status: string; createdAt: string };
type Data = { email: string; application: App | null; products: Product[] };

const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function SellerDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [tab, setTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [productImagePreview, setProductImagePreview] = useState("");

  const load = useCallback(async () => {
    if (!data) setLoading(true);
    const res = await fetch("/api/seller-dashboard");
    if (res.status === 401) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const value = await res.json();
    if (res.ok) setData(value);
    else setMessage(value.error || "Could not load dashboard");
    setLoading(false);
  }, [data]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const handleProductImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProductImagePreview(String(event.target.result));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productImagePreview) {
      setMessage("Please select a product photo file from your device.");
      return;
    }
    const formElement = e.currentTarget;
    const f = new FormData(formElement);
    const payload = Object.fromEntries(f);
    payload.imageUrl = productImagePreview;

    const res = await fetch("/api/seller-dashboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const value = await res.json();
    setMessage(res.ok ? `Product saved • ${value.status}` : value.error || "Could not save product");
    if (res.ok) {
      formElement.reset();
      setProductImagePreview("");
      setTab("products");
      load();
    }
  };

  const stock = async (id: string, value: number) => {
    const res = await fetch("/api/seller-dashboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "inventory", id, stock: value }),
    });
    const result = await res.json();
    setMessage(res.ok ? "Inventory updated" : result.error || "Could not update");
    if (res.ok) load();
  };

  if (loading) return <main className="account-loading"><span /><p>Loading Seller Dashboard…</p></main>;
  if (unauthorized) return <main className="account-signin"><div><img src="/vpansak-logo-light.jpeg" alt="VPANSAK" /><small>SELLER AUTHENTICATION</small><h1>Seller sign in.</h1><p>Sign in with the same email used in your seller application.</p><a href="/login?return_to=%2Fseller%2Fdashboard"><LogIn />Sign in securely</a><Link href="/seller">Apply as seller</Link><span><ShieldCheck />KYC documents remain private</span></div></main>;
  if (!data?.application) return <main className="seller-dashboard-empty"><div><Store /><small>NO SELLER APPLICATION FOUND</small><h1>Register before opening the dashboard.</h1><p>The signed-in email must match your seller application email.</p><Link href="/seller">Start seller registration <ChevronRight /></Link><Link href="/">Back to store</Link></div></main>;

  const approved = data.application.status === "Approved";
  const lowStock = data.products.filter((p) => p.stock < 5).length;

  return (
    <main className="seller-dashboard">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span><strong>VPANSAK</strong><small>SELLER CENTER</small></span>
        </Link>
        <nav>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Seller support</a>
          <Link href="/seller">Guidelines</Link>
          <a href="/signout?return_to=%2F">Sign out</a>
        </nav>
      </header>
      {message && <button className="account-toast" onClick={() => setMessage("")}>{message}</button>}
      <div className="seller-dashboard-shell">
        <aside>
          <div className="seller-identity">
            <span>{data.application.businessName.slice(0, 2).toUpperCase()}</span>
            <div>
              <small>SELLER ACCOUNT</small>
              <strong>{data.application.businessName}</strong>
              <p>{data.email}</p>
            </div>
          </div>
          <nav>
            {[
              { k: "overview", I: BarChart3, l: "Overview" },
              { k: "products", I: Boxes, l: "Products" },
              { k: "add", I: PackagePlus, l: "Add product" },
              { k: "inventory", I: RefreshCw, l: "Inventory" },
              { k: "orders", I: Truck, l: "Orders" },
              { k: "settings", I: Settings, l: "Settings" },
            ].map(({ k, I, l }) => (
              <button className={tab === k ? "active" : ""} onClick={() => setTab(k)} key={k}>
                <I />{l}<ChevronRight />
              </button>
            ))}
          </nav>
        </aside>
        <section className="seller-dashboard-main">
          {tab === "overview" && (
            <>
              <div className="seller-dashboard-title">
                <small>SELLER OVERVIEW</small>
                <h1>{data.application.businessName}</h1>
                <p>Application {data.application.applicationId} • {data.application.businessType}</p>
                <span className={approved ? "approved" : "pending"}><ClipboardCheck />{data.application.status}</span>
              </div>
              <div className="seller-metrics">
                <article><Boxes /><span><strong>{data.products.length}</strong><small>Total listings</small></span></article>
                <article><ClipboardCheck /><span><strong>{data.products.filter((p) => p.status === "Approved").length}</strong><small>Approved products</small></span></article>
                <article><RefreshCw /><span><strong>{lowStock}</strong><small>Low stock</small></span></article>
                <article><CircleDollarSign /><span><strong>{money(0)}</strong><small>Recorded earnings</small></span></article>
              </div>
              <section className="seller-dashboard-panel">
                <header>
                  <h2>Recent product listings</h2>
                  <button onClick={() => setTab("products")}>View all</button>
                </header>
                <ProductRows products={data.products.slice(0, 5)} onStock={stock} />
              </section>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="seller-dashboard-title">
                <small>CATALOG</small>
                <h1>Product listings</h1>
                <p>Every new listing is reviewed before it appears in the store.</p>
              </div>
              <section className="seller-dashboard-panel">
                <ProductRows products={data.products} onStock={stock} />
              </section>
            </>
          )}

          {tab === "add" && (
            <>
              <div className="seller-dashboard-title">
                <small>CATALOG SUBMISSION</small>
                <h1>Add a product</h1>
                <p>Upload a clear product photo file and accurate inventory details.</p>
              </div>
              <form className="seller-product-form" onSubmit={addProduct}>
                <label>Product name<input name="name" required maxLength={160} /></label>
                <label>Brand<input name="brand" defaultValue={data.application.businessName} required /></label>
                <label>
                  Category
                  <select name="category" required defaultValue="">
                    <option value="" disabled>Select category</option>
                    {["Fashion", "Electronics", "Mobile", "Beauty", "Grocery", "Books", "Home", "Appliances", "Sports", "Toys", "Accessories", "Lifestyle", "Computer", "Gaming", "Kitchen", "Furniture", "Healthcare", "Automotive"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>SKU<input name="sku" required maxLength={60} /></label>
                <label>Selling price<input name="price" type="number" min="1" required /></label>
                <label>MRP<input name="mrp" type="number" min="1" required /></label>
                <label>Opening stock<input name="stock" type="number" min="0" required /></label>
                
                <div className="seller-file-upload">
                  <label>Product Photo File</label>
                  <div className="seller-image-dropzone">
                    {productImagePreview ? (
                      <div className="product-photo-preview">
                        <img src={productImagePreview} alt="Product preview" />
                        <button type="button" onClick={() => setProductImagePreview("")}>Remove Photo</button>
                      </div>
                    ) : (
                      <label className="seller-upload-trigger">
                        <Upload size={28} />
                        <strong>Choose Product Photo File</strong>
                        <small>Select any JPG, PNG or WEBP photo directly from your device</small>
                        <input type="file" accept="image/*" onChange={handleProductImageSelect} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>
                </div>

                <label className="wide">Description<textarea name="description" required minLength={20} maxLength={2000} /></label>
                <button><Save />Submit for review</button>
              </form>
            </>
          )}

          {tab === "inventory" && (
            <>
              <div className="seller-dashboard-title">
                <small>STOCK CONTROL</small>
                <h1>Inventory</h1>
                <p>Update current available units. Zero stock products become unavailable.</p>
              </div>
              <section className="seller-dashboard-panel">
                <ProductRows products={data.products} onStock={stock} />
              </section>
            </>
          )}

          {tab === "orders" && (
            <>
              <div className="seller-dashboard-title">
                <small>FULFILMENT</small>
                <h1>Seller orders</h1>
                <p>Orders containing your approved products will appear here after marketplace fulfilment integration is enabled.</p>
              </div>
              <div className="seller-no-orders">
                <Truck />
                <h3>No seller orders assigned</h3>
                <p>This panel is ready for order allocation, packing and return workflows.</p>
              </div>
            </>
          )}

          {tab === "settings" && (
            <>
              <div className="seller-dashboard-title">
                <small>BUSINESS ACCOUNT</small>
                <h1>Seller settings</h1>
              </div>
              <section className="seller-settings-card">
                <Store />
                <div>
                  <small>BUSINESS NAME</small>
                  <strong>{data.application.businessName}</strong>
                  <p>{data.application.fullName} • {data.email}</p>
                </div>
                <span>{data.application.status}</span>
                <p>To change verified business or KYC information, create a Seller support ticket. Sensitive documents cannot be edited from the public dashboard.</p>
                <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Contact Seller Support</a>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ProductRows({ products, onStock }: { products: Product[]; onStock: (id: string, stock: number) => void }) {
  return (
    <div className="seller-product-rows">
      {products.length ? (
        products.map((p) => (
          <article key={p.id}>
            <img src={p.imageUrl} alt="" />
            <span>
              <strong>{p.name}</strong>
              <small>{p.sku} • {p.category}</small>
            </span>
            <b>{money(p.price)}</b>
            <label>
              Stock
              <input type="number" min="0" defaultValue={p.stock} onBlur={(e) => onStock(p.id, Number(e.target.value))} />
            </label>
            <i className={p.status.toLowerCase().replaceAll(" ", "-")}>{p.status}</i>
          </article>
        ))
      ) : (
        <div className="seller-no-orders">
          <Boxes />
          <h3>No products yet</h3>
          <p>Add your first product to start the review process.</p>
        </div>
      )}
    </div>
  );
}
