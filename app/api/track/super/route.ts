import { eq, or, desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import {
  orders,
  orderItems,
  careerApplications,
  tickets,
  ticketReplies,
  contributions,
} from "../../../../db/schema";
import { supabase } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCode = String(searchParams.get("id") || searchParams.get("code") || "").trim();

  if (!rawCode || rawCode.length < 3) {
    return Response.json(
      { error: "Please enter a valid tracking code or Reference ID." },
      { status: 400 }
    );
  }

  const code = rawCode.toUpperCase();
  const db = await getDb();

  // 1. TRY SEARCHING ORDERS (VPO-...)
  try {
    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, code))
      .limit(1);

    let orderData = orderRows && orderRows[0];

    // Supabase fallback for orders
    if (!orderData && supabase) {
      try {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", code)
          .limit(1);
        if (data && data[0]) {
          const co = data[0];
          orderData = {
            orderId: co.order_id || co.orderId,
            customerName: co.customer_name || co.customerName || "Customer",
            mobile: co.mobile || "",
            address: co.address || "",
            city: co.city || "",
            pinCode: co.pin_code || co.pinCode || "",
            total: Number(co.total || 0),
            status: co.status || "Order Confirmed",
            currentLocation: co.current_location || co.currentLocation || "Processing Hub",
            paymentMethod: co.payment_method || co.paymentMethod || "COD",
            createdAt: co.created_at || co.createdAt || new Date().toISOString(),
            updatedAt: co.updated_at || co.updatedAt || new Date().toISOString(),
          };
        }
      } catch {}
    }

    if (orderData) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderData.orderId))
        .catch(() => []);

      return Response.json({
        found: true,
        type: "order",
        code: orderData.orderId,
        title: "VPANSAK Order Shipment",
        data: orderData,
        items,
      });
    }
  } catch {}

  // 2. TRY SEARCHING CAREER APPLICATIONS (VPC-CAREER-...)
  try {
    const careerRows = await db
      .select()
      .from(careerApplications)
      .where(
        or(
          eq(careerApplications.applicationId, code),
          eq(careerApplications.email, rawCode.toLowerCase())
        )
      )
      .orderBy(desc(careerApplications.createdAt))
      .limit(1);

    let careerData = careerRows && careerRows[0];

    if (!careerData && supabase) {
      try {
        const { data } = await supabase
          .from("career_applications")
          .select("*")
          .or(`application_id.eq.${code},email.eq.${rawCode.toLowerCase()}`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data[0]) {
          const cc = data[0];
          careerData = {
            applicationId: cc.application_id || cc.applicationId,
            fullName: cc.full_name || cc.fullName,
            email: cc.email,
            mobile: cc.mobile,
            city: cc.city,
            state: cc.state,
            country: cc.country || "India",
            interestedRole: cc.interested_role || cc.interestedRole,
            preferredPosition: cc.preferred_position || cc.preferredPosition,
            workMode: cc.work_mode || cc.workMode,
            qualification: cc.qualification,
            experienceLevel: cc.experience_level || cc.experienceLevel,
            status: cc.status || "New",
            createdAt: cc.created_at || cc.createdAt,
            updatedAt: cc.updated_at || cc.updatedAt,
          };
        }
      } catch {}
    }

    if (careerData) {
      return Response.json({
        found: true,
        type: "career",
        code: careerData.applicationId,
        title: "VPANSAK Career Application",
        data: careerData,
      });
    }
  } catch {}

  // 3. TRY SEARCHING SUPPORT TICKETS (VPT-...)
  try {
    const ticketRows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.ticketId, code))
      .limit(1);

    let ticketData = ticketRows && ticketRows[0];

    if (!ticketData && supabase) {
      try {
        const { data } = await supabase
          .from("tickets")
          .select("*")
          .eq("ticket_id", code)
          .limit(1);
        if (data && data[0]) {
          const ct = data[0];
          ticketData = {
            ticketId: ct.ticket_id || ct.ticketId,
            customerName: ct.customer_name || ct.customerName,
            email: ct.email,
            category: ct.category,
            subject: ct.subject,
            description: ct.description,
            priority: ct.priority,
            status: ct.status,
            assignedOfficer: ct.assigned_officer || ct.assignedOfficer,
            createdAt: ct.created_at || ct.createdAt,
            updatedAt: ct.updated_at || ct.updatedAt,
          };
        }
      } catch {}
    }

    if (ticketData) {
      const replies = await db
        .select()
        .from(ticketReplies)
        .where(eq(ticketReplies.ticketId, ticketData.ticketId))
        .catch(() => []);

      return Response.json({
        found: true,
        type: "ticket",
        code: ticketData.ticketId,
        title: "VPANSAK Support Ticket",
        data: ticketData,
        replies,
      });
    }
  } catch {}

  // 4. TRY SEARCHING SUPPORT CONTRIBUTIONS / CERTIFICATES (VPC-2026-...)
  try {
    const contribRows = await db
      .select()
      .from(contributions)
      .where(
        or(
          eq(contributions.verificationId, code),
          eq(contributions.certificateNumber, code)
        )
      )
      .limit(1);

    let contribData = contribRows && contribRows[0];

    if (!contribData && supabase) {
      try {
        const { data } = await supabase
          .from("contributions")
          .select("*")
          .or(`verification_id.eq.${code},certificate_number.eq.${code}`)
          .limit(1);

        if (data && data[0]) {
          const cc = data[0];
          contribData = {
            verificationId: cc.verification_id || cc.verificationId,
            certificateNumber: cc.certificate_number || cc.certificateNumber,
            fullName: cc.full_name || cc.fullName,
            email: cc.email,
            amount: cc.amount,
            paymentStatus: cc.payment_status || cc.paymentStatus,
            submittedAt: cc.submitted_at || cc.submittedAt || cc.created_at,
            verifiedAt: cc.verified_at || cc.verifiedAt,
          };
        }
      } catch {}
    }

    if (contribData) {
      return Response.json({
        found: true,
        type: "contribution",
        code: contribData.verificationId || contribData.certificateNumber,
        title: "VPANSAK Support Contribution",
        data: contribData,
      });
    }
  } catch {}

  return Response.json(
    {
      found: false,
      error: `No record found for code "${rawCode}". Please check your code and try again.`,
    },
    { status: 444 }
  );
}
