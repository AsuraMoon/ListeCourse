// GET PRODUCTS — retourne tous les produits du user via cookie "session"

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

  // 4. Récupérer tous les produits de cette liste
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("list_id", list.id);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 400 });
  }

  // 5. Retourner les produits
  return NextResponse.json(products);
}

// CREATE PRODUCT — ajoute un produit dans la liste du user via cookie "session"

export async function POST(req: Request) {
  const { name } = await req.json();

  // 1. Vérifier champ obligatoire
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }

  const cleanName = name.trim();

  // 2. Lire le cookie "session"
  const session = req.headers.get("cookie")
    ?.split("; ")
    ?.find((c) => c.startsWith("session="))
    ?.split("=")[1];

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Récupérer le user via l'id stocké dans le cookie
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Récupérer la liste du user
  const { data: list, error: listError } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: "Liste introuvable" }, { status: 400 });
  }

  // 5. Vérifier doublon dans la même liste
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("list_id", list.id)
    .eq("name", cleanName)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Produit déjà existant" }, { status: 400 });
  }

  // 6. Créer le produit
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: cleanName,
      to_buy: false,
      list_id: list.id,
    })
    .select("*")
    .single();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 400 });
  }

  // 7. Retourner le produit créé
  return NextResponse.json(product);
}
