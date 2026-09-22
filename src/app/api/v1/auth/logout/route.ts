// src/app/api/v1/auth/logout/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";

const SESSION_COOKIE = "session";

export async function POST(req: NextRequest) {
  try {
    // Récupération de l'identifiant de session présent dans le cookie.
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;

    // Suppression de la session correspondante en BDD.
    if (sessionId) {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) {
        console.error("DELETE SESSION ERROR:", error);

        return NextResponse.json(
          {
            error: "Impossible de fermer la session.",
          },
          { status: 500 }
        );
      }
    }

    // Création de la réponse avant de supprimer le cookie côté navigateur.
    const response = NextResponse.json({
      success: true,
    });

    // Suppression du cookie de session côté client.
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    // Gestion des erreurs inattendues côté serveur.
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}