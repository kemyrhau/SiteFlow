import { useRef, useEffect, type ReactNode } from "react";

interface KolonneDef<T> {
  id: string;
  header: string;
  celle: (rad: T) => ReactNode;
  bredde?: string;
}

interface TableProps<T> {
  kolonner: KolonneDef<T>[];
  data: T[];
  radNokkel: (rad: T) => string;
  onRadKlikk?: (rad: T) => void;
  tomMelding?: string;
  velgbar?: boolean;
  valgteRader?: Set<string>;
  onValgEndring?: (valgteIder: Set<string>) => void;
}

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  );
}

export function Table<T>({
  kolonner,
  data,
  radNokkel,
  onRadKlikk,
  tomMelding = "Ingen data å vise",
  velgbar,
  valgteRader,
  onValgEndring,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        {tomMelding}
      </div>
    );
  }

  const alleNokler = data.map(radNokkel);
  const antallValgte = valgteRader?.size ?? 0;
  const alleValgt = antallValgte === data.length && data.length > 0;
  const noenValgt = antallValgte > 0 && !alleValgt;

  function toggleAlleRader() {
    if (!onValgEndring) return;
    if (alleValgt) {
      onValgEndring(new Set());
    } else {
      onValgEndring(new Set(alleNokler));
    }
  }

  function toggleRad(nokkel: string) {
    if (!onValgEndring || !valgteRader) return;
    const nyttSett = new Set(valgteRader);
    if (nyttSett.has(nokkel)) {
      nyttSett.delete(nokkel);
    } else {
      nyttSett.add(nokkel);
    }
    onValgEndring(nyttSett);
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
          <tr>
            {velgbar && (
              <th className="w-10 px-3 py-3">
                <IndeterminateCheckbox
                  checked={alleValgt}
                  indeterminate={noenValgt}
                  onChange={toggleAlleRader}
                />
              </th>
            )}
            {kolonner.map((kol) => (
              <th
                key={kol.id}
                className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
                style={kol.bredde ? { width: kol.bredde } : undefined}
              >
                {kol.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((rad) => {
            const nokkel = radNokkel(rad);
            const erValgt = valgteRader?.has(nokkel) ?? false;
            return (
              <tr
                key={nokkel}
                onClick={() => onRadKlikk?.(rad)}
                className={`transition-colors ${
                  erValgt ? "bg-blue-50" : ""
                } ${
                  onRadKlikk
                    ? "cursor-pointer hover:bg-blue-50"
                    : ""
                }`}
              >
                {velgbar && (
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={erValgt}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleRad(nokkel);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {kolonner.map((kol) => (
                  <td key={kol.id} className="px-4 py-3">
                    {kol.celle(rad)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
