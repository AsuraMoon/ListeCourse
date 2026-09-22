// src/components/ProductBar.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProductSearchResult = {
  id: number;
  name: string;
};

type ProductBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showResults?: boolean;
};

export default function ProductBar({
  value,
  onChange,
  placeholder = "Rechercher un produit...",
  disabled = false,
  showResults = true,
}: ProductBarProps) {
  const router = useRouter();

  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = value.trim();

    // Pas de recherche avant 3 caractères.
    if (!showResults || query.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      // Annule la recherche précédente.
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);

        const response = await fetch(
          `/api/v1/products/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setResults([]);
          return;
        }

        // On ne conserve que les 3 premières propositions.
        setResults((data.products ?? []).slice(0, 3));
      } catch (error) {
        // Une requête annulée est normale quand l'utilisateur continue de taper.
        if ((error as Error).name !== "AbortError") {
          console.error("PRODUCT SEARCH ERROR:", error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, showResults]);

  function handleProductClick(productId: number) {
    router.push(`/products/${productId}`);
  }

  return (
    <div className="product-bar">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="search-input"
      />

      {showResults && value.trim().length >= 3 && (
        <div className="product-bar-results">
          {loading && (
            <div className="product-bar-result">
              Recherche...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="product-bar-result">
              Aucun produit trouvé.
            </div>
          )}

          {!loading &&
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                className="product-bar-result product-bar-result-button"
                onClick={() => handleProductClick(product.id)}
              >
                {product.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}