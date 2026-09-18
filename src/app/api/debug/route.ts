import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { supabase } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 🔐 Hash du username en SHA‑256 (format ancien)
  const usernameHash = crypto
    .createHash("sha256")
    .update(username)
    .digest("hex");

  // 🔐 Hash du password en bcrypt (format ancien)
  const passwordHash = await bcrypt.hash(password, 10);

  // 🗄️ Insertion dans la BDD
  const { error } = await supabase.from("users").insert({
    username: usernameHash,
    password: passwordHash,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "User created with old format",
    usernameHash,
    passwordHash,
  });
}
