export async function GET() {
  const listId = await getListId();
  // On récupère la liste du user

  if (!listId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("id, product_id, to_buy, created_at, products(name)")
    // products(name) = jointure automatique pour récupérer le nom du produit
    .eq("list_id", listId)
    // On filtre par liste
    .order("created_at", { ascending: false });
    // Tri du plus récent au plus ancien

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
export async function POST(req: Request) {
  const listId = await getListId();
  // On récupère la liste du user

  if (!listId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const productId = body.product_id;
  // On récupère l'id du produit

  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const supabase = supabaseServer();

  // Vérifier que le produit appartient à la même liste
  const { data: product } = await supabase
    .from("products")
    .select("id, list_id")
    .eq("id", productId)
    .single();

  if (!product || product.list_id !== listId) {
    return NextResponse.json({ error: "Invalid product for this list" }, { status: 400 });
    // Sécurité : impossible d'ajouter un produit d'une autre liste
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert({ list_id: listId, product_id: productId, to_buy: true })
    // On crée l'item dans la bonne liste
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
