// PRODUCT — modification d'un produit via cookie "session"

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/server";

export async function PATCH(req: Request, { params }: any) {
  const { id } = params;
  const { name, to_buy } = await req.json();

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

  // 3. Récupérer la liste du user
  const { data: list } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // 4. Vérifier ownership du produit
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || product.list_id !== list.id) {
    return NextResponse.json({ error: "Produit non autorisé" }, { status: 403 });
  }

  // 5. Renommage
  if (name) {
    const newName = name.trim();
    if (!newName) {
      return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
    }

    // Vérifier doublon
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("list_id", list.id)
      .eq("name", newName)
      .single();

    if (existing && existing.id !== product.id) {
      return NextResponse.json({ error: "Produit déjà existant" }, { status: 400 });
    }

    await supabase.from("products").update({ name: newName }).eq("id", id);
  }

  // 6. Toggle
  if (typeof to_buy === "boolean") {
    await supabase.from("products").update({ to_buy }).eq("id", id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: any) {
  const { id } = params;

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

  // 3. Récupérer la liste du user
  const { data: list } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // 4. Vérifier ownership du produit
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || product.list_id !== list.id) {
    return NextResponse.json({ error: "Produit non autorisé" }, { status: 403 });
  }

  // 5. Suppression
  await supabase.from("products").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
