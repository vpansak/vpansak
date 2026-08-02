import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { coupons } from "../../../db/schema";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase(); const total = Number(new URL(request.url).searchParams.get("total") || 0);
  if (!code) return Response.json({ error:"Coupon code is required." },{status:400});
  try { const db = await getDb(); if (code === "VPANSAK10") await db.insert(coupons).values({code,title:"Welcome Offer",type:"percentage",value:10,minOrder:499,maxDiscount:300}).onConflictDoNothing(); const [coupon] = await db.select().from(coupons).where(eq(coupons.code,code)).limit(1); if (!coupon || !coupon.active) return Response.json({error:"Coupon is invalid or inactive."},{status:404}); if (coupon.expiresAt && new Date(coupon.expiresAt)<new Date()) return Response.json({error:"Coupon has expired."},{status:400}); if (total<coupon.minOrder) return Response.json({error:`Add ₹${coupon.minOrder-total} more to use this coupon.`},{status:400}); let discount=coupon.type==="percentage"?Math.round(total*coupon.value/100):coupon.value; if(coupon.maxDiscount) discount=Math.min(discount,coupon.maxDiscount); return Response.json({coupon:{code:coupon.code,title:coupon.title,discount}}); }
  catch { return Response.json({error:"Coupon validation is unavailable."},{status:503}); }
}
