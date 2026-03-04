export interface RapportObjekt {
  id: string;
  type: string;
  label: string;
  required: boolean;
  config: Record<string, unknown>;
  sortOrder: number;
  parentId: string | null;
}

export interface RapportObjektProps {
  objekt: {
    id: string;
    type: string;
    label: string;
    required: boolean;
    config: Record<string, unknown>;
  };
  verdi: unknown;
  onEndreVerdi: (verdi: unknown) => void;
  leseModus?: boolean;
  prosjektId?: string;
  barneObjekter?: RapportObjekt[];
  /** Sjekkliste-ID for opplastingskø (brukes av RepeaterObjekt) */
  sjekklisteId?: string;
  /** Oppgave-ID for opplastingskø (brukes av RepeaterObjekt) */
  oppgaveIdForKo?: string;
}
