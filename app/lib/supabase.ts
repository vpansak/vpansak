import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://lffcguvwibkpwzzihpcp.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZmNndXZ3aWJrcHd6emlocGNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTc3NTEyMywiZXhwIjoyMTAxMzUxMTIzfQ.2AaATrDqHgJNI-kXuzSbLrAM7dqjscQ1QJNDXUm_fYI";

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
    const email = String(userData.email || userData.owner_email || "").toLowerCase().trim();
    if (!email) return null;

    const now = new Date().toISOString();
    let passHash = String(userData.password_hash || userData.passwordHash || "");
    let secQ = userData.security_question_id || userData.securityQuestionId || null;
    let secAns = userData.security_answer_hash || userData.securityAnswerHash || null;
    let role = String(userData.role || userData.role || "customer");

    if (!passHash || passHash === "NO_HASH" || !secQ) {
      try {
        const { data: existing } = await supabase.from("users").select("password_hash, security_question_id, security_answer_hash, role").eq("email", email).maybeSingle();
        if (existing) {
          if ((!passHash || passHash === "NO_HASH") && existing.password_hash && existing.password_hash !== "NO_HASH") {
            passHash = existing.password_hash;
          }
          if (!secQ && existing.security_question_id) {
            secQ = existing.security_question_id;
          }
          if (!secAns && existing.security_answer_hash) {
            secAns = existing.security_answer_hash;
          }
          if (existing.role && role === "customer") {
            role = existing.role;
          }
        }
      } catch {
        // Ignore select check error
      }
    }

    const fullPayload: Record<string, unknown> = {
      email,
      password_hash: passHash || "NO_HASH",
      full_name: String(userData.full_name || userData.fullName || email.split("@")[0]),
      mobile: String(userData.mobile || ""),
      role,
      profile_image: userData.profile_image ?? userData.profileImage ?? null,
      auth_provider: String(userData.auth_provider || userData.authProvider || "email"),
      email_verified: userData.email_verified ?? userData.emailVerified ? 1 : 0,
      account_status: String(userData.account_status || userData.accountStatus || "active"),
      security_question_id: secQ,
      security_answer_hash: secAns,
      created_at: String(userData.created_at || userData.createdAt || now),
      updated_at: String(userData.updated_at || userData.updatedAt || now),
    };

    // 1. Try full upsert with select
    const { data, error } = await supabase.from("users").upsert(fullPayload, { onConflict: "email" }).select();
    if (!error && data) return data;

    // 2. Try full upsert without select (in case select permissions differ)
    const { error: errorNoSelect } = await supabase.from("users").upsert(fullPayload, { onConflict: "email" });
    if (!errorNoSelect) return [fullPayload];

    // 3. Fallback: try core essential payload if Supabase table lacks optional columns
    const corePayload = {
      email,
      password_hash: passHash || "NO_HASH",
      full_name: String(userData.full_name || userData.fullName || email.split("@")[0]),
      mobile: String(userData.mobile || ""),
      role,
    };
    const { data: fallbackData } = await supabase.from("users").upsert(corePayload, { onConflict: "email" }).select();
    return fallbackData || [corePayload];
  } catch (err) {
    console.error("Supabase user upsert notice:", err);
    return null;
  }
}

