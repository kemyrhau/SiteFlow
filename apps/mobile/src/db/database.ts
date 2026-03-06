import { Platform } from "react-native";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

let dbInstans: ReturnType<typeof drizzle<typeof schema>> | null = null;
let initForsok = false;

/**
 * Sjekk om SQLite er tilgjengelig (kun iOS/Android).
 * expo-sqlite bruker JSI — krever IKKE SharedArrayBuffer.
 */
export function erDatabaseTilgjengelig(): boolean {
  return Platform.OS !== "web";
}

/**
 * Hent singleton Drizzle-instans.
 * Returnerer null på web eller miljøer uten SharedArrayBuffer.
 */
export function hentDatabase() {
  if (!initForsok) {
    initForsok = true;
    if (erDatabaseTilgjengelig()) {
      try {
        const sqliteDb = openDatabaseSync("sitedoc.db");
        dbInstans = drizzle(sqliteDb, { schema });
        console.log("[DB] SQLite-database åpnet OK");
      } catch (feil) {
        console.warn("[DB] Kunne ikke åpne SQLite-database:", feil);
      }
    } else {
      console.log("[DB] SQLite ikke tilgjengelig, Platform.OS:", Platform.OS);
    }
  }
  return dbInstans;
}
