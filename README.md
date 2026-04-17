
# ListeCourse
## MiamListe — A Next.js (App Router) project to manage a shopping list.
# [liste-course-kappa.vercel.app]

MiamListe is a lightweight shopping‑list application built with Next.js 14, Supabase, and a clean SQL architecture.

The UI is fully responsive, uses centralized CSS variables, and includes automatic dark mode via prefers-color-scheme.

## Features
🛍️ Product management (owner): add, edit, delete, categorize

🔒 Protected routes via Next.js middleware

🗄️ Clean SQL schema with foreign keys, indexes, and triggers

⚙️ Automatic list coherence: triggers create shopping list entries for every new product

🎨 Responsive UI with card layout and unified button styles

🌙 Dark mode using CSS variables (no JS, no extra classes)

📦 Docker support for easy deployment

## Getting started
### Prerequisites
Node.js v18+ (only required for local development)

npm / yarn / pnpm / bun (optional)

Docker (recommended for running without installing Node)

Copy env.example → .env and fill your Supabase keys

### Tech stack:
- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL)
- Docker
- CSS variables + responsive layout


## Development
Create your .env
bash
```
cp env.example .env
```
Then edit .env and fill the keys.

## NPM Version
bash
```
npm install
npm run build
npm run start
```

Open http://localhost:3000 in your browser.
Edit app/page.tsx — the page auto‑reloads while you work.

## Docker Version (recommended)
This repository already contains a Dockerfile and an env.example.

Build the Docker image:

bash
```
docker build -t liste-course .
```

Run the container:

bash
```
docker run -d -p 3000:3000 --env-file .env --name liste-course liste-course
```
The app will be available at:
http://localhost:3000

## Database structure (Supabase / PostgreSQL)
The project uses a clean SQL schema:

products_owner / products_guest

shopping_owner_list_items / shopping_guest_list_items

users

system_heartbeat

### Automatic triggers
Every new product automatically creates its corresponding shopping list entry:

to_buy = false by default

prevents missing or orphaned items

keeps the database consistent

### Dark Mode
MiamListe includes automatic dark mode using:

css
@media (prefers-color-scheme: dark)
No JS, no toggle, no extra classes — the entire UI adapts through CSS variables.

## Learn more
Next.js docs: https://nextjs.org/docs

Next.js tutorial: https://nextjs.org/learn

## Contributing & License
Fork the repo, create a feature branch, open a PR with a clear description and screenshots if relevant.

See the LICENSE file for details.

## Repository
https://github.com/AsuraMoon/liste-course
