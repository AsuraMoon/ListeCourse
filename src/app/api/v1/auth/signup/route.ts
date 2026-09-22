export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Validation basique
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Le nom d'utilisateur et le mot de passe sont requis.",
        },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        {
          error: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 }
      );
    }

    // Vérifie si le username existe déjà
    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

    if (existingUserError) {
      console.error(
        "CHECK USER ERROR:",
        existingUserError
      );

      return NextResponse.json(
        {
          error: "Erreur lors de la vérification du compte.",
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Ce nom d'utilisateur est déjà utilisé.",
        },
        { status: 409 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création du compte
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        username: cleanUsername,
        password: hashedPassword,
      })
      .select("id, username")
      .single();

    if (userError || !user) {
      console.error(
        "CREATE USER ERROR:",
        userError
      );

      return NextResponse.json(
        {
          error: "Impossible de créer le compte.",
        },
        { status: 500 }
      );
    }

    // Création automatique de la liste
    const { error: listError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        name: "Ma liste de courses",
      });

    if (listError) {
      console.error(
        "CREATE LIST ERROR:",
        listError
      );

      // On supprime le compte si la création
      // de la liste échoue.
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
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}