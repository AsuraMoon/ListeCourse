// proxy.ts

import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  console.log("PROXY RUNNING ON:", req.nextUrl.pathname);
  console.log("SESSION VALUE:", token);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/products",
    "/list",
    "/user",
    "/api/v1/products/:path*",
    "/api/v1/list/:path*",
    "/api/v1/user/:path*",
  ],
};
