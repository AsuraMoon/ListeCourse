"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
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

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Erreur inconnue");
        setLoading(false);
        return;
      }

      setShowPopup(true);

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
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 style={{ marginBottom: "10px" }}>Inscription confirmée 🎉</h3>
            <p>Redirection vers l'accueil...</p>
          </div>
        </div>
      )}

      <div className="responsive-container">
        <div className="responsive-card" style={{ maxWidth: "400px", margin: "80px auto" }}>
          <h1 className="card-title">Inscription</h1>

          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: "15px" }}>
              Nom d'utilisateur
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="search-input"
                required
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
              disabled={loading}
            >
              {loading ? "Chargement..." : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
