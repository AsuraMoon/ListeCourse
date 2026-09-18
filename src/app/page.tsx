"use client";
// Ce composant utilise des hooks React → rendu côté client obligatoire.

import { useRouter } from "next/navigation";
// Permet de naviguer vers les pages login / signup.

import Image from "next/image";
// Image optimisée par Next.js.

import styles from "./home.module.css";
// Styles locaux de la page (on garde tes classes existantes).

const HomePage = () => {
  const router = useRouter(); 
  // Router pour rediriger l'utilisateur.

  // Redirection vers la page d'inscription
  const handleSignup = () => router.push("/signup");

  // Redirection vers la page de connexion
  const handleLogin = () => router.push("/login");

  return (
    <div className={styles.homeContainer}>
      {/* Conteneur principal de la page */}

      <h1 className={styles.homeTitle}>MiamList</h1>
      {/* Titre principal */}

      <Image
        src="/bread.png"
        width={500}
        height={500}
        alt="Pain chaud sortie du four"
        className={styles.homeImage}
        priority
      />

      {/* Bouton connexion */}
      <button onClick={handleLogin} className="primary-button">
        Connexion
      </button>

      {/* Bouton inscription */}
      <button onClick={handleSignup} className="quaternary-button">
        Inscription
      </button>
    </div>
  );
};

export default HomePage;
