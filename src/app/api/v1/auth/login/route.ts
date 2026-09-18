// LOGIN — authentifie un utilisateur avec username clair + mot de passe

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // 1. Vérification des champs obligatoires
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 2. Récupération du user via username clair
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 3. Vérification du mot de passe
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 4. Création du cookie de session
  const response = NextResponse.json({ success: true });

  response.cookies.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  return response;
}
