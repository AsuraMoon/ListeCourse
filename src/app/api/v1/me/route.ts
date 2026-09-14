import { NextResponse } from "next/server"; 
// NextResponse = permet de renvoyer une réponse API propre

import { supabaseServer } from "@/utils/supabase/server";
// supabaseServer = ton client service_role côté serveur

export async function GET() {
// GET = méthode HTTP pour récupérer des données

  const supabase = supabaseServer();
  // supabase = instance connectée à ta base avec service_role

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // auth.getUser() = récupère l'utilisateur connecté via Supabase Auth
  // user = contient id, email, etc.

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    // Si pas de user → pas connecté → erreur 401
  }

  const { data: member } = await supabase
    .from("shopping_list_members")
    .select("list_id")
    .eq("user_id", user.id)
    .single();
  // On va chercher dans shopping_list_members la liste du user
  // eq("user_id", user.id) = filtre par user
  // single() = on veut une seule ligne

  return NextResponse.json({
    user,        // infos du user Supabase
    list_id: member?.list_id ?? null, // id de la liste (1 ou 2)
  });
}
