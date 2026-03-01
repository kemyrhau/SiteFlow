"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

const STORAGE_KEY = "siteflow-valgt-prosjekt";

interface Prosjekt {
  id: string;
  name: string;
  projectNumber: string;
  status: string;
  description: string | null;
  address: string | null;
}

interface ProsjektKontekstType {
  valgtProsjekt: Prosjekt | null;
  prosjekter: Prosjekt[];
  isLoading: boolean;
  velgProsjekt: (id: string) => void;
  prosjektId: string | null;
}

const ProsjektKontekst = createContext<ProsjektKontekstType | null>(null);

function hentLagretProsjektId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function ProsjektProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ prosjektId?: string }>();
  const router = useRouter();
  const urlProsjektId = params.prosjektId ?? null;

  // Bruk URL-param hvis tilgjengelig, ellers bruk lagret verdi
  const [lagretProsjektId, setLagretProsjektId] = useState<string | null>(
    () => hentLagretProsjektId(),
  );

  const prosjektId = urlProsjektId ?? lagretProsjektId;

  // Synkroniser: når URL har prosjektId → lagre det
  useEffect(() => {
    if (urlProsjektId) {
      setLagretProsjektId(urlProsjektId);
      localStorage.setItem(STORAGE_KEY, urlProsjektId);
    }
  }, [urlProsjektId]);

  const { data: prosjekter, isLoading: lasterProsjekter } =
    trpc.prosjekt.hentAlle.useQuery();

  const { data: valgtProsjekt, isLoading: lasterValgt } =
    trpc.prosjekt.hentMedId.useQuery(
      { id: prosjektId! },
      { enabled: !!prosjektId, retry: false },
    );

  function velgProsjekt(id: string) {
    setLagretProsjektId(id);
    localStorage.setItem(STORAGE_KEY, id);
    router.push(`/dashbord/${id}`);
  }

  return (
    <ProsjektKontekst.Provider
      value={{
        valgtProsjekt: valgtProsjekt ?? null,
        prosjekter: prosjekter ?? [],
        isLoading: lasterProsjekter || lasterValgt,
        velgProsjekt,
        prosjektId,
      }}
    >
      {children}
    </ProsjektKontekst.Provider>
  );
}

export function useProsjekt() {
  const ctx = useContext(ProsjektKontekst);
  if (!ctx) {
    throw new Error("useProsjekt må brukes innenfor ProsjektProvider");
  }
  return ctx;
}
