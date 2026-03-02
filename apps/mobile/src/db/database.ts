import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

let dbInstans: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Hent singleton Drizzle-instans.
 * Lazy-initialisert — oppretter databasen ved første kall.
 */
export function hentDatabase() {
  if (!dbInstans) {
    const sqliteDb = openDatabaseSync("siteflow.db");
    dbInstans = drizzle(sqliteDb, { schema });
  }
  return dbInstans;
}
