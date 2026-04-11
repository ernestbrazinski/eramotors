"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from "react";
import clsx from "clsx";
import { Reorder, useDragControls } from "framer-motion";
import { useSearchParams } from "next/navigation";
import type { Place } from "@/src/types/places";
import { useCurrency } from "@/src/stores/currencyStore";
import { useTravel } from "@/src/stores/travelStore";
import { cars } from "@/src/api/demo/cars";
import { places } from "@/src/api/demo/places";
import { CAR_CATEGORY_LABELS } from "@/src/types/cars";
import Select from "@/src/components/_ui/Select/Select";
import {
  buildTripPoints,
  buildYandexRouteMapUrl,
} from "@/src/lib/yandexMapsEmbed";
import { estimateDriveSecondsFromDistanceKm } from "@/src/lib/yandexRoutingApi";

const DEFAULT_FUEL_PRICE_GEL = 3.05;

const SOCAR_CARD_DISCOUNT_GEL_PER_LITER = 0.15;

const DEPARTURE_POINTS = [
  { id: "batumi", name: "Батуми", lat: 41.6168, lng: 41.6367 },
  { id: "tbilisi", name: "Тбилиси", lat: 41.6941, lng: 44.8337 },
] as const;

type DepartureId = (typeof DEPARTURE_POINTS)[number]["id"];

function roadDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(straight * 1.35);
}

const pillBtn =
  "cursor-pointer rounded-[calc(var(--base-size)*0.8)] border border-[rgba(128,128,128,0.25)] bg-transparent px-[calc(var(--base-size)*2)] py-[calc(var(--base-size)*0.8)] text-[calc(var(--base-size)*1.5)] font-medium leading-[1.2] text-foreground transition-[border-color,background] duration-200 hover:border-[rgba(128,128,128,0.5)]";

const pillBtnActive =
  "border-primary bg-[rgba(236,32,36,0.07)] font-semibold";

const blockTitle = "m-0 text-[calc(var(--base-size)*1.8)] font-bold leading-[1.25]";

const blockHint = "m-0 text-[calc(var(--base-size)*1.3)] font-medium leading-[1.35] opacity-50";

const ESTIMATE_SPEED_KMH = 60;

/** После отпускания ручки перетаскивания: пауза перед записью порядка в стор и обновлением карты / запроса маршрута. */
const ROUTE_REORDER_COMMIT_MS = 1500;

function sortedPlaceIdsSig(r: Place[]): string {
  return [...r.map((p) => p.id)].sort().join("\0");
}

function placeOrderSig(r: Place[]): string {
  return r.map((p) => p.id).join("\0");
}

function formatTravelTimeRu(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0 && m > 0) return `${h} ч ${m} мин`;
  if (h > 0) return `${h} ч`;
  if (m > 0) return `${m} мин`;
  return "до 1 мин";
}

function trafficHintRu(trafficType: string | undefined): string | null {
  if (trafficType === "realtime") return "с учётом пробок на момент запроса";
  if (trafficType === "forecast") return "по прогнозу пробок";
  if (trafficType === "disabled") return "без учёта пробок";
  return null;
}

type YandexTimingState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; seconds: number; trafficType?: string }
  | { kind: "fallback"; reason: "no_key" | "error" };

function RouteDragHandleIcon() {
  return (
    <svg
      width={14}
      height={18}
      viewBox="0 0 14 18"
      fill="currentColor"
      className="opacity-45"
      aria-hidden
    >
      <circle cx={4} cy={4} r={1.6} />
      <circle cx={10} cy={4} r={1.6} />
      <circle cx={4} cy={9} r={1.6} />
      <circle cx={10} cy={9} r={1.6} />
      <circle cx={4} cy={14} r={1.6} />
      <circle cx={10} cy={14} r={1.6} />
    </svg>
  );
}

