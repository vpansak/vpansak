import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function saveOrderToSupabase(orderData: Record<string, unknown>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("orders").insert(orderData).select();
    if (error) console.error("Supabase order insert notice:", error.message);
    return data;
  } catch (err) {
    console.error("Supabase order insert catch:", err);
    return null;
  }
}

export async function saveDonationToSupabase(donationData: Record<string, unknown>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("donations").insert(donationData).select();
    if (error) console.error("Supabase donation insert notice:", error.message);
    return data;
  } catch (err) {
    console.error("Supabase donation insert catch:", err);
    return null;
  }
}

export async function saveTicketToSupabase(ticketData: Record<string, unknown>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("tickets").insert(ticketData).select();
    if (error) console.error("Supabase ticket insert notice:", error.message);
    return data;
  } catch (err) {
    console.error("Supabase ticket insert catch:", err);
    return null;
  }
}

export async function getTicketFromSupabase(ticketId: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("tickets").select("*").eq("ticket_id", ticketId).single();
    if (error || !data) return null;
    return {
      ticketId: String(data.ticket_id || ticketId),
      customerName: String(data.customer_name || "Customer"),
      category: String(data.category || "Support"),
      subject: String(data.subject || "Support Request"),
      priority: String(data.priority || "Normal"),
      status: String(data.status || "Open"),
      createdAt: String(data.created_at || new Date().toISOString()),
      updatedAt: String(data.updated_at || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export async function getDonationFromSupabase(certificateId: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("donations").select("*").eq("certificate_id", certificateId).single();
    if (error || !data) return null;
    return {
      certificateId: String(data.certificate_id || certificateId),
      donorName: String(data.donor_name || "Donor"),
      amount: Number(data.amount || 0),
      appreciationMessage: String(data.appreciation_message || ""),
      createdAt: String(data.created_at || new Date().toISOString()),
      paymentStatus: String(data.payment_status || "Pending Verification"),
    };
  } catch {
    return null;
  }
}

export async function getOrderFromSupabase(orderId: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("orders").select("*").eq("order_id", orderId).single();
    if (error || !data) return null;
    return {
      orderId: String(data.order_id || orderId),
      status: String(data.status || "Order Confirmed"),
      total: Number(data.total || 0),
      createdAt: String(data.created_at || new Date().toISOString()),
      paymentMethod: String(data.payment_method || "COD"),
      city: String(data.city || ""),
      pinCode: String(data.pin_code || ""),
      mobile: String(data.mobile || ""),
    };
  } catch {
    return null;
  }
}

export async function saveUserToSupabase(userData: Record<string, unknown>) {
  if (!supabase) return null;
  try {
    const payload: Record<string, unknown> = {};
    if (userData.email) payload.email = String(userData.email).toLowerCase().trim();
    if (userData.password_hash || userData.passwordHash) payload.password_hash = String(userData.password_hash || userData.passwordHash);
    if (userData.full_name || userData.fullName) payload.full_name = String(userData.full_name || userData.fullName);
    if (userData.mobile !== undefined) payload.mobile = String(userData.mobile);
    if (userData.role) payload.role = String(userData.role);
    if (userData.profile_image !== undefined || userData.profileImage !== undefined) payload.profile_image = userData.profile_image ?? userData.profileImage ?? null;
    if (userData.auth_provider || userData.authProvider) payload.auth_provider = String(userData.auth_provider || userData.authProvider);
    if (userData.email_verified !== undefined || userData.emailVerified !== undefined) payload.email_verified = userData.email_verified ?? userData.emailVerified ? 1 : 0;
    if (userData.account_status || userData.accountStatus) payload.account_status = String(userData.account_status || userData.accountStatus);
    if (userData.security_question_id || userData.securityQuestionId) payload.security_question_id = String(userData.security_question_id || userData.securityQuestionId);
    if (userData.security_answer_hash || userData.securityAnswerHash) payload.security_answer_hash = String(userData.security_answer_hash || userData.securityAnswerHash);
    if (userData.created_at || userData.createdAt) payload.created_at = String(userData.created_at || userData.createdAt);
    if (userData.updated_at || userData.updatedAt) payload.updated_at = String(userData.updated_at || userData.updatedAt || new Date().toISOString());

    const { data, error } = await supabase.from("users").upsert(payload, { onConflict: "email" }).select();
    if (error) console.error("Supabase user upsert notice:", error.message);
    return data;
  } catch (err) {
    console.error("Supabase user upsert catch:", err);
    return null;
  }
}

export async function getUserFromSupabase(email: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single();
    if (error || !data) return null;
    return {
      email: String(data.email || "").toLowerCase(),
      passwordHash: String(data.password_hash || data.passwordHash || ""),
      fullName: String(data.full_name || data.fullName || ""),
      mobile: String(data.mobile || ""),
      role: String(data.role || "customer"),
      securityQuestionId: String(data.security_question_id || data.securityQuestionId || ""),
      securityAnswerHash: String(data.security_answer_hash || data.securityAnswerHash || ""),
      accountStatus: String(data.account_status || data.accountStatus || "active"),
      createdAt: String(data.created_at || data.createdAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

