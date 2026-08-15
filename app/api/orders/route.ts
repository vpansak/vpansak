import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { notifications, orderItems, orders } from "../../../db/schema";
import { getAuthUserFromRequest } from "../../lib/auth-session";
import { getOrderFromSupabase, saveOrderToSupabase } from "../../lib/supabase";

const publicOrder = (order: { orderId: string; status: string; total: number; createdAt: string; paymentMethod: string; city: string; pinCode: string; mobile: string }) => ({
  orderId: order.orderId,
  status: order.status,
  total: order.total,
  createdAt: order.createdAt,
  paymentMethod: order.paymentMethod,
  city: order.city,
  pinCode: order.pinCode.length > 3 ? `${order.pinCode.slice(0,2)}***${order.pinCode.slice(-1)}` : "***",
  mobile: order.mobile.length > 4 ? `${"*".repeat(Math.max(0,order.mobile.length-4))}${order.mobile.slice(-4)}` : "****",
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawId = url.searchParams.get("id")?.trim() || "";
  const orderId = rawId.toUpperCase();

  if (!orderId || orderId.length < 4) {
    return Response.json({ error: "Enter a valid VPANSAK Order ID." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);

    if (!order) {
      const remote = await getOrderFromSupabase(orderId);
      if (!remote) return Response.json({ error: "No order found with this ID." }, { status: 404 });
      return Response.json({ order: publicOrder(remote), items: [] });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.orderId));
    return Response.json({ order: publicOrder(order), items });
  } catch (err) {
    console.error("Order tracking error:", err);
    return Response.json({ error: "Order tracking is being initialized. Please try again shortly." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const required = ["customerName", "mobile", "address", "city", "pinCode", "paymentMethod"];

    if (required.some((key) => !String(payload[key] ?? "").trim()) || !Number(payload.total)) {
      return Response.json({ error: "Complete all checkout details." }, { status: 400 });
    }

    if (String(payload.paymentMethod) !== "Cash on Delivery") {
      return Response.json({ error: "Online payments must be verified before confirmation." }, { status: 400 });
    }

    const orderId = `VPO${Math.floor(100000 + Math.random() * 900000)}`;
    const db = await getDb();
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser || !authUser.email) {
      return Response.json({ error: "Please sign in to complete your purchase." }, { status: 401 });
    }
    const ownerEmail = authUser.email.toLowerCase();

    const [order] = await db
      .insert(orders)
      .values({
        orderId,
        ownerEmail,
        customerName: String(payload.customerName).trim().slice(0, 100),
        mobile: String(payload.mobile).trim().slice(0, 20),
        address: String(payload.address).trim().slice(0, 300),
        city: String(payload.city).trim().slice(0, 100),
        pinCode: String(payload.pinCode).trim().slice(0, 12),
        paymentMethod: String(payload.paymentMethod).trim().slice(0, 50),
        total: Math.round(Number(payload.total)),
      })
      .returning();

    const items = Array.isArray(payload.items) ? (payload.items as Array<Record<string, unknown>>) : [];
    if (items.length) {
      await db.insert(orderItems).values(
        items.slice(0, 50).map((item) => ({
          orderId,
          productId: String(item.productId || "").slice(0, 80),
          productName: String(item.productName || "").slice(0, 160),
          price: Math.round(Number(item.price) || 0),
          quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1)),
        }))
      );
    }

    if (ownerEmail) {
      await db.insert(notifications).values({
        ownerEmail,
        title: "Order confirmed",
        message: `Your order ${orderId} has been created successfully.`,
        type: "order",
      });
    }

    await saveOrderToSupabase({
      order_id: orderId,
      owner_email: ownerEmail,
      customer_name: String(payload.customerName).trim().slice(0, 100),
      mobile: String(payload.mobile).trim().slice(0, 20),
      address: String(payload.address).trim().slice(0, 300),
      city: String(payload.city).trim().slice(0, 100),
      pin_code: String(payload.pinCode).trim().slice(0, 12),
      payment_method: String(payload.paymentMethod).trim().slice(0, 50),
      total: Math.round(Number(payload.total)),
      status: "Order Confirmed",
    });

    return Response.json({ order: publicOrder(order) }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return Response.json({ error: "We could not create the order. Please try again." }, { status: 500 });
  }
}

export async function getRecentOrdersForAdmin() {
  const db = await getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(30);
}
