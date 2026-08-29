import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { officers, ticketReplies, tickets } from "../../../db/schema";
import { getAuthUserFromRequest } from "../../lib/auth-session";
import { buildTicketEmailHtml, sendEmailViaResend } from "../../lib/email";
import { getTicketFromSupabase, saveTicketToSupabase } from "../../lib/supabase";

const SUPER_ADMIN_EMAIL = "aloksingh84959@gmail.com";

const publicTicket = (ticket: {
  ticketId: string;
  customerName: string;
  category: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}) => ({
  ticketId: ticket.ticketId,
  customerName: `${ticket.customerName.slice(0, 1)}***`,
  category: ticket.category,
  subject: ticket.subject,
  priority: ticket.priority,
  status: ticket.status,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim().toUpperCase();
  if (!id || !/^VPT\d{6}$/.test(id))
    return Response.json({ error: "Enter a valid Ticket ID." }, { status: 400 });
  try {
    const db = await getDb();
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, id)).limit(1);
    if (!ticket) {
      const remoteTicket = await getTicketFromSupabase(id);
      if (!remoteTicket)
        return Response.json({ error: "Ticket not found." }, { status: 404 });
      return Response.json({
        ticket: publicTicket(remoteTicket),
        replies: [
          {
            authorType: "system",
            authorName: "VPANSAK Support",
            message:
              "Your request has been received. Our support team will review it and share an update here.",
            createdAt: remoteTicket.createdAt,
          },
        ],
      });
    }
    const replies = await db
      .select({
        authorType: ticketReplies.authorType,
        authorName: ticketReplies.authorName,
        message: ticketReplies.message,
        createdAt: ticketReplies.createdAt,
      })
      .from(ticketReplies)
      .where(eq(ticketReplies.ticketId, id))
      .orderBy(asc(ticketReplies.createdAt));
    return Response.json({
      ticket: publicTicket(ticket),
      replies: replies.map(
        (reply: { authorType: string; authorName: string; message: string; createdAt: string }) => ({
          ...reply,
          authorName: reply.authorType === "customer" ? "Customer" : reply.authorName,
        })
      ),
    });
  } catch {
    return Response.json(
      { error: "Ticket tracking is temporarily unavailable." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request).catch(() => null);
    const body = ((await request.json().catch(() => ({}))) || {}) as Record<string, string>;

    const customerName = String(body.customerName || authUser?.fullName || "").trim();
    const email = String(body.email || authUser?.email || "").trim().toLowerCase();
    const mobile = String(body.mobile || authUser?.mobile || "").trim();
    const category = String(body.category || "").trim();
    const priority = String(body.priority || "Normal").trim();
    const subject = String(body.subject || "").trim();
    const descriptionInput = String(body.description || body.message || "").trim();
    const orderId = String(body.orderId || "").trim().toUpperCase();

    // 1. Mandatory field checks (including mobile)
    if (!customerName || !email || !mobile || !category || !subject || !descriptionInput) {
      return Response.json(
        { error: "Complete all required ticket details (name, email, mobile, category, subject, description)." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 2. Validate mobile length and allowed characters before saving
    const digitsOnly = mobile.replace(/\D/g, "");
    if (!/^\+?[0-9\s-]{7,20}$/.test(mobile) || digitsOnly.length < 7 || digitsOnly.length > 15) {
      return Response.json(
        { error: "Please enter a valid mobile number (7 to 15 digits)." },
        { status: 400 }
      );
    }

    const ticketId = `VPT${Math.floor(100000 + Math.random() * 900000)}`;
    const db = await getDb();

    // Select random active officer
    const activeOfficers = await db
      .select()
      .from(officers)
      .where(eq(officers.active, true));

    let selectedOfficer: (typeof activeOfficers)[number] | null = null;
    if (activeOfficers.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeOfficers.length);
      selectedOfficer = activeOfficers[randomIndex];
    }

    const descriptionText = `${orderId ? `Order: ${orderId}\n` : ""}${descriptionInput}`.slice(
      0,
      2000
    );

    // Save ticket locally in D1/SQLite
    await db.insert(tickets).values({
      ticketId,
      customerName: customerName.slice(0, 100),
      email,
      mobile: mobile.slice(0, 20),
      category: category.slice(0, 50),
      subject: subject.slice(0, 150),
      description: descriptionText,
      priority: priority.slice(0, 20),
      assignedOfficer: selectedOfficer?.email ?? null,
    });

    // Save system reply record
    await db.insert(ticketReplies).values({
      ticketId,
      authorType: "system",
      authorName: "VPANSAK Support",
      message:
        "Your request has been received. Our support team will review it and share an update here.",
    });

    // Increment assigned officer count if assigned
    if (selectedOfficer) {
      await db
        .update(officers)
        .set({ assignedCount: selectedOfficer.assignedCount + 1 })
        .where(eq(officers.id, selectedOfficer.id));
    }

    // 3. Await Supabase backup, catching failure separately so local ticket is preserved
    try {
      await saveTicketToSupabase({
        ticket_id: ticketId,
        customer_name: customerName.slice(0, 100),
        email,
        mobile: mobile.slice(0, 20),
        category: category.slice(0, 50),
        subject: subject.slice(0, 150),
        description: descriptionText,
        priority: priority.slice(0, 20),
        status: "Open",
      });
    } catch (supabaseErr: unknown) {
      const msg = supabaseErr instanceof Error ? supabaseErr.message : String(supabaseErr);
      console.error("Supabase ticket backup failed (local ticket preserved):", msg);
    }

    // Prepare email notifications via Resend
    let notificationSent = false;
    try {
      const nowIST = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "medium",
      });

      const assignmentStatus = selectedOfficer
        ? `Assigned to ${selectedOfficer.fullName} (${selectedOfficer.email})`
        : "Unassigned (No active support officer)";

      const emailSubject = `New VPANSAK Support Ticket – ${ticketId} – ${subject.slice(0, 80)}`;

      const emailHtml = buildTicketEmailHtml({
        ticketId,
        submittedAtIst: nowIST,
        customerName,
        customerEmail: email,
        mobile,
        category,
        priority,
        subject,
        description: descriptionText,
        orderId: orderId || undefined,
        assignedOfficerName: selectedOfficer?.fullName,
        officerId: selectedOfficer?.officerId,
        officerEmail: selectedOfficer?.email,
        assignmentStatus,
        uploadedFileLinks: [],
      });

      // 4. Email Super Admin unconditionally - notificationSent is set ONLY on Super Admin success
      const adminResult = await sendEmailViaResend({
        to: SUPER_ADMIN_EMAIL,
        subject: emailSubject,
        html: emailHtml,
        idempotencyKey: `${ticketId}-admin`,
      });

      notificationSent = adminResult.success;

      // Email Assigned Officer if active officer was selected (does not alter notificationSent)
      if (selectedOfficer && selectedOfficer.email) {
        await sendEmailViaResend({
          to: selectedOfficer.email,
          subject: emailSubject,
          html: emailHtml,
          idempotencyKey: `${ticketId}-officer`,
        });
      }
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("Ticket notification dispatch failed:", msg);
    }

    return Response.json(
      {
        ticketId,
        status: "Open",
        assigned: Boolean(selectedOfficer),
        assignedOfficer: selectedOfficer?.email || null,
        notificationSent,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Create ticket error:", msg);
    return Response.json(
      { error: "Ticket could not be created. Please try again." },
      { status: 500 }
    );
  }
}
