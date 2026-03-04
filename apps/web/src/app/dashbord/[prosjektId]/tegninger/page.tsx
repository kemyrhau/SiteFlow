"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useBygning } from "@/kontekst/bygning-kontekst";
import { Button, Select, Modal, Spinner } from "@siteflow/ui";
import { Map, FileText, MapPin, Plus } from "lucide-react";

interface Markør {
  id: string;
  x: number;
  y: number;
  label: string;
  status: string;
}

export default function TegningerSide() {
  const params = useParams<{ prosjektId: string }>();
  const router = useRouter();
  const { standardTegning, aktivBygning } = useBygning();
  const utils = trpc.useUtils();
  const bildeRef = useRef<HTMLImageElement>(null);

  // Ny markør-plassering
  const [nyMarkør, setNyMarkør] = useState<{ x: number; y: number } | null>(null);
  const [visOpprettModal, setVisOpprettModal] = useState(false);
  const [opprettType, setOpprettType] = useState<"oppgave" | "sjekkliste">("oppgave");

  // Skjema-state
  const [valgtMal, setValgtMal] = useState("");
  const [valgtOppretter, setValgtOppretter] = useState("");
  const [valgtSvarer, setValgtSvarer] = useState("");
  const [tittel, setTittel] = useState("");

  const { data: tegning, isLoading } = trpc.tegning.hentMedId.useQuery(
    { id: standardTegning?.id ?? "" },
    { enabled: !!standardTegning?.id },
  );

  // Hent eksisterende oppgavemarkører for denne tegningen
  const { data: oppgaveMarkører } = trpc.oppgave.hentForTegning.useQuery(
    { drawingId: standardTegning?.id ?? "" },
    { enabled: !!standardTegning?.id },
  );

  const { data: maler } = trpc.mal.hentForProsjekt.useQuery(
    { projectId: params.prosjektId },
    { enabled: visOpprettModal },
  );
  const { data: mineEntrepriser } = trpc.medlem.hentMineEntrepriser.useQuery(
    { projectId: params.prosjektId },
    { enabled: visOpprettModal },
  );
  const { data: entrepriser } = trpc.entreprise.hentForProsjekt.useQuery(
    { projectId: params.prosjektId },
    { enabled: visOpprettModal },
  );

  const opprettOppgaveMutation = trpc.oppgave.opprett.useMutation({
    onSuccess: (_data: unknown, _vars: { title: string }) => {
      utils.oppgave.hentForTegning.invalidate({ drawingId: standardTegning?.id ?? "" });
      lukkModal();
    },
  });

  const opprettSjekklisteMutation = trpc.sjekkliste.opprett.useMutation({
    onSuccess: () => {
      lukkModal();
    },
  });

  function lukkModal() {
    setVisOpprettModal(false);
    setNyMarkør(null);
    setValgtMal("");
    setValgtOppretter("");
    setValgtSvarer("");
    setTittel("");
  }

  const handleBildeKlikk = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNyMarkør({ x, y });
    setVisOpprettModal(true);
  }, []);

  function handleOpprett(e: React.FormEvent) {
    e.preventDefault();
    if (!valgtMal || !valgtOppretter || !valgtSvarer) return;

    if (opprettType === "oppgave") {
      opprettOppgaveMutation.mutate({
        templateId: valgtMal,
        creatorEnterpriseId: valgtOppretter,
        responderEnterpriseId: valgtSvarer,
        title: tittel || "Ny oppgave",
        drawingId: standardTegning?.id,
        positionX: nyMarkør?.x,
        positionY: nyMarkør?.y,
      });
    } else {
      opprettSjekklisteMutation.mutate({
        templateId: valgtMal,
        creatorEnterpriseId: valgtOppretter,
        responderEnterpriseId: valgtSvarer,
        buildingId: aktivBygning?.id,
        drawingId: standardTegning?.id,
      });
    }
  }

  // Markører fra eksisterende oppgaver
  const markører: Markør[] = (oppgaveMarkører ?? [])
    .filter((o) => o.positionX != null && o.positionY != null)
    .map((o) => ({
      id: o.id,
      x: o.positionX!,
      y: o.positionY!,
      label: o.template.prefix
        ? `${o.template.prefix}-${String(o.number ?? 0).padStart(3, "0")}`
        : o.title,
      status: o.status,
    }));

  // Filtrerte maler basert på type
  const filtrerMaler = (maler as Array<{ id: string; name: string; category: string }> | undefined)
    ?.filter((m) => m.category === opprettType) ?? [];

  const oppretterAlternativer = (mineEntrepriser ?? []).map((e) => ({ value: e.id, label: e.name }));
  const svarerAlternativer = (entrepriser ?? []).map((e) => ({ value: e.id, label: e.name }));

  // Ingen tegning valgt
  if (!standardTegning) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Map className="mx-auto mb-4 h-16 w-16 text-gray-200" />
          <p className="text-lg font-medium text-gray-400">
            {aktivBygning
              ? "Velg en tegning i panelet"
              : "Velg en lokasjon og tegning i panelet"}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tegning) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">Tegningen ble ikke funnet</p>
      </div>
    );
  }

  const fileUrl = tegning.fileUrl ? `/api${tegning.fileUrl}` : null;
  const fileType = tegning.fileType ?? "";
  const erBilde = ["png", "jpg", "jpeg"].includes(fileType);
  const erLaster = opprettOppgaveMutation.isPending || opprettSjekklisteMutation.isPending;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-2">
        <FileText className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-900">{tegning.name}</span>
        {tegning.drawingNumber && (
          <span className="text-sm text-gray-500">({tegning.drawingNumber})</span>
        )}
        {tegning.revision && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
            Rev. {tegning.revision}
          </span>
        )}
        <div className="flex-1" />
        <span className="text-xs text-gray-400">
          Klikk i tegningen for å opprette oppgave
        </span>
      </div>

      {/* Tegningsvisning med markører */}
      {fileUrl ? (
        erBilde ? (
          <div className="flex-1 overflow-auto bg-gray-100">
            <div
              className="relative cursor-crosshair"
              onClick={handleBildeKlikk}
            >
              <img
                ref={bildeRef}
                src={fileUrl}
                alt={tegning.name}
                className="block w-full"
                crossOrigin="anonymous"
                draggable={false}
              />

              {/* Eksisterende markører */}
              {markører.map((m) => (
                <button
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashbord/${params.prosjektId}/oppgaver?oppgave=${m.id}`);
                  }}
                  className="group absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                  title={m.label}
                >
                  <MapPin className="h-6 w-6 fill-red-500 text-red-700 drop-shadow-md transition-transform group-hover:scale-125" />
                  <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {m.label}
                  </span>
                </button>
              ))}

              {/* Ny markør (klikket posisjon) */}
              {nyMarkør && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
                  style={{ left: `${nyMarkør.x}%`, top: `${nyMarkør.y}%` }}
                >
                  <MapPin className="h-7 w-7 fill-blue-500 text-blue-700 drop-shadow-lg animate-bounce" />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PDF — iframe med klikkbar overlay */
          <div className="relative flex-1">
            <iframe
              src={fileUrl}
              title={tegning.name}
              className="h-full w-full border-0"
            />
            <div
              className="absolute inset-0 cursor-crosshair"
              onClick={handleBildeKlikk}
              style={{ background: "transparent" }}
            />
            {/* Markører over PDF */}
            {markører.map((m) => (
              <button
                key={m.id}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashbord/${params.prosjektId}/oppgaver?oppgave=${m.id}`);
                }}
                className="group absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                title={m.label}
              >
                <MapPin className="h-6 w-6 fill-red-500 text-red-700 drop-shadow-md" />
              </button>
            ))}
            {nyMarkør && (
              <div
                className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
                style={{ left: `${nyMarkør.x}%`, top: `${nyMarkør.y}%` }}
              >
                <MapPin className="h-7 w-7 fill-blue-500 text-blue-700 drop-shadow-lg animate-bounce" />
              </div>
            )}
          </div>
        )
      ) : (
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <p className="text-gray-400">Ingen fil tilgjengelig</p>
        </div>
      )}

      {/* Opprett modal */}
      <Modal
        open={visOpprettModal}
        onClose={lukkModal}
        title="Opprett fra tegning"
      >
        <form onSubmit={handleOpprett} className="flex flex-col gap-4">
          {/* Type-valg */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setOpprettType("oppgave"); setValgtMal(""); }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                opprettType === "oppgave"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Oppgave
            </button>
            <button
              type="button"
              onClick={() => { setOpprettType("sjekkliste"); setValgtMal(""); }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                opprettType === "sjekkliste"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sjekkliste
            </button>
          </div>

          <Select
            label="Mal"
            options={filtrerMaler.map((m) => ({ value: m.id, label: m.name }))}
            value={valgtMal}
            onChange={(e) => setValgtMal(e.target.value)}
            placeholder="Velg mal..."
          />

          {opprettType === "oppgave" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tittel</label>
              <input
                type="text"
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Beskriv oppgaven..."
              />
            </div>
          )}

          <Select
            label="Oppretter-entreprise"
            options={oppretterAlternativer}
            value={valgtOppretter}
            onChange={(e) => setValgtOppretter(e.target.value)}
            placeholder="Velg entreprise..."
          />

          <Select
            label="Ansvarlig entreprise (svarer)"
            options={svarerAlternativer}
            value={valgtSvarer}
            onChange={(e) => setValgtSvarer(e.target.value)}
            placeholder="Velg entreprise..."
          />

          {nyMarkør && (
            <p className="text-xs text-gray-400">
              Posisjon: {nyMarkør.x.toFixed(1)}%, {nyMarkør.y.toFixed(1)}%
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={erLaster}>
              <Plus className="mr-1.5 h-4 w-4" />
              Opprett {opprettType === "oppgave" ? "oppgave" : "sjekkliste"}
            </Button>
            <Button type="button" variant="secondary" onClick={lukkModal}>
              Avbryt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
