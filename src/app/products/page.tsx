"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  to_buy: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    // 🔥 Si pas connecté → retour login
    if (!userId) {
      router.push("/login");
      return;
    }

    // 🔥 Appel API pour récupérer les produits du user
    fetch("/api/v1/products", {
      headers: { "x-user-id": userId }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.log("API ERROR:", data);
          return;
        }

        setProducts(data.products);
      })
      .catch((err) => console.error(err));
  }, []);

  const filterBySearch = (list: Product[]) => {
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  };

  const sortByName = (list: Product[]) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

  const renderCard = (item: Product) => (
    <div key={item.id} className="responsive-card">
      <span className="card-title">{item.name}</span>

      <div className="card-actions">
        <button className="primary-button">Ajouter à la liste</button>
        <button className="secondary-button">Voir le produit</button>
      </div>
    </div>
  );

  return (
    <div className="responsive-container">
      <header className="responsive-header">
        <h1>Liste des produits</h1>

        <div className="search-controls">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <section>
        <h2>Produits</h2>
        <div className="responsive-wrap">
          {sortByName(filterBySearch(products)).map(renderCard)}
        </div>
      </section>
    </div>
  );
}
