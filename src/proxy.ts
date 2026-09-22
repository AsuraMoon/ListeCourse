import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const authCookie = req.cookies.get("auth")?.value;

  const path = req.nextUrl.pathname;

  // Routes protégées
  const protectedRoutes = [
    "/products",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // Pas de cookie → redirection vers login
  if (isProtectedRoute && !authCookie) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/products/:path*",
  ],
};