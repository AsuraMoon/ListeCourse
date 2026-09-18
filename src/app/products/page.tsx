"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  to_buy: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/v1/products", {
          credentials: "include",
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleBuy = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to_buy: !current }),
      });

      if (!res.ok) throw new Error(await res.text());

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, to_buy: !current } : p))
      );
    } catch (err) {
      console.error("Error toggling product:", err);
      alert("Erreur : impossible de modifier le produit.");
    }
  };

  if (loading) return <div className="responsive-container">Chargement…</div>;
  if (error)
    return (
      <div className="responsive-container">
        <p className="error-text">{error}</p>
        <button onClick={() => router.refresh()} className="primary-button">
          Réessayer
        </button>
      </div>
    );

  return (
    <div className="responsive-container">
      <header className="responsive-header">
        <h1>Tous vos produits</h1>

        <div className="action-buttons">
          <button
            onClick={() => router.push("/list")}
            className="tertiary-button"
          >
            Voir la liste à acheter
          </button>
        </div>
      </header>

      {products.length === 0 ? (
        <p className="empty-text">Aucun produit pour l’instant.</p>
      ) : (
        <div className="responsive-wrap">
          {products.map((product) => (
            <div key={product.id} className="responsive-card">
              <span className="card-title">{product.name}</span>

              <div className="card-actions" style={{ display: "flex", gap: "10px" }}>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={product.to_buy}
                    onChange={() => toggleBuy(product.id, product.to_buy)}
                  />
                  <span className="slider"></span>
                </label>

                <button className="icon-button">✏️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={() => router.push("/products/create")}
          className="secondary-button"
        >
          Ajouter un produit
        </button>

        <button onClick={() => router.push("/")} className="quaternary-button">
          Accueil
        </button>
      </div>
    </div>
  );
}
