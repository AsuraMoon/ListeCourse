// src/app/api/v1/keepAlive/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";

export async function POST() {
  try {
    // Génère l'horodatage du ping envoyé à Supabase.
    const now = new Date().toISOString();

    // Écrit un nouveau heartbeat afin de maintenir l'activité de la BDD.
    const { error } = await supabase
      .from("system_heartbeat")
      .insert({
        last_ping: now,
      });

    // Retourne une erreur si l'écriture en BDD échoue.
    if (error) {
      console.error("HEARTBEAT INSERT ERROR:", error);

      return NextResponse.json(
        {
          status: "error",
          error: "Impossible d'enregistrer le heartbeat.",
        },
        { status: 500 }
      );
    }

    // Confirme que le heartbeat a bien été enregistré.
    return NextResponse.json(
      {
        status: "alive",
        timestamp: now,
      },
      { status: 201 }
    );
  } catch (error) {
    // Capture les erreurs inattendues côté serveur.
    console.error("HEARTBEAT ERROR:", error);

    return NextResponse.json(
      {
        status: "error",
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}