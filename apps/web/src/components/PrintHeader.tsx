export interface PrintHeaderProps {
  prosjektnavn: string;
  prosjektnummer: string;
  eksterntNummer?: string | null;
  sjekklisteTittel: string;
  sjekklisteNummer?: string | null;
  oppretter?: string | null;
  oppretterBruker?: string | null;
  svarer?: string | null;
  vaerTekst?: string | null;
}

export function PrintHeader({
  prosjektnavn,
  prosjektnummer,
  eksterntNummer,
  sjekklisteTittel,
  sjekklisteNummer,
  oppretter,
  oppretterBruker,
  svarer,
  vaerTekst,
}: PrintHeaderProps) {
  const dato = new Date().toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <div className="print-header mb-6 border border-gray-300">
      {/* Rad 1: Prosjekt */}
      <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2">
        <div>
          <p className="text-base font-bold text-gray-900">{prosjektnavn}</p>
          <p className="text-xs text-gray-600">Prosjektnr: {prosjektnummer}</p>
        </div>
        <div className="text-right">
          {eksterntNummer && (
            <p className="text-xs text-gray-600">Eksternt nr: {eksterntNummer}</p>
          )}
          <p className="text-xs text-gray-600">Dato: {dato}</p>
        </div>
      </div>

      {/* Rad 2: Sjekkliste */}
      <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Sjekkliste: {sjekklisteTittel}
          </p>
          {oppretter && (
            <p className="text-xs text-gray-600">
              Oppretter: {oppretter}
              {oppretterBruker && ` (${oppretterBruker})`}
            </p>
          )}
          {svarer && (
            <p className="text-xs text-gray-600">Svarer: {svarer}</p>
          )}
        </div>
        {sjekklisteNummer && (
          <p className="text-sm font-medium text-gray-700">
            Nr: {sjekklisteNummer}
          </p>
        )}
      </div>

      {/* Rad 3: Vær (kun hvis data finnes) */}
      {vaerTekst && (
        <div className="px-4 py-2">
          <p className="text-xs text-gray-600">Vær: {vaerTekst}</p>
        </div>
      )}
    </div>
  );
}
