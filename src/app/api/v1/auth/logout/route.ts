export const runtime = "nodejs";

import { NextResponse } from "next/server";

const AUTH_COOKIE = "auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}