"use client";

import { useState } from "react";
import { useProsjekt } from "@/kontekst/prosjekt-kontekst";
import { trpc } from "@/lib/trpc";
import { Button, Input, Modal, Spinner, EmptyState } from "@sitedoc/ui";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Users,
  Building2,
  X,
  FileText,
} from "lucide-react";
import {
  hentFargeForEntreprise,
  FARGE_MAP,
} from "../_components/entreprise-farger";

/* ------------------------------------------------------------------ */
/*  Typer                                                              */
/* ------------------------------------------------------------------ */

interface DokumentflytMedlemData {
  id: string;
  rolle: string;
  steg: number;
  enterprise: { id: string; name: string; color: string | null } | null;
  projectMember: {
    id: string;
    user: { id: string; name: string | null; email: string };
  } | null;
}

interface DokumentflytMalData {
  template: { id: string; name: string; category: string };
}

interface DokumentflytData {
  id: string;
  name: string;
  medlemmer: DokumentflytMedlemData[];
  maler: DokumentflytMalData[];
}

interface EntrepriseItem {
  id: string;
  name: string;
  color: string | null;
}

interface ProsjektMedlemItem {
  id: string;
  user: { name: string | null; email: string };
}

/* ------------------------------------------------------------------ */
/*  DokumentflytKort                                                   */
/* ------------------------------------------------------------------ */

