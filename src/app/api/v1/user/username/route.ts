// PATCH /api/user/username — change le nom d'utilisateur via cookie "session"

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/server";

export async function PATCH(req: Request) {
  const { newUsername } = await req.json();

  if (!newUsername || !newUsername.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const cleanName = newUsername.trim();

  // 1. Lire le cookie "session"
  const session = req.headers.get("cookie")
    ?.split("; ")
    ?.find((c) => c.startsWith("session="))
    ?.split("=")[1];

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Récupérer le user via l'id stocké dans le cookie
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Vérifier collision username clair
  const { data: clearUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", cleanName)
    .single();

  if (clearUser && clearUser.id !== user.id) {
    return NextResponse.json({ error: "Nom déjà utilisé" }, { status: 400 });
  }

  // 4. Mise à jour du username
  const { error } = await supabase
    .from("users")
    .update({ username: cleanName })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 5. Mise à jour du nom de la liste
  await supabase
    .from("shopping_lists")
    .update({ name: `${cleanName}'s list` })
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
