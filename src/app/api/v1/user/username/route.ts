// src/app/api/v1/auth/username/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";
import { getAuthenticatedUserId } from "@/utils/auth";

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

    // Récupère le nouveau nom d'utilisateur envoyé par le client.
    const { newUsername } = await req.json();

    // Vérifie que le nom est présent et n'est pas uniquement composé d'espaces.
    if (
      !newUsername ||
      typeof newUsername !== "string" ||
      !newUsername.trim()
    ) {
      return NextResponse.json(
        { error: "Nom d'utilisateur requis." },
        { status: 400 }
      );
    }

    // Nettoyage du nouveau nom d'utilisateur.
    const cleanUsername = newUsername.trim();

    // Applique la même règle minimale que lors de l'inscription.
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        {
          error:
            "Le nom d'utilisateur doit contenir au moins 3 caractères.",
        },
        { status: 400 }
      );
    }

    // Vérifie si un autre utilisateur utilise déjà ce username.
    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", userId)
        .maybeSingle();

    if (existingUserError) {
      console.error(
        "CHECK USERNAME ERROR:",
        existingUserError
      );

      return NextResponse.json(
        {
          error:
            "Erreur lors de la vérification du nom d'utilisateur.",
        },
        { status: 500 }
      );
    }

    // Empêche deux comptes d'utiliser le même username.
    if (existingUser) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà utilisé." },
        { status: 409 }
      );
    }

    // Met à jour le username de l'utilisateur connecté.
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        username: cleanUsername,
      })
      .eq("id", userId);

    if (updateUserError) {
      console.error(
        "UPDATE USERNAME ERROR:",
        updateUserError
      );

      return NextResponse.json(
        {
          error: "Impossible de modifier le nom d'utilisateur.",
        },
        { status: 500 }
      );
    }

    // Met à jour le nom de la liste associée à l'utilisateur.
    const { error: updateListError } = await supabase
      .from("shopping_lists")
      .update({
        name: `${cleanUsername}'s list`,
      })
      .eq("user_id", userId);

    if (updateListError) {
      console.error(
        "UPDATE LIST NAME ERROR:",
        updateListError
      );

      return NextResponse.json(
        {
          error:
            "Le nom d'utilisateur a été modifié, mais le nom de la liste n'a pas pu être mis à jour.",
        },
        { status: 500 }
      );
    }

    // Confirme la modification.
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("CHANGE USERNAME ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}