import { basicAuth, calculateCheckout, razorpayConfig } from "../../../lib/payment";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const checkout = await calculateCheckout(payload.items, payload.couponCode);
    const { keyId, keySecret } = await razorpayConfig();
    const vpOrderId = `VPO${Math.floor(100000 + Math.random() * 900000)}`;
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method:"POST",
      headers:{ authorization:basicAuth(keyId,keySecret), "content-type":"application/json" },
      body:JSON.stringify({ amount:checkout.total*100, currency:"INR", receipt:vpOrderId, notes:{ platform:"VPANSAK", coupon:checkout.couponCode || "none" } }),
    });
    const order = await response.json() as { id?:string; amount?:number; currency?:string; error?:{description?:string} };
    if (!response.ok || !order.id) return Response.json({ error:order.error?.description || "Payment gateway order create nahi kar saka." },{status:502});
    return Response.json({ keyId, vpOrderId, order:{ id:order.id, amount:order.amount, currency:order.currency }, checkout:{ total:checkout.total, discount:checkout.discount } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "INVALID_ITEMS") return Response.json({error:"Cart items valid nahi hain."},{status:400});
    if (code === "INVALID_COUPON") return Response.json({error:"Coupon invalid ya expired hai."},{status:400});
    return Response.json({error:"Online payment abhi available nahi hai."},{status:503});
  }
}
