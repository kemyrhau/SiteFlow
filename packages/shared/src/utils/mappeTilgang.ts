/**
 * Beregn synlige mapper basert på tilgangsregler med arv.
 *
 * Logikk:
 * - Admin ser alt
 * - accessMode "custom" → sjekk om bruker matcher en oppføring (entreprise, gruppe, bruker-ID)
 * - accessMode "inherit" → gå oppover i foreldrekjeden til første "custom"-mappe
 * - Rotmappe med "inherit" uten forelder = åpen for alle
 * - Foreldre-mapper til synlige barn inkluderes alltid (for å bevare treet), men markeres som "kun sti"
 */

export interface MappeTilgangInput {
  id: string;
  parentId: string | null;
  accessMode: string; // "inherit" | "custom"
  accessEntries: Array<{
    accessType: string; // "enterprise" | "group" | "user"
    enterpriseId: string | null;
    groupId: string | null;
    userId: string | null;
  }>;
}

export interface BrukerTilgangInfo {
  userId: string;
  erAdmin: boolean;
  entrepriseIder: string[];
  gruppeIder: string[];
}

export interface SynligeMapperResultat {
  synlige: Set<string>;
  kunSti: Set<string>;
}

export function beregnSynligeMapper(
  mapper: MappeTilgangInput[],
  bruker: BrukerTilgangInfo,
): SynligeMapperResultat {
  // Admin ser alt
  if (bruker.erAdmin) {
    const alle = new Set(mapper.map((m) => m.id));
    return { synlige: alle, kunSti: new Set() };
  }

  const mappeMap = new Map<string, MappeTilgangInput>();
  for (const m of mapper) {
    mappeMap.set(m.id, m);
  }

  // Cache for oppløst tilgang per mappe
  const tilgangCache = new Map<string, boolean>();

  function harTilgang(mappeId: string): boolean {
    if (tilgangCache.has(mappeId)) {
      return tilgangCache.get(mappeId)!;
    }

    // Marker som under oppløsning for å unngå sirkulære referanser
    tilgangCache.set(mappeId, false);

    const mappe = mappeMap.get(mappeId);
    if (!mappe) {
      return false;
    }

    let resultat: boolean;

    if (mappe.accessMode === "custom") {
      // Sjekk om bruker matcher noen oppføring
      resultat = mappe.accessEntries.some((entry) => {
        if (entry.accessType === "enterprise" && entry.enterpriseId) {
          return bruker.entrepriseIder.includes(entry.enterpriseId);
        }
        if (entry.accessType === "group" && entry.groupId) {
          return bruker.gruppeIder.includes(entry.groupId);
        }
        if (entry.accessType === "user" && entry.userId) {
          return entry.userId === bruker.userId;
        }
        return false;
      });
    } else {
      // inherit — gå oppover til nærmeste custom-forelder
      if (mappe.parentId) {
        resultat = harTilgang(mappe.parentId);
      } else {
        // Rotmappe med inherit = åpen for alle
        resultat = true;
      }
    }

    tilgangCache.set(mappeId, resultat);
    return resultat;
  }

  // Beregn tilgang for alle mapper
  const synlige = new Set<string>();
  for (const mappe of mapper) {
    if (harTilgang(mappe.id)) {
      synlige.add(mappe.id);
    }
  }

  // Legg til foreldre-mapper til synlige barn (for å bevare treet)
  const kunSti = new Set<string>();
  for (const mappeId of synlige) {
    let gjeldende = mappeMap.get(mappeId);
    while (gjeldende?.parentId) {
      if (!synlige.has(gjeldende.parentId)) {
        kunSti.add(gjeldende.parentId);
      }
      gjeldende = mappeMap.get(gjeldende.parentId);
    }
  }

  // Inkluder sti-mapper i synlige
  for (const stiId of kunSti) {
    synlige.add(stiId);
  }

  return { synlige, kunSti };
}
