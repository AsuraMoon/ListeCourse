// src/app/list/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  to_buy: boolean;
  created_at: string;
};

type ShoppingList = {
  id: number;
  name: string;
};

export default function ListPage() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Récupère uniquement les produits actuellement à acheter.
  async function loadList() {
    try {
      const res = await fetch("/api/v1/list");
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Impossible de récupérer la liste de courses.",
        );
        return;
      }

      setList(data.list);
      setProducts(data.items);
    } catch (error) {
      console.error("LIST ERROR:", error);

      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  // Inverse l'état du produit.
  async function handleToBuy(product: Product) {
    const newValue = !product.to_buy;

    try {
      const res = await fetch(
        `/api/v1/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to_buy: newValue,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Impossible de modifier le produit.",
        );
        return;
      }

      // Si le produit n'est plus à acheter, on le retire de l'affichage.
      if (!newValue) {
        setProducts((currentProducts) =>
          currentProducts.filter(
            (item) => item.id !== product.id,
          ),
        );
        return;
      }

      // Met à jour l'état local du produit.
      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? { ...item, to_buy: newValue }
            : item,
        ),
      );
    } catch (error) {
      console.error("TOGGLE PRODUCT ERROR:", error);

      setError("Impossible de contacter le serveur.");
    }
  }

  // Déconnecte l'utilisateur.
  async function handleLogout() {
    try {
      const res = await fetch(
        "/api/v1/auth/logout",
        {
          method: "POST",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Impossible de se déconnecter.",
        );
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      setError("Impossible de contacter le serveur.");
    }
  }

  if (loading) {
    return (
      <div className="responsive-container">
        <header className="responsive-header">
          <h1>Ma liste de courses</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="responsive-container">
      <header className="responsive-header">
        <h1>{list?.name}</h1>
      </header>

      {error && (
        <p
          style={{
            color: "var(--quaternary-color)",
            marginBottom: "15px",
          }}
        >
          {error}
        </p>
      )}

      <section>

        <div className="responsive-wrap">
          {products.length === 0 ? (
            <div className="responsive-card">
              <span className="card-title">
                Aucun produit à acheter.
              </span>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="responsive-card"
              >
                <span
                  className="card-title"
                  onClick={() =>
                    router.push(
                      `/products/${product.id}`,
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  {product.name}
                </span>

                <div className="card-actions">
                  {/* Vert = à acheter. Un clic le retire de la liste. */}
                  <label className="buy-toggle">
                    <input
                      type="checkbox"
                      checked={product.to_buy}
                      onChange={() =>
                        handleToBuy(product)
                      }
                    />
                    <span className="buy-toggle-track" />
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="action-buttons">
        <button
          onClick={() => router.push("/products")}
          className="primary-button"
        >
          Voir les produits
        </button>

        <button
          onClick={handleLogout}
          className="quaternary-button"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}