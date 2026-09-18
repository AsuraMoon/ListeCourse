"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionCookie, setSessionCookie] = useState<string | null>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  useEffect(() => {
    addLog("📌 useEffect lancé");
    addLog("📌 Page Products chargée");

    // Lire TOUS les cookies
    const raw = document.cookie;
    addLog(`📌 document.cookie = "${raw}"`);

    // Extraire le cookie "session"
    const session = raw
      .split("; ")
      .find((c) => c.startsWith("session="));

    if (session) {
      const value = session.split("=")[1];
      setSessionCookie(value);
      addLog(`📌 Cookie 'session' trouvé → ${value}`);
    } else {
      addLog("❌ Cookie 'session' introuvable");
    }
  }, []);

  return (
    <div style={{ padding: "20px", fontSize: "18px" }}>
      <h1>DEBUG LOGIN → PRODUCTS</h1>

      <div
        style={{
          marginTop: "20px",
          background: "#eee",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h2>📌 Cookie reçu :</h2>
        <p>
          {sessionCookie
            ? `✔ Cookie session = ${sessionCookie}`
            : "❌ Aucun cookie 'session' reçu"}
        </p>

        <h2 style={{ marginTop: "20px" }}>📌 Logs :</h2>
        {logs.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>
    </div>
  );
}
