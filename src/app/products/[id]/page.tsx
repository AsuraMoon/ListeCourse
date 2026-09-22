

// src/app/products/[id]/page.tsx

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductBar from "@/components/ProductBar";

type Product = {
  id: number;
  name: string;
  to_buy: boolean;
  created_at: string;
};

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/v1/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
          } else {
            setError(data.error ?? "Produit introuvable.");
          }
          return;
        }

        setProduct(data.product);
        setName(data.product.name);
      } catch (error) {
        console.error("LOAD PRODUCT ERROR:", error);
        setError("Erreur interne.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, router]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Le nom du produit est requis.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/v1/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Impossible de modifier le produit.");
        return;
      }

      setProduct(data.product);
      setName(data.product.name);
    } catch (error) {
      console.error("UPDATE PRODUCT ERROR:", error);
      setError("Erreur interne.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToBuy() {
    if (!product) return;

    const response = await fetch(`/api/v1/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_buy: !product.to_buy,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Impossible de modifier le produit.");
      return;
    }

    setProduct(data.product);
  }

  async function handleDelete() {
    if (!confirm("Voulez-vous supprimer ce produit ?")) {
      return;
    }

    const response = await fetch(`/api/v1/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Impossible de supprimer le produit.");
      return;
    }

    router.push("/products");
  }

  if (loading) {
    return (
      <main className="responsive-container">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="responsive-container">
        <p>{error || "Produit introuvable."}</p>

        <button
          className="secondary-button"
          onClick={() => router.push("/products")}
        >
          Retour aux produits
        </button>
      </main>
    );
  }

  return (
    <main className="responsive-container">
      <header className="responsive-header">
        <div>
          <h1>Produit</h1>
          <p>Modifier le produit</p>
        </div>

        <button
          className="secondary-button"
          onClick={() => router.push("/products")}
        >
          Tous les produits
        </button>
      </header>

      <form
        onSubmit={handleUpdate}
        className="responsive-card"
      >
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
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            className="quaternary-button"
            onClick={handleDelete}
          >
            Supprimer
          </button>
        </div>
      </form>
    </main>
  );
}