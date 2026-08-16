import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { coupons } from "../../../db/schema";

const DEFAULT_COUPONS = [
  { code: "FREEDOM79", title: "Independence Freedom Offer", type: "fixed", value: 79, minOrder: 399, maxDiscount: 79 },
  { code: "INDIA15", title: "Freedom 15% Savings", type: "percentage", value: 15, minOrder: 899, maxDiscount: 450 },
  { code: "INDEPENDENCE100", title: "Independence Mega Savings", type: "fixed", value: 100, minOrder: 799, maxDiscount: 100 },
  { code: "WELCOME50", title: "Welcome Discount", type: "fixed", value: 50, minOrder: 499, maxDiscount: 50 },
  { code: "VPANSAK100", title: "VPANSAK Mega Offer", type: "fixed", value: 100, minOrder: 999, maxDiscount: 100 },
  { code: "VPANSAK10", title: "Welcome 10% Off", type: "percentage", value: 10, minOrder: 499, maxDiscount: 300 },
  { code: "VP50", title: "Storewide ₹50 Off", type: "fixed", value: 50, minOrder: 399, maxDiscount: 50 },
  { code: "FESTIVE200", title: "Festive Season Off", type: "fixed", value: 200, minOrder: 1999, maxDiscount: 200 },
  { code: "SAVE15", title: "Super Saver 15% Off", type: "percentage", value: 15, minOrder: 1499, maxDiscount: 500 },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim().toUpperCase();
  const total = Number(url.searchParams.get("total") || 0);

  if (!code) {
    return Response.json({ error: "Coupon code is required." }, { status: 400 });
  }

  try {
    const db = await getDb();

    // Auto-seed default coupon if matches known platform coupons
    const defaultMatch = DEFAULT_COUPONS.find((c) => c.code === code);
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

    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);

    if (!coupon || !coupon.active) {
      return Response.json({ error: `Coupon code '${code}' is invalid or inactive.` }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return Response.json({ error: `Coupon '${code}' has expired.` }, { status: 400 });
    }

    if (total > 0 && total < coupon.minOrder) {
      const remaining = coupon.minOrder - total;
      return Response.json(
        { error: `Min order for ${coupon.code} is ₹${coupon.minOrder}. Add ₹${remaining} more to apply.` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round((total * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    if (coupon.maxDiscount && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return Response.json({
      coupon: {
        code: coupon.code,
        title: coupon.title,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        discount,
      },
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return Response.json({ error: "Coupon validation is temporarily unavailable." }, { status: 503 });
  }
}
