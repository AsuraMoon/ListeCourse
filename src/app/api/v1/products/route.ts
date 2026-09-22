export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";
import { getAuthenticatedUserId } from "@/utils/auth";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id, name")
      .eq("user_id", userId)
      .single();

    if (listError || !list) {
      console.error("GET LIST ERROR:", listError);

      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 }
      );
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, to_buy, created_at")
      .eq("list_id", list.id)
      .order("created_at", { ascending: true });

    if (productsError) {
      console.error("GET PRODUCTS ERROR:", productsError);

      return NextResponse.json(
        { error: "Impossible de récupérer les produits." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      list,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}