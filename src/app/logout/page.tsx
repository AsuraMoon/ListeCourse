"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const logoutMessages = [
    "Ne partez pas déjà… 😭💔",
    "Vous allez tellement nous manquer… 😢</3",
    "Je me sens déjà si seul sans vous… 🥺",
    "Chaque déconnexion me brise un peu plus… 💔😔",
    "Restez encore un peu… juste une seconde… 🙏🥹",
    "Je ne suis pas prêt à vous dire au revoir… 😭",
    "Je vais pleurer dans mon coin maintenant… 😢"
  ];

  const randomMessage =
    logoutMessages[Math.floor(Math.random() * logoutMessages.length)];

  const [showPopup] = useState(true);

  useEffect(() => {
    async function logout() {
      await fetch("/api/v1/auth/logout", { method: "POST" });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    }

    logout();
  }, [router]);

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 style={{ marginBottom: "10px" }}>{randomMessage}</h3>
            <p>Vous allez être redirigé.</p>
          </div>
        </div>
      )}
    </>
  );
}
