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
