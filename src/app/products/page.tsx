// src/app/products/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductBar from "@/components/ProductBar";

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
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/v1/products");
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
          }
          return;
        }

        setProducts(data.products ?? []);
        setList(data.list ?? null);
      } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [router]);

  async function handleToBuy(product: Product) {
    // Inverse l'état actuel du toggle.
    const newValue = !product.to_buy;

    const response = await fetch(`/api/v1/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_buy: newValue,
      }),
    });

    if (!response.ok) return;

    // Met à jour l'état local après la modification en base.
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, to_buy: newValue }
          : item,
      ),
    );
  }

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
    });

    router.push("/login");
  }

  // La recherche de cette page filtre la liste déjà récupérée.
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <main className="responsive-container">
      <header className="responsive-header">
        <div>
          <h1>{list?.name ?? "Mes produits"}</h1>
        </div>

        <div className="action-buttons">
          <button
            className="primary-button"
            onClick={() => router.push("/list")}
          >
            Ma liste de courses
          </button>

          <button
            className="secondary-button"
            onClick={() => router.push("/products/create")}
          >
            Créer un produit
          </button>

          <button className="quaternary-button" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      <ProductBar
        value={search}
        onChange={setSearch}
        showResults={false}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <section className="responsive-wrap">
          {filteredProducts.map((product) => (
            <article key={product.id} className="responsive-card">
              <h2
                className="card-title"
                onClick={() => router.push(`/products/${product.id}`)}
                style={{ cursor: "pointer" }}
              >
                {product.name}
              </h2>

              <div className="card-actions">
                {/* Toggle rouge = pas à acheter, vert = à acheter. */}
                <label className="buy-toggle">
                  <input
                    type="checkbox"
                    checked={product.to_buy}
                    onChange={() => handleToBuy(product)}
                  />
                  <span className="buy-toggle-track" />
                </label>

                <button
                  className="quinary-button"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  Voir le produit
                </button>
              </div>
            </article>
          ))}

          {filteredProducts.length === 0 && (
            <p>Aucun produit trouvé.</p>
          )}
        </section>
      )}
    </main>
  );
}