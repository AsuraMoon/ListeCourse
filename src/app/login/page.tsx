"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Erreur inconnue");
      return;
    }

    // IMPORTANT :
    // On ne lit PAS le cookie ici (HTTP-only)
    // On ne fait PAS credentials: "include"
    // On ne fait PAS de redirection serveur
    // On laisse le navigateur accepter le Set-Cookie automatiquement

    router.push("/products");
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "80px auto" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label style={{ marginTop: "10px" }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
        )}

        <button type="submit" style={{ marginTop: "20px" }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}
