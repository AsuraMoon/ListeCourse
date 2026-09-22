// src/app/signup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function SignupPage() {
  // Champs du formulaire
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Gestion des erreurs
  const [error, setError] = useState("");

  // Popup de confirmation
  const [showPopup, setShowPopup] = useState(false);

  // Loading du bouton
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Gère la soumission du formulaire d'inscription.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Erreur inconnue");
        setLoading(false);
        return;
      }

      // Affiche la confirmation d'inscription.
      setShowPopup(true);

      // Redirige vers l'accueil après 2 secondes.
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setError("Impossible de contacter le serveur");
    }

    setLoading(false);
  }

  return (
    <>
      {/* Popup de confirmation */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 style={{ marginBottom: "10px" }}>
              Inscription confirmée 🎉
            </h3>
            <p>Redirection vers l'accueil...</p>
          </div>
        </div>
      )}

      <div className="responsive-container">
        <div
          className="responsive-card"
          style={{ maxWidth: "400px", margin: "80px auto" }}
        >
          <h1 className="card-title">Inscription</h1>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {/* Champ username */}
            <label style={{ display: "block", marginBottom: "15px" }}>
              Nom d'utilisateur
              <input
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                className="search-input"
                required
              />
            </label>

            {/* Champ password */}
            <label style={{ display: "block", marginBottom: "15px" }}>
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="search-input"
                required
              />
            </label>

            {/* Affichage des erreurs */}
            {error && (
              <p
                style={{
                  color: "var(--quaternary-color)",
                  marginBottom: "10px",
                }}
              >
                {error}
              </p>
            )}

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              className="secondary-button"
              style={{ width: "100%", marginBottom: "15px" }}
              disabled={loading}
            >
              {loading ? "Chargement..." : "S'inscrire"}
            </button>

            {/* Bouton Accueil */}
            <button
              type="button"
              className="secondary-button"
              style={{
                width: "100%",
                backgroundColor: "var(--primary-color)",
              }}
              onClick={() => router.push("/")}
            >
              Accueil
            </button>
          </form>
        </div>
      </div>
    </>
  );
}