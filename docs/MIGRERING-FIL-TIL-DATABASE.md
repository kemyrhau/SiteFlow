# Migrasjonsplan: "Fil til database" → SiteDoc

## Oversikt

"Fil til database" er et todelt system: en **desktop-app** (Tkinter) og en **Azure web-app** (FastAPI + Next.js). Begge deler samme service-lag og pipeline. Dette dokumentet analyserer hva som finnes, hva som gir mest verdi for SiteDoc, og hvordan en fremtidig migrering bør gjøres.

## Kildekodebase

- **Repo:** `/Users/kennethmyrhaug/Documents/Programmering/Fil til database-kopi`
- **Desktop:** Tkinter GUI (`src/new_gui_launcher.py`, `src/ui/`) — 218 KB hovedfil, tråd-basert
- **Web/Azure:** FastAPI API (`src/api/`) + Next.js frontend (`frontend/`) med shadcn/ui
- **Delt service-lag:** `src/services/` — forretningslogikk brukt av begge plattformene
- **Pipeline:** `src/pipeline/` — dokumentklassifisering og prosessering med profiler
- **Backends:** `src/backends/` — abstraksjonslag (lokal vs. Azure) for embedding, OCR, vektorsøk og lagring
- **Database:** SQLite (lokal) / SQL Server / Azure SQL via SQLAlchemy

## Hva som faktisk finnes

### Desktop-versjonen (Tkinter)
- Fullverdig GUI for dokumenthåndtering med mappebrowser
- Batch-import av filer med OCR og tekstekstraksjon
- Embedding-generering som bakgrunnsprosess
- AI-søk med vektorsimilaritet + re-ranking
- Mengdeoversikt med A-nota/T-nota/avviksanalyse
- NS-standard søk med kodeoppslag
- Innstillingsvindu med søke-vekter (recall/precision/latency)

### Azure/Web-versjonen (FastAPI + Next.js)
- 35 API-endepunkter fordelt på 8 route-moduler
- React frontend med shadcn/ui-komponenter
- Mengdeside med tabs (Oversikt + Avviksanalyse)
- Dokumentvisning med metadata, chunks og fulltekst
- Søkeside med kontekst-snippets
- Import-side med drag-and-drop og jobbfremdrift
- NS-søk med kodeautocomplete
- Admin-side med embedding-håndtering og DB-vedlikehold
- Auth via MSAL (Microsoft Entra ID) — samme provider SiteDoc allerede bruker

### Backend-abstraksjon (`src/backends/`)
Elegant mønster med utbyttbare backends:
- **Embedding:** `LocalEmbedding` (sentence-transformers/NorBERT2) vs. `AzureOpenAIEmbedding`
- **Vektorsøk:** `FAISSBackend` (lokal) vs. `AzureAISearchBackend`
- **OCR:** `LocalOCR` (pytesseract) vs. `AzureDocIntelligence`
- **Lagring:** `LocalStorage` (filsystem) vs. `AzureBlobStorage`

### Pipeline-profiler (`src/pipeline/profiles/`)
Spesialiserte parsere per dokumenttype:
- `a_nota.py` — A-nota (avdragsnota) med postnr, mengder, beløp
- `t_nota.py` — T-nota (tilleggsnota)
- `mengdebeskrivelse.py` — NS 3420-poster fra PDF/Word (26 KB, robust parser)
- `ns_3xxx.py` — NS-standarder med koder og seksjoner (24 KB)
- `ns_standard.py` — Generell NS-standard parser
- `referat.py` — Møtereferater
- `universal.py` — Fallback-profil

### Mengde-service (`src/services/mengde_service.py`)
Størst service (80 KB). Håndterer:
- Prosjekter, dokumenter, perioder
- Spesifikasjonsposter med budsjett/kontrakt/forbruk
- A-nota import (Excel → strukturerte poster)
- T-nota import
- XML-budsjett import med hierarki
- Avviksanalyse (tilbud vs. kontrakt)
- Fuzzy prosjektmatching (3 nivåer)
- Notatfunksjon per post

