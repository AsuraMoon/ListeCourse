"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);
      console.log("STATUS:", res.status);

      // Gestion des erreurs API
      if (!res.ok) {
        setError(data.error || "Identifiants incorrects.");
        return;
      }

      // Vérification de la présence de l'identifiant utilisateur
      if (!data.userId) {
        console.error("Réponse API invalide :", data);
        setError("La réponse du serveur est invalide.");
        return;
      }

      // Stockage temporaire de l'identifiant utilisateur
      localStorage.setItem("userId", String(data.userId));

      // Redirection après connexion
      router.push("/products");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        "Impossible de contacter le serveur. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="responsive-container">
      <div
        className="responsive-card"
        style={{
          maxWidth: "400px",
          margin: "80px auto",
        }}
      >
        <h1 className="card-title">Connexion</h1>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <label
            style={{
              display: "block",
              marginBottom: "15px",
            }}
          >
            Nom d'utilisateur

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="search-input"
              autoComplete="username"
              required
              disabled={loading}
            />
          </label>

          {/* Password */}
          <label
            style={{
              display: "block",
              marginBottom: "15px",
            }}
          >
            Mot de passe

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-input"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>

          {/* Error */}
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

          {/* Login */}
          <button
            type="submit"
            className="secondary-button"
            style={{
              width: "100%",
              marginBottom: "15px",
            }}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Home */}
          <button
            type="button"
            className="secondary-button"
            style={{
              width: "100%",
              backgroundColor: "var(--primary-color)",
            }}
            onClick={() => router.push("/")}
            disabled={loading}
          >
            Accueil
          </button>
        </form>
      </div>
    </div>
  );
}