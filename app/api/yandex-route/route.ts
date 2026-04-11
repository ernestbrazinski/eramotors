import { NextRequest, NextResponse } from "next/server";
import {
  readTrafficType,
  sumRouteDurationSeconds,
} from "@/src/lib/yandexRoutingApi";

const MAX_WAYPOINTS = 50;

type WaypointBody = { lat: number; lng: number };

function validWaypoint(p: unknown): p is WaypointBody {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.lat === "number" &&
    typeof o.lng === "number" &&
    Number.isFinite(o.lat) &&
    Number.isFinite(o.lng) &&
    o.lat >= -90 &&
    o.lat <= 90 &&
    o.lng >= -180 &&
    o.lng <= 180
  );
}

/**
 * Proxies Yandex Router API v2 so `YANDEX_ROUTING_API_KEY` stays server-side.
 * Dashboard: https://developer.tech.yandex.com/ — enable “Router API” / route requests.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.YANDEX_ROUTING_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "missing_key" as const },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" as const }, { status: 400 });
  }

  const body = json as { waypoints?: unknown };
  const raw = body.waypoints;
  if (!Array.isArray(raw) || raw.length < 2) {
    return NextResponse.json({ error: "bad_waypoints" as const }, { status: 400 });
  }
  if (raw.length > MAX_WAYPOINTS) {
    return NextResponse.json({ error: "too_many_points" as const }, { status: 400 });
  }

  const waypoints: WaypointBody[] = [];
  for (const p of raw) {
    if (!validWaypoint(p)) {
      return NextResponse.json({ error: "bad_waypoints" as const }, { status: 400 });
    }
    waypoints.push(p);
  }

  const wp = waypoints.map((p) => `${p.lat},${p.lng}`).join("|");
  const url = new URL("https://api.routing.yandex.net/v2/route");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("waypoints", wp);
  url.searchParams.set("mode", "driving");

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" as const }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    return NextResponse.json({ error: "bad_upstream" as const }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "upstream_http" as const, status: upstream.status },
      { status: 502 },
    );
  }

  const durationSeconds = sumRouteDurationSeconds(data);
  if (durationSeconds == null) {
    return NextResponse.json({ error: "no_route" as const }, { status: 502 });
  }

  return NextResponse.json({
    durationSeconds,
    trafficType: readTrafficType(data),
  });
}
