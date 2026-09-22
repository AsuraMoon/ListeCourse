"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthResponse = {
  authenticated: boolean;
  userId: number | null;
};

export default function ProductsPage() {
  const router = useRouter();

  const [data, setData] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    console.log("========== LOAD AUTH ==========");

    try {
      const response = await fetch("/api/v1/products");

      console.log("STATUS:", response.status);
      console.log("STATUS TEXT:", response.statusText);
      console.log(
        "CONTENT-TYPE:",
        response.headers.get("content-type")
      );

      const text = await response.text();

      console.log("RAW RESPONSE:", text);

      let json: AuthResponse;

      try {
        json = JSON.parse(text);

        console.log("PARSED JSON:", json);
      } catch (error) {
        console.error("JSON PARSE ERROR:", error);

        setError("La réponse du serveur n'est pas du JSON.");
        return;
      }

      if (response.status === 401) {
        console.log("UNAUTHORIZED");

        setError("Session non authentifiée.");

        return;
      }

      if (!response.ok) {
        console.error("API ERROR:", json);

        setError("Erreur API.");

        return;
      }

      console.log("AUTH DATA RECEIVED:", json);

      setData(json);
    } catch (error) {
      console.error("LOAD AUTH ERROR:", error);

      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Products</h1>
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Products - Diagnostic Auth</h1>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {data && (
        <div>
          <p>
            Authentifié :{" "}
            {data.authenticated ? "OUI" : "NON"}
          </p>

          <p>
            User ID :{" "}
            {data.userId ?? "Aucun"}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/login")}
      >
        Retour login
      </button>
    </main>
  );
}