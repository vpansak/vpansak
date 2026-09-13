import { supabase } from "../../lib/supabase";

export async function GET() {
  try {
    let supabaseStatus = "disconnected";
    if (supabase) {
      const { data, error } = await supabase.from("users").select("id").limit(1);
      if (!error) {
        supabaseStatus = "healthy";
      } else {
        supabaseStatus = `notice: ${error.message}`;
      }
    }

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      supabase: supabaseStatus,
      uptime: process.uptime(),
    });
  } catch (err) {
    return Response.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
