// src/app/api/v1/list/route.ts

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

    // Si aucune liste n'existe, retourne une liste vide.
    if (listError || !list) {
      console.error("GET LIST ERROR:", listError);

      return NextResponse.json([], { status: 200 });
    }

    // Récupère uniquement les produits marqués comme "à acheter".
    const { data: items, error: itemsError } = await supabase
      .from("products")
      .select("id, name, to_buy, created_at")
      .eq("list_id", list.id)
      .eq("to_buy", true)
      .order("name", { ascending: true });

    // Vérifie que la récupération des produits s'est correctement effectuée.
    if (itemsError) {
      console.error("GET SHOPPING LIST ERROR:", itemsError);

      return NextResponse.json(
        { error: "Impossible de récupérer la liste de courses." },
        { status: 500 }
      );
    }

    // Retourne les produits actuellement à acheter.
    return NextResponse.json({
      list,
      items,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("GET SHOPPING LIST ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}