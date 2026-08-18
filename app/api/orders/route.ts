import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { notifications, orderItems, orders } from "../../../db/schema";
import { getAuthUserFromRequest } from "../../lib/auth-session";
import { getOrderFromSupabase, saveOrderToSupabase } from "../../lib/supabase";

const publicOrder = (order: Record<string, any>) => {
  const orderId = String(order.orderId || order.order_id || "").toUpperCase();
  const status = String(order.status || "Order Confirmed");
  const currentLocation = String(order.currentLocation || order.current_location || "Processing Hub");
  const total = Number(order.total || 0);
  const createdAt = String(order.createdAt || order.created_at || new Date().toISOString());
  const updatedAt = String(order.updatedAt || order.updated_at || createdAt);
  const paymentMethod = String(order.paymentMethod || order.payment_method || "COD");
  const city = String(order.city || "India");
  const pinCodeRaw = String(order.pinCode || order.pin_code || "");
  const mobileRaw = String(order.mobile || "");

  const pinCode = pinCodeRaw.length > 3 ? `${pinCodeRaw.slice(0, 2)}***${pinCodeRaw.slice(-1)}` : "***";
  const mobile = mobileRaw.length > 4 ? `${"*".repeat(Math.max(0, mobileRaw.length - 4))}${mobileRaw.slice(-4)}` : "****";

  return {
    orderId,
    status,
    currentLocation,
    total,
    createdAt,
    updatedAt,
    paymentMethod,
    city,
    pinCode,
    mobile,
  };
};

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
    const remote = await getOrderFromSupabase(orderId);

    if (!order && !remote) {
      return Response.json({ error: "No order found with this ID." }, { status: 404 });
    }

    const merged = order && remote ? { ...remote, ...order, status: remote.status || order.status, currentLocation: remote.currentLocation || (remote as any).current_location || order.currentLocation } : (order || remote);

    const items = order ? await db.select().from(orderItems).where(eq(orderItems.orderId, order.orderId)) : [];
    return Response.json({ order: publicOrder(merged), items });
  } catch (err) {
    console.error("Order tracking error:", err);
    return Response.json({ error: "Order tracking service is being refreshed. Please try again shortly." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const required = ["customerName", "mobile", "address", "city", "pinCode", "paymentMethod"];

    if (required.some((key) => !String(payload[key] ?? "").trim()) || !Number(payload.total)) {
      return Response.json({ error: "Complete all checkout details." }, { status: 400 });
    }

    const pMethod = String(payload.paymentMethod || "").toLowerCase();
    if (!pMethod.includes("cash") && !pMethod.includes("cod")) {
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
