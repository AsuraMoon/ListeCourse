export const dynamic = "force-dynamic";

console.log("🔥 ROUTE PRODUCTS LOADED");

export async function GET(req: Request) {
  console.log("🔥 GET /api/v1/products CALLED");

  // 🔥 Lire les cookies envoyés par le navigateur
  const rawCookies = req.headers.get("cookie");
  console.log("🍪 Cookies reçus :", rawCookies);

  return Response.json({ ok: true, cookies: rawCookies });
}
