// src/app/api/v1/products/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";
import { getAuthenticatedUserId } from "@/utils/auth";

// Récupère la liste de courses de l'utilisateur connecté.
async function getUserList(userId: number) {
  const { data: list, error } = await supabase
    .from("shopping_lists")
    .select("id, name")
    .eq("user_id", userId)
    .single();

  if (error || !list) {
    return null;
  }

  return list;
}

// GET
// Récupère tous les produits de l'utilisateur connecté.
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

    // Récupère l'unique liste de courses de l'utilisateur.
    const list = await getUserList(userId);

    if (!list) {
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
      .order("name", { ascending: true });

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

// POST
// Crée un nouveau produit dans la liste de l'utilisateur.
export async function POST(req: Request) {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    // Récupère les données envoyées par le client.
    const { name } = await req.json();

    // Vérifie que le nom est bien fourni.
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Le nom du produit est requis." },
        { status: 400 }
      );
    }

    // Nettoie le nom avant de l'enregistrer.
    const cleanName = name.trim();

    if (!cleanName) {
      return NextResponse.json(
        { error: "Le nom du produit est requis." },
        { status: 400 }
      );
    }

    // Récupère la liste de l'utilisateur.
    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 }
      );
    }

    // Crée le produit dans la liste de l'utilisateur.
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        list_id: list.id,
        name: cleanName,
        to_buy: false,
      })
      .select("id, name, to_buy, created_at")
      .single();

    // La contrainte UNIQUE de la BDD empêche les doublons.
    if (productError) {
      if (productError.code === "23505") {
        return NextResponse.json(
          {
            error: "Ce produit existe déjà dans votre liste.",
          },
          { status: 409 }
        );
      }

      console.error("CREATE PRODUCT ERROR:", productError);

      return NextResponse.json(
        { error: "Impossible de créer le produit." },
        { status: 500 }
      );
    }

    // Retourne le produit nouvellement créé.
    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("POST PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// PATCH
// Modifie le statut "à acheter" d'un produit.
export async function PATCH(req: Request) {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    // Récupère les données envoyées par le client.
    const { productId, toBuy } = await req.json();

    // Vérifie l'identifiant du produit.
    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Identifiant produit invalide." },
        { status: 400 }
      );
    }

    // Vérifie que toBuy est bien un booléen.
    if (typeof toBuy !== "boolean") {
      return NextResponse.json(
        { error: "La valeur toBuy doit être un booléen." },
        { status: 400 }
      );
    }

    // Récupère la liste de l'utilisateur.
    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 }
      );
    }

    // Modifie uniquement un produit appartenant à la liste de l'utilisateur.
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        to_buy: toBuy,
      })
      .eq("id", productId)
      .eq("list_id", list.id)
      .select("id, name, to_buy, created_at")
      .single();

    // Le produit n'existe pas dans la liste de cet utilisateur.
    if (productError || !product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    // Retourne le produit après modification.
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("PATCH PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// DELETE
// Supprime un produit de la liste de l'utilisateur.
export async function DELETE(req: Request) {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    // Récupère l'identifiant du produit envoyé par le client.
    const { productId } = await req.json();

    // Vérifie l'identifiant du produit.
    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Identifiant produit invalide." },
        { status: 400 }
      );
    }

    // Récupère la liste de l'utilisateur.
    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 }
      );
    }

    // Supprime uniquement le produit appartenant à la liste de l'utilisateur.
    const { data: deletedProduct, error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("list_id", list.id)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      console.error("DELETE PRODUCT ERROR:", deleteError);

      return NextResponse.json(
        { error: "Impossible de supprimer le produit." },
        { status: 500 }
      );
    }

    // Aucun produit supprimé signifie qu'il n'existe pas
    // dans la liste de l'utilisateur.
    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    // Confirme la suppression.
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}