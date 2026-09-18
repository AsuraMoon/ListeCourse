"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  to_buy: boolean;
};

export default function ListPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/v1/list", {
          credentials: "include",
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching list:", err);
        setError("Impossible de charger la liste.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const toggleOff = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to_buy: false }),
      });

      if (!res.ok) throw new Error(await res.text());

      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error toggling item:", err);
      alert("Erreur : impossible de retirer le produit.");
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
        <h1>Votre liste de courses</h1>

        <div className="action-buttons">
          <button
            onClick={() => router.push("/products")}
            className="tertiary-button"
          >
            Voir tous les produits
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="empty-text">Tous les produits ont été achetés 🎉</p>
      ) : (
        <div className="responsive-wrap">
          {items.map((item) => (
            <div key={item.id} className="responsive-card">
              <span className="card-title">{item.name}</span>

              <div className="card-actions">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleOff(item.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={() => router.push("/products")}
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
