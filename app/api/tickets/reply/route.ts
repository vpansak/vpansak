import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { ticketReplies, tickets } from "../../../../db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ticketId?: string; email?: string; message?: string };
    const ticketId = body.ticketId?.trim().toUpperCase() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const message = body.message?.trim() || "";
    if (!ticketId || !email || !message) return Response.json({ error: "Ticket ID, email and reply are required." }, { status: 400 });
    const db = await getDb();
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, ticketId)).limit(1);
    if (!ticket || ticket.email.toLowerCase() !== email) return Response.json({ error: "Ticket details do not match." }, { status: 403 });
    await db.insert(ticketReplies).values({ ticketId, authorType: "customer", authorName: ticket.customerName, message: message.slice(0,2000) });
    await db.update(tickets).set({ status: "Customer Replied", updatedAt: new Date().toISOString() }).where(eq(tickets.ticketId, ticketId));
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Reply could not be saved." }, { status: 500 }); }
}
