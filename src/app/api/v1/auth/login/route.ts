// src/app/api/v1/auth/login/route.ts

export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { supabase } from "@/utils/supabase";

const SESSION_COOKIE = "session";

export async function POST(req: Request) {
  try {
    // Récupération des identifiants envoyés par le client.
    const { username, password } = await req.json();

    // Vérification des champs obligatoires.
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Le nom d'utilisateur et le mot de passe sont requis.",
        },
        { status: 400 }
      );
    }

    // Nettoyage du nom d'utilisateur avant la recherche en BDD.
    const cleanUsername = username.trim();

    // Recherche de l'utilisateur correspondant au nom fourni.
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, password")
      .eq("username", cleanUsername)
      .single();

    // On utilise le même message pour éviter de révéler si le compte existe.
    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Identifiants invalides.",
        },
        { status: 401 }
      );
    }

    // Vérification du mot de passe avec le hash stocké en BDD.
    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "Identifiants invalides.",
        },
        { status: 401 }
      );
    }

    // Génération d'un identifiant de session aléatoire.
    const sessionId = randomUUID();

    // La session reste valide pendant 7 jours.
    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7
    );

    // Enregistrement de la session côté serveur.
    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({
        id: sessionId,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("CREATE SESSION ERROR:", sessionError);

      return NextResponse.json(
        {
          error: "Impossible de créer la session.",
        },
        { status: 500 }
      );
    }

    // Création de la réponse qui contiendra le cookie de session.
    const response = NextResponse.json({
      success: true,
    });

    // Le cookie est HttpOnly afin qu'il ne soit pas accessible depuis JavaScript côté client.
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}