export async function getUserFromSupabase(email: string) {
  if (!supabase || !email) return null;
  try {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try exact match in users table
    let { data, error } = await supabase.from("users").select("*").eq("email", cleanEmail).limit(1);
    let userRow = Array.isArray(data) && data.length > 0 ? data[0] : null;

    // 2. Try ilike case-insensitive match in users table
    if (!userRow) {
      const { data: ilikeData } = await supabase.from("users").select("*").ilike("email", cleanEmail).limit(1);
      userRow = Array.isArray(ilikeData) && ilikeData.length > 0 ? ilikeData[0] : null;
    }

    // 3. Ultra-deep fallback: Check profiles table if users table row wasn't found
    if (!userRow) {
      const { data: profData } = await supabase.from("profiles").select("*").ilike("email", cleanEmail).limit(1);
      const profRow = Array.isArray(profData) && profData.length > 0 ? profData[0] : null;
      if (profRow) {
        userRow = {
          email: String(profRow.email || cleanEmail),
          full_name: String(profRow.full_name || profRow.fullName || cleanEmail.split("@")[0]),
          mobile: String(profRow.mobile || ""),
          role: "customer",
          password_hash: "NO_HASH",
          account_status: "active",
          created_at: String(profRow.created_at || new Date().toISOString()),
        };
      }
    }

    // 4. Ultra-deep fallback: Check orders table if profiles table row wasn't found
    if (!userRow) {
      const { data: ordData } = await supabase.from("orders").select("*").ilike("owner_email", cleanEmail).limit(1);
      const ordRow = Array.isArray(ordData) && ordData.length > 0 ? ordData[0] : null;
      if (ordRow) {
        userRow = {
          email: String(ordRow.owner_email || cleanEmail),
          full_name: String(ordRow.customer_name || ordRow.customerName || cleanEmail.split("@")[0]),
          mobile: String(ordRow.mobile || ""),
          role: "customer",
          password_hash: "NO_HASH",
          account_status: "active",
          created_at: String(ordRow.created_at || new Date().toISOString()),
        };
      }
    }

    if (error && !userRow) return null;
    if (!userRow) return null;

    return {
      email: String(userRow.email || cleanEmail).toLowerCase().trim(),
      passwordHash: String(userRow.password_hash || userRow.passwordHash || ""),
      fullName: String(userRow.full_name || userRow.fullName || cleanEmail.split("@")[0]),
      mobile: String(userRow.mobile || ""),
      role: String(userRow.role || "customer"),
      profileImage: String(userRow.profile_image || userRow.profileImage || ""),
      authProvider: String(userRow.auth_provider || userRow.authProvider || "email"),
      securityQuestionId: String(userRow.security_question_id || userRow.securityQuestionId || ""),
      securityAnswerHash: String(userRow.security_answer_hash || userRow.securityAnswerHash || ""),
      accountStatus: String(userRow.account_status || userRow.accountStatus || "active"),
      createdAt: String(userRow.created_at || userRow.createdAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export async function getUserOrdersFromSupabase(email: string) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("orders").select("*").eq("owner_email", email.toLowerCase());
    if (error || !data) return [];
    return data.map((row) => ({
      orderId: String(row.order_id || row.orderId || ""),
      ownerEmail: String(row.owner_email || email).toLowerCase(),
      customerName: String(row.customer_name || row.customerName || ""),
      mobile: String(row.mobile || ""),
      address: String(row.address || ""),
      city: String(row.city || ""),
      pinCode: String(row.pin_code || row.pinCode || ""),
      total: Number(row.total || 0),
      status: String(row.status || "Order Confirmed"),
      paymentMethod: String(row.payment_method || row.paymentMethod || "COD"),
      createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export async function getAddressesFromSupabase(email: string) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("addresses").select("*").eq("owner_email", email.toLowerCase());
    if (error || !data) return [];
    return data.map((row) => ({
      ownerEmail: String(row.owner_email || email).toLowerCase(),
      label: String(row.label || "Home"),
      fullName: String(row.full_name || row.fullName || ""),
      mobile: String(row.mobile || ""),
      line1: String(row.line1 || ""),
      city: String(row.city || ""),
      state: String(row.state || ""),
      pinCode: String(row.pin_code || row.pinCode || ""),
      isPrimary: Boolean(row.is_primary || row.isPrimary),
    }));
  } catch {
    return [];
  }
}

export async function saveAddressToSupabase(addressData: Record<string, unknown>) {
  if (!supabase) return null;
  try {
    const payload = {
      owner_email: String(addressData.ownerEmail || addressData.owner_email || "").toLowerCase(),
      label: String(addressData.label || "Home"),
      full_name: String(addressData.fullName || addressData.full_name || ""),
      mobile: String(addressData.mobile || ""),
      line1: String(addressData.line1 || ""),
      city: String(addressData.city || ""),
      state: String(addressData.state || ""),
      pin_code: String(addressData.pinCode || addressData.pin_code || ""),
      is_primary: Boolean(addressData.isPrimary || addressData.is_primary),
    };
    const { data, error } = await supabase.from("addresses").upsert(payload).select();
    if (error) console.error("Supabase address upsert notice:", error.message);
    return data;
  } catch (err) {
    console.error("Supabase address upsert catch:", err);
    return null;
  }
}

export async function getCartFromSupabase(email: string) {
  if (!supabase || !email) return [];
  try {
    const { data, error } = await supabase.from("cart_items").select("*").eq("owner_email", email.toLowerCase());
    if (error || !data) return [];
    return data.map((r) => ({
      ownerEmail: String(r.owner_email || email).toLowerCase(),
      productId: String(r.product_id || ""),
      quantity: Number(r.quantity || 1),
    }));
  } catch {
    return [];
  }
}

export async function saveCartItemToSupabase(email: string, productId: string, quantity: number) {
  if (!supabase || !email || !productId) return null;
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (quantity <= 0) {
      await supabase.from("cart_items").delete().eq("owner_email", cleanEmail).eq("product_id", productId);
      return null;
    }
    const payload = {
      owner_email: cleanEmail,
      product_id: productId,
      quantity,
      updated_at: new Date().toISOString(),
    };
    const { data } = await supabase.from("cart_items").upsert(payload, { onConflict: "owner_email,product_id" }).select();
    return data;
  } catch (err) {
    console.error("Supabase cart upsert notice:", err);
    return null;
  }
}

export async function getWishlistFromSupabase(email: string) {
  if (!supabase || !email) return [];
  try {
    const { data, error } = await supabase.from("wishlist_items").select("*").eq("owner_email", email.toLowerCase());
    if (error || !data) return [];
    return data.map((r) => ({
      ownerEmail: String(r.owner_email || email).toLowerCase(),
      productId: String(r.product_id || ""),
    }));
  } catch {
    return [];
  }
}

export async function saveWishlistItemToSupabase(email: string, productId: string, remove = false) {
  if (!supabase || !email || !productId) return null;
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (remove) {
      await supabase.from("wishlist_items").delete().eq("owner_email", cleanEmail).eq("product_id", productId);
      return null;
    }
    const payload = {
      owner_email: cleanEmail,
      product_id: productId,
      created_at: new Date().toISOString(),
    };
    const { data } = await supabase.from("wishlist_items").upsert(payload, { onConflict: "owner_email,product_id" }).select();
    return data;
  } catch (err) {
    console.error("Supabase wishlist upsert notice:", err);
    return null;
  }
}

