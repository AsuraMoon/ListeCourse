export const runtime = "nodejs";

import {
  createHmac,
  timingSafeEqual,
} from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { supabase } from "@/utils/supabase";

const AUTH_COOKIE = "auth";
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not defined");
}

/**
 * Récupère le userId depuis le cookie d'authentification.
 */
async function getAuthenticatedUserId(): Promise<number | null> {
  const cookieStore = await cookies();

  const authCookie = cookieStore.get(AUTH_COOKIE)?.value;

  if (!authCookie) {
    return null;
  }

  const [userIdString, signature] =
    authCookie.split(".");

  if (!userIdString || !signature) {
    return null;
  }

  const userId = Number(userIdString);

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  const expectedSignature = createHmac(
    "sha256",
    AUTH_SECRET
  )
    .update(String(userId))
    .digest("hex");

  try {
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return null;
    }
  } catch {
    return null;
  }

  return userId;
}

/**
 * Récupère la liste appartenant à l'utilisateur.
 */
async function getUserList(userId: number) {
  const { data: list, error } = await supabase
    .from("shopping_lists")
    .select("id, name")
    .eq("user_id", userId)
    .single();

  if (error || !list) {
    return null;
  }

  return list;
}

/**
 * GET
 *
 * Récupère les produits de l'utilisateur connecté.
 */
export async function GET() {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        {
          error: "Liste de courses introuvable.",
        },
        { status: 404 }
      );
    }

    const { data: products, error } =
      await supabase
        .from("products")
        .select(
          "id, name, to_buy, created_at"
        )
        .eq("list_id", list.id)
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      console.error(
        "GET PRODUCTS ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de récupérer les produits.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      list,
      products,
    });
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 *
 * Ajoute un produit.
 *
 * Body :
 * {
 *   "name": "Tomates"
 * }
 */
export async function POST(req: Request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Le nom du produit est requis.",
        },
        { status: 400 }
      );
    }

    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        {
          error:
            "Liste de courses introuvable.",
        },
        { status: 404 }
      );
    }

    const { data: product, error } =
      await supabase
        .from("products")
        .insert({
          list_id: list.id,
          name,
          to_buy: true,
        })
        .select(
          "id, name, to_buy, created_at"
        )
        .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Ce produit existe déjà dans votre liste.",
          },
          { status: 409 }
        );
      }

      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible d'ajouter le produit.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 *
 * Modifie to_buy.
 *
 * Body :
 * {
 *   "productId": 12,
 *   "toBuy": false
 * }
 */
export async function PATCH(req: Request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const productId =
      Number(body.productId);

    const toBuy = body.toBuy;

    if (
      !Number.isInteger(productId) ||
      typeof toBuy !== "boolean"
    ) {
      return NextResponse.json(
        {
          error: "Données invalides.",
        },
        { status: 400 }
      );
    }

    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        {
          error:
            "Liste de courses introuvable.",
        },
        { status: 404 }
      );
    }

    const { data: product, error } =
      await supabase
        .from("products")
        .update({
          to_buy: toBuy,
        })
        .eq("id", productId)
        .eq("list_id", list.id)
        .select(
          "id, name, to_buy, created_at"
        )
        .single();

    if (error || !product) {
      return NextResponse.json(
        {
          error: "Produit introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 *
 * Supprime un produit.
 *
 * Body :
 * {
 *   "productId": 12
 * }
 */
export async function DELETE(req: Request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const productId =
      Number(body.productId);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          error: "productId invalide.",
        },
        { status: 400 }
      );
    }

    const list = await getUserList(userId);

    if (!list) {
      return NextResponse.json(
        {
          error:
            "Liste de courses introuvable.",
        },
        { status: 404 }
      );
    }

    const { data: product, error } =
      await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("list_id", list.id)
        .select("id")
        .single();

    if (error || !product) {
      return NextResponse.json(
        {
          error: "Produit introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}