### Frontend-komponenter (Next.js)
Allerede i TypeScript/React — kan gjenbrukes direkte:
- `mengde/spec-post-table.tsx` — Spesifikasjonspost-tabell
- `mengde/deviation-analysis-panel.tsx` — Avviksanalyse med sortering og fargekoding
- `mengde/summary-panel.tsx` — Oppsummeringspanel (sum, MVA, totalt)
- `mengde/project-selectors.tsx` — Prosjekt/dokument/periode-velgere
- `mengde/import-dialog.tsx` — Import-dialog
- `mengde/note-editor.tsx` — Notatredigering per post
- `mengde/ns-code-panel.tsx` — NS-kodeoppslag
- `search/search-form.tsx` + `hit-list.tsx` — Søke-UI
- `documents/metadata-panel.tsx` + `chunk-panel.tsx` — Dokumentdetaljer
- `import/file-dropzone.tsx` + `job-progress.tsx` — Filimport med fremdrift

## Hva gir mest verdi for SiteDoc

### Høyest verdi: Mengde/økonomi-modulen

**Hvorfor:** SiteDoc mangler helt økonomioppfølging. Mengde-modulen gir:
- Budsjettoppfølging per entreprise (tilbud → kontrakt → fakturert)
- A-nota/T-nota import fra Excel (bransjepraksis)
- Avviksanalyse som faktisk brukes i prosjektledermøter
- Direkte kobling til SiteDoc sin entreprisestruktur

**Hva som kan gjenbrukes:**
- Frontend-komponentene er allerede TypeScript/React — kan tilpasses SiteDoc sitt UI
- Parsingslogikken fra `mengde_service.py` og `a_nota.py` (regex-mønstre, beløpskonvertering)
- Avviksanalyse-algoritmen (Match/Endret/Ny/Fjernet-klassifisering)
- Database-skjemaet (SpecPost, NotaPeriod, NotaPost) som Prisma-modeller

### Høy verdi: Dokumentsøk (fulltekst + AI)

**Hvorfor:** SiteDoc har Mapper-modul men ingen søkefunksjon. Dokumentsøk gir:
- Finn relevante dokumenter raskt i store prosjektmapper
- Kontekst-snippets viser hvorfor et treff er relevant
- NS-standard-oppslag direkte fra sjekklister/oppgaver

**Hva som kan gjenbrukes:**
- Søke-UI fra frontend (allerede TypeScript)
- Re-ranking-logikken fra `ai_search.py` (frase/term/kvalitet/heading-signaler)
- Backend-abstraksjonsmønsteret (lokal vs. Azure) passer SiteDoc sitt deploy-oppsett

### Middels verdi: Dokumentpipeline og OCR

**Hvorfor:** Nyttig men krever tyngst infrastruktur. Gir automatisk tekstekstraksjon.

**Hva som kan gjenbrukes:**
- Pipeline-profil-mønsteret (klassifiser → riktig parser)
- Chunking-strategiene fra `src/services/chunking/`
- Backend-abstraksjonslaget for OCR

### Lavere verdi for SiteDoc (men nyttig referanse):
- Desktop-appen (Tkinter) — irrelevant, SiteDoc har egen web/mobil
- Multi-DB-støtte (SQLite/SQL Server/Azure SQL) — SiteDoc bruker kun PostgreSQL
- Watchdog auto-import — SiteDoc har annen filhåndteringsflyt
- Model cache service — SiteDoc vil bruke Azure OpenAI i produksjon

## Prioritert migrasjonsrekkefølge

| # | Funksjon | Verdi | Kompleksitet | Gjenbruk fra kilde |
|---|----------|-------|--------------|---------------------|
| 1 | Mengde/økonomi (A-nota, budsjett, avvik) | Svært høy | Middels | Frontend direkte, parsing-logikk portes |
| 2 | Fulltekstsøk i dokumenter | Høy | Lav-middels | PostgreSQL FTS, ingen ML nødvendig |
| 3 | AI-søk med embeddings | Høy | Middels-høy | Backend-abstraksjon, pgvector |
| 4 | Dokumentpipeline (OCR + chunking) | Middels-høy | Høy | Pipeline-profiler portes |
| 5 | NS-standard oppslag | Middels | Lav | Frontend + API portes direkte |

## Teknisk migreringsstrategi

### Fase 1: Mengde og økonomi

**Mål:** Økonomioppfølging per entreprise i SiteDoc

