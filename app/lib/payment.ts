import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { coupons } from "../../db/schema";
import { catalogProducts } from "./catalog";

export type CheckoutItem = { productId: string; quantity: number };

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
    if (couponCode === "VPANSAK10") await db.insert(coupons).values({ code:couponCode, title:"Welcome Offer", type:"percentage", value:10, minOrder:499, maxDiscount:300 }).onConflictDoNothing();
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, couponCode)).limit(1);
    if (!coupon || !coupon.active || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) || subtotal < coupon.minOrder) throw new Error("INVALID_COUPON");
    discount = coupon.type === "percentage" ? Math.round(subtotal * coupon.value / 100) : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }
  return { items, subtotal, discount, total: Math.max(1, subtotal - discount), couponCode };
}

export async function razorpayConfig() {
  const { env } = await import("cloudflare:workers");
  const values = env as Record<string, unknown>;
  const keyId = values.RAZORPAY_KEY_ID;
  const keySecret = values.RAZORPAY_KEY_SECRET;
  if (typeof keyId !== "string" || typeof keySecret !== "string") throw new Error("PAYMENT_NOT_CONFIGURED");
  return { keyId, keySecret };
}

export function basicAuth(keyId: string, keySecret: string) {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

export async function validRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2,"0")).join("");
  if (expected.length !== signature.length) return false;
  let difference = 0;
  for (let index=0; index<expected.length; index++) difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return difference === 0;
}
