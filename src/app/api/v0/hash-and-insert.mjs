import 'dotenv/config';
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// -----------------------------
// CONFIG
// -----------------------------
const USERNAME = "Your Username";
const PASSWORD = "Your Password";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// -----------------------------
// INIT SUPABASE
// -----------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// -----------------------------
// HASH USERNAME (SHA-256)
// -----------------------------
const usernameHash = crypto
  .createHash("sha256")
  .update(USERNAME)
  .digest("hex");

// -----------------------------
// HASH PASSWORD (bcrypt)
// -----------------------------
const passwordHash = await bcrypt.hash(PASSWORD, 10);

// -----------------------------
// INSERTION DANS SUPABASE
// -----------------------------
const { data, error } = await supabase
  .from("users")
  .insert({
    username: usernameHash,
    password: passwordHash
  })
  .select()
  .single();

if (error) {
  console.error("❌ Erreur Supabase :", error.message);
  process.exit(1);
}

console.log("✅ Utilisateur créé !");
console.log("ID :", data.id);
console.log("Username hashé :", usernameHash);
console.log("Password hashé :", passwordHash);
