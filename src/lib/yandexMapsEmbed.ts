/**
 * Yandex Maps embed widget (iframe). No API key for basic embed.
 * @see https://yandex.com/dev/yandex-apps-launch-maps/doc/en/concepts/yandexmaps-web
 */

const WIDGET_BASE = "https://yandex.com/map-widget/v1/";

/** Map center for Georgia overview (lon,lat); pair with zoom for country-scale view */
const GEORGIA_OVERVIEW_LL = "43.4,42.3";

const commonParams = (): URLSearchParams =>
  new URLSearchParams({ l: "map", lang: "ru_RU" });

/** Single-point map (placemark) or Georgia overview when lat/lng omitted */
export function buildYandexPlaceMapUrl(options: {
  lat?: number;
  lng?: number;
  zoom?: number;
}): string {
  const params = commonParams();
  if (options.lat != null && options.lng != null) {
    params.set("pt", `${options.lng},${options.lat}`);
    params.set("z", String(options.zoom ?? 10));
  } else {
    params.set("ll", GEORGIA_OVERVIEW_LL);
    params.set("z", String(options.zoom ?? 7));
  }
  return `${WIDGET_BASE}?${params.toString()}`;
}

export function buildTripPoints(
  departure: { lat: number; lng: number },
  route: Array<{ lat: number; lng: number }>,
  returnTrip: boolean,
): { lat: number; lng: number }[] {
  const points = [departure, ...route];
  if (returnTrip) points.push(departure);
  return points;
}

/**
 * Driving route on the widget: `rtext` uses Yandex order lat,lng~lat,lng per launch-URL docs.
 * @returns null when fewer than two points
 */
export function buildYandexRouteMapUrl(
  points: { lat: number; lng: number }[],
): string | null {
  if (points.length < 2) return null;
  const params = commonParams();
  params.set("rtext", points.map((p) => `${p.lat},${p.lng}`).join("~"));
  params.set("rtt", "auto");
  return `${WIDGET_BASE}?${params.toString()}`;
}