**1. Database (Prisma):**
```prisma
model SpecPost {
  id            String   @id @default(cuid())
  projectId     String
  enterpriseId  String
  postnr        String?
  beskrivelse   String?
  enhet         String?
  mengdeAnbud   Decimal?
  enhetspris    Decimal?
  sumAnbud      Decimal?
  nsKode        String?  // NS 3420-kode
  eksternNotat  String?
  project       Project    @relation(...)
  enterprise    Enterprise @relation(...)
  notaPoster    NotaPost[]
}

model NotaPeriod {
  id           String   @id @default(cuid())
  projectId    String
  enterpriseId String
  periodeNr    Int
  label        String   // "A-nota #3 – Mars 2025"
  type         String   // "a_nota" | "t_nota"
  dato         DateTime?
  project      Project    @relation(...)
  enterprise   Enterprise @relation(...)
  poster       NotaPost[]
}

model NotaPost {
  id           String     @id @default(cuid())
  periodId     String
  specPostId   String
  mengde       Decimal?
  enhetspris   Decimal?
  sum          Decimal?
  period       NotaPeriod @relation(...)
  specPost     SpecPost   @relation(...)
}
```

**2. API (tRPC-router: `mengde`):**
- `hentOversikt(prosjektId, entrepriseId, periodeId)` — Spec-poster med fremdrift
- `hentPerioder(prosjektId, entrepriseId)` — Alle perioder
- `importNota(prosjektId, entrepriseId, fil)` — Excel-import
- `importBudsjett(prosjektId, entrepriseId, fil)` — XML-budsjett
- `hentAvvik(prosjektId, entrepriseId)` — Avviksanalyse
- `oppdaterNotat(specPostId, tekst)` — Notat per post

**3. Web-UI:**
- Ny seksjon i HovedSidebar: "Økonomi" (BarChart3-ikon)
- Gjenbruk og tilpass eksisterende React-komponenter fra frontend-mappen
- Koble til SiteDoc sin ProsjektKontekst og entreprise-velger
- Ny tillatelse: `view_economy` / `manage_economy`

**4. Portering av parsing-logikk:**
- `a_nota.py` regex-mønstre → TypeScript i `apps/api/src/services/nota-parser.ts`
- `mengde_service.py` avviksanalyse → `apps/api/src/services/avviksanalyse.ts`
- Excel: `exceljs` (Node.js) erstatter `openpyxl` (Python)
- XML: `fast-xml-parser` erstatter `ElementTree`

### Fase 2: Dokumentsøk

**Mål:** Søk i dokumenter lastet opp i Mapper-modulen

**Steg 1 — Fulltekstsøk (ingen ML):**
- PostgreSQL innebygd fulltekstsøk (`tsvector`, `tsquery`)
- Ny kolonne `search_vector tsvector` på `documents`-tabellen
- Trigger som oppdaterer `search_vector` ved INSERT/UPDATE
- tRPC: `sok.dokumenter(query, prosjektId)` — ranket fulltekstsøk
- Søkefelt i Mapper-panelet og/eller Toppbar

**Steg 2 — AI-søk (valgfritt, etter behov):**
- `pgvector`-utvidelse for vektorlagring i PostgreSQL
- Embedding via Azure OpenAI `text-embedding-3-small` (prod) eller `@xenova/transformers` (dev)
- Ny tabell `document_chunks` med chunk_text + embedding_vector
- Hybrid søk: kombinerer FTS-score og vektorsimilaritet
- Bakgrunnsjobb (pg-boss) for chunk-generering og embedding

### Fase 3: Dokumentpipeline (valgfritt)

**Mål:** Automatisk tekstekstraksjon fra opplastede filer

- PDF-parsing: `pdf-parse` (Node.js)
- Word-parsing: `mammoth`
- OCR: Azure Document Intelligence (skytjeneste) for skannede PDF-er
- Pipeline-profiler portes fra Python til TypeScript
- Chunking-strategi basert på overskrifter og sideinnhold

## Python → TypeScript: Porteringstabell

