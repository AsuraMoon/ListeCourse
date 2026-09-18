import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  
  console.log("MIDDLEWARE RUNNING ON:", req.nextUrl.pathname);
  console.log("SESSION VALUE:", req.cookies.get("session")?.value);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/productsOwner",
    "/productsOwner/:path*",
    "/shoppingOwnerList",
    "/shoppingOwnerList/:path*",
    "/api/productsOwner/:path*",
    "/api/shoppingOwnerList/:path*"
  ],
};