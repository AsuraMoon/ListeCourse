// src/proxy.ts

import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  // Récupère la session depuis le cookie HttpOnly.
  const session = req.cookies.get("session")?.value;

  // Si aucune session n'existe, l'utilisateur doit se connecter.
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Protège toutes les pages /products et leurs sous-routes.
export const config = {
  matcher: ["/products/:path*"],
};