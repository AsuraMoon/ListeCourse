import { NextResponse } from "next/server";

async function getListId() {
  const supabase = supabaseServer();
  // On récupère le client supabase

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // On récupère le user connecté

  if (!user) return null;
  // Si pas connecté → null

  const { data: member } = await supabase
    .from("shopping_list_members")
    .select("list_id")
    .eq("user_id", user.id)
    .single();
  // On récupère la liste du user

  return member?.list_id ?? null;
  // On renvoie la liste (1 ou 2)
}

export async function GET() {
  const listId = await getListId();
  // On récupère la liste du user

  if (!listId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Si pas de liste → erreur

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("list_id", listId)
    .order("name", { ascending: true });
  // On récupère tous les produits de la liste du user
  // eq("list_id", listId) = FAMILLE ne voit que FAMILLE, DEMO ne voit que DEMO
  // order("name") = tri alphabétique

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const listId = await getListId();
  // On récupère la liste du user

  if (!listId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // On lit le body JSON envoyé par le frontend

  const name = (body.name ?? "").trim();
  // On récupère le nom du produit
  // trim() = supprime les espaces

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
    // Si nom vide → erreur
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .insert({ name, list_id: listId })
    // On insère le produit dans la liste du user
    .select("*")
    .single();
    // On renvoie le produit créé

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
