"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button, Input, Modal, Spinner, SearchInput, Card } from "@siteflow/ui";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Users,
  Shield,
  Key,
  Settings,
  Eye,
  AlertTriangle,
  Building2,
  UserPlus,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Typer                                                              */
/* ------------------------------------------------------------------ */

interface BrukerGruppeMedlem {
  id: string;
  navn: string;
  rolle?: string;
}

interface BrukerGruppe {
  id: string;
  navn: string;
  kategori: "generelt" | "field" | "brukergrupper";
  medlemmer: BrukerGruppeMedlem[];
  ikon?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Statiske grupper (erstattes med tRPC-data senere)                  */
/* ------------------------------------------------------------------ */

const standardGrupper: BrukerGruppe[] = [
  // Generelt
  {
    id: "prosjektadmin",
    navn: "Prosjektadministratorer",
    kategori: "generelt",
    medlemmer: [],
    ikon: <Shield className="h-4 w-4" />,
  },
  // Field
  {
    id: "field-admin",
    navn: "Field-administratorer",
    kategori: "field",
    medlemmer: [],
    ikon: <Key className="h-4 w-4" />,
  },
  {
    id: "oppgave-sjekkliste-koord",
    navn: "Oppgave- og sjekklistekoordinatorer",
    kategori: "field",
    medlemmer: [],
    ikon: <Settings className="h-4 w-4" />,
  },
  {
    id: "field-observatorer",
    navn: "Field-observatører",
    kategori: "field",
    medlemmer: [],
    ikon: <Eye className="h-4 w-4" />,
  },
  {
    id: "hms-ledere",
    navn: "HMS-ledere",
    kategori: "field",
    medlemmer: [],
    ikon: <AlertTriangle className="h-4 w-4" />,
  },
];

/* ------------------------------------------------------------------ */
/*  GruppeKort-komponent                                               */
/* ------------------------------------------------------------------ */

const MAKS_SYNLIGE = 4;

function GruppeKort({
  gruppe,
  onLeggTilMedlem,
}: {
  gruppe: BrukerGruppe;
  onLeggTilMedlem?: (gruppeId: string) => void;
}) {
  const [visAlle, setVisAlle] = useState(false);
  const harMedlemmer = gruppe.medlemmer.length > 0;
  const synlige = visAlle
    ? gruppe.medlemmer
    : gruppe.medlemmer.slice(0, MAKS_SYNLIGE);
  const skjulte = gruppe.medlemmer.length - MAKS_SYNLIGE;

  return (
    <div className="group flex min-h-[160px] flex-col rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h4 className="truncate text-sm font-semibold text-gray-900">
          {gruppe.navn}
        </h4>
        {gruppe.kategori === "brukergrupper" && (
          <div className="flex gap-1 text-gray-400">
            <Key className="h-3.5 w-3.5" />
            <Users className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Innhold */}
      <div className="flex flex-1 flex-col px-4 py-3">
        {harMedlemmer ? (
          <div className="flex flex-col gap-1.5">
            {synlige.map((medlem) => (
              <div key={medlem.id} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-sm ${
                    medlem.rolle
                      ? "bg-gray-700 text-white"
                      : "text-gray-700"
                  }`}
                >
                  {medlem.navn}
                </span>
                {medlem.rolle && (
                  <span className="text-xs text-gray-400">{medlem.rolle}</span>
                )}
              </div>
            ))}
            {!visAlle && skjulte > 0 && (
              <button
                onClick={() => setVisAlle(true)}
                className="mt-1 self-start text-xs text-gray-400 hover:text-gray-600"
              >
                + {skjulte} mer
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-sm text-gray-300">Tom gruppe</span>
          </div>
        )}
      </div>

      {/* Hover-handling */}
      {onLeggTilMedlem && (
        <div className="border-t border-gray-100 px-4 py-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onLeggTilMedlem(gruppe.id)}
            className="flex items-center gap-1.5 text-xs text-siteflow-primary hover:underline"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Legg til medlem
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Seksjon-komponent                                                  */
/* ------------------------------------------------------------------ */

function GruppeSeksjon({
  tittel,
  grupper,
  onLeggTilMedlem,
}: {
  tittel: string;
  grupper: BrukerGruppe[];
  onLeggTilMedlem?: (gruppeId: string) => void;
}) {
  if (grupper.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="mb-3 text-lg font-bold text-gray-900">{tittel}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {grupper.map((gruppe) => (
          <GruppeKort
            key={gruppe.id}
            gruppe={gruppe}
            onLeggTilMedlem={onLeggTilMedlem}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hovudside                                                          */
/* ------------------------------------------------------------------ */

export default function BrukereSide() {
  const params = useParams<{ prosjektId: string }>();
  const [sok, setSok] = useState("");
  const [visNyGruppeModal, setVisNyGruppeModal] = useState(false);
  const [nyGruppeNavn, setNyGruppeNavn] = useState("");
  const [nyGruppeKategori, setNyGruppeKategori] = useState<
    "generelt" | "field" | "brukergrupper"
  >("brukergrupper");
  const [visningsModus, setVisningsModus] = useState<"grid" | "liste">("grid");

  // Hent prosjektmedlemmer og entrepriser for å populere grupper
  const { data: prosjekt } = trpc.prosjekt.hentMedId.useQuery(
    { id: params.prosjektId! },
    { enabled: !!params.prosjektId },
  );

  const { data: entrepriser } = trpc.entreprise.hentForProsjekt.useQuery(
    { projectId: params.prosjektId! },
    { enabled: !!params.prosjektId },
  );

  // Bygg grupper fra data
  const adminGruppe = standardGrupper[0]!;
  const grupper: BrukerGruppe[] = [
    // Generelt — populer prosjektadmin med prosjekteier
    {
      id: adminGruppe.id,
      navn: adminGruppe.navn,
      kategori: adminGruppe.kategori,
      ikon: adminGruppe.ikon,
      medlemmer: prosjekt?.members
        ?.filter((m) => m.role === "admin" || m.role === "owner")
        .map((m) => ({
          id: m.id,
          navn: m.user.name ?? m.user.email ?? "Ukjent",
          rolle: m.role === "owner" ? "Kontaktperson" : undefined,
        })) ?? [],
    },
    // Field-grupper (foreløpig tomme — fylles ut når rollesystemet er på plass)
    ...standardGrupper.slice(1),
    // Brukergrupper fra entrepriser
    ...(entrepriser?.map((ent) => ({
      id: `ent-${ent.id}`,
      navn: ent.name,
      kategori: "brukergrupper" as const,
      medlemmer: ent.members.map((m: { id: string; user?: { name?: string | null; email?: string | null } }) => ({
        id: m.id,
        navn: m.user?.name ?? m.user?.email ?? "Ukjent",
      })),
      ikon: <Building2 className="h-4 w-4" />,
    })) ?? []),
  ];

  // Filtrering
  const filtrert = sok
    ? grupper.filter(
        (g) =>
          g.navn.toLowerCase().includes(sok.toLowerCase()) ||
          g.medlemmer.some((m) =>
            m.navn.toLowerCase().includes(sok.toLowerCase()),
          ),
      )
    : grupper;

  const generelt = filtrert.filter((g) => g.kategori === "generelt");
  const field = filtrert.filter((g) => g.kategori === "field");
  const brukergrupper = filtrert.filter((g) => g.kategori === "brukergrupper");

  function handleLeggTilMedlem(gruppeId: string) {
    // Fremtidig: åpne modal for å legge til medlem i gruppen
  }

  return (
    <div>
      {/* Verktøylinje */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => setVisNyGruppeModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Legg til gruppe
          </Button>
          <Button variant="ghost" size="sm">
            <Users className="mr-1.5 h-4 w-4" />
            Kontakter
          </Button>
        </div>
      </div>

      {/* Tittel + søk */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Brukere</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisningsModus("liste")}
            className={`rounded p-1.5 ${
              visningsModus === "liste"
                ? "bg-gray-200 text-gray-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Listevisning"
          >
            <LayoutList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setVisningsModus("grid")}
            className={`rounded p-1.5 ${
              visningsModus === "grid"
                ? "bg-gray-200 text-gray-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Rutenettvisning"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Søk og filter */}
      <div className="mb-6 flex items-center gap-3">
        <SearchInput
          verdi={sok}
          onChange={setSok}
          placeholder="Søk"
          className="w-64"
        />
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <Plus className="h-3.5 w-3.5" />
          Tilføy filter
        </button>
      </div>

      {/* Gruppevisning */}
      <GruppeSeksjon
        tittel="Generelt"
        grupper={generelt}
        onLeggTilMedlem={handleLeggTilMedlem}
      />
      <GruppeSeksjon
        tittel="Field"
        grupper={field}
        onLeggTilMedlem={handleLeggTilMedlem}
      />
      <GruppeSeksjon
        tittel="Brukergrupper"
        grupper={brukergrupper}
        onLeggTilMedlem={handleLeggTilMedlem}
      />

      {filtrert.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          Ingen grupper matcher søket
        </div>
      )}

      {/* Ny gruppe modal */}
      <Modal
        open={visNyGruppeModal}
        onClose={() => setVisNyGruppeModal(false)}
        title="Legg til gruppe"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Fremtidig: lagre gruppe via tRPC
            setVisNyGruppeModal(false);
            setNyGruppeNavn("");
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Gruppenavn"
            placeholder="F.eks. HMS-ledere"
            value={nyGruppeNavn}
            onChange={(e) => setNyGruppeNavn(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Kategori
            </label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-siteflow-primary focus:outline-none focus:ring-1 focus:ring-siteflow-primary"
              value={nyGruppeKategori}
              onChange={(e) =>
                setNyGruppeKategori(
                  e.target.value as "generelt" | "field" | "brukergrupper",
                )
              }
            >
              <option value="generelt">Generelt</option>
              <option value="field">Field</option>
              <option value="brukergrupper">Brukergrupper</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Opprett</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVisNyGruppeModal(false)}
            >
              Avbryt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