function DokumentflytKort({
  dokumentflyt,
  entrepriser,
  onRediger,
  onSlett,
}: {
  dokumentflyt: DokumentflytData;
  entrepriser: EntrepriseItem[];
  onRediger: () => void;
  onSlett: () => void;
}) {
  const [ekspandert, setEkspandert] = useState(true);

  const opprettere = dokumentflyt.medlemmer.filter((m) => m.rolle === "oppretter");
  const svarere = dokumentflyt.medlemmer.filter((m) => m.rolle === "svarer");

  // Grupper svarere per steg
  const stegMap = new Map<number, DokumentflytMedlemData[]>();
  for (const s of svarere) {
    const liste = stegMap.get(s.steg) ?? [];
    liste.push(s);
    stegMap.set(s.steg, liste);
  }
  const sorterteSteg = Array.from(stegMap.entries()).sort(([a], [b]) => a - b);

  const oppgaveMaler = dokumentflyt.maler.filter((m) => m.template.category === "oppgave");
  const sjekklisteMaler = dokumentflyt.maler.filter((m) => m.template.category === "sjekkliste");
  const malOppsummering = [
    oppgaveMaler.length > 0 ? `${oppgaveMaler.length} oppg.` : null,
    sjekklisteMaler.length > 0 ? `${sjekklisteMaler.length} sjekk.` : null,
  ].filter(Boolean).join(" + ");

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => setEkspandert(!ekspandert)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {ekspandert ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm font-semibold text-gray-900">
            {dokumentflyt.name}
          </span>
          {malOppsummering && (
            <span className="text-xs text-gray-400">({malOppsummering})</span>
          )}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onRediger}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Rediger"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onSlett}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Slett"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {ekspandert && (
        <div>
          {/* Kolonner: Oppretter → Svarer 1 → Svarer 2 → ... */}
          <div className="flex divide-x divide-gray-100">
            {/* Oppretter-kolonne */}
            <div className="flex-1 p-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Oppretter
              </div>
              <MedlemListe medlemmer={opprettere} entrepriser={entrepriser} />
            </div>

            {/* Svarer-kolonner per steg */}
            {sorterteSteg.map(([steg, medlemmer]) => (
              <div key={steg} className="flex-1 p-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Svarer{steg > 1 ? ` ${steg}` : ""}
                </div>
                <MedlemListe medlemmer={medlemmer} entrepriser={entrepriser} />
              </div>
            ))}

            {/* Vis minst én svarer-kolonne hvis ingen */}
            {sorterteSteg.length === 0 && (
              <div className="flex-1 p-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Svarer
                </div>
                <span className="text-xs text-gray-300">Ikke konfigurert</span>
              </div>
            )}
          </div>

          {/* Maler */}
          {dokumentflyt.maler.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <div className="flex flex-wrap gap-1.5">
                {dokumentflyt.maler.map((m) => (
                  <span
                    key={m.template.id}
                    className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    <FileText className="h-3 w-3" />
                    {m.template.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MedlemListe — viser entrepriser og personer i en kolonne           */
/* ------------------------------------------------------------------ */

function MedlemListe({
  medlemmer,
  entrepriser,
}: {
  medlemmer: DokumentflytMedlemData[];
  entrepriser: EntrepriseItem[];
}) {
  if (medlemmer.length === 0) {
    return <span className="text-xs text-gray-300">Ikke konfigurert</span>;
  }

  return (
    <div className="space-y-1">
      {medlemmer.map((m) => {
        if (m.enterprise) {
          const ent = entrepriser.find((e) => e.id === m.enterprise!.id);
          const fargeIdx = ent ? entrepriser.indexOf(ent) : 0;
          const farge = hentFargeForEntreprise(m.enterprise.color, fargeIdx);
          return (
            <div
              key={m.id}
              className={`flex items-center gap-1.5 rounded px-1.5 py-1 ${farge.bg}`}
            >
              <Building2 className={`h-3.5 w-3.5 ${farge.tekst}`} />
              <span className={`text-[13px] font-medium ${farge.tekst}`}>
                {m.enterprise.name}
              </span>
            </div>
          );
        }
        if (m.projectMember) {
          return (
            <div
              key={m.id}
              className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-gray-50"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600">
                {(m.projectMember.user.name ?? m.projectMember.user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] leading-tight text-gray-700">
                  {m.projectMember.user.name ?? m.projectMember.user.email}
                </div>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OpprettDokumentflytModal                                           */
/* ------------------------------------------------------------------ */

function OpprettDokumentflytModal({
  open,
  onClose,
  prosjektId,
  entrepriser,
  maler,
  alleMedlemmer,
}: {
  open: boolean;
  onClose: () => void;
  prosjektId: string;
  entrepriser: EntrepriseItem[];
  maler: Array<{ id: string; name: string; category: string }>;
  alleMedlemmer: ProsjektMedlemItem[];
}) {
  const [navn, setNavn] = useState("");
  const [oppretterType, setOppretterType] = useState<"entreprise" | "person">("entreprise");
  const [oppretterEntrepriseId, setOppretterEntrepriseId] = useState("");
  const [svarerType, setSvarerType] = useState<"entreprise" | "person">("entreprise");
  const [svarerEntrepriseId, setSvarerEntrepriseId] = useState("");
  const [valgteMaler, setValgteMaler] = useState<Set<string>>(new Set());

  const utils = trpc.useUtils();
  const opprettMutation = trpc.dokumentflyt.opprett.useMutation({
    onSuccess: () => {
      utils.dokumentflyt.hentForProsjekt.invalidate({ projectId: prosjektId });
      nullstill();
      onClose();
    },
  });

  function nullstill() {
    setNavn("");
    setOppretterEntrepriseId("");
    setSvarerEntrepriseId("");
    setValgteMaler(new Set());
  }

  // Synkroniser ved åpning
  const [forrigeOpen, setForrigeOpen] = useState(false);
  if (open && !forrigeOpen) nullstill();
  if (open !== forrigeOpen) setForrigeOpen(open);

  const oppgaveMaler = maler.filter((m) => m.category === "oppgave");
  const sjekklisteMaler = maler.filter((m) => m.category === "sjekkliste");

  function toggleMal(id: string) {
    setValgteMaler((prev) => {
      const neste = new Set(prev);
      if (neste.has(id)) neste.delete(id);
      else neste.add(id);
      return neste;
    });
  }

  function handleOpprett(e: React.FormEvent) {
    e.preventDefault();
    if (!navn.trim()) return;

    const medlemmer: Array<{
      enterpriseId?: string;
      projectMemberId?: string;
      rolle: "oppretter" | "svarer";
      steg: number;
    }> = [];

    if (oppretterEntrepriseId) {
      medlemmer.push({ enterpriseId: oppretterEntrepriseId, rolle: "oppretter", steg: 1 });
    }
    if (svarerEntrepriseId) {
      medlemmer.push({ enterpriseId: svarerEntrepriseId, rolle: "svarer", steg: 1 });
    }

    opprettMutation.mutate({
      projectId: prosjektId,
      name: navn.trim(),
      templateIds: Array.from(valgteMaler),
      medlemmer,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Ny dokumentflyt">
      <form onSubmit={handleOpprett} className="flex flex-col gap-4">
        <Input
          label="Navn"
          placeholder="F.eks. Uavhengig kontroll"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          required
        />

        {/* Oppretter */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Oppretter-entreprise
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sitedoc-primary focus:outline-none focus:ring-1 focus:ring-sitedoc-primary"
            value={oppretterEntrepriseId}
            onChange={(e) => setOppretterEntrepriseId(e.target.value)}
          >
            <option value="">Velg entreprise...</option>
            {entrepriser.map((ent) => (
              <option key={ent.id} value={ent.id}>{ent.name}</option>
            ))}
          </select>
        </div>

        {/* Svarer */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Svarer-entreprise
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sitedoc-primary focus:outline-none focus:ring-1 focus:ring-sitedoc-primary"
            value={svarerEntrepriseId}
            onChange={(e) => setSvarerEntrepriseId(e.target.value)}
          >
            <option value="">Velg entreprise...</option>
            {entrepriser.map((ent) => (
              <option key={ent.id} value={ent.id}>{ent.name}</option>
            ))}
          </select>
        </div>

        {/* Maler */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-sitedoc-primary accent-sitedoc-primary"
                checked={oppgaveMaler.length > 0 && oppgaveMaler.every((m) => valgteMaler.has(m.id))}
                onChange={() => {
                  const alleValgt = oppgaveMaler.every((m) => valgteMaler.has(m.id));
                  setValgteMaler((prev) => {
                    const neste = new Set(prev);
                    for (const m of oppgaveMaler) {
                      if (alleValgt) neste.delete(m.id); else neste.add(m.id);
                    }
                    return neste;
                  });
                }}
              />
              <span className="text-sm font-semibold text-gray-900">Oppgavetype</span>
            </label>
            <div className="space-y-1.5">
              {oppgaveMaler.map((mal) => (
                <label key={mal.id} className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-sitedoc-primary accent-sitedoc-primary"
                    checked={valgteMaler.has(mal.id)}
                    onChange={() => toggleMal(mal.id)}
                  />
                  <span className="text-sm text-gray-700">{mal.name}</span>
                </label>
              ))}
              {oppgaveMaler.length === 0 && <p className="text-xs text-gray-400">Ingen oppgavemaler</p>}
            </div>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-sitedoc-primary accent-sitedoc-primary"
                checked={sjekklisteMaler.length > 0 && sjekklisteMaler.every((m) => valgteMaler.has(m.id))}
                onChange={() => {
                  const alleValgt = sjekklisteMaler.every((m) => valgteMaler.has(m.id));
                  setValgteMaler((prev) => {
                    const neste = new Set(prev);
                    for (const m of sjekklisteMaler) {
                      if (alleValgt) neste.delete(m.id); else neste.add(m.id);
                    }
                    return neste;
                  });
                }}
              />
              <span className="text-sm font-semibold text-gray-900">Sjekklistetype</span>
            </label>
            <div className="space-y-1.5">
              {sjekklisteMaler.map((mal) => (
                <label key={mal.id} className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-sitedoc-primary accent-sitedoc-primary"
                    checked={valgteMaler.has(mal.id)}
                    onChange={() => toggleMal(mal.id)}
                  />
                  <span className="text-sm text-gray-700">{mal.name}</span>
                </label>
              ))}
              {sjekklisteMaler.length === 0 && <p className="text-xs text-gray-400">Ingen sjekklistemaler</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Avbryt
          </Button>
          <Button type="submit" loading={opprettMutation.isPending} disabled={!navn.trim()}>
            Opprett
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Hovedside                                                          */
/* ------------------------------------------------------------------ */

export default function DokumentflytSide() {
  const { prosjektId } = useProsjekt();
  const utils = trpc.useUtils();
  const [visOpprett, setVisOpprett] = useState(false);
  const [slettId, setSlettId] = useState<string | null>(null);

  // Data
  const { data: dokumentflyter, isLoading } = trpc.dokumentflyt.hentForProsjekt.useQuery(
    { projectId: prosjektId! },
    { enabled: !!prosjektId },
  );

  const { data: entrepriser } = trpc.entreprise.hentForProsjekt.useQuery(
    { projectId: prosjektId! },
    { enabled: !!prosjektId },
  );

  const { data: maler } = trpc.mal.hentForProsjekt.useQuery(
    { projectId: prosjektId! },
    { enabled: !!prosjektId },
  );

  const { data: medlemmer } = trpc.medlem.hentForProsjekt.useQuery(
    { projectId: prosjektId! },
    { enabled: !!prosjektId },
  );

  const slettMutation = trpc.dokumentflyt.slett.useMutation({
    onSuccess: () => {
      utils.dokumentflyt.hentForProsjekt.invalidate({ projectId: prosjektId! });
      setSlettId(null);
    },
  });

  const entrepriseListe: EntrepriseItem[] = (entrepriser ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    color: e.color ?? null,
  }));

  const malListe = (maler ?? []).map((m: { id: string; name: string; category: string }) => ({
    id: m.id,
    name: m.name,
    category: m.category,
  }));

  const medlemListe: ProsjektMedlemItem[] = (medlemmer as ProsjektMedlemItem[] | undefined) ?? [];

  if (!prosjektId) return null;

  return (
    <div>
      {/* Verktøylinje */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Dokumentflyt</h2>
        <Button size="sm" onClick={() => setVisOpprett(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Ny dokumentflyt
        </Button>
      </div>

      {/* Innhold */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (dokumentflyter ?? []).length === 0 ? (
        <EmptyState
          title="Ingen dokumentflyter"
          description="Opprett en dokumentflyt for å styre hvem som oppretter og svarer på dokumenter."
        />
      ) : (
        <div className="space-y-4">
          {(dokumentflyter as DokumentflytData[]).map((df) => (
            <DokumentflytKort
              key={df.id}
              dokumentflyt={df}
              entrepriser={entrepriseListe}
              onRediger={() => {
                // TODO: redigeringsmodal
              }}
              onSlett={() => setSlettId(df.id)}
            />
          ))}
        </div>
      )}

      {/* Opprett modal */}
      <OpprettDokumentflytModal
        open={visOpprett}
        onClose={() => setVisOpprett(false)}
        prosjektId={prosjektId}
        entrepriser={entrepriseListe}
        maler={malListe}
        alleMedlemmer={medlemListe}
      />

      {/* Bekreft sletting */}
      <Modal
        open={slettId !== null}
        onClose={() => setSlettId(null)}
        title="Slett dokumentflyt"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Er du sikker på at du vil slette denne dokumentflyten?
            Eksisterende dokumenter påvirkes ikke.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSlettId(null)}>
              Avbryt
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              loading={slettMutation.isPending}
              onClick={() => {
                if (slettId) {
                  slettMutation.mutate({ id: slettId, projectId: prosjektId });
                }
              }}
            >
              Slett
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
