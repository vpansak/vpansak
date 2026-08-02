import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { officers, ticketReplies, tickets } from "../../../db/schema";

const publicTicket = (ticket: typeof tickets.$inferSelect) => ({ ticketId: ticket.ticketId, customerName: `${ticket.customerName.slice(0, 1)}***`, category: ticket.category, subject: ticket.subject, priority: ticket.priority, status: ticket.status, createdAt: ticket.createdAt, updatedAt: ticket.updatedAt });

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim().toUpperCase();
  if (!id || !/^VPT\d{6}$/.test(id)) return Response.json({ error: "Enter a valid Ticket ID." }, { status: 400 });
  try {
    const db = await getDb();
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, id)).limit(1);
    if (!ticket) return Response.json({ error: "Ticket not found." }, { status: 404 });
    const replies = await db.select({ authorType: ticketReplies.authorType, authorName: ticketReplies.authorName, message: ticketReplies.message, createdAt: ticketReplies.createdAt }).from(ticketReplies).where(eq(ticketReplies.ticketId, id)).orderBy(asc(ticketReplies.createdAt));
    return Response.json({ ticket: publicTicket(ticket), replies: replies.map((reply)=>({...reply,authorName:reply.authorType==="customer"?"Customer":reply.authorName})) });
  } catch { return Response.json({ error: "Ticket tracking is temporarily unavailable." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    const required = ["customerName", "email", "category", "subject", "description"];
    if (required.some((key) => !String(body[key] || "").trim())) return Response.json({ error: "Complete all required ticket details." }, { status: 400 });
    const ticketId = `VPT${Math.floor(100000 + Math.random() * 900000)}`;
    const db = await getDb();
    const [officer] = await db.select().from(officers).where(eq(officers.active, true)).orderBy(asc(officers.assignedCount), asc(officers.id)).limit(1);
    const orderReference=body.orderId?.trim().toUpperCase();
    await db.insert(tickets).values({ ticketId, customerName: body.customerName.trim().slice(0,100), email: body.email.trim().toLowerCase().slice(0,150), mobile: body.mobile?.trim().slice(0,20) || "", category: body.category.trim().slice(0,50), subject: body.subject.trim().slice(0,150), description: `${orderReference?`Order: ${orderReference}\n`:""}${body.description.trim()}`.slice(0,2000), priority: body.priority?.trim().slice(0,20) || "Normal", assignedOfficer: officer?.email ?? null });
    await db.insert(ticketReplies).values({ ticketId, authorType: "system", authorName: "VPANSAK Support", message: "Your request has been received. Our support team will review it and share an update here." });
    if (officer) await db.update(officers).set({ assignedCount: officer.assignedCount + 1 }).where(eq(officers.id, officer.id));
    return Response.json({ ticketId, status: "Open", assigned: Boolean(officer) }, { status: 201 });
  } catch { return Response.json({ error: "Ticket could not be created. Please try again." }, { status: 500 }); }
}
