"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Input,
  Modal,
  Select,
  Spinner,
  EmptyState,
  SearchInput,
} from "@siteflow/ui";
import {
  Plus,
  Eye,
  Printer,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ListTodo,
  ArrowRight,
  MoreVertical,
  Trash2,
  UserPlus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Fargepalett for entrepriser                                        */
/* ------------------------------------------------------------------ */

const entrepriseFarger = [
  { bg: "bg-blue-100", border: "border-blue-200", tekst: "text-blue-900" },
  { bg: "bg-green-100", border: "border-green-200", tekst: "text-green-900" },
  { bg: "bg-purple-100", border: "border-purple-200", tekst: "text-purple-900" },
  { bg: "bg-amber-100", border: "border-amber-200", tekst: "text-amber-900" },
  { bg: "bg-rose-100", border: "border-rose-200", tekst: "text-rose-900" },
  { bg: "bg-teal-100", border: "border-teal-200", tekst: "text-teal-900" },
  { bg: "bg-indigo-100", border: "border-indigo-200", tekst: "text-indigo-900" },
  { bg: "bg-orange-100", border: "border-orange-200", tekst: "text-orange-900" },
];

function hentFarge(indeks: number) {
  return entrepriseFarger[indeks % entrepriseFarger.length]!;
}

/* ------------------------------------------------------------------ */
/*  Typer                                                              */
/* ------------------------------------------------------------------ */

interface DokumentFlyt {
  id: string;
  navn: string;
  type: "sjekkliste" | "oppgave";
  oppretterNavn: string;
  oppretterEntreprise: string;
  svarerNavn: string;
  svarerEntreprise: string;
}

interface EntrepriseGruppe {
  id: string;
  navn: string;
  flyter: DokumentFlyt[];
  fargeIndeks: number;
}

/* ------------------------------------------------------------------ */
/*  Flyt-kort (Oppretter → Svarer)                                    */
/* ------------------------------------------------------------------ */

function FlytKort({
  flyt,
}: {
  flyt: DokumentFlyt;
}) {
  return (
    <div className="flex items-stretch gap-0 py-2 pl-8">
      {/* Oppretter-boks */}
      <div className="flex min-h-[56px] w-[280px] flex-col justify-center rounded-lg border border-gray-300 bg-white px-4 py-2">
        <p className="text-sm font-medium text-gray-900">{flyt.oppretterNavn}</p>
        <p className="text-xs text-gray-500">{flyt.oppretterEntreprise}</p>
      </div>

      {/* Kobling */}
      <div className="flex w-[60px] items-center justify-center">
        <div className="flex items-center">
          <div className="h-px w-4 bg-gray-300" />
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="h-px w-4 bg-gray-300" />
        </div>
      </div>

      {/* Svarer-boks */}
      <div className="flex min-h-[56px] w-[280px] flex-col justify-center rounded-lg border border-gray-300 bg-white px-4 py-2">
        <p className="text-sm font-medium text-gray-900">{flyt.svarerNavn}</p>
        <p className="text-xs text-gray-500">{flyt.svarerEntreprise}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dokumenttype-seksjon (ekspanderbar)                                */
/* ------------------------------------------------------------------ */

function DokumentTypeSeksjon({
  flyter,
  typeNavn,
  typeIkon,
}: {
  flyter: DokumentFlyt[];
  typeNavn: string;
  typeIkon: React.ReactNode;
}) {
  const [ekspandert, setEkspandert] = useState(true);

  return (
    <div className="mb-1">
      <button
        onClick={() => setEkspandert(!ekspandert)}
        className="flex w-full items-center gap-2 py-2 pl-4 text-left"
      >
        {ekspandert ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-gray-400">{typeIkon}</span>
        <span className="text-sm font-medium text-gray-700">{typeNavn}</span>
      </button>

      {ekspandert && (
        <div>
          {flyter.map((flyt) => (
            <FlytKort key={flyt.id} flyt={flyt} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Entreprise-gruppe (farget header)                                  */
/* ------------------------------------------------------------------ */

function EntrepriseGruppeKomponent({
  gruppe,
}: {
  gruppe: EntrepriseGruppe;
}) {
  const [ekspandert, setEkspandert] = useState(true);
  const farge = hentFarge(gruppe.fargeIndeks);

  // Grupper flyter etter type
  const sjekklisteFlyter = gruppe.flyter.filter((f) => f.type === "sjekkliste");
  const oppgaveFlyter = gruppe.flyter.filter((f) => f.type === "oppgave");

  return (
    <div className="mb-4">
      {/* Entreprise-header */}
      <button
        onClick={() => setEkspandert(!ekspandert)}
        className={`flex w-full items-center gap-2 rounded-t-lg px-4 py-2.5 text-left ${farge.bg} ${farge.border} border`}
      >
        {ekspandert ? (
          <ChevronDown className={`h-4 w-4 ${farge.tekst}`} />
        ) : (
          <ChevronRight className={`h-4 w-4 ${farge.tekst}`} />
        )}
        <span className={`text-sm font-semibold ${farge.tekst}`}>
          {gruppe.navn}
        </span>
      </button>

      {ekspandert && (
        <div className={`rounded-b-lg border border-t-0 ${farge.border} bg-white py-2`}>
          {sjekklisteFlyter.length > 0 && (
            <DokumentTypeSeksjon
              typeNavn="Sjekklister"
              typeIkon={<ClipboardCheck className="h-4 w-4" />}
              flyter={sjekklisteFlyter}
            />
          )}
          {oppgaveFlyter.length > 0 && (
            <DokumentTypeSeksjon
              typeNavn="Oppgaver"
              typeIkon={<ListTodo className="h-4 w-4" />}
              flyter={oppgaveFlyter}
            />
          )}
          {gruppe.flyter.length === 0 && (
            <p className="px-8 py-4 text-sm text-gray-400">
              Ingen dokumentflyter konfigurert
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hovedside                                                          */
/* ------------------------------------------------------------------ */

export default function EntrepriserSide() {
  const params = useParams<{ prosjektId: string }>();
  const [sok, setSok] = useState("");
  const [visNyFlytModal, setVisNyFlytModal] = useState(false);
  const [nyFlytType, setNyFlytType] = useState<"sjekkliste" | "oppgave">("sjekkliste");
  const [nyFlytNavn, setNyFlytNavn] = useState("");
  const [valgtOppretter, setValgtOppretter] = useState("");
  const [valgtSvarer, setValgtSvarer] = useState("");

  const { data: entrepriser, isLoading } =
    trpc.entreprise.hentForProsjekt.useQuery(
      { projectId: params.prosjektId! },
      { enabled: !!params.prosjektId },
    );

  const { data: sjekklister } = trpc.sjekkliste.hentForProsjekt.useQuery(
    { projectId: params.prosjektId! },
    { enabled: !!params.prosjektId },
  );

  const { data: oppgaver } = trpc.oppgave.hentForProsjekt.useQuery(
    { projectId: params.prosjektId! },
    { enabled: !!params.prosjektId },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Bygg entreprise-grupper fra faktiske data
  const grupperMap = new Map<string, EntrepriseGruppe>();

  // Legg til alle entrepriser som grupper
  entrepriser?.forEach((ent, indeks) => {
    grupperMap.set(ent.id, {
      id: ent.id,
      navn: ent.name,
      flyter: [],
      fargeIndeks: indeks,
    });
  });

  // Legg til sjekkliste-flyter
  type SjekklisteData = {
    id: string;
    title: string;
    creatorEnterprise: { id: string; name: string };
    responderEnterprise: { id: string; name: string };
  };
  (sjekklister as SjekklisteData[] | undefined)?.forEach((sjekk) => {
    const gruppeId = sjekk.creatorEnterprise?.id;
    if (!gruppeId) return;
    const gruppe = grupperMap.get(gruppeId);
    if (gruppe) {
      gruppe.flyter.push({
        id: `sjekk-${sjekk.id}`,
        navn: sjekk.title,
        type: "sjekkliste",
        oppretterNavn: sjekk.title,
        oppretterEntreprise: sjekk.creatorEnterprise.name,
        svarerNavn: sjekk.title,
        svarerEntreprise: sjekk.responderEnterprise.name,
      });
    }
  });

  // Legg til oppgave-flyter
  type OppgaveData = {
    id: string;
    title: string;
    creatorEnterprise: { id: string; name: string };
    responderEnterprise: { id: string; name: string };
  };
  (oppgaver as OppgaveData[] | undefined)?.forEach((oppgave) => {
    const gruppeId = oppgave.creatorEnterprise?.id;
    if (!gruppeId) return;
    const gruppe = grupperMap.get(gruppeId);
    if (gruppe) {
      gruppe.flyter.push({
        id: `oppg-${oppgave.id}`,
        navn: oppgave.title,
        type: "oppgave",
        oppretterNavn: oppgave.title,
        oppretterEntreprise: oppgave.creatorEnterprise.name,
        svarerNavn: oppgave.title,
        svarerEntreprise: oppgave.responderEnterprise.name,
      });
    }
  });

  const grupper = Array.from(grupperMap.values());

  // Søkefiltrering
  const filtrert = sok
    ? grupper.filter(
        (g) =>
          g.navn.toLowerCase().includes(sok.toLowerCase()) ||
          g.flyter.some((f) =>
            f.navn.toLowerCase().includes(sok.toLowerCase()),
          ),
      )
    : grupper;

  const entrepriseOptions = entrepriser?.map((e) => ({
    value: e.id,
    label: e.name,
  })) ?? [];

  return (
    <div>
      {/* Verktøylinje */}
      <div className="mb-4 flex items-center gap-3">
        <Button size="sm" onClick={() => setVisNyFlytModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Legg til entreprise
        </Button>
        <Button variant="ghost" size="sm">
          <Eye className="mr-1.5 h-4 w-4" />
          Vis detaljer
        </Button>
        <Button variant="ghost" size="sm">
          <Printer className="mr-1.5 h-4 w-4" />
          Skriv ut
        </Button>
      </div>

      {/* Søk */}
      <div className="mb-4 flex items-center gap-3">
        <SearchInput
          verdi={sok}
          onChange={setSok}
          placeholder="Søk"
          className="w-72"
        />
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <Plus className="h-3.5 w-3.5" />
          Tilføy filter
        </button>
      </div>

      {/* Kolonne-header */}
      <div className="mb-3 flex items-center gap-0 pl-8">
        <div className="w-[280px]">
          <span className="text-sm font-semibold text-gray-700">Oppretter</span>
        </div>
        <div className="w-[60px]" />
        <div className="w-[280px]">
          <span className="text-sm font-semibold text-gray-700">Svarer</span>
        </div>
      </div>

      {/* Entreprise-grupper */}
      {filtrert.length === 0 ? (
        <EmptyState
          title="Ingen entrepriser"
          description="Legg til entrepriser for å konfigurere dokumentflyt mellom oppretter og svarer."
          action={
            <Button onClick={() => setVisNyFlytModal(true)}>
              Legg til entreprise
            </Button>
          }
        />
      ) : (
        filtrert.map((gruppe) => (
          <EntrepriseGruppeKomponent key={gruppe.id} gruppe={gruppe} />
        ))
      )}

      {/* Ny flyt modal */}
      <Modal
        open={visNyFlytModal}
        onClose={() => setVisNyFlytModal(false)}
        title="Ny dokumentflyt"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Fremtidig: opprett flyt via tRPC
            setVisNyFlytModal(false);
            setNyFlytNavn("");
            setValgtOppretter("");
            setValgtSvarer("");
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Navn"
            placeholder="F.eks. Kontroll elektro"
            value={nyFlytNavn}
            onChange={(e) => setNyFlytNavn(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-siteflow-primary focus:outline-none focus:ring-1 focus:ring-siteflow-primary"
              value={nyFlytType}
              onChange={(e) => setNyFlytType(e.target.value as "sjekkliste" | "oppgave")}
            >
              <option value="sjekkliste">Sjekkliste</option>
              <option value="oppgave">Oppgave</option>
            </select>
          </div>
          <Select
            label="Oppretter-entreprise"
            options={entrepriseOptions}
            value={valgtOppretter}
            onChange={(e) => setValgtOppretter(e.target.value)}
            placeholder="Velg entreprise..."
          />
          <Select
            label="Svarer-entreprise"
            options={entrepriseOptions}
            value={valgtSvarer}
            onChange={(e) => setValgtSvarer(e.target.value)}
            placeholder="Velg entreprise..."
          />

          {/* Forhåndsvisning */}
          {valgtOppretter && valgtSvarer && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-500">Forhåndsvisning</p>
              <div className="flex items-center gap-2">
                <div className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium">
                  {entrepriseOptions.find((e) => e.value === valgtOppretter)?.label}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                <div className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium">
                  {entrepriseOptions.find((e) => e.value === valgtSvarer)?.label}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit">Opprett</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVisNyFlytModal(false)}
            >
              Avbryt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
