# SiteDoc

Rapport- og kvalitetsstyringssystem for byggeprosjekter. Flerplattform (PC, mobil, nettbrett) med offline-støtte, bildekomprimering, GPS-tagging og entreprisearbeidsflyt.

## Funksjoner

- **Sjekklister** — Strukturerte dokumenter basert på gjenbrukbare rapportmaler med 15 ulike objekttyper
- **Oppgaver** — Arbeidsoppgaver med prioritet, frist og ansvarlig entreprise
- **Entrepriseflyt** — Dokumenter flyter mellom oppretter- og svarer-entrepriser med full sporbarhet
- **Malbygger** — Drag-and-drop-bygger for rapportmaler på PC
- **Tegninger** — Prosjekttegninger (PDF/DWG) med versjonering
- **Offline-først** — Mobil-appen fungerer fullt offline med SQLite og bakgrunnssynkronisering
- **Bildekomprimering** — Automatisk komprimering til 300–400 KB med valgfri GPS-tagging

## Tech Stack

| Lag | Teknologi |
|-----|-----------|
| Monorepo | Turborepo, pnpm |
| Frontend web | Next.js 14+ (App Router), React, TypeScript, Tailwind CSS |
| Frontend mobil | React Native, Expo (SDK 52+), NativeWind |
| Backend API | Node.js, Fastify, tRPC |
| Database (server) | PostgreSQL, Prisma ORM |
| Database (lokal) | SQLite, Drizzle ORM |
| Auth | Auth.js v5 (Google, Microsoft Entra ID) |
| Fillagring | S3-kompatibel (AWS S3 / Cloudflare R2 / MinIO) |

## Kom i gang

### Forutsetninger

- Node.js 18+
- pnpm 9+
- PostgreSQL 15+

### Installasjon

```bash
# Klon repoet
git clone https://github.com/kemyrhau/SiteDoc.git
cd SiteDoc

# Installer avhengigheter
pnpm install

# Kopier miljøvariabler
cp .env.example .env
# Rediger .env med dine verdier (database, OAuth-nøkler, etc.)

# Kjør database-migreringer
pnpm db:migrate

# (Valgfritt) Seed med testdata
pnpm db:seed

# Start utviklingsserver
pnpm dev
```

Appen kjører på:
- **Web:** http://localhost:3100
- **API:** http://localhost:3001

### Miljøvariabler

Se `.env.example` for alle nødvendige variabler. Minimum:

| Variabel | Beskrivelse |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL tilkoblingsstreng |
| `AUTH_SECRET` | Tilfeldig hemmelighet (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth-nøkler |

## Prosjektstruktur

```
sitedoc/
├── apps/
│   ├── web/            # Next.js web-applikasjon
│   ├── mobile/         # Expo React Native app
│   └── api/            # Fastify tRPC backend
├── packages/
│   ├── shared/         # Delte typer, utils, validering (Zod)
│   ├── db/             # Prisma schema, migreringer, seed
│   └── ui/             # Delte UI-komponenter
├── CLAUDE.md           # AI-assistentkonfigurasjon
├── turbo.json
└── package.json
```

## Kommandoer

```bash
pnpm dev                    # Start alle apps i dev-modus
pnpm dev --filter @sitedoc/web    # Kun web
pnpm dev --filter @sitedoc/api    # Kun API
pnpm build                  # Bygg alle apps
pnpm typecheck              # TypeScript typesjekk
pnpm lint                   # ESLint
pnpm db:migrate             # Kjør Prisma-migreringer
pnpm db:seed                # Seed database
pnpm db:studio              # Åpne Prisma Studio
```

## UI-layout

Web-appen bruker et Dalux-inspirert tre-kolonne layout:

```
+----------------------------------------------------------+
| TOPPBAR: [SiteDoc] [Prosjektvelger v]     [Bruker v]    |
+------+------------------+--------------------------------+
| IKON | SEKUNDÆRT PANEL  | HOVEDINNHOLD                   |
| 60px | 280px            | Verktøylinje + tabell/detalj   |
+------+------------------+--------------------------------+
```

- **Ikonsidebar** — Navigasjon mellom seksjoner (Dashbord, Sjekklister, Oppgaver, Maler, Tegninger, Entrepriser)
- **Sekundært panel** — Kontekstuell filtrering, statusgrupper og søk
- **Hovedinnhold** — Tabeller og detaljvisninger med kontekstuell verktøylinje

## Entrepriseflyt

Sentral forretningslogikk for dokumentflyt mellom entrepriser:

```
draft → sent → received → in_progress → responded → approved/rejected → closed
```

- Oppretter-entreprise initierer og godkjenner/avviser
- Svarer-entreprise mottar, fyller ut og besvarer
- Alle overganger logges med full sporbarhet

## Lisens

Privat prosjekt.
