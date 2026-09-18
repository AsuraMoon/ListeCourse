// SIGNUP — crée un utilisateur et génère automatiquement sa liste de courses

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // 1. Vérification des champs obligatoires
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 2. Vérifier si le username existe déjà (format clair)
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: "Nom d'utilisateur déjà pris" },
      { status: 400 }
    );
  }

  // 3. Hash du mot de passe avec bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Création du nouvel utilisateur
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({ username, password: hashedPassword })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 5. Création automatique de la liste associée au user
  await supabase.from("shopping_lists").insert({
    user_id: newUser.id,
    name: `${username}'s list`,
  });

  // 6. Succès
  return NextResponse.json({ success: true });
}
