export const dynamic = "force-dynamic";

import { cookies } from "next/headers";

console.log("🔥 ROUTE PRODUCTS LOADED");

export async function GET(req: Request) {
  console.log("🔥 GET /api/v1/products CALLED");
  const sessionCookie = cookies().get("session");
  console.log("🍪 cookies().get('session') :", sessionCookie);
  return Response.json({
    ok: true,
    session: sessionCookie?.value ?? null,
  });
}
