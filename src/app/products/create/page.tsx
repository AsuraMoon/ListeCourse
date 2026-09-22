// src/app/products/create/page.tsx

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProductBar from "@/components/ProductBar";

export default function CreateProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Le nom du produit est requis.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Impossible de créer le produit.");
        return;
      }

      // Après création, on ouvre directement la fiche du produit.
      router.push(`/products/${data.product.id}`);
    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      setError("Erreur interne.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="responsive-container">
      <header className="responsive-header">
        <div>
          <h1>Créer un produit</h1>
          <p>Ajoutez un nouveau produit à votre liste.</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => router.push("/products")}
        >
          Retour aux produits
        </button>
      </header>

      <form onSubmit={handleSubmit} className="responsive-card">
        <ProductBar
          value={name}
          onChange={setName}
          placeholder="Nom du produit..."
        />

        {error && <p>{error}</p>}

        <div className="card-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer le produit"}
          </button>
        </div>
      </form>
    </main>
  );
}