import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // Vérification des champs
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Récupération du user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Vérification du mot de passe
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Création de la réponse
  const res = NextResponse.json({ success: true });

  // Pose du cookie HTTP-only
  res.cookies.set("session", user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // en local
    path: "/",     // indispensable
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  return res;
}
