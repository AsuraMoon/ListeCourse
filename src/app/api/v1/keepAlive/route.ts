import { supabase } from "@/utils/supabase/server";

export async function POST() {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("system_heartbeat")
    .insert({ last_ping: now });

  if (error) {
    console.error("Heartbeat insert error:", error);
    return new Response(JSON.stringify({ status: "error", error }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "alive", timestamp: now }), { status: 201 });
}
