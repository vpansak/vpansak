import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { contributions, coupons, donations, notifications, officers, orders, products, reviews, sellerApplications, ticketReplies, tickets, users } from "../../../db/schema";
import { getAuthUserFromRequest, isAdminUser } from "../../lib/auth-session";

const ADMIN = "aloksingh84959@gmail.com";

async function authorized(request: Request) {
  const user = await getAuthUserFromRequest(request);
  if (user && isAdminUser(user)) return true;
  const headerEmail = request.headers.get("oai-authenticated-user-email")?.toLowerCase();
  if (headerEmail === ADMIN) return true;
  return false;
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "Admin access denied." }, { status: 403 });
  try {
    const db = await getDb();
    const [userRows, orderRows, sellerRows, ticketRows, productRows, reviewRows, officerRows, donationRows, couponRows] = await Promise.all([
      db.select({ email: users.email, fullName: users.fullName, mobile: users.mobile, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(100),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100),
      db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt)).limit(100),
      db.select().from(tickets).orderBy(desc(tickets.updatedAt)).limit(100),
      db.select().from(products).orderBy(desc(products.createdAt)).limit(100),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100),
      db.select().from(officers).orderBy(desc(officers.createdAt)).limit(100),
      db.select().from(donations).orderBy(desc(donations.createdAt)).limit(100),
      db.select().from(coupons).limit(100),
    ]);
    return Response.json({
      users: userRows,
      orders: orderRows,
      sellers: sellerRows,
      tickets: ticketRows,
      products: productRows,
      reviews: reviewRows,
      officers: officerRows,
      donations: donationRows,
      coupons: couponRows,
    });
  } catch {
    return Response.json({ error: "Admin data is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await authorized(request))) return Response.json({ error: "Admin access denied." }, { status: 403 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action || "");
    const db = await getDb();

    if (action === "userRole") {
      const email = String(body.email || "").trim().toLowerCase();
      const role = String(body.role || "customer").slice(0, 30);
      if (email) {
        await db.update(users).set({ role }).where(eq(users.email, email));
      }
      return Response.json({ ok: true });
    }

    if (action === "orderStatus") {
      const id = String(body.orderId || "");
      const status = String(body.status || "").slice(0, 50);
      await db.update(orders).set({ status }).where(eq(orders.orderId, id));
      const [order] = await db.select().from(orders).where(eq(orders.orderId, id)).limit(1);
      if (order?.ownerEmail) {
        await db.insert(notifications).values({
          ownerEmail: order.ownerEmail,
          title: "Order status updated",
          message: `${id} is now ${status}.`,
          type: "order",
        });
      }
      return Response.json({ ok: true });
    }

    if (action === "sellerStatus") {
      await db.update(sellerApplications).set({ status: String(body.status || "").slice(0, 50) }).where(eq(sellerApplications.applicationId, String(body.applicationId || "")));
      return Response.json({ ok: true });
    }

    if (action === "ticketStatus") {
      await db.update(tickets).set({ status: String(body.status || "").slice(0, 50), updatedAt: new Date().toISOString() }).where(eq(tickets.ticketId, String(body.ticketId || "")));
      return Response.json({ ok: true });
    }

    if (action === "ticketReply") {
      const ticketId = String(body.ticketId || "");
      const message = String(body.message || "").trim().slice(0, 2000);
      if (!message) return Response.json({ error: "Reply is required." }, { status: 400 });
      await db.insert(ticketReplies).values({ ticketId, authorType: "admin", authorName: "VPANSAK Support", message });
      await db.update(tickets).set({ status: "Support Replied", updatedAt: new Date().toISOString() }).where(eq(tickets.ticketId, ticketId));
      return Response.json({ ok: true });
    }

    if (action === "reviewStatus") {
      await db.update(reviews).set({ status: String(body.status || "").slice(0, 30) }).where(eq(reviews.id, Number(body.id)));
      return Response.json({ ok: true });
    }

    if (action === "productStatus") {
      await db.update(products).set({ status: String(body.status || "").slice(0, 30) }).where(eq(products.id, String(body.id || "")));
      return Response.json({ ok: true });
    }

    if (action === "donationStatus" || action === "verifyContribution" || action === "rejectContribution") {
      const verificationId = String(body.verificationId || body.donationId || "").trim().toUpperCase();
      const targetStatus = String(body.status || (action === "rejectContribution" ? "rejected" : "verified")).trim().toLowerCase();
      const internalNote = String(body.adminNote || body.rejectionReason || "").slice(0, 500);
      const publicRejectionReason = String(body.publicRejectionReason || "Verification failed").slice(0, 300);

      const [row] = await db.select().from(contributions).where(eq(contributions.verificationId, verificationId)).limit(1);
      if (!row) return Response.json({ error: "Contribution record not found." }, { status: 404 });

      const adminUser = await getAuthUserFromRequest(request);
      const adminEmail = adminUser?.email || "aloksingh84959@gmail.com";
      const now = new Date().toISOString();

      if (targetStatus === "verified") {
        if (row.paymentStatus === "verified") {
          return Response.json({ error: "Contribution is already verified." }, { status: 400 });
        }
        const { generateCertificateNumber } = await import("../../lib/contributions");
        const certificateNumber = row.certificateNumber || (await generateCertificateNumber(db));

        await db.update(contributions).set({
          paymentStatus: "verified",
          verificationMethod: row.verificationMethod || "manual_admin",
          verifiedAt: now,
          verifiedBy: adminEmail,
          certificateNumber,
          certificateGeneratedAt: now,
          adminNote: internalNote || row.adminNote,
          updatedAt: now,
        }).where(eq(contributions.id, row.id));

        const certificateUrl = `${new URL(request.url).origin}/foundation?certificate=${encodeURIComponent(row.verificationId)}`;
        const subject = `VPANSAK Support Certificate ${certificateNumber}`;
        const bodyText = `Hello ${row.fullName},\n\nYour support contribution payment has been verified successfully!\n\nVerification ID: ${row.verificationId}\nCertificate Number: ${certificateNumber}\n\nView and download your official Certificate of Appreciation:\n${certificateUrl}\n\nThank you for supporting VPANSAK community initiatives.\n\nWarm regards,\nAlok Singh\nFounder & Authorized Signatory\nVPANSAK Support Foundation`;
        const composeUrl = `https://outlook.live.com/mail/0/deeplink/compose?${new URLSearchParams({ to: row.email, subject, body: bodyText })}`;
        return Response.json({ ok: true, certificateNumber, verificationId: row.verificationId, composeUrl });
      }

      if (targetStatus === "rejected") {
        await db.update(contributions).set({
          paymentStatus: "rejected",
          rejectionReason: internalNote || "Manual rejection by admin",
          publicRejectionReason,
          adminNote: internalNote || row.adminNote,
          updatedAt: now,
        }).where(eq(contributions.id, row.id));
        return Response.json({ ok: true, verificationId: row.verificationId, status: "rejected" });
      }

      // Other status updates (pending_verification, failed, refunded)
      await db.update(contributions).set({
        paymentStatus: targetStatus,
        adminNote: internalNote || row.adminNote,
        updatedAt: now,
      }).where(eq(contributions.id, row.id));

      return Response.json({ ok: true });
    }

    if (action === "officer") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) return Response.json({ error: "Officer email is required." }, { status: 400 });
      await db.insert(officers).values({
        officerId: `VPOF${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: String(body.fullName || "").trim().slice(0, 100),
        email,
        role: String(body.role || "Ticket Support Officer").slice(0, 50),
        department: String(body.department || "Support").slice(0, 50),
      });
      return Response.json({ ok: true });
    }

    if (action === "coupon") {
      const code = String(body.code || "").trim().toUpperCase();
      if (!code) return Response.json({ error: "Coupon code is required." }, { status: 400 });
      await db.insert(coupons).values({
        code,
        title: String(body.title || code).slice(0, 100),
        type: String(body.type || "percentage"),
        value: Math.max(1, Math.round(Number(body.value) || 1)),
        minOrder: Math.max(0, Math.round(Number(body.minOrder) || 0)),
        maxDiscount: Math.max(0, Math.round(Number(body.maxDiscount) || 0)) || null,
      }).onConflictDoUpdate({
        target: coupons.code,
        set: {
          title: String(body.title || code).slice(0, 100),
          type: String(body.type || "percentage"),
          value: Math.max(1, Math.round(Number(body.value) || 1)),
          minOrder: Math.max(0, Math.round(Number(body.minOrder) || 0)),
          active: true,
        },
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown admin action." }, { status: 400 });
  } catch {
    return Response.json({ error: "Admin action could not be completed." }, { status: 500 });
  }
}
