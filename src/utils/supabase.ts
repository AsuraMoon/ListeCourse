// Supabase côté serveur uniquement
// On utilise la clé service_role pour pouvoir vérifier les mots de passe
// et accéder aux tables protégées via RLS.

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false }, // pas de session côté client
  }
);
