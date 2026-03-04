"use client";

import { useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { RapportObjektProps, FeltVerdi, RapportObjekt } from "./typer";
import { TOM_FELTVERDI } from "./typer";
import { RapportObjektRenderer, DISPLAY_TYPER } from "./RapportObjektRenderer";
import { FeltWrapper } from "./FeltWrapper";

type RadData = Record<string, FeltVerdi>;
type RepeaterVerdi = RadData[];

export function RepeaterObjekt({
  objekt,
  verdi,
  onEndreVerdi,
  leseModus,
  prosjektId,
  barneObjekter,
}: RapportObjektProps) {
  const rader = Array.isArray(verdi) ? (verdi as RepeaterVerdi) : [];
  const barn = barneObjekter ?? [];

  const leggTilRad = useCallback(() => {
    const nyRad: RadData = {};
    for (const b of barn) {
      nyRad[b.id] = { ...TOM_FELTVERDI };
    }
    onEndreVerdi([...rader, nyRad]);
  }, [barn, rader, onEndreVerdi]);

  const fjernRad = useCallback(
    (indeks: number) => {
      onEndreVerdi(rader.filter((_, i) => i !== indeks));
    },
    [rader, onEndreVerdi],
  );

  const oppdaterFeltVerdi = useCallback(
    (radIndeks: number, feltId: string, nyVerdi: unknown) => {
      const oppdatert = rader.map((rad, i) => {
        if (i !== radIndeks) return rad;
        const eksisterende = rad[feltId] ?? { ...TOM_FELTVERDI };
        return { ...rad, [feltId]: { ...eksisterende, verdi: nyVerdi } };
      });
      onEndreVerdi(oppdatert);
    },
    [rader, onEndreVerdi],
  );

  const oppdaterKommentar = useCallback(
    (radIndeks: number, feltId: string, kommentar: string) => {
      const oppdatert = rader.map((rad, i) => {
        if (i !== radIndeks) return rad;
        const eksisterende = rad[feltId] ?? { ...TOM_FELTVERDI };
        return { ...rad, [feltId]: { ...eksisterende, kommentar } };
      });
      onEndreVerdi(oppdatert);
    },
    [rader, onEndreVerdi],
  );

  const leggTilVedlegg = useCallback(
    (radIndeks: number, feltId: string, vedlegg: FeltVerdi["vedlegg"][number]) => {
      const oppdatert = rader.map((rad, i) => {
        if (i !== radIndeks) return rad;
        const eksisterende = rad[feltId] ?? { ...TOM_FELTVERDI };
        return {
          ...rad,
          [feltId]: {
            ...eksisterende,
            vedlegg: [...(eksisterende.vedlegg ?? []), vedlegg],
          },
        };
      });
      onEndreVerdi(oppdatert);
    },
    [rader, onEndreVerdi],
  );

  const fjernVedlegg = useCallback(
    (radIndeks: number, feltId: string, vedleggId: string) => {
      const oppdatert = rader.map((rad, i) => {
        if (i !== radIndeks) return rad;
        const eksisterende = rad[feltId] ?? { ...TOM_FELTVERDI };
        return {
          ...rad,
          [feltId]: {
            ...eksisterende,
            vedlegg: (eksisterende.vedlegg ?? []).filter((v) => v.id !== vedleggId),
          },
        };
      });
      onEndreVerdi(oppdatert);
    },
    [rader, onEndreVerdi],
  );

  if (barn.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
        Ingen felter definert i malen for denne repeateren.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rader.map((rad, radIndeks) => (
        <div
          key={radIndeks}
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Rad {radIndeks + 1}
            </span>
            {!leseModus && (
              <button
                type="button"
                onClick={() => fjernRad(radIndeks)}
                className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {barn.map((barnObjekt) => {
              const feltVerdi = rad[barnObjekt.id] ?? TOM_FELTVERDI;
              const erDisplay = DISPLAY_TYPER.has(barnObjekt.type);

              if (erDisplay) {
                return (
                  <div key={barnObjekt.id}>
                    <RapportObjektRenderer
                      objekt={barnObjekt}
                      verdi={feltVerdi.verdi}
                      onEndreVerdi={(v) =>
                        oppdaterFeltVerdi(radIndeks, barnObjekt.id, v)
                      }
                      leseModus={leseModus}
                      prosjektId={prosjektId}
                    />
                  </div>
                );
              }

              return (
                <FeltWrapper
                  key={barnObjekt.id}
                  objekt={barnObjekt}
                  kommentar={feltVerdi.kommentar}
                  vedlegg={feltVerdi.vedlegg}
                  onEndreKommentar={(k) =>
                    oppdaterKommentar(radIndeks, barnObjekt.id, k)
                  }
                  onLeggTilVedlegg={(v) =>
                    leggTilVedlegg(radIndeks, barnObjekt.id, v)
                  }
                  onFjernVedlegg={(vId) =>
                    fjernVedlegg(radIndeks, barnObjekt.id, vId)
                  }
                  leseModus={leseModus}
                  prosjektId={prosjektId}
                >
                  <RapportObjektRenderer
                    objekt={barnObjekt}
                    verdi={feltVerdi.verdi}
                    onEndreVerdi={(v) =>
                      oppdaterFeltVerdi(radIndeks, barnObjekt.id, v)
                    }
                    leseModus={leseModus}
                    prosjektId={prosjektId}
                  />
                </FeltWrapper>
              );
            })}
          </div>
        </div>
      ))}

      {!leseModus && (
        <button
          type="button"
          onClick={leggTilRad}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          <Plus size={16} />
          Legg til rad
        </button>
      )}
    </div>
  );
}
