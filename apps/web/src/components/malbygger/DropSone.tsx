"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TemplateZone } from "@siteflow/shared";
import { harBetingelse } from "@siteflow/shared";
import { DraggbartFelt, type MalObjekt } from "./DraggbartFelt";
import { BetingelseBjelke } from "./BetingelseBjelke";

interface DropSoneProps {
  zone: TemplateZone;
  label: string;
  objekter: MalObjekt[];
  valgtId: string | null;
  onVelg: (id: string) => void;
  onSlett: (id: string) => void;
  onTilfoyjBetingelse: (parentId: string) => void;
  onOppdaterBetingelseVerdier: (parentId: string, verdier: string[]) => void;
  onFjernBetingelse: (parentId: string) => void;
  onFjernBarnBetingelse: (barnId: string) => void;
}

export function DropSone({
  zone,
  label,
  objekter,
  valgtId,
  onVelg,
  onSlett,
  onTilfoyjBetingelse,
  onOppdaterBetingelseVerdier,
  onFjernBetingelse,
  onFjernBarnBetingelse,
}: DropSoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `sone-${zone}`,
    data: { zone },
  });

  const ider = objekter.map((o) => o.id);

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </h4>
      <SortableContext items={ider} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`min-h-[80px] rounded-lg border-2 border-dashed p-3 transition-colors ${
            isOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 bg-gray-50/50"
          }`}
        >
          {objekter.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Dra felter hit
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {objekter.map((objekt) => {
                const erBarn = harBetingelse(objekt.config);
                const harAktiv = objekt.config.conditionActive === true;

                return (
                  <div key={objekt.id}>
                    <DraggbartFelt
                      objekt={objekt}
                      erValgt={valgtId === objekt.id}
                      erBarnFelt={erBarn}
                      harAktivBetingelse={harAktiv}
                      onClick={() => onVelg(objekt.id)}
                      onSlett={() => onSlett(objekt.id)}
                      onTilfoyjBetingelse={() => onTilfoyjBetingelse(objekt.id)}
                      onFjernBetingelse={() => onFjernBarnBetingelse(objekt.id)}
                    />

                    {/* Betingelsebjelke etter foreldrefelt med aktiv betingelse */}
                    {harAktiv && (
                      <div className="mt-1.5">
                        <BetingelseBjelke
                          parentObjekt={objekt}
                          aktiveVerdier={(objekt.config.conditionValues as string[]) ?? []}
                          onEndreVerdier={(verdier) =>
                            onOppdaterBetingelseVerdier(objekt.id, verdier)
                          }
                          onFjern={() => onFjernBetingelse(objekt.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
