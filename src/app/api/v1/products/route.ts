// src/app/api/v1/products/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";
import { getAuthenticatedUserId } from "@/utils/auth";

export async function GET() {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    // Refuse l'accès si aucune session valide n'est trouvée.
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    // Récupère l'unique liste de courses appartenant à l'utilisateur.
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id, name")
      .eq("user_id", userId)
      .single();

    // Vérifie que la liste de courses existe bien.
    if (listError || !list) {
      console.error("GET LIST ERROR:", listError);

      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 }
      );
    }

    // Récupère uniquement les produits appartenant à cette liste.
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, to_buy, created_at")
      .eq("list_id", list.id)
      .order("created_at", { ascending: true });

    // Vérifie que la récupération des produits s'est correctement effectuée.
    if (productsError) {
      console.error("GET PRODUCTS ERROR:", productsError);

      return NextResponse.json(
        { error: "Impossible de récupérer les produits." },
        { status: 500 }
      );
    }

    // Retourne la liste et ses produits au client.
    return NextResponse.json({
      list,
      products,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}