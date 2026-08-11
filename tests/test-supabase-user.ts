import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Load .env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key length:", supabaseKey.length);

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

async function testSupabaseError() {
  const testEmail = `supa_test_${Date.now()}@gmail.com`;
  
  if (!supabase) {
    console.log("Supabase client is null!");
    return;
  }

  const { data, error } = await supabase.from("users").upsert({
    email: testEmail,
    password_hash: "salt:hash123",
    full_name: "Supabase Test User",
    mobile: "9998887777",
    role: "customer",
    auth_provider: "email",
    email_verified: 1,
    account_status: "active",
    security_question_id: "school",
    security_answer_hash: "salt:ans123",
    created_at: new Date().toISOString()
  }, { onConflict: "email" }).select();

  console.log("Supabase Data:", data);
  console.log("Supabase Error:", error);
}

testSupabaseError();
