# MiamListe

Application web de gestion de liste de courses, développée avec **Next.js**, **TypeScript** et **Supabase**.

MiamListe permet à chaque utilisateur de gérer sa propre liste de courses : créer des produits, les modifier, les rechercher et suivre ceux qu'il reste à acheter.

**Application en ligne :** https://liste-course-kappa.vercel.app/  
**Dépôt GitHub :** https://github.com/AsuraMoon/ListeCourse

---

## Fonctionnalités

- **Gestion de compte** : création de compte, connexion et déconnexion.
- **Liste personnelle** : une liste de courses est associée à chaque utilisateur.
- **Gestion des produits** : ajout, modification et suppression de produits.
- **Suivi des achats** : chaque produit peut être marqué comme « à acheter ».
- **Recherche** : recherche des produits de la liste par nom.
- **Paramètres du compte** : modification du nom d'utilisateur et du mot de passe.
- **Interface responsive** : adaptation aux différentes tailles d'écran.

## Stack technique

| Technologie | Utilisation |
| --- | --- |
| Next.js 16 (App Router) | Application web et routes API |
| React 19 | Interface utilisateur |
| TypeScript | Typage statique |
| Supabase / PostgreSQL | Base de données |
| Supabase JS | Accès à la base de données depuis le serveur |
| bcryptjs | Hachage et vérification des mots de passe |
| CSS | Mise en forme de l'interface |
| Vercel | Hébergement et déploiement |
| Docker | Configuration de conteneurisation fournie |

## Architecture

L'application s'appuie sur une architecture en trois parties :

1. **Client Next.js** : affiche l'interface et communique avec les routes API.
2. **API Next.js (Route Handlers)** : traite les requêtes, vérifie les sessions et applique les règles d'accès.
3. **Supabase PostgreSQL** : stocke les utilisateurs, les sessions, les listes et les produits.

Les accès à Supabase sont réalisés côté serveur avec `@supabase/supabase-js`. Le projet utilise une authentification personnalisée : les mots de passe sont hachés avec bcryptjs et les sessions sont enregistrées en base de données. Le navigateur reçoit un cookie de session `HttpOnly`.

## Prérequis

- Node.js **20.9 ou supérieur** (Node.js 22 recommandé).
- npm.
- Un projet Supabase avec une base PostgreSQL.

## Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/AsuraMoon/ListeCourse.git
cd ListeCourse
```

### 2. Installer les dépendances

```bash
npm ci
```

### 3. Configurer les variables d'environnement

Créer un fichier local à partir du modèle :

```bash
cp .env.example .env.local
```

Renseigner ensuite les variables suivantes dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète utilisée par le serveur pour accéder à la base de données.

> **Sécurité :** ne jamais publier le fichier `.env.local`, ni exposer `SUPABASE_SERVICE_ROLE_KEY dans du code exécuté côté navigateur. Cette clé doit rester strictement côté serveur.

### 4. Initialiser la base de données

Ouvrir l'éditeur SQL du projet Supabase et exécuter le script :

```
src/utils/database.sql
```

Ce script crée les tables nécessaires au fonctionnement de l'application : `users`, `shopping_lists`, `products` et `sessions`.

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

### 6. Construire et lancer en production

```bash
npm run build
npm run start
```

## API

Les routes API sont regroupées sous le préfixe `/api/v1`.

| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Créer un compte |
| POST | `/auth/login` | Ouvrir une session |
| POST | `/auth/logout` | Fermer une session |
| GET | `/products` | Récupérer les produits de l'utilisateur |
| POST | `/products` | Ajouter un produit |
| PATCH | `/products` | Modifier le statut d'achat d'un produit |
| DELETE | `/products` | Supprimer un produit |
| GET | `/products/search?q=<terme>` | Rechercher des produits |
| GET | `/products/<id>` | Récupérer un produit |
| PATCH | `/products/<id>` | Modifier un produit |
| DELETE | `/products/<id>` | Supprimer un produit |
| GET | `/list` | Récupérer les éléments à acheter |
| PATCH | `/user/username` | Modifier le nom d'utilisateur |
| PATCH | `/user/password` | Modifier le mot de passe |

Les routes de gestion des données personnelles vérifient la session et limitent les opérations aux ressources appartenant à l'utilisateur connecté.

## Modèle de données

Le schéma PostgreSQL est défini dans `src/utils/database.sql`.

- **users** : comptes utilisateurs et empreintes de mots de passe.
- **shopping_lists** : liste associée à chaque utilisateur.
- **products** : produits rattachés à une liste, avec leur état `to_buy`.
- **sessions** : sessions utilisateur et date d'expiration.

Les contraintes SQL assurent notamment l'unicité du nom d'utilisateur, l'existence d'une seule liste par utilisateur et l'absence de doublons de produits au sein d'une même liste.

## Déploiement

L'application est déployée sur **Vercel** et utilise **Supabase** comme service PostgreSQL.

Pour déployer une nouvelle instance sur Vercel :

1. Importer le dépôt GitHub dans Vercel.
2. Configurer `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans les variables d'environnement du projet.
3. Vérifier que le schéma SQL a été exécuté sur le projet Supabase associé.
4. Lancer le déploiement.

Un `Dockerfile` est également présent dans le dépôt pour la conteneurisation. Sa procédure de construction doit être validée avec l'environnement Docker/BuildKit et les secrets Supabase configurés avant utilisation en production.

## Pistes d'amélioration

- Renforcer la validation des entrées et la politique de mots de passe.
- Ajouter une limitation des tentatives de connexion et d'inscription.
- Mettre en place des tests automatisés (unitaires et d'intégration).
- Évaluer l'utilisation de Supabase Auth pour déléguer la gestion des identités et des sessions.

## Licence

Consulter le fichier [LICENSE](./LICENSE) pour connaître les conditions d'utilisation et de distribution du projet.
