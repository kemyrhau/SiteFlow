import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";

const VALGT_PROSJEKT_KEY = "siteflow_valgt_prosjekt";

async function lagreVerdi(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
  }
}

async function hentVerdi(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

interface ProsjektKontekstType {
  valgtProsjektId: string | null;
  byttProsjekt: (id: string) => void;
  lasterProsjektId: boolean;
}

const ProsjektContext = createContext<ProsjektKontekstType>({
  valgtProsjektId: null,
  byttProsjekt: () => {},
  lasterProsjektId: true,
});

export function useProsjekt() {
  return useContext(ProsjektContext);
}

export function ProsjektProvider({ children }: { children: ReactNode }) {
  const [valgtProsjektId, setValgtProsjektId] = useState<string | null>(null);
  const [lasterProsjektId, setLasterProsjektId] = useState(true);

  // Last lagret prosjekt-ID ved oppstart
  useEffect(() => {
    async function lastLagretProsjekt() {
      try {
        const lagretId = await hentVerdi(VALGT_PROSJEKT_KEY);
        if (lagretId) {
          setValgtProsjektId(lagretId);
        }
      } catch {
        // Ignorer feil ved lasting
      } finally {
        setLasterProsjektId(false);
      }
    }
    lastLagretProsjekt();
  }, []);

  const byttProsjekt = useCallback((id: string) => {
    setValgtProsjektId(id);
    lagreVerdi(VALGT_PROSJEKT_KEY, id).catch(() => {});
  }, []);

  return (
    <ProsjektContext.Provider
      value={{ valgtProsjektId, byttProsjekt, lasterProsjektId }}
    >
      {children}
    </ProsjektContext.Provider>
  );
}
