export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { supabase } from "@/utils/supabase";

const SESSION_COOKIE = "session";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Le nom d'utilisateur et le mot de passe sont requis.",
        },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, password")
      .eq("username", cleanUsername)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Identifiants invalides.",
        },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "Identifiants invalides.",
        },
        { status: 401 }
      );
    }

    // Création de la session
    const sessionId = randomUUID();

    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7
    );

    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({
        id: sessionId,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("CREATE SESSION ERROR:", sessionError);

      return NextResponse.json(
        {
          error: "Impossible de créer la session.",
        },
        { status: 500 }
      );
    }

    // Création du cookie
    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}