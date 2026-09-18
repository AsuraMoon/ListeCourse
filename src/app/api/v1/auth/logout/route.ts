// LOGOUT — supprime le cookie de session pour déconnecter l'utilisateur

import { NextResponse } from "next/server";

export async function POST() {
  // 1. Réponse JSON de succès
  const response = NextResponse.json({ success: true });

  // 2. Suppression du cookie "session"
  response.cookies.set("session", "", {
    httpOnly: true,
    expires: new Date(0), // expire immédiatement
  });

  // 3. Retour de la réponse
  return response;
}
