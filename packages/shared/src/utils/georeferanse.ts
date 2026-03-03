import type { GeoReferanse } from "../types";

/**
 * Transformasjonsparametre for similaritetstransformasjon (2D).
 * Mapping: pixel (prosent) ↔ GPS (lat/lng)
 *
 * GPS → Pixel:
 *   x = a * lng + b * lat + c
 *   y = -b * lng + a * lat + d
 *
 * Pixel → GPS:
 *   Invertert transformasjon
 */
export interface Transformasjon {
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * Beregn similaritetstransformasjon fra 2 referansepunkter.
 * Bruker skalering + rotasjon + translasjon (4 ukjente, 4 ligninger).
 */
export function beregnTransformasjon(ref: GeoReferanse): Transformasjon {
  const { point1, point2 } = ref;

  // Kilde: GPS-koordinater
  const lng1 = point1.gps.lng;
  const lat1 = point1.gps.lat;
  const lng2 = point2.gps.lng;
  const lat2 = point2.gps.lat;

  // Mål: pixel-koordinater (prosent)
  const px1 = point1.pixel.x;
  const py1 = point1.pixel.y;
  const px2 = point2.pixel.x;
  const py2 = point2.pixel.y;

  // Differanser
  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  const dPx = px2 - px1;
  const dPy = py2 - py1;

  // Løs for a og b:
  // dPx = a * dLng + b * dLat
  // dPy = -b * dLng + a * dLat
  const denom = dLng * dLng + dLat * dLat;
  if (denom === 0) {
    throw new Error("Referansepunktene har identiske GPS-koordinater");
  }

  const a = (dPx * dLng + dPy * dLat) / denom;
  const b = (dPx * dLat - dPy * dLng) / denom;

  // Løs for c og d fra punkt 1:
  const c = px1 - a * lng1 - b * lat1;
  const d = py1 + b * lng1 - a * lat1;

  return { a, b, c, d };
}

/**
 * Transformer GPS-koordinater til tegningsposisjon (prosent 0-100).
 * Returnerer verdier clampet til 0-100.
 */
export function gpsTilTegning(
  gps: { lat: number; lng: number },
  transformasjon: Transformasjon,
): { x: number; y: number } {
  const { a, b, c, d } = transformasjon;

  const x = a * gps.lng + b * gps.lat + c;
  const y = -b * gps.lng + a * gps.lat + d;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

/**
 * Transformer tegningsposisjon (prosent) til GPS-koordinater.
 * Invertert similaritetstransformasjon.
 */
export function tegningTilGps(
  pixel: { x: number; y: number },
  transformasjon: Transformasjon,
): { lat: number; lng: number } {
  const { a, b, c, d } = transformasjon;

  // Invertert transformasjon
  const xShift = pixel.x - c;
  const yShift = pixel.y - d;

  const denom = a * a + b * b;
  if (denom === 0) {
    throw new Error("Ugyldig transformasjon (a og b er begge 0)");
  }

  const lng = (a * xShift - b * yShift) / denom;
  const lat = (b * xShift + a * yShift) / denom;

  return { lat, lng };
}

/**
 * Sjekk om en GPS-posisjon er innenfor tegningens dekningsområde.
 * Sjekker at transformerte koordinater er innenfor 0-100 med litt margin.
 */
export function erInnenforTegning(
  gps: { lat: number; lng: number },
  transformasjon: Transformasjon,
  margin: number = 10,
): boolean {
  const { a, b, c, d } = transformasjon;

  const x = a * gps.lng + b * gps.lat + c;
  const y = -b * gps.lng + a * gps.lat + d;

  return x >= -margin && x <= 100 + margin && y >= -margin && y <= 100 + margin;
}
