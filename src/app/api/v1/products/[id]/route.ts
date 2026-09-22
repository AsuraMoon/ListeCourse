// src/app/api/v1/products/[id]/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";
import { getAuthenticatedUserId } from "@/utils/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
// Récupère un produit précis appartenant à l'utilisateur connecté.
export async function GET(req: Request, { params }: RouteContext) {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    // Récupère l'identifiant du produit depuis l'URL.
    const { id } = await params;
    const productId = Number(id);

    // Vérifie que l'identifiant est valide.
    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Identifiant produit invalide." },
        { status: 400 },
      );
    }

    // Récupère la liste appartenant à l'utilisateur connecté.
    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 },
      );
    }

    // Récupère uniquement le produit appartenant à cette liste.
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, to_buy, created_at")
      .eq("id", productId)
      .eq("list_id", list.id)
      .single();

    // Empêche l'accès à un produit qui n'appartient pas à l'utilisateur.
    if (productError || !product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 },
      );
    }

    // Retourne le produit demandé.
    return NextResponse.json({
      product,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}

// PATCH
// Modifie un produit précis.
// Peut modifier son nom et/ou son statut "à acheter".
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    // Récupère l'identifiant du produit depuis l'URL.
    const { id } = await params;
    const productId = Number(id);

    // Vérifie que l'identifiant est valide.
    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Identifiant produit invalide." },
        { status: 400 },
      );
    }

    // Récupère les données envoyées pour la modification.
    const { name, to_buy } = await req.json();

    // Récupère la liste appartenant à l'utilisateur connecté.
    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 },
      );
    }

    // Vérifie que le produit appartient bien à l'utilisateur.
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, to_buy")
      .eq("id", productId)
      .eq("list_id", list.id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 },
      );
    }

    // Prépare uniquement les champs réellement demandés.
    const updates: {
      name?: string;
      to_buy?: boolean;
    } = {};

    // Modification du nom si celui-ci est fourni.
    if (name !== undefined) {
      if (typeof name !== "string") {
        return NextResponse.json({ error: "Nom invalide." }, { status: 400 });
      }

      // Nettoie le nouveau nom.
      const newName = name.trim();

      if (!newName) {
        return NextResponse.json({ error: "Nom invalide." }, { status: 400 });
      }

      // Vérifie qu'un autre produit de la même liste
      // n'utilise pas déjà ce nom.
      const { data: existingProduct, error: existingError } = await supabase
        .from("products")
        .select("id")
        .eq("list_id", list.id)
        .eq("name", newName)
        .neq("id", productId)
        .maybeSingle();

      if (existingError) {
        console.error("CHECK PRODUCT NAME ERROR:", existingError);

        return NextResponse.json(
          {
            error: "Impossible de vérifier le nom du produit.",
          },
          { status: 500 },
        );
      }

      // Empêche la création d'un doublon.
      if (existingProduct) {
        return NextResponse.json(
          {
            error: "Ce produit existe déjà dans votre liste.",
          },
          { status: 409 },
        );
      }

      updates.name = newName;
    }

    // Modification du statut "à acheter".
    if (to_buy !== undefined) {
      if (typeof to_buy !== "boolean") {
        return NextResponse.json(
          {
            error: "La valeur to_buy doit être un booléen.",
          },
          { status: 400 },
        );
      }

      updates.to_buy = to_buy;
    }

    // Vérifie qu'au moins une modification est demandée.
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Aucune modification fournie." },
        { status: 400 },
      );
    }

    // Applique les modifications au produit.
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .eq("list_id", list.id)
      .select("id, name, to_buy, created_at")
      .single();

    if (updateError || !updatedProduct) {
      console.error("UPDATE PRODUCT ERROR:", updateError);

      return NextResponse.json(
        { error: "Impossible de modifier le produit." },
        { status: 500 },
      );
    }

    // Retourne le produit après modification.
    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("PATCH PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 },
    );
  }
}

// DELETE
// Supprime un produit précis de la liste de l'utilisateur.
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    // Récupère l'utilisateur associé à la session courante.
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    // Récupère l'identifiant du produit depuis l'URL.
    const { id } = await params;
    const productId = Number(id);

    // Vérifie que l'identifiant est valide.
    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Identifiant produit invalide." },
        { status: 400 },
      );
    }

    // Récupère la liste appartenant à l'utilisateur connecté.
    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        { error: "Liste de courses introuvable." },
        { status: 404 },
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
        { status: 500 },
      );
    }

    // Aucun produit supprimé signifie qu'il n'existe pas
    // dans la liste de l'utilisateur.
    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 },
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
      { status: 500 },
    );
  }
}
