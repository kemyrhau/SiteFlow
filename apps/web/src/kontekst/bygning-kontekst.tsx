"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useProsjekt } from "./prosjekt-kontekst";

const BYGNING_STORAGE_KEY = "siteflow-aktiv-bygning";
const TEGNING_STORAGE_KEY = "siteflow-standard-tegning";

interface AktivBygning {
  id: string;
  name: string;
  number: number | null;
}

interface StandardTegning {
  id: string;
  name: string;
}

interface BygningKontekstType {
  aktivBygning: AktivBygning | null;
  velgBygning: (bygning: AktivBygning | null) => void;
  standardTegning: StandardTegning | null;
  settStandardTegning: (tegning: StandardTegning | null) => void;
}

const BygningKontekst = createContext<BygningKontekstType | null>(null);

export function BygningProvider({ children }: { children: ReactNode }) {
  const { prosjektId } = useProsjekt();
  const [aktivBygning, setAktivBygning] = useState<AktivBygning | null>(null);
  const [standardTegning, setStandardTegning] = useState<StandardTegning | null>(null);

  // Les fra localStorage etter mount
  useEffect(() => {
    if (!prosjektId) {
      setAktivBygning(null);
      setStandardTegning(null);
      return;
    }

    try {
      const lagretBygning = localStorage.getItem(BYGNING_STORAGE_KEY);
      if (lagretBygning) {
        const parsed = JSON.parse(lagretBygning) as Record<string, AktivBygning>;
        if (parsed[prosjektId]) {
          setAktivBygning(parsed[prosjektId]);

          // Les standard-tegning for denne bygningen
          const lagretTegning = localStorage.getItem(TEGNING_STORAGE_KEY);
          if (lagretTegning) {
            const parsedTegning = JSON.parse(lagretTegning) as Record<string, StandardTegning>;
            const t = parsedTegning[parsed[prosjektId].id];
            if (t) {
              setStandardTegning(t);
            }
          }
        } else {
          setAktivBygning(null);
          setStandardTegning(null);
        }
      }
    } catch {
      // Ignorer ugyldig localStorage-data
    }
  }, [prosjektId]);

  const velgBygning = useCallback(
    (bygning: AktivBygning | null) => {
      setAktivBygning(bygning);
      setStandardTegning(null);

      if (!prosjektId) return;

      try {
        const lagret = localStorage.getItem(BYGNING_STORAGE_KEY);
        const parsed = lagret ? (JSON.parse(lagret) as Record<string, AktivBygning>) : {};
        if (bygning) {
          parsed[prosjektId] = bygning;
        } else {
          delete parsed[prosjektId];
        }
        localStorage.setItem(BYGNING_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        // Ignorer localStorage-feil
      }

      // Les standard-tegning for ny bygning
      if (bygning) {
        try {
          const lagretTegning = localStorage.getItem(TEGNING_STORAGE_KEY);
          if (lagretTegning) {
            const parsedTegning = JSON.parse(lagretTegning) as Record<string, StandardTegning>;
            const t = parsedTegning[bygning.id];
            if (t) {
              setStandardTegning(t);
            }
          }
        } catch {
          // Ignorer
        }
      }
    },
    [prosjektId],
  );

  const settStandardTegning = useCallback(
    (tegning: StandardTegning | null) => {
      setStandardTegning(tegning);

      if (!aktivBygning) return;

      try {
        const lagret = localStorage.getItem(TEGNING_STORAGE_KEY);
        const parsed = lagret ? (JSON.parse(lagret) as Record<string, StandardTegning>) : {};
        if (tegning) {
          parsed[aktivBygning.id] = tegning;
        } else {
          delete parsed[aktivBygning.id];
        }
        localStorage.setItem(TEGNING_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        // Ignorer localStorage-feil
      }
    },
    [aktivBygning],
  );

  return (
    <BygningKontekst.Provider
      value={{
        aktivBygning,
        velgBygning,
        standardTegning,
        settStandardTegning,
      }}
    >
      {children}
    </BygningKontekst.Provider>
  );
}

export function useBygning() {
  const ctx = useContext(BygningKontekst);
  if (!ctx) {
    throw new Error("useBygning må brukes innenfor BygningProvider");
  }
  return ctx;
}
