"use client";

import { SearchInput, Spinner } from "@siteflow/ui";
import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useBygning } from "@/kontekst/bygning-kontekst";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react";

export function TegningerPanel() {
  const params = useParams<{ prosjektId: string }>();
  const [sok, setSok] = useState("");
  const [utvidede, setUtvidede] = useState<Set<string>>(new Set());
  const { aktivBygning, velgBygning, standardTegning, settStandardTegning } =
    useBygning();

  const { data: bygninger, isLoading } =
    trpc.bygning.hentForProsjekt.useQuery(
      { projectId: params.prosjektId },
      { enabled: !!params.prosjektId },
    );

  function toggleUtvid(bygningId: string) {
    setUtvidede((prev) => {
      const ny = new Set(prev);
      if (ny.has(bygningId)) {
        ny.delete(bygningId);
      } else {
        ny.add(bygningId);
      }
      return ny;
    });
  }

  function handleVelgBygning(bygning: {
    id: string;
    name: string;
    number: number | null;
  }) {
    if (aktivBygning?.id === bygning.id) {
      velgBygning(null);
    } else {
      velgBygning(bygning);
      setUtvidede((prev) => new Set(prev).add(bygning.id));
    }
  }

  function handleVelgTegning(
    tegning: { id: string; name: string },
    bygningId: string,
  ) {
    if (standardTegning?.id === tegning.id) {
      settStandardTegning(null);
    } else {
      settStandardTegning(tegning);
    }
    if (aktivBygning?.id !== bygningId) {
      const byg = bygninger?.find((b) => b.id === bygningId);
      if (byg) {
        velgBygning({ id: byg.id, name: byg.name, number: byg.number });
        setUtvidede((prev) => new Set(prev).add(bygningId));
      }
    }
  }

  const sokLower = sok.toLowerCase();
  const filtrerte = bygninger?.filter((b) => {
    if (!sok) return true;
    const bygningMatch =
      b.name.toLowerCase().includes(sokLower) ||
      (b.number && String(b.number).includes(sok));
    const tegningMatch = b.drawings.some((t) =>
      t.name.toLowerCase().includes(sokLower),
    );
    return bygningMatch || tegningMatch;
  });

  // Auto-utvid aktiv bygning
  if (
    aktivBygning &&
    !utvidede.has(aktivBygning.id) &&
    filtrerte?.some((b) => b.id === aktivBygning.id)
  ) {
    setUtvidede((prev) => new Set(prev).add(aktivBygning.id));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        verdi={sok}
        onChange={setSok}
        placeholder="Søk lokasjoner..."
      />

      <div className="flex flex-col gap-0.5">
        {/* Alle lokasjoner */}
        <button
          onClick={() => velgBygning(null)}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
            !aktivBygning
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <MapPin className="h-4 w-4 shrink-0" />
          <span>Alle lokasjoner</span>
        </button>

        {/* Bygningsliste */}
        {filtrerte?.map((bygning) => {
          const erAktiv = aktivBygning?.id === bygning.id;
          const erUtvidet = utvidede.has(bygning.id);
          const antallTegninger = bygning._count.drawings;

          const filtrerTegninger = sok
            ? bygning.drawings.filter((t) =>
                t.name.toLowerCase().includes(sokLower),
              )
            : bygning.drawings;

          return (
            <div key={bygning.id}>
              <button
                onClick={() =>
                  handleVelgBygning({
                    id: bygning.id,
                    name: bygning.name,
                    number: bygning.number,
                  })
                }
                className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  erAktiv
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUtvid(bygning.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      toggleUtvid(bygning.id);
                    }
                  }}
                  className="shrink-0 p-0.5 rounded hover:bg-gray-200"
                >
                  {erUtvidet ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </span>
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate text-left flex-1">
                  {bygning.number ? `${bygning.number}. ` : ""}
                  {bygning.name}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  ({antallTegninger})
                </span>
              </button>

              {erUtvidet && filtrerTegninger.length > 0 && (
                <div className="ml-6 flex flex-col gap-0.5 mt-0.5">
                  {filtrerTegninger.map((tegning) => {
                    const erStandard = standardTegning?.id === tegning.id;
                    return (
                      <button
                        key={tegning.id}
                        onClick={() =>
                          handleVelgTegning(tegning, bygning.id)
                        }
                        className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
                          erStandard
                            ? "text-blue-700 bg-blue-50/50"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {erStandard ? (
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                        ) : (
                          <span className="w-3 shrink-0" />
                        )}
                        <span className="truncate text-left">
                          {tegning.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {erUtvidet && filtrerTegninger.length === 0 && (
                <div className="ml-6 px-2 py-1 text-xs text-gray-400">
                  Ingen tegninger
                </div>
              )}
            </div>
          );
        })}

        {filtrerte?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Building2 className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">
              {sok ? "Ingen treff" : "Ingen lokasjoner"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
