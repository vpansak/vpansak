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

// Helper for fast Supabase query with 1.5s timeout
async function fastSupabaseQuery(tableName: string, queryFn: (sb: any) => Promise<any>) {
  if (!supabase) return null;
  const fetchPromise = (async () => {
    try {
      const res = await queryFn(supabase.from(tableName));
      return res?.data || null;
    } catch {
      return null;
    }
  })();
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
  return Promise.race([fetchPromise, timeoutPromise]);
}

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
  const lowerEmail = rawCode.toLowerCase();
  const db = await getDb();

  // Helper search functions
  async function searchOrder() {
    try {
      const orderRows = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, code))
        .limit(1);

      let orderData = orderRows && orderRows[0];

      if (!orderData) {
        const sbData = await fastSupabaseQuery("orders", (sb) =>
          sb.select("*").eq("order_id", code).limit(1)
        );
        if (sbData && sbData[0]) {
          const co = sbData[0];
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
      }

      if (orderData) {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, orderData.orderId))
          .catch(() => []);

        return {
          found: true,
          type: "order" as const,
          code: orderData.orderId,
          title: "VPANSAK Order Shipment",
          data: orderData,
          items,
        };
      }
    } catch {}
    return null;
  }

  async function searchCareer() {
    try {
      const careerRows = await db
        .select()
        .from(careerApplications)
        .where(
          or(
            eq(careerApplications.applicationId, code),
            eq(careerApplications.email, lowerEmail)
          )
        )
        .orderBy(desc(careerApplications.createdAt))
        .limit(1);

      let careerData = careerRows && careerRows[0];

      if (!careerData) {
        const sbData = await fastSupabaseQuery("career_applications", (sb) =>
          sb.select("*").or(`application_id.eq.${code},email.eq.${lowerEmail}`).order("created_at", { ascending: false }).limit(1)
        );
        if (sbData && sbData[0]) {
          const cc = sbData[0];
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
      }

      if (careerData) {
        return {
          found: true,
          type: "career" as const,
          code: careerData.applicationId,
          title: "VPANSAK Career Application",
          data: careerData,
        };
      }
    } catch {}
    return null;
  }

  async function searchTicket() {
    try {
      const ticketRows = await db
        .select()
        .from(tickets)
        .where(eq(tickets.ticketId, code))
        .limit(1);

      let ticketData = ticketRows && ticketRows[0];

      if (!ticketData) {
        const sbData = await fastSupabaseQuery("tickets", (sb) =>
          sb.select("*").eq("ticket_id", code).limit(1)
        );
        if (sbData && sbData[0]) {
          const ct = sbData[0];
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
      }

      if (ticketData) {
        const replies = await db
          .select()
          .from(ticketReplies)
          .where(eq(ticketReplies.ticketId, ticketData.ticketId))
          .catch(() => []);

        return {
          found: true,
          type: "ticket" as const,
          code: ticketData.ticketId,
          title: "VPANSAK Support Ticket",
          data: ticketData,
          replies,
        };
      }
    } catch {}
    return null;
  }

  async function searchContribution() {
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

      if (!contribData) {
        const sbData = await fastSupabaseQuery("contributions", (sb) =>
          sb.select("*").or(`verification_id.eq.${code},certificate_number.eq.${code}`).limit(1)
        );
        if (sbData && sbData[0]) {
          const cc = sbData[0];
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
      }

      if (contribData) {
        return {
          found: true,
          type: "contribution" as const,
          code: contribData.verificationId || contribData.certificateNumber,
          title: "VPANSAK Support Contribution",
          data: contribData,
        };
      }
    } catch {}
    return null;
  }

  // 1. FAST ROUTING BY PREFIX
  if (code.startsWith("VPC-CAREER-") || lowerEmail.includes("@")) {
    const careerRes = await searchCareer();
    if (careerRes) return Response.json(careerRes);
  } else if (code.startsWith("VPO-")) {
    const orderRes = await searchOrder();
    if (orderRes) return Response.json(orderRes);
  } else if (code.startsWith("VPT-")) {
    const ticketRes = await searchTicket();
    if (ticketRes) return Response.json(ticketRes);
  } else if (code.startsWith("VPC-2026-") || code.startsWith("CERT-")) {
    const contribRes = await searchContribution();
    if (contribRes) return Response.json(contribRes);
  }

  // 2. PARALLEL FALLBACK SEARCH FOR ALL UNKNOWN CODES
  const [orderRes, careerRes, ticketRes, contribRes] = await Promise.all([
    searchOrder(),
    searchCareer(),
    searchTicket(),
    searchContribution(),
  ]);

  const result = orderRes || careerRes || ticketRes || contribRes;
  if (result) {
    return Response.json(result);
  }

  return Response.json(
    {
      found: false,
      error: `No record found for code "${rawCode}". Please check your code and try again.`,
    },
    { status: 444 }
  );
}
