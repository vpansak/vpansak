import { catalogProducts } from "../../../lib/catalog";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_live_TLMoK497QwLs7Y";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "wgxcFGPQitPjJ6FwCTUphLcn";

type CartRow = { productId?: unknown; quantity?: unknown };

const createBasicAuth = (id: string, secret: string) => {
  if (typeof btoa === "function") return btoa(`${id}:${secret}`);
  return Buffer.from(`${id}:${secret}`).toString("base64");
};

const cleanRows = (payload: Record<string, unknown>) => {
  const rows = Array.isArray(payload.items)
    ? payload.items as CartRow[]
    : [{ productId: payload.productId, quantity: payload.quantity }];
  return rows
    .map((row) => ({ productId: String(row.productId || ""), quantity: Math.max(1, Math.min(20, Number(row.quantity) || 1)) }))
    .filter((row) => catalogProducts.some((product) => product.id === row.productId));
};

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const rows = cleanRows(payload);
    if (!rows.length) return Response.json({ error: "Choose a valid VPANSAK product." }, { status: 400 });
    if (!keyId || !keySecret) return Response.json({ error: "Razorpay environment keys are not configured on Vercel." }, { status: 503 });

    const amount = rows.reduce((sum, row) => {
      const product = catalogProducts.find((item) => item.id === row.productId);
      return sum + (product ? product.price * row.quantity : 0);
    }, 0);
    if (amount <= 0) return Response.json({ error: "Invalid payable amount." }, { status: 400 });

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        authorization: `Basic ${createBasicAuth(keyId, keySecret)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: "INR",
        receipt: `VPS-${Date.now()}`,
        notes: { source: "VPANSAK Shopping" },
      }),
    });

    const result = await razorpayResponse.json() as { id?: string; amount?: number; currency?: string; error?: { description?: string } };
    if (!razorpayResponse.ok || !result.id) {
      return Response.json({ error: result.error?.description || "Could not create Razorpay payment order." }, { status: 502 });
    }

    return Response.json({
      keyId,
      razorpayOrderId: result.id,
      amount: result.amount,
      currency: result.currency || "INR",
    });
  } catch {
    return Response.json({ error: "Razorpay payment could not be initialized." }, { status: 500 });
  }
}
