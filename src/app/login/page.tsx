"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingPopup, setLoadingPopup] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoadingPopup(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include", // <-- indispensable pour que le navigateur accepte/renvoie le cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      // Toujours arrêter la popup avant d'agir (évite spinner bloqué)
      setLoadingPopup(false);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Erreur inconnue");
        return;
      }

      // Succès → navigation
      router.push("/products");
    } catch (err) {
      setLoadingPopup(false);
      setError("Impossible de contacter le serveur");
      console.error("Login fetch error:", err);
    }
  }

  return (
    <>
      {/* POPUP DE CHARGEMENT */}
      {loadingPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 style={{ marginBottom: "10px" }}>Connexion en cours… 🔐</h3>
            <p>Veuillez patienter…</p>
          </div>
        </div>
      )}

      <div className="responsive-container">
        <div className="responsive-card" style={{ maxWidth: "400px", margin: "80px auto" }}>
          <h1 className="card-title">Connexion</h1>

          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: "15px" }}>
              Nom d'utilisateur
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="search-input"
                required
                autoComplete="username"
                disabled={loadingPopup}
              />
            </label>

            <label style={{ display: "block", marginBottom: "15px" }}>
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="search-input"
                required
                autoComplete="current-password"
                disabled={loadingPopup}
              />
            </label>

            {error && (
              <p style={{ color: "var(--quaternary-color)", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="secondary-button"
              style={{ width: "100%" }}
              disabled={loadingPopup}
            >
              {loadingPopup ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
