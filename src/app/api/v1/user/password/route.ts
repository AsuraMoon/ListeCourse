// src/app/api/v1/auth/password/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    // Récupère l'ancien et le nouveau mot de passe envoyés par le client.
    const { oldPassword, newPassword } = await req.json();

    // Vérifie que les deux mots de passe sont présents.
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "L'ancien et le nouveau mot de passe sont requis." },
        { status: 400 }
      );
    }

    // Vérifie la longueur minimale du nouveau mot de passe.
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error:
            "Le nouveau mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 }
      );
    }

    // Récupère le hash actuel du mot de passe de l'utilisateur.
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, password")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("GET USER ERROR:", userError);

      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    // Vérifie que l'ancien mot de passe est correct.
    const passwordValid = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Ancien mot de passe incorrect." },
        { status: 400 }
      );
    }

    // Hash du nouveau mot de passe avant son stockage en BDD.
    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // Remplace l'ancien hash par le nouveau.
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
      })
      .eq("id", userId);

    if (updateError) {
      console.error(
        "UPDATE PASSWORD ERROR:",
        updateError
      );

      return NextResponse.json(
        { error: "Impossible de modifier le mot de passe." },
        { status: 500 }
      );
    }

    // La session actuelle reste valide après le changement de mot de passe.
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}