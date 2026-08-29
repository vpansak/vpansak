import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { coupons } from "../../db/schema";
import { catalogProducts } from "./catalog";

export type CheckoutItem = { productId: string; quantity: number };

const fallbackPublicKeyId = "rzp_live_TLMoK497QwLs7Y";
const fallbackKeySecret = "wgxcFGPQitPjJ6FwCTUphLcn";

const DEFAULT_COUPONS = [
  { code: "RAKHI79", title: "Rakshabandhan Special Gift Offer", type: "fixed", value: 79, minOrder: 399, maxDiscount: 79 },
  { code: "RAKHI15", title: "Rakshabandhan 15% Savings", type: "percentage", value: 15, minOrder: 899, maxDiscount: 450 },
  { code: "SIBLING100", title: "Rakhi Sibling Mega Savings", type: "fixed", value: 100, minOrder: 799, maxDiscount: 100 },
  { code: "FREEDOM79", title: "Rakshabandhan Special Gift Offer", type: "fixed", value: 79, minOrder: 399, maxDiscount: 79 },
  { code: "INDIA15", title: "Rakshabandhan 15% Savings", type: "percentage", value: 15, minOrder: 899, maxDiscount: 450 },
  { code: "INDEPENDENCE100", title: "Rakhi Sibling Mega Savings", type: "fixed", value: 100, minOrder: 799, maxDiscount: 100 },
  { code: "WELCOME50", title: "Welcome Discount", type: "fixed", value: 50, minOrder: 499, maxDiscount: 50 },
  { code: "VPANSAK100", title: "VPANSAK Mega Offer", type: "fixed", value: 100, minOrder: 999, maxDiscount: 100 },
  { code: "VPANSAK10", title: "Welcome 10% Off", type: "percentage", value: 10, minOrder: 499, maxDiscount: 300 },
  { code: "VP50", title: "Storewide ₹50 Off", type: "fixed", value: 50, minOrder: 399, maxDiscount: 50 },
  { code: "FESTIVE200", title: "Rakshabandhan Festive Off", type: "fixed", value: 200, minOrder: 1999, maxDiscount: 200 },
  { code: "SAVE15", title: "Super Saver 15% Off", type: "percentage", value: 15, minOrder: 1499, maxDiscount: 500 },
];

export async function calculateCheckout(rawItems: unknown, rawCoupon: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) throw new Error("INVALID_ITEMS");
  const items = rawItems.map((raw) => {
    const input = raw as Record<string, unknown>;
    const product = catalogProducts.find((entry) => entry.id === String(input.productId || ""));
    const quantity = Math.max(1, Math.min(20, Math.floor(Number(input.quantity) || 1)));
    if (!product || product.stock < quantity) throw new Error("INVALID_ITEMS");
    return { productId: product.id, productName: product.name, price: product.price, quantity };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  const couponCode = String(rawCoupon || "").trim().toUpperCase();

  if (couponCode) {
    const db = await getDb();
    const defaultMatch = DEFAULT_COUPONS.find((c) => c.code === couponCode);
    if (defaultMatch) {
      await db
        .insert(coupons)
        .values({
          code: defaultMatch.code,
          title: defaultMatch.title,
          type: defaultMatch.type,
          value: defaultMatch.value,
          minOrder: defaultMatch.minOrder,
          maxDiscount: defaultMatch.maxDiscount,
          active: 1,
        })
        .onConflictDoNothing();
    }

    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, couponCode)).limit(1);
    if (!coupon || !coupon.active || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) || subtotal < coupon.minOrder) {
      throw new Error("INVALID_COUPON");
    }

    discount = coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }

  return { items, subtotal, discount, total: Math.max(1, subtotal - discount), couponCode };
}

export async function razorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || fallbackPublicKeyId;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || fallbackKeySecret;
  if (typeof keyId !== "string" || !keyId.startsWith("rzp_") || typeof keySecret !== "string" || !keySecret) throw new Error("PAYMENT_NOT_CONFIGURED");
  return { keyId, keySecret };
}

export function basicAuth(keyId: string, keySecret: string) {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

export async function validRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (expected.length !== signature.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index++) difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return difference === 0;
}
