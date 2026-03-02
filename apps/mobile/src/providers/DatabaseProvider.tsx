import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { kjorMigreringer } from "../db/migreringer";
import { ryddFullforteOpplastinger, ryddForeldreloseBilder } from "../db/opprydding";

interface DatabaseKontekst {
  erKlar: boolean;
}

const DatabaseContext = createContext<DatabaseKontekst>({ erKlar: false });

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [erKlar, settErKlar] = useState(false);

  useEffect(() => {
    try {
      kjorMigreringer();
      // Rydd opp fullførte opplastinger fra forrige sesjon
      ryddFullforteOpplastinger();
      // Rydd opp foreldreløse bilder i bakgrunnen (ikke-blokkerende)
      ryddForeldreloseBilder().catch((f) =>
        console.warn("Opprydding av foreldreløse bilder feilet:", f),
      );
      settErKlar(true);
    } catch (feil) {
      console.error("Databasemigrering feilet:", feil);
      // La appen starte selv om migrering feiler — bedre enn å blokkere
      settErKlar(true);
    }
  }, []);

  if (!erKlar) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ erKlar }}>
      {children}
    </DatabaseContext.Provider>
  );
}
