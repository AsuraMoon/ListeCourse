// PATCH /api/user/password — change le mot de passe via cookie "session"

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/utils/supabase/server";

export async function PATCH(req: Request) {
  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  // 1. Lire le cookie "session"
  const session = req.headers.get("cookie")
    ?.split("; ")
    ?.find((c) => c.startsWith("session="))
    ?.split("=")[1];

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Récupérer le user via l'id stocké dans le cookie
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Vérifier ancien mot de passe
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Ancien mot de passe incorrect" }, { status: 400 });
  }

  // 4. Hash du nouveau mot de passe
  const hashed = await bcrypt.hash(newPassword, 10);

  // 5. Mise à jour
  const { error } = await supabase
    .from("users")
    .update({ password: hashed })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
