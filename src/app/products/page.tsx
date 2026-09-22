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

export default function ProductsPage() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/v1/products");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Impossible de récupérer la liste.");
          return;
        }

        setList(data.list);
        setProducts(data.products);
      } catch (error) {
        console.error("PRODUCTS ERROR:", error);

        setError("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  async function handleLogout() {
    try {
      const res = await fetch("/api/v1/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de se déconnecter.");
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

        <div className="search-controls">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="search-input"
          />
        </div>
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
        <h2>Produits</h2>

        <div className="responsive-wrap">
          {products.length === 0 ? (
            <div className="responsive-card">
              <span className="card-title">
                Aucun produit dans votre liste.
              </span>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="responsive-card">
                <span className="card-title">{product.name}</span>

                <div className="card-actions">
                  <button className="primary-button">À acheter</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="action-buttons">
        <button onClick={() => router.push("/")} className="primary-button">
          Accueil
        </button>

        <button onClick={handleLogout} className="quaternary-button">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
