import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const listId = await getListId();
  // On récupère la liste du user

  if (!listId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const itemId = Number(params.id);
  // On récupère l'id de l'item dans l'URL

  const body = await req.json();
  const toBuy = body.to_buy;
  // On récupère la nouvelle valeur

  const supabase = supabaseServer();

  // Vérifier que l’item appartient à la liste du user
  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("id, list_id")
    .eq("id", itemId)
    .single();

  if (!item || item.list_id !== listId) {
    return NextResponse.json({ error: "Item not in your list" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .update({ to_buy: !!toBuy })
    // !!toBuy = convertit en booléen
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const listId = await getListId();
  // On récupère la liste du user

  if (!listId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const itemId = Number(params.id);
  // On récupère l'id de l'item

  const supabase = supabaseServer();

  // Vérifier que l’item appartient à la liste du user
  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("id, list_id")
    .eq("id", itemId)
    .single();

  if (!item || item.list_id !== listId) {
    return NextResponse.json({ error: "Item not in your list" }, { status: 404 });
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", itemId);
    // On supprime l'item

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
