import { supabase } from "@/utils/supabase/server";

export async function GET() {
  try {

    const { data: products_guest, error } = await supabase
      .from("products_guest")
      .select("*");

    if (error) throw error;

    return new Response(JSON.stringify(products_guest), { status: 200 });
  } catch (error) {
    console.error("An error occurred:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return new Response("Product name is required", { status: 400 });
    }

    const toTitleCase = (str: string) =>
      str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
      );

    const name = toTitleCase(body.name);
    const allowedPositions = ["haut", "bas_sec", "bas_surgele", "bas_frais"];
    const position = allowedPositions.includes(body.position)
      ? body.position
      : "haut";

    const { data, error } = await supabase
      .from("products_guest")
      .upsert([{ name, position }], { onConflict: "name" });

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify(error), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error("Unexpected POST error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const product_id = body.product_id;

    if (!product_id) {
      return new Response("Product ID missing", { status: 400 });
    }

    // Met à jour uniquement to_buy = true dans shopping_guest_list_items
    const { data, error } = await supabase
      .from("shopping_guest_list_items")
      .update({ to_buy: true })
      .eq("product_id", product_id);

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("An error occurred:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