function RouteReorderRow({
  place,
  onRemove,
  onGripPointerDown,
  onGripPointerUp,
}: {
  place: Place;
  onRemove: () => void;
  onGripPointerDown: () => void;
  onGripPointerUp: () => void;
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={place}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex flex-row items-center gap-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.6)] select-none"
    >
      <div
        className="pointer-events-none absolute top-0 bottom-1/2 left-[calc(var(--base-size)*0.5)] w-0.5 -translate-x-1/2 bg-[rgba(128,128,128,0.25)]"
        aria-hidden
      />
      <div className="z-[1] h-[calc(var(--base-size)*1.2)] w-[calc(var(--base-size)*1.2)] shrink-0 rounded-full border-2 border-[rgba(128,128,128,0.4)] bg-[rgba(128,128,128,0.4)]" />
      <button
        type="button"
        className="text-[calc(var(--base-size)*1.4)] leading-[1.35] z-[1] flex h-[calc(var(--base-size)*2.8)] w-[calc(var(--base-size)*2.8)] shrink-0 cursor-grab touch-none items-center justify-center rounded-[calc(var(--base-size)*0.5)] border border-transparent bg-transparent text-foreground active:cursor-grabbing"
        onPointerDown={(e) => {
          onGripPointerDown();
          dragControls.start(e);
          const end = () => {
            onGripPointerUp();
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
          };
          window.addEventListener("pointerup", end, true);
          window.addEventListener("pointercancel", end, true);
        }}
        aria-label="Перетащить, чтобы изменить порядок"
      >
        <RouteDragHandleIcon />
      </button>
      <span className="text-[calc(var(--base-size)*1.5)] font-medium leading-[1.4] min-w-0 flex-1">{place.name}</span>
      <button
        type="button"
        className="text-[calc(var(--base-size)*1.4)] leading-[1.35] flex h-[calc(var(--base-size)*2.6)] w-[calc(var(--base-size)*2.6)] shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--base-size)*0.5)] border border-[rgba(236,32,36,0.25)] bg-transparent text-primary transition-[background,border-color] duration-150 hover:border-[rgba(236,32,36,0.5)] hover:bg-[rgba(236,32,36,0.08)]"
        onClick={onRemove}
        aria-label="Удалить из маршрута"
      >
        ×
      </button>
    </Reorder.Item>
  );
}

function TravelCalculatorContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const {
    selectedCarId, pickCarId,
    route, togglePlace, removeFromRoute, setRoute,
  } = useTravel();

  const [localOrder, setLocalOrder] = useState<Place[]>(() => route);
  const [committedRoute, setCommittedRoute] = useState<Place[]>(() => route);
  const localOrderRef = useRef(route);
  const routeRef = useRef(route);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRouteCommitTimer = useCallback(() => {
    if (commitTimerRef.current !== null) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const flushRouteToStoreAndMap = useCallback(
    (next: Place[]) => {
      clearRouteCommitTimer();
      setRoute(next);
      setCommittedRoute(next);
    },
    [clearRouteCommitTimer, setRoute],
  );

  const scheduleRouteCommit = useCallback(() => {
    clearRouteCommitTimer();
    commitTimerRef.current = setTimeout(() => {
      commitTimerRef.current = null;
      const next = localOrderRef.current;
      if (placeOrderSig(next) !== placeOrderSig(routeRef.current)) {
        setRoute(next);
        setCommittedRoute(next);
      }
    }, ROUTE_REORDER_COMMIT_MS);
  }, [clearRouteCommitTimer, setRoute]);

  const onReorderGripDown = useCallback(() => {
    clearRouteCommitTimer();
  }, [clearRouteCommitTimer]);

  const onReorderGripUp = useCallback(() => {
    if (placeOrderSig(localOrderRef.current) === placeOrderSig(routeRef.current)) {
      return;
    }
    scheduleRouteCommit();
  }, [scheduleRouteCommit]);

  const handleReorderRoute = useCallback(
    (next: Place[]) => {
      localOrderRef.current = next;
      setLocalOrder(next);
      clearRouteCommitTimer();
    },
    [clearRouteCommitTimer],
  );

  const safeTogglePlace = useCallback(
    (place: Place) => {
      flushRouteToStoreAndMap(localOrderRef.current);
      togglePlace(place);
    },
    [flushRouteToStoreAndMap, togglePlace],
  );

  const handleRemoveFromRoute = useCallback(
    (idx: number) => {
      flushRouteToStoreAndMap(localOrderRef.current);
      removeFromRoute(idx);
    },
    [flushRouteToStoreAndMap, removeFromRoute],
  );

  useEffect(() => {
    localOrderRef.current = localOrder;
  }, [localOrder]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    return () => clearRouteCommitTimer();
  }, [clearRouteCommitTimer]);

  useEffect(() => {
    setLocalOrder((prev) => {
      if (sortedPlaceIdsSig(route) !== sortedPlaceIdsSig(prev)) {
        clearRouteCommitTimer();
        return route;
      }
      return prev;
    });
    setCommittedRoute((prev) => {
      if (sortedPlaceIdsSig(route) !== sortedPlaceIdsSig(prev)) {
        return route;
      }
      return prev;
    });
  }, [route, clearRouteCommitTimer]);

  const [returnTrip, setReturnTrip] = useState(true);
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICE_GEL);
  const [departureId, setDepartureId] = useState<DepartureId>("batumi");
  const [yandexTiming, setYandexTiming] = useState<YandexTimingState>({
    kind: "idle",
  });

  useEffect(() => {
    const placeId = searchParams.get("place");
    if (placeId) {
      const place = places.find((p) => p.id === placeId);
      if (place && !route.some((p) => p.id === placeId)) {
        setRoute([...route, place]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departure = DEPARTURE_POINTS.find((d) => d.id === departureId)!;
  const selectedCar = cars.find((c) => c.id === selectedCarId) ?? null;

  const routeIndexOf = (id: string) => localOrder.findIndex((p) => p.id === id);

  const results = useMemo(() => {
    if (!selectedCar || localOrder.length === 0) return null;
    const fullRoute = returnTrip ? [...localOrder, { ...departure, id: "_return" } as Place] : localOrder;
    const allPoints = [departure, ...fullRoute];

    let totalDistance = 0;
    const segments: { from: string; to: string; km: number }[] = [];
    for (let i = 0; i < allPoints.length - 1; i++) {
      const from = allPoints[i];
      const to = allPoints[i + 1];
      const km = roadDistanceKm(from.lat, from.lng, to.lat, to.lng);
      segments.push({
        from: i === 0 ? departure.name : localOrder[i - 1]?.name ?? departure.name,
        to: i + 1 < localOrder.length + 1 ? localOrder[i]?.name ?? departure.name : departure.name,
        km,
      });
      totalDistance += km;
    }

    const liters = (totalDistance / 100) * selectedCar.consumptionL100;
    const fuelCostBaselineGel = liters * fuelPrice;
    const effectiveFuelPriceGel = Math.max(0, fuelPrice - SOCAR_CARD_DISCOUNT_GEL_PER_LITER);
    const fuelCostGel = liters * effectiveFuelPriceGel;
    const socarDiscountGel = fuelCostBaselineGel - fuelCostGel;
    const rentalDays = Math.max(1, Math.ceil(totalDistance / 400));
    const rentalCostGel = selectedCar.pricePerDay * rentalDays;

    return {
      totalDistance,
      segments,
      liters,
      fuelPrice,
      fuelCostBaselineGel,
      socarDiscountGel,
      fuelCostGel,
      rentalDays,
      rentalCostGel,
      totalGel: fuelCostGel + rentalCostGel,
    };
  }, [selectedCar, localOrder, returnTrip, departure, fuelPrice]);

  const tripPoints = useMemo(
    () => buildTripPoints(departure, committedRoute, returnTrip),
    [departure, committedRoute, returnTrip],
  );

  const mapsEmbedUrl = useMemo(() => {
    if (tripPoints.length < 2) return null;
    return buildYandexRouteMapUrl(tripPoints);
  }, [tripPoints]);

  useEffect(() => {
    if (tripPoints.length < 2) {
      setYandexTiming({ kind: "idle" });
      return;
    }
    const ac = new AbortController();
    setYandexTiming({ kind: "loading" });
    fetch("/api/yandex-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waypoints: tripPoints }),
      signal: ac.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          error?: string;
          durationSeconds?: number;
          trafficType?: string;
        };
        if (ac.signal.aborted) return;
        if (res.ok && typeof data.durationSeconds === "number") {
          setYandexTiming({
            kind: "ok",
            seconds: data.durationSeconds,
            trafficType: data.trafficType,
          });
          return;
        }
        if (data.error === "missing_key") {
          setYandexTiming({ kind: "fallback", reason: "no_key" });
        } else {
          setYandexTiming({ kind: "fallback", reason: "error" });
        }
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        if (ac.signal.aborted) return;
        setYandexTiming({ kind: "fallback", reason: "error" });
      });
    return () => ac.abort();
  }, [tripPoints]);

  const carSelectOptions = useMemo(
    () =>
      cars.map((car) => ({
        value: car.id,
        label: car.name,
        icon: car.image,
        description: `${CAR_CATEGORY_LABELS[car.category]} · ${car.specs.transmission} · ${car.consumptionL100} л/100км · ${formatPrice(car.pricePerDay)}/день`,
      })),
    [formatPrice],
  );

  return (
    <div className="min-h-screen pt-[calc(var(--base-size)*10)] pb-[calc(var(--base-size)*8)]">
      <div className="container">
        <div className="flex w-full flex-col gap-[calc(var(--base-size)*4)]">
          <div className="flex flex-col gap-[calc(var(--base-size)*1)]">
            <h1 className="m-0 text-[calc(var(--base-size)*3.6)] font-bold leading-[1.15]">
              Калькулятор путешествий
            </h1>
            <p className="m-0 text-[calc(var(--base-size)*1.6)] leading-[1.5] opacity-60">
              Составьте маршрут — мы посчитаем расходы на топливо и аренду
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-[calc(var(--base-size)*4)] lg:flex-row">
            {/* Left column */}
            <div className="flex min-w-0 flex-[0_0_auto] flex-col gap-[calc(var(--base-size)*3)] lg:flex-[0_0_calc(var(--base-size)*52)]">
              <section className="flex flex-col gap-[calc(var(--base-size)*1.2)]">
                <h2 className={blockTitle}>1. Откуда едем</h2>
                <div className="flex flex-row gap-[calc(var(--base-size)*1)]">
                  {DEPARTURE_POINTS.map((dep) => (
                    <button
                      key={dep.id}
                      className={clsx(pillBtn, departureId === dep.id && pillBtnActive)}
                      onClick={() => setDepartureId(dep.id)}
                    >
                      {dep.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-[calc(var(--base-size)*1.2)]">
                <h2 className={blockTitle}>2. Автомобиль</h2>
                <Select
                  ariaLabel="Выбор автомобиля для расчёта"
                  placeholder="Выберите автомобиль"
                  options={carSelectOptions}
                  value={selectedCarId ?? ""}
                  onChange={(v) => pickCarId(v || null)}
                />
              </section>

              <section className="flex flex-col gap-[calc(var(--base-size)*1.2)]">
                <h2 className={blockTitle}>3. Добавьте места в маршрут</h2>
                <p className={blockHint}>
                  Нажимайте по очереди — места добавятся в нужном порядке
                </p>
                <div className="grid grid-cols-2 gap-[calc(var(--base-size)*0.8)]">
                  {places.map((place) => {
                    const idx = routeIndexOf(place.id);
                    const inRoute = idx !== -1;
                    return (
                      <button
                        key={place.id}
                        className={clsx(
                          "relative flex cursor-pointer flex-col gap-[calc(var(--base-size)*0.3)] rounded-[calc(var(--base-size)*1)] border border-[rgba(128,128,128,0.2)] bg-transparent px-[calc(var(--base-size)*1.4)] py-[calc(var(--base-size)*1.2)] text-left text-foreground transition-[border-color,background] duration-200 hover:border-[rgba(128,128,128,0.5)] hover:bg-[rgba(128,128,128,0.05)]",
                          inRoute && "border-primary bg-[rgba(236,32,36,0.07)]",
                        )}
                        onClick={() => safeTogglePlace(place)}
                      >
                        {inRoute && (
                          <span className="text-[calc(var(--base-size)*1.2)] font-bold leading-[1.2] absolute top-[calc(var(--base-size)*0.6)] right-[calc(var(--base-size)*0.8)] flex h-[calc(var(--base-size)*2.2)] w-[calc(var(--base-size)*2.2)] items-center justify-center rounded-full bg-primary text-white">
                            {idx + 1}
                          </span>
                        )}
                        <span className="text-[calc(var(--base-size)*1.4)] font-semibold leading-[1.3] pr-[calc(var(--base-size)*2.4)]">
                          {place.name}
                        </span>
                        <span className="text-[calc(var(--base-size)*1.1)] leading-[1.35] opacity-55">
                          {place.distanceFromTbilisi} км от Тбилиси
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="flex flex-col gap-[calc(var(--base-size)*1.2)]">
                <h2 className={blockTitle}>4. Цена топлива (GEL/л)</h2>
                <p className={blockHint}>
                  В итоге учтена скидка{" "}
                  <strong>{SOCAR_CARD_DISCOUNT_GEL_PER_LITER * 100} тетри/л</strong> при оплате картой SOCAR на АЗС
                  SOCAR (эффективная цена: не ниже 0 ₾/л).
                </p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-[calc(var(--base-size)*14)] rounded-[calc(var(--base-size)*0.8)] border border-[rgba(128,128,128,0.3)] bg-transparent px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*0.8)] text-[calc(var(--base-size)*1.6)] leading-[1.25] text-foreground focus:border-primary focus:outline-none"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                />
              </section>
            </div>

            {/* Right column */}
            <div className="sticky top-[calc(var(--base-size)*10)] flex min-w-0 flex-1 flex-col gap-[calc(var(--base-size)*2)]">
              <div className="flex flex-col gap-[calc(var(--base-size)*1.6)] rounded-[calc(var(--base-size)*1.6)] border border-[rgba(128,128,128,0.2)] p-[calc(var(--base-size)*2.4)]">
                <h2 className="m-0 text-[calc(var(--base-size)*1.8)] font-bold leading-[1.25]">
                  Маршрут
                </h2>
                {localOrder.length > 0 ? (
                  <p className="text-[calc(var(--base-size)*1.2)] leading-[1.35] m-0 opacity-45">
                    Тяните за ручку слева. Карта и время в пути обновятся через 1,5 с после отпускания, если сразу не
                    тянуть другую строку.
                  </p>
                ) : null}

                {localOrder.length === 0 ? (
                  <p className="text-[calc(var(--base-size)*1.4)] leading-[1.4] m-0 opacity-45">
                    Добавьте места из списка слева
                  </p>
                ) : (
                  <div className="flex flex-col gap-0">
                    <div className="relative flex flex-row items-center gap-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.6)]">
                      <div
                        className="z-[1] h-[calc(var(--base-size)*1.2)] w-[calc(var(--base-size)*1.2)] shrink-0 rounded-full border-2 border-primary bg-primary"
                        data-type="start"
                      />
                      <span className="text-[calc(var(--base-size)*1.5)] font-medium leading-[1.4] flex-1">
                        {departure.name}
                      </span>
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={localOrder}
                      onReorder={handleReorderRoute}
                      className="m-0 flex list-none flex-col gap-0 p-0"
                    >
                      {localOrder.map((place, idx) => (
                        <RouteReorderRow
                          key={place.id}
                          place={place}
                          onGripPointerDown={onReorderGripDown}
                          onGripPointerUp={onReorderGripUp}
                          onRemove={() => handleRemoveFromRoute(idx)}
                        />
                      ))}
                    </Reorder.Group>

                    {returnTrip && (
                      <div className="relative flex flex-row items-center gap-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.6)]">
                        <div
                          className="pointer-events-none absolute top-0 bottom-1/2 left-[calc(var(--base-size)*0.5)] w-0.5 -translate-x-1/2 bg-[rgba(128,128,128,0.25)]"
                          aria-hidden
                        />
                        <div
                          className="z-[1] h-[calc(var(--base-size)*1.2)] w-[calc(var(--base-size)*1.2)] shrink-0 rounded-full border-2 border-primary bg-primary"
                          data-type="end"
                        />
                        <span className="text-[calc(var(--base-size)*1.5)] font-medium leading-[1.4] flex-1 opacity-60">
                          {departure.name} (возврат)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <label className="text-[calc(var(--base-size)*1.5)] font-medium leading-[1.4] flex cursor-pointer flex-row items-center gap-[calc(var(--base-size)*1)] border-t border-[rgba(128,128,128,0.12)] pt-[calc(var(--base-size)*0.8)] select-none">
                  <input
                    type="checkbox"
                    className="h-[calc(var(--base-size)*1.8)] w-[calc(var(--base-size)*1.8)] cursor-pointer accent-primary"
                    checked={returnTrip}
                    onChange={(e) => setReturnTrip(e.target.checked)}
                  />
                  <span>С обратной дорогой</span>
                </label>
              </div>

              {mapsEmbedUrl && (
                <div className="aspect-video overflow-hidden rounded-[calc(var(--base-size)*1.6)] border border-[rgba(128,128,128,0.2)]">
                  <iframe
                    key={mapsEmbedUrl}
                    src={mapsEmbedUrl}
                    className="block h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Маршрут"
                  />
                </div>
              )}

              {results && (
                <div className="flex flex-col gap-[calc(var(--base-size)*2)] rounded-[calc(var(--base-size)*1.6)] border border-[rgba(128,128,128,0.2)] p-[calc(var(--base-size)*2.4)]">
                  <h2 className="m-0 text-[calc(var(--base-size)*2)] font-bold leading-[1.2]">
                    Итого
                  </h2>

                  <div className="flex flex-col gap-[calc(var(--base-size)*0.8)] border-t border-[rgba(128,128,128,0.12)] pt-[calc(var(--base-size)*1.6)]">
                    <h3 className="text-[calc(var(--base-size)*1.2)] font-semibold uppercase tracking-[0.06em] leading-[1.3] mb-[calc(var(--base-size)*0.4)] opacity-45">
                      Расстояния
                    </h3>
                    {results.segments.map((seg, i) => (
                      <div key={i} className="text-[calc(var(--base-size)*1.4)] leading-[1.35] flex items-baseline justify-between gap-[calc(var(--base-size)*1)]">
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap opacity-70">
                          {seg.from} → {seg.to}
                        </span>
                        <span>~{seg.km} км</span>
                      </div>
                    ))}
                    <div className="text-[calc(var(--base-size)*1.4)] font-semibold leading-[1.35] flex justify-between border-t border-[rgba(128,128,128,0.1)] pt-[calc(var(--base-size)*0.8)]">
                      <span>Итого</span>
                      <span>{results.totalDistance} км</span>
                    </div>
                    <div className="flex flex-col gap-[calc(var(--base-size)*0.35)] border-t border-[rgba(128,128,128,0.1)] pt-[calc(var(--base-size)*0.8)] sm:flex-row sm:items-start sm:justify-between sm:gap-[calc(var(--base-size)*1)]">
                      <span className="text-[calc(var(--base-size)*1.4)] font-semibold leading-[1.35] shrink-0 opacity-80">Время в пути</span>
                      <div className="min-w-0 sm:text-right">
                        {yandexTiming.kind === "ok" ? (
                          <>
                            <span className="text-[calc(var(--base-size)*1.4)] font-semibold leading-[1.35] block">
                              {formatTravelTimeRu(yandexTiming.seconds)}
                            </span>
                            {(() => {
                              const hint = trafficHintRu(yandexTiming.trafficType);
                              return hint ? (
                                <span className="text-[calc(var(--base-size)*1.2)] leading-[1.35] mt-[calc(var(--base-size)*0.2)] block opacity-50">
                                  {hint}
                                </span>
                              ) : null;
                            })()}
                            <span className="text-[calc(var(--base-size)*1.2)] leading-[1.35] mt-[calc(var(--base-size)*0.15)] block opacity-45">
                              Яндекс.Маршрутизация
                            </span>
                          </>
                        ) : yandexTiming.kind === "fallback" ? (
                          <>
                            <span className="text-[calc(var(--base-size)*1.4)] font-semibold leading-[1.35] block">
                              {formatTravelTimeRu(
                                estimateDriveSecondsFromDistanceKm(
                                  results.totalDistance,
                                  ESTIMATE_SPEED_KMH,
                                ),
                              )}
                            </span>
                            <span className="text-[calc(var(--base-size)*1.2)] leading-[1.35] mt-[calc(var(--base-size)*0.2)] block opacity-50">
                              {yandexTiming.reason === "no_key"
                                ? `оценка ~${ESTIMATE_SPEED_KMH} км/ч по км в калькуляторе; для времени по дорогам задайте YANDEX_ROUTING_API_KEY`
                                : `оценка ~${ESTIMATE_SPEED_KMH} км/ч; ответ маршрута Яндекса недоступен`}
                            </span>
                          </>
                        ) : (
                          <span className="opacity-45">…</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[calc(var(--base-size)*0.8)] border-t border-[rgba(128,128,128,0.12)] pt-[calc(var(--base-size)*1.6)]">
                    <h3 className="text-[calc(var(--base-size)*1.2)] font-semibold uppercase tracking-[0.06em] leading-[1.3] mb-[calc(var(--base-size)*0.4)] opacity-45">
                      Расходы
                    </h3>
                    {results.socarDiscountGel > 0.001 ? (
                      <>
                        <div className="text-[calc(var(--base-size)*1.4)] leading-[1.35] flex items-start justify-between gap-[calc(var(--base-size)*1)]">
                          <span className="min-w-0 flex-1 opacity-70">
                            Топливо, без скидки ({results.liters.toFixed(1)} л × {results.fuelPrice.toFixed(2)} ₾/л)
                          </span>
                          <span>{formatPrice(results.fuelCostBaselineGel)}</span>
                        </div>
                        <div className="text-[calc(var(--base-size)*1.4)] leading-[1.35] flex items-start justify-between gap-[calc(var(--base-size)*1)] font-medium [&>span:last-child]:shrink-0 [&>span:last-child]:font-semibold [&>span:last-child]:text-primary">
                          <span className="min-w-0 flex-1 opacity-70">
                            Скидка карты SOCAR ({SOCAR_CARD_DISCOUNT_GEL_PER_LITER * 100} тетри/л на АЗС SOCAR)
                          </span>
                          <span>−{formatPrice(results.socarDiscountGel)}</span>
                        </div>
                        <div className="text-[calc(var(--base-size)*1.4)] font-semibold leading-[1.35] mb-[calc(var(--base-size)*0.4)] flex justify-between border-t border-[rgba(128,128,128,0.1)] pt-[calc(var(--base-size)*0.8)]">
                          <span>Топливо с учётом скидки</span>
                          <span>{formatPrice(results.fuelCostGel)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[calc(var(--base-size)*1.4)] leading-[1.35] flex items-start justify-between gap-[calc(var(--base-size)*1)]">
                        <span className="min-w-0 flex-1 opacity-70">
                          Топливо ({results.liters.toFixed(1)} л × {results.fuelPrice.toFixed(2)} ₾/л)
                        </span>
                        <span>{formatPrice(results.fuelCostGel)}</span>
                      </div>
                    )}
                    <div className="text-[calc(var(--base-size)*1.4)] leading-[1.35] flex justify-between">
                      <span>
                        Аренда ({results.rentalDays} {results.rentalDays === 1 ? "день" : "дней"})
                      </span>
                      <span>{formatPrice(results.rentalCostGel)}</span>
                    </div>
                  </div>

                  <div className="text-[calc(var(--base-size)*1.5)] font-semibold leading-[1.3] flex items-center justify-between border-t border-[rgba(128,128,128,0.15)] pt-[calc(var(--base-size)*1.6)]">
                    <span>Примерный итог</span>
                    <span className="text-[calc(var(--base-size)*2.8)] font-bold leading-[1.1] text-primary">
                      {formatPrice(results.totalGel)}
                    </span>
                  </div>

                  <p className="text-[calc(var(--base-size)*1.2)] leading-[1.35] m-0 opacity-45">
                    Расстояния — приблизительные (прямая × 1.35). Время в пути при наличии ключа — по Yandex Router
                    API (как на карте маршрута); иначе показана оценка по скорости {ESTIMATE_SPEED_KMH} км/ч и км из
                    калькулятора. Цену топлива уточняйте на день поездки. Скидка{" "}
                    {SOCAR_CARD_DISCOUNT_GEL_PER_LITER * 100} тетри за литр действует при оплате
                    картой SOCAR на заправках SOCAR; без карты заложите полную цену за литр в поле выше.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TravelCalculatorPage() {
  return (
    <Suspense>
      <TravelCalculatorContent />
    </Suspense>
  );
}
