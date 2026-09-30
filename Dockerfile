# Dockerfile

# ============================================================

# ÉTAPE 1 — Installation des dépendances

# ============================================================

# Node.js 22 est utilisé car Supabase recommande Node.js 22+

# pour les versions récentes de @supabase/supabase-js.

FROM node:22-alpine AS deps

# Dossier de travail dans le conteneur.

WORKDIR /app

# On copie uniquement les fichiers nécessaires à npm.

COPY package.json package-lock.json ./

# npm ci installe exactement les versions du package-lock.json.

RUN npm ci

# ============================================================

# ÉTAPE 2 — Construction de l'application

# ============================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Récupération des dépendances installées à l'étape précédente.

COPY --from=deps /app/node_modules ./node_modules

# Copie du projet.

# Le .dockerignore empêche notamment .env d'être copié.

COPY . .

# Construction de Next.js.

#

# Le fichier .env est fourni temporairement à Docker comme secret.

# Il est accessible uniquement pendant cette commande.

#

# Il n'est donc pas enregistré dans l'image Docker finale.

RUN --mount=type=secret,id=supabase_env,target=/run/secrets/supabase_env export $(grep -v '^#' /run/secrets/supabase_env | xargs) && npm run build

# ============================================================

# ÉTAPE 3 — Image de production

# ============================================================

# Nouvelle image propre contenant uniquement ce qui est

# nécessaire pour exécuter MiamListe.

FROM node:22-alpine AS runner

WORKDIR /app

# Environnement de production.

ENV NODE_ENV=production

# Port utilisé par Next.js.

ENV PORT=3000

# Permet à Next.js d'écouter sur toutes les interfaces réseau

# du conteneur.

ENV HOSTNAME="0.0.0.0"

# ============================================================

# ÉTAPE 3.1 — Utilisateur non-root

# ============================================================

# On crée un utilisateur dédié à l'application.

#

# L'objectif est de ne pas exécuter le serveur avec root.

RUN addgroup --system --gid 1001 nodejs 
&& adduser --system --uid 1001 nextjs

# ============================================================

# ÉTAPE 3.2 — Fichiers publics

# ============================================================

# Copie le dossier public.

#

# Cela contient notamment :

# - manifest.json

# - icon-192.png

# - icon-512.png

# - bread.png

COPY --from=builder /app/public ./public

# ============================================================

# ÉTAPE 3.3 — Serveur Next.js standalone

# ============================================================

# next.config.ts contient :

#

# output: "standalone"

#

# Next.js génère alors un serveur autonome dans

# .next/standalone.

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Fichiers JavaScript/CSS statiques générés par Next.js.

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ============================================================

# ÉTAPE 3.4 — Sécurité

# ============================================================

# Le serveur sera exécuté avec l'utilisateur nextjs

# plutôt qu'avec root.

USER nextjs

# ============================================================

# ÉTAPE 3.5 — Réseau

# ============================================================

# Documentation du port utilisé par le conteneur.

EXPOSE 3000

# ============================================================

# ÉTAPE 3.6 — Démarrage

# ============================================================

# Le mode standalone génère server.js.

#

# On démarre directement ce serveur plutôt que npm start.

CMD ["node", "server.js"]
