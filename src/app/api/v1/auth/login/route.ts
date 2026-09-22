export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";

import { supabase } from "@/utils/supabase";

const AUTH_COOKIE = "auth";
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not defined");
}

function createSignature(userId: number): string {
  return createHmac("sha256", AUTH_SECRET)
    .update(String(userId))
    .digest("hex");
}

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

    const { data: user, error } = await supabase
      .from("users")
      .select("id, password")
      .eq("username", cleanUsername)
      .single();

    if (error || !user) {
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

    const signature = createSignature(user.id);

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      AUTH_COOKIE,
      `${user.id}.${signature}`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

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