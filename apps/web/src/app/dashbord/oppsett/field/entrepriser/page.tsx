"use client";

import { useState } from "react";
import { useProsjekt } from "@/kontekst/prosjekt-kontekst";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Input,
  Select,
  Modal,
  Spinner,
  EmptyState,
  SearchInput,
} from "@sitedoc/ui";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import { ENTERPRISE_INDUSTRIES, ENTERPRISE_COLORS } from "@sitedoc/shared";
import {
  hentFargeForEntreprise,
  nesteAutoFarge,
  FARGE_MAP,
} from "../_components/entreprise-farger";

/* ------------------------------------------------------------------ */
/*  Fargevelger                                                        */
/* ------------------------------------------------------------------ */

function FargeVelger({
  valgt,
  onChange,
}: {
  valgt: string;
  onChange: (farge: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ENTERPRISE_COLORS.map((farge) => {
        const fargeData = FARGE_MAP[farge];
        return (
          <button
            key={farge}
            type="button"
            onClick={() => onChange(farge)}
            className={`h-6 w-6 rounded-full ${fargeData?.bg ?? "bg-gray-400"} ${
              valgt === farge ? "ring-2 ring-offset-2 ring-gray-400" : ""
            }`}
            title={farge}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Treprikk-meny                                                      */
/* ------------------------------------------------------------------ */

function TreprikkMeny({
  handlinger,
  className = "",
}: {
  handlinger: Array<{
    label: string;
    ikon: React.ReactNode;
    onClick: () => void;
    fare?: boolean;
  }>;
  className?: string;
}) {
  const [apen, setApen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setApen(!apen);
        }}
        className="rounded p-1 text-gray-400 hover:bg-black/10 hover:text-gray-600"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {apen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setApen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {handlinger.map((h) => (
              <button
                key={h.label}
                onClick={() => {
                  setApen(false);
                  h.onClick();
                }}
                className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm ${
                  h.fare
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {h.ikon}
                {h.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typer                                                              */
/* ------------------------------------------------------------------ */

interface EntrepriseData {
  id: string;
  name: string;
  enterpriseNumber: string | null;
  organizationNumber: string | null;
  color: string | null;
  industry: string | null;
  companyName: string | null;
  fargeIndeks: number;
}

/* ------------------------------------------------------------------ */
/*  EntrepriseKort — kompakt visning                                   */
/* ------------------------------------------------------------------ */

function EntrepriseKort({
  entreprise,
  onRediger,
  onSlett,
}: {
  entreprise: EntrepriseData;
  onRediger: () => void;
  onSlett: () => void;
}) {
  const farge = hentFargeForEntreprise(entreprise.color, entreprise.fargeIndeks);

  const headerTekst = [
    entreprise.enterpriseNumber,
    entreprise.name,
  ].filter(Boolean).join(" ")
    + (entreprise.companyName ? `, ${entreprise.companyName}` : "");

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-white">
      <div className={`flex items-center rounded-lg ${farge.bg} ${farge.border} border`}>
        <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
          <Building2 className={`h-4 w-4 ${farge.tekst}`} />
          <span className={`text-sm font-semibold ${farge.tekst}`}>
            {headerTekst}
          </span>
          {entreprise.industry && (
            <span className={`text-xs ${farge.tekst} opacity-70`}>
              · {entreprise.industry}
            </span>
          )}
          {entreprise.organizationNumber && (
            <span className={`text-xs ${farge.tekst} opacity-50`}>
              · Org. {entreprise.organizationNumber}
            </span>
          )}
        </div>

        <div className="mr-2">
          <TreprikkMeny
            className="[&>button]:text-white [&>button]:hover:bg-white/20"
            handlinger={[
              {
                label: "Rediger entreprise",
                ikon: <Pencil className="h-4 w-4 text-gray-400" />,
                onClick: onRediger,
              },
              {
                label: "Slett entreprise",
                ikon: <Trash2 className="h-4 w-4 text-red-400" />,
                onClick: onSlett,
                fare: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EntrepriseVeiviser                                                 */
/* ------------------------------------------------------------------ */

type VeiviserMetode = "kopier" | "importer" | "tom";

function EntrepriseVeiviser({
  open,
  onClose,
  prosjektId,
  entrepriser,
  prosjekter,
  onOpprettet,
}: {
  open: boolean;
  onClose: () => void;
  prosjektId: string;
  entrepriser: EntrepriseData[];
  prosjekter: Array<{ id: string; name: string; projectNumber: string }>;
  onOpprettet: () => void;
}) {
  const [steg, setSteg] = useState(1);
  const [metode, setMetode] = useState<VeiviserMetode>("tom");

  const [kopierEntrepriseId, setKopierEntrepriseId] = useState("");
  const [importProsjektId, setImportProsjektId] = useState("");
  const [importEntrepriseId, setImportEntrepriseId] = useState("");
  const [nyNavn, setNyNavn] = useState("");
  const [nyNummer, setNyNummer] = useState("");
  const [nyBransje, setNyBransje] = useState("");
  const [nyFirma, setNyFirma] = useState("");

  const { data: importEntrepriser } =
    trpc.entreprise.hentForProsjekt.useQuery(
      { projectId: importProsjektId },
      { enabled: !!importProsjektId && metode === "importer" },
    );

  const utils = trpc.useUtils();

  const opprettMutation = trpc.entreprise.opprett.useMutation({
    onSuccess: () => {
      utils.entreprise.hentForProsjekt.invalidate({ projectId: prosjektId });
      onOpprettet();
      lukkOgNullstill();
    },
  });

  const kopierMutation = trpc.entreprise.kopier.useMutation({
    onSuccess: () => {
      utils.entreprise.hentForProsjekt.invalidate({ projectId: prosjektId });
      onOpprettet();
      lukkOgNullstill();
    },
  });

  function lukkOgNullstill() {
    setSteg(1);
    setMetode("tom");
    setKopierEntrepriseId("");
    setImportProsjektId("");
    setImportEntrepriseId("");
    setNyNavn("");
    setNyNummer("");
    setNyBransje("");
    setNyFirma("");
    onClose();
  }

  const erLagrer = opprettMutation.isPending || kopierMutation.isPending;
  const andreProsjekter = prosjekter.filter((p) => p.id !== prosjektId);
  const harAndreProsjekter = andreProsjekter.length > 0;
  const harEntrepriser = entrepriser.length > 0;

  // Synkroniser ved åpning
  const [forrigeOpen, setForrigeOpen] = useState(false);
  if (open && !forrigeOpen) {
    setSteg(1);
    setMetode("tom");
    setKopierEntrepriseId("");
    setImportProsjektId("");
    setImportEntrepriseId("");
    setNyNavn("");
    setNyNummer("");
    setNyBransje("");
    setNyFirma("");
  }
  if (open !== forrigeOpen) setForrigeOpen(open);

  function handleNeste() {
    if (steg === 1) {
      if (metode === "kopier" && kopierEntrepriseId) {
        kopierMutation.mutate({
          sourceEnterpriseId: kopierEntrepriseId,
          targetProjectId: prosjektId,
          memberIds: [],
        });
        return;
      }
      setSteg(2);
      return;
    }

    if (steg === 2) {
      if (metode === "importer" && importEntrepriseId) {
        kopierMutation.mutate({
          sourceEnterpriseId: importEntrepriseId,
          targetProjectId: prosjektId,
          memberIds: [],
        });
        return;
      }
      if (metode === "tom" && nyNavn.trim()) {
        opprettMutation.mutate({
          name: nyNavn.trim(),
          projectId: prosjektId,
          enterpriseNumber: nyNummer.trim() || undefined,
          color: nesteAutoFarge(entrepriser.map((e) => e.color)),
          industry: nyBransje.trim() || undefined,
          companyName: nyFirma.trim() || undefined,
          memberIds: [],
        });
        return;
      }
    }
  }

  const kanGaVidere = (() => {
    if (steg === 1) {
      if (metode === "kopier") return !!kopierEntrepriseId;
      if (metode === "importer") return harAndreProsjekter;
      return true;
    }
    if (steg === 2) {
      if (metode === "importer") return !!importEntrepriseId;
      if (metode === "tom") return !!nyNavn.trim();
    }
    return false;
  })();

  const knappTekst = (() => {
    if (metode === "kopier" && steg === 1) return "Kopier";
    if (metode === "importer" && steg === 2) return "Importer";
    if (metode === "tom" && steg === 2) return "Opprett";
    return "Neste";
  })();

  return (
    <Modal open={open} onClose={lukkOgNullstill} title="Legg til entreprise">
      <div className="flex flex-col gap-5">
        {steg === 1 && (
          <>
            <p className="text-sm text-gray-600">
              Velg hvordan du vil legge til en entreprise:
            </p>
            <div className="flex flex-col gap-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                  metode === "kopier" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                } ${!harEntrepriser ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="metode"
                  value="kopier"
                  checked={metode === "kopier"}
                  onChange={() => setMetode("kopier")}
                  disabled={!harEntrepriser}
                  className="mt-0.5 accent-sitedoc-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Kopier fra nåværende prosjekt
                  </span>
                  {metode === "kopier" && harEntrepriser && (
                    <div className="mt-2">
                      <Select
                        options={[
                          { value: "", label: "Velg entreprise..." },
                          ...entrepriser.map((e) => ({ value: e.id, label: e.name })),
                        ]}
                        value={kopierEntrepriseId}
                        onChange={(e) => setKopierEntrepriseId(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                  metode === "importer" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                } ${!harAndreProsjekter ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="metode"
                  value="importer"
                  checked={metode === "importer"}
                  onChange={() => setMetode("importer")}
                  disabled={!harAndreProsjekter}
                  className="mt-0.5 accent-sitedoc-primary"
                />
                <span className="text-sm font-medium text-gray-900">
                  Importer fra annet prosjekt
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                  metode === "tom" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="metode"
                  value="tom"
                  checked={metode === "tom"}
                  onChange={() => setMetode("tom")}
                  className="mt-0.5 accent-sitedoc-primary"
                />
                <span className="text-sm font-medium text-gray-900">
                  Opprett tom entreprise
                </span>
              </label>
            </div>
          </>
        )}

        {steg === 2 && metode === "importer" && (
          <>
            <Select
              label="Velg prosjekt"
              options={[
                { value: "", label: "Velg prosjekt..." },
                ...andreProsjekter.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.projectNumber})`,
                })),
              ]}
              value={importProsjektId}
              onChange={(e) => {
                setImportProsjektId(e.target.value);
                setImportEntrepriseId("");
              }}
            />
            {importProsjektId && (
              <Select
                label="Velg entreprise"
                options={[
                  { value: "", label: "Velg entreprise..." },
                  ...(importEntrepriser?.map((e) => ({
                    value: e.id,
                    label: e.name,
                  })) ?? []),
                ]}
                value={importEntrepriseId}
                onChange={(e) => setImportEntrepriseId(e.target.value)}
              />
            )}
          </>
        )}

        {steg === 2 && metode === "tom" && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Entreprise <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={nyNummer}
                  onChange={(e) => setNyNummer(e.target.value)}
                  placeholder="Nr."
                  className="w-[60px] rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={nyNavn}
                  onChange={(e) => setNyNavn(e.target.value)}
                  placeholder="F.eks. Tømrer"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bransje</label>
              <input
                list="bransje-liste-ny"
                placeholder="Velg eller skriv inn bransje..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={nyBransje}
                onChange={(e) => setNyBransje(e.target.value)}
              />
              <datalist id="bransje-liste-ny">
                {ENTERPRISE_INDUSTRIES.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <Input
              label="Firma"
              placeholder="Firmanavn"
              value={nyFirma}
              onChange={(e) => setNyFirma(e.target.value)}
            />
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={lukkOgNullstill}>
            Avbryt
          </Button>
          {steg > 1 && (
            <Button variant="secondary" type="button" onClick={() => setSteg(1)}>
              Forrige
            </Button>
          )}
          <Button onClick={handleNeste} loading={erLagrer} disabled={!kanGaVidere}>
            {knappTekst}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Hovedside                                                          */
/* ------------------------------------------------------------------ */

export default function EntrepriserSide() {
  const { prosjektId, prosjekter } = useProsjekt();
  const utils = trpc.useUtils();

  const [sok, setSok] = useState("");
  const [visVeiviser, setVisVeiviser] = useState(false);

  // Rediger entreprise
  const [redigerEntrepriseId, setRedigerEntrepriseId] = useState<string | null>(null);
  const [redigerNavn, setRedigerNavn] = useState("");
  const [redigerNummer, setRedigerNummer] = useState("");
  const [redigerOrgNummer, setRedigerOrgNummer] = useState("");
  const [redigerFarge, setRedigerFarge] = useState("");
  const [redigerBransje, setRedigerBransje] = useState("");
  const [redigerFirma, setRedigerFirma] = useState("");
  const [slettEntrepriseId, setSlettEntrepriseId] = useState<string | null>(null);

  // Data
  const { data: entrepriser, isLoading } = trpc.entreprise.hentForProsjekt.useQuery(
    { projectId: prosjektId! },
    { enabled: !!prosjektId },
  );

  const oppdaterMutation = trpc.entreprise.oppdater.useMutation({
    onSuccess: () => {
      utils.entreprise.hentForProsjekt.invalidate({ projectId: prosjektId! });
      setRedigerEntrepriseId(null);
    },
  });

  const slettMutation = trpc.entreprise.slett.useMutation({
    onSuccess: () => {
      utils.entreprise.hentForProsjekt.invalidate({ projectId: prosjektId! });
      setSlettEntrepriseId(null);
    },
  });

  function handleRediger(id: string) {
    const ent = entrepriser?.find((e) => e.id === id);
    if (!ent) return;
    setRedigerEntrepriseId(id);
    setRedigerNavn(ent.name);
    setRedigerNummer(ent.enterpriseNumber ?? "");
    setRedigerOrgNummer(ent.organizationNumber ?? "");
    setRedigerFarge(ent.color ?? "");
    setRedigerBransje(ent.industry ?? "");
    setRedigerFirma(ent.companyName ?? "");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const entrepriseData: EntrepriseData[] = entrepriser?.map((e, i) => ({
    id: e.id,
    name: e.name,
    enterpriseNumber: e.enterpriseNumber ?? null,
    organizationNumber: e.organizationNumber ?? null,
    color: e.color ?? null,
    industry: e.industry ?? null,
    companyName: e.companyName ?? null,
    fargeIndeks: i,
  })) ?? [];

  const filtrert = sok
    ? entrepriseData.filter((e) => {
        const s = sok.toLowerCase();
        return (
          e.name.toLowerCase().includes(s) ||
          e.companyName?.toLowerCase().includes(s) ||
          e.enterpriseNumber?.toLowerCase().includes(s) ||
          e.industry?.toLowerCase().includes(s)
        );
      })
    : entrepriseData;

  return (
    <div>
      {/* Verktøylinje */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Entrepriser</h2>
        <Button size="sm" onClick={() => setVisVeiviser(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Legg til entreprise
        </Button>
      </div>

      {/* Søk */}
      {entrepriseData.length > 0 && (
        <div className="mb-4">
          <SearchInput
            verdi={sok}
            onChange={setSok}
            placeholder="Søk i entrepriser"
            className="w-72"
          />
        </div>
      )}

      {/* Entrepriser */}
      {filtrert.length === 0 ? (
        <EmptyState
          title="Ingen entrepriser"
          description="Legg til entrepriser for prosjektet. Dokumentflyt konfigureres under Dokumentflyt-fanen."
          action={
            <Button onClick={() => setVisVeiviser(true)}>
              Legg til entreprise
            </Button>
          }
        />
      ) : (
        <div>
          {filtrert.map((ent) => (
            <EntrepriseKort
              key={ent.id}
              entreprise={ent}
              onRediger={() => handleRediger(ent.id)}
              onSlett={() => setSlettEntrepriseId(ent.id)}
            />
          ))}
        </div>
      )}

      {/* Veiviser */}
      <EntrepriseVeiviser
        open={visVeiviser}
        onClose={() => setVisVeiviser(false)}
        prosjektId={prosjektId!}
        entrepriser={entrepriseData}
        prosjekter={prosjekter}
        onOpprettet={() => {}}
      />

      {/* Rediger entreprise */}
      <Modal
        open={redigerEntrepriseId !== null}
        onClose={() => setRedigerEntrepriseId(null)}
        title="Rediger entreprise"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!redigerEntrepriseId || !redigerNavn.trim()) return;
            oppdaterMutation.mutate({
              id: redigerEntrepriseId,
              name: redigerNavn.trim(),
              enterpriseNumber: redigerNummer.trim() || undefined,
              organizationNumber: redigerOrgNummer.trim() || undefined,
              color: redigerFarge || undefined,
              industry: redigerBransje.trim() || undefined,
              companyName: redigerFirma.trim() || undefined,
            });
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Entreprise <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <FargeVelger valgt={redigerFarge} onChange={setRedigerFarge} />
              <input
                type="text"
                value={redigerNummer}
                onChange={(e) => setRedigerNummer(e.target.value)}
                placeholder="Nr."
                className="w-[60px] rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={redigerNavn}
                onChange={(e) => setRedigerNavn(e.target.value)}
                placeholder="Navn"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bransje</label>
            <input
              list="bransje-liste-rediger"
              placeholder="Velg eller skriv inn bransje..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={redigerBransje}
              onChange={(e) => setRedigerBransje(e.target.value)}
            />
            <datalist id="bransje-liste-rediger">
              {ENTERPRISE_INDUSTRIES.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <Input
            label="Firma"
            placeholder="Firmanavn"
            value={redigerFirma}
            onChange={(e) => setRedigerFirma(e.target.value)}
          />

          <Input
            label="Organisasjonsnummer"
            placeholder="Valgfritt"
            value={redigerOrgNummer}
            onChange={(e) => setRedigerOrgNummer(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={oppdaterMutation.isPending}>
              Lagre
            </Button>
            <Button type="button" variant="secondary" onClick={() => setRedigerEntrepriseId(null)}>
              Avbryt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Slett entreprise */}
      <Modal
        open={slettEntrepriseId !== null}
        onClose={() => setSlettEntrepriseId(null)}
        title="Slett entreprise"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Er du sikker på at du vil slette denne entreprisen?
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              loading={slettMutation.isPending}
              onClick={() => {
                if (!slettEntrepriseId) return;
                slettMutation.mutate({ id: slettEntrepriseId });
              }}
            >
              Slett
            </Button>
            <Button variant="secondary" onClick={() => setSlettEntrepriseId(null)}>
              Avbryt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
