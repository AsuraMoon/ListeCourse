// GET LIST — retourne uniquement les produits à acheter (to_buy = true) via cookie "session"

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/server";

export async function GET(req: Request) {
  // 1. Lire le cookie "session"
  const session = req.headers.get("cookie")
    ?.split("; ")
    ?.find((c) => c.startsWith("session="))
    ?.split("=")[1];

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Récupérer le user via l'id stocké dans le cookie
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Récupérer la liste du user
  const { data: list, error: listError } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (listError || !list) {
    return NextResponse.json([], { status: 200 });
  }

  // 4. Récupérer les produits à acheter
  const { data: items, error: itemsError } = await supabase
    .from("products")
    .select("*")
    .eq("list_id", list.id)
    .eq("to_buy", true);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  // 5. Retourner les produits à acheter
  return NextResponse.json(items);
}
