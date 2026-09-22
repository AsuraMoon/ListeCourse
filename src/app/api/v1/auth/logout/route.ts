export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";

const SESSION_COOKIE = "session";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;

    if (sessionId) {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) {
        console.error("DELETE SESSION ERROR:", error);

        return NextResponse.json(
          {
            error: "Impossible de fermer la session.",
          },
          { status: 500 }
        );
      }
    }

    const response = NextResponse.json({
      success: true,
    });

    // Suppression du cookie
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}