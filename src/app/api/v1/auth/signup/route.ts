// src/app/api/v1/auth/signup/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    // Récupération des données envoyées par le client.
    const { username, password } = await req.json();

    // Validation basique des champs obligatoires.
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Le nom d'utilisateur et le mot de passe sont requis.",
        },
        { status: 400 }
      );
    }

    // Nettoyage du nom d'utilisateur avant son utilisation.
    const cleanUsername = username.trim();

    // Vérification de la longueur minimale du nom d'utilisateur.
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        {
          error: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
        },
        { status: 400 }
      );
    }

    // Vérification de la longueur minimale du mot de passe.
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 }
      );
    }

    // Vérifie si un compte utilise déjà ce nom d'utilisateur.
    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

    if (existingUserError) {
      console.error("CHECK USER ERROR:", existingUserError);

      return NextResponse.json(
        {
          error: "Erreur lors de la vérification du compte.",
        },
        { status: 500 }
      );
    }

    // Empêche la création de plusieurs comptes avec le même username.
    if (existingUser) {
      return NextResponse.json(
        {
          error: "Ce nom d'utilisateur est déjà utilisé.",
        },
        { status: 409 }
      );
    }

    // Hash sécurisé du mot de passe avant son stockage en BDD.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création du compte utilisateur.
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        username: cleanUsername,
        password: hashedPassword,
      })
      .select("id, username")
      .single();

    if (userError || !user) {
      console.error("CREATE USER ERROR:", userError);

      return NextResponse.json(
        {
          error: "Impossible de créer le compte.",
        },
        { status: 500 }
      );
    }

    // Création automatique de la liste de courses associée à l'utilisateur.
    const { error: listError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        name: "Ma liste de courses",
      });

    if (listError) {
      console.error("CREATE LIST ERROR:", listError);

      // Rollback manuel : supprime le compte si la création de la liste échoue.
      await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      return NextResponse.json(
        {
          error: "Impossible de créer la liste de courses.",
        },
        { status: 500 }
      );
    }

    // Retourne les informations publiques du compte nouvellement créé.
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}