| Python-komponent | TypeScript-mål | Gjenbruksgrad |
|------------------|----------------|---------------|
| `mengde_service.py` (80 KB) | `apps/api/src/routes/mengde.ts` + `services/` | Logikk portes, frontend gjenbrukes |
| `a_nota.py` profil (22 KB) | `apps/api/src/services/nota-parser.ts` | Regex-mønstre kopieres direkte |
| `mengdebeskrivelse.py` (27 KB) | `apps/api/src/services/mengde-parser.ts` | Regex-mønstre kopieres |
| `ai_search.py` (27 KB) | `apps/api/src/routes/sok.ts` | Algoritme portes, pgvector erstatter faiss |
| `backends/__init__.py` | Ikke nødvendig — SiteDoc bruker env-config | Mønsteret er nyttig referanse |
| Frontend mengde-komponenter | `apps/web/src/components/mengde/` | Direkte gjenbruk, tilpass UI-lib |
| Frontend søke-komponenter | `apps/web/src/components/sok/` | Direkte gjenbruk |
| `db_utils_new.py` modeller | Prisma schema | Konverteres til Prisma-modeller |

## Hva som IKKE bør migreres

| Komponent | Grunn |
|-----------|-------|
| Tkinter desktop-app | SiteDoc har egen web/mobil-plattform |
| Multi-DB abstraksjon (SQLite/MSSQL/Azure SQL) | SiteDoc bruker kun PostgreSQL |
| `new_gui_launcher.py` (218 KB) | Desktop-spesifikk, irrelevant |
| Watchdog auto-import | SiteDoc har annen filhåndteringsflyt |
| Model cache service | SiteDoc vil bruke Azure OpenAI, ikke lokale modeller |
| FAISS vektorsøk | Erstattes av pgvector i PostgreSQL |
| Threading/subprocess-modell | Node.js er event-drevet, bruker BullMQ/pg-boss |
| Auth (MSAL desktop-flyt) | SiteDoc bruker Auth.js med database-sesjoner |

## Arkitekturprinsipper

1. **Entreprise-kobling:** All mengde-/økonomidata knyttes til entrepriser — dette mangler i kilde-prosjektet og er SiteDoc sin styrke
2. **Modulsystem:** Mengde aktiveres per prosjekt via modulsystemet (som Godkjenning/HMS-avvik)
3. **Tilgangskontroll:** Ny tillatelse `view_economy` / `manage_economy` i prosjektgrupper
4. **Gjenbruk frontend:** React-komponentene fra kilde-prosjektet er allerede TypeScript — tilpass styling fra shadcn/ui til SiteDoc sin Tailwind-setup
5. **PostgreSQL-first:** Bruk Prisma, pgvector og FTS direkte — ingen SQLAlchemy-port
6. **Ingen Python i prod:** Alt portes til TypeScript/Node.js

## Risiko og mitigering

| Risiko | Mitigering |
|--------|------------|
| Excel-parsing i Node.js er mindre moden | Test grundig med reelle A-nota-filer fra prosjekter |
| A-nota-formater varierer mellom UE-er | Fleksibel parser med manuell mapping-fallback |
| pgvector krever PostgreSQL-utvidelse | Fulltekstsøk (steg 1) fungerer uten — pgvector er valgfritt |
| Mengde-modulen er stor (80 KB Python) | Del opp i separate services (parser, avvik, oversikt) |

## Estimert omfang

| Fase | Nye filer | Nye tabeller | Nye tRPC-prosedyrer |
|------|-----------|--------------|---------------------|
| Fase 1: Mengde/økonomi | 10-15 | 3 (SpecPost, NotaPeriod, NotaPost) | 6-8 |
| Fase 2: Dokumentsøk | 3-5 | 0-1 (search_vector kolonne) | 2-3 |
| Fase 3: Pipeline (valgfritt) | 8-12 | 1 (document_chunks) | 3-5 |
| **Totalt** | **21-32** | **4-5** | **11-16** |

## Referanser

- **Kildekode:** `/Users/kennethmyrhaug/Documents/Programmering/Fil til database-kopi/`
- **Frontend (gjenbrukbart):** `frontend/src/components/mengde/` — 6 React-komponenter
- **Mengde-service (portering):** `src/services/mengde_service.py` — 80 KB forretningslogikk
- **A-nota parser:** `src/pipeline/profiles/a_nota.py` — regex-basert Excel-parsing
- **SiteDoc modulsystem:** `packages/shared/src/moduler/`
- **SiteDoc API-routere:** `apps/api/src/routes/`
- **SiteDoc Mapper-modul:** `/dashbord/[prosjektId]/mapper`
