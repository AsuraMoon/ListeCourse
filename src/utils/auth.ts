import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";

const SESSION_COOKIE = "session";

export async function getAuthenticatedUserId(): Promise<number | null> {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return null;
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    return null;
  }

  if (new Date(session.expires_at) <= new Date()) {
    await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    return null;
  }

  return session.user_id;
}