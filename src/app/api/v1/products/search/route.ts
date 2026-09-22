// src/app/api/v1/products/search/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { getAuthenticatedUserId } from "@/utils/auth";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() ?? "";

    // La recherche commence uniquement à partir de 3 caractères.
    if (query.length < 3) {
      return NextResponse.json({ products: [] });
    }

    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 }
      );
    }

    // Échappe les caractères spéciaux utilisés par ILIKE.
    const escapedQuery = query
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name")
      .eq("list_id", list.id)
      .ilike("name", `%${escapedQuery}%`)
      .order("name", { ascending: true })
      .limit(10);

    if (productsError) {
      console.error("SEARCH PRODUCTS ERROR:", productsError);

      return NextResponse.json(
        { error: "Impossible de rechercher les produits." },
        { status: 500 }
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("SEARCH PRODUCTS ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}