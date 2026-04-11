/**
 * Parse Yandex Router API v2 JSON and sum step durations (seconds).
 * @see https://yandex.com/maps-api/docs/router-api/response.html
 */
export function sumRouteDurationSeconds(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.errors) && o.errors.length) return null;
  const route = o.route as Record<string, unknown> | undefined;
  if (!route) return null;
  const legs = route.legs as unknown[] | undefined;
  if (!Array.isArray(legs) || legs.length === 0) return null;
  let total = 0;
  for (const leg of legs) {
    if (!leg || typeof leg !== "object") continue;
    const L = leg as Record<string, unknown>;
    if (L.status !== "OK") continue;
    const steps = L.steps as unknown[] | undefined;
    if (!Array.isArray(steps)) continue;
    for (const step of steps) {
      if (!step || typeof step !== "object") continue;
      const d = (step as Record<string, unknown>).duration;
      if (typeof d === "number" && Number.isFinite(d)) total += d;
    }
  }
  return total > 0 ? total : null;
}

export function readTrafficType(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const t = (data as Record<string, unknown>).traffic_type;
  return typeof t === "string" ? t : undefined;
}

/** Rough drive-time fallback when Router API is unavailable (km / speed). */
export function estimateDriveSecondsFromDistanceKm(
  distanceKm: number,
  speedKmh: number,
): number {
  if (distanceKm <= 0 || speedKmh <= 0) return 0;
  return (distanceKm / speedKmh) * 3600;
}
