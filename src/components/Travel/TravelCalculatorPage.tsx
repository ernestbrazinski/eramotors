"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import type { Place } from "@/src/types/places";
import { useCurrency } from "@/src/stores/currencyStore";
import { useTravel } from "@/src/stores/travelStore";
import { cars } from "@/src/api/demo/cars";
import { places } from "@/src/api/demo/places";
import { CAR_CATEGORY_LABELS } from "@/src/types/cars";
import Select from "@/src/components/_ui/Select/Select";

const DEFAULT_FUEL_PRICE_GEL = 3.05;

const SOCAR_CARD_DISCOUNT_GEL_PER_LITER = 0.1;

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

function buildMapsUrl(
  departure: { lat: number; lng: number },
  route: Place[],
  returnTrip: boolean
): string {
  const points = [departure, ...route, ...(returnTrip ? [departure] : [])];
  const path = points.map((p) => `${p.lat},${p.lng}`).join("/");
  return `https://www.google.com/maps/dir/${path}/?output=embed`;
}

const pillBtn =
  "er-t-pill cursor-pointer rounded-[calc(var(--base-size)*0.8)] border border-[rgba(128,128,128,0.25)] bg-transparent px-[calc(var(--base-size)*2)] py-[calc(var(--base-size)*0.8)] text-foreground transition-[border-color,background] duration-200 hover:border-[rgba(128,128,128,0.5)]";

const pillBtnActive =
  "border-primary bg-[rgba(236,32,36,0.07)] font-semibold";

const blockTitle = "er-t-h3 m-0";

const blockHint = "er-t-hint-inline m-0 opacity-50";

function TravelCalculatorContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const {
    selectedCarId, pickCarId,
    route, togglePlace, moveUp, moveDown, removeFromRoute, setRoute,
  } = useTravel();

  const [returnTrip, setReturnTrip] = useState(true);
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_FUEL_PRICE_GEL);
  const [departureId, setDepartureId] = useState<DepartureId>("batumi");

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

  const routeIndexOf = (id: string) => route.findIndex((p) => p.id === id);

  const results = useMemo(() => {
    if (!selectedCar || route.length === 0) return null;
    const fullRoute = returnTrip ? [...route, { ...departure, id: "_return" } as Place] : route;
    const allPoints = [departure, ...fullRoute];

    let totalDistance = 0;
    const segments: { from: string; to: string; km: number }[] = [];
    for (let i = 0; i < allPoints.length - 1; i++) {
      const from = allPoints[i];
      const to = allPoints[i + 1];
      const km = roadDistanceKm(from.lat, from.lng, to.lat, to.lng);
      segments.push({
        from: i === 0 ? departure.name : route[i - 1]?.name ?? departure.name,
        to: i + 1 < route.length + 1 ? route[i]?.name ?? departure.name : departure.name,
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
  }, [selectedCar, route, returnTrip, departure, fuelPrice]);

  const mapsUrl = useMemo(
    () => route.length > 0 ? buildMapsUrl(departure, route, returnTrip) : null,
    [departure, route, returnTrip]
  );

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
            <h1 className="er-t-display m-0">
              Калькулятор путешествий
            </h1>
            <p className="er-t-lead m-0 opacity-60">
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
                        onClick={() => togglePlace(place)}
                      >
                        {inRoute && (
                          <span className="er-t-caption-bold absolute top-[calc(var(--base-size)*0.6)] right-[calc(var(--base-size)*0.8)] flex h-[calc(var(--base-size)*2.2)] w-[calc(var(--base-size)*2.2)] items-center justify-center rounded-full bg-primary text-white">
                            {idx + 1}
                          </span>
                        )}
                        <span className="er-t-semibold-sm pr-[calc(var(--base-size)*2.4)]">
                          {place.name}
                        </span>
                        <span className="er-t-micro opacity-55">
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
                  className="er-t-input w-[calc(var(--base-size)*14)] rounded-[calc(var(--base-size)*0.8)] border border-[rgba(128,128,128,0.3)] bg-transparent px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*0.8)] text-foreground focus:border-primary focus:outline-none"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                />
              </section>
            </div>

            {/* Right column */}
            <div className="sticky top-[calc(var(--base-size)*10)] flex min-w-0 flex-1 flex-col gap-[calc(var(--base-size)*2)]">
              <div className="flex flex-col gap-[calc(var(--base-size)*1.6)] rounded-[calc(var(--base-size)*1.6)] border border-[rgba(128,128,128,0.2)] p-[calc(var(--base-size)*2.4)]">
                <h2 className="er-t-h3 m-0">
                  Маршрут
                </h2>

                {route.length === 0 ? (
                  <p className="er-t-body-sm m-0 opacity-45">
                    Добавьте места из списка слева
                  </p>
                ) : (
                  <div className="flex flex-col gap-0">
                    <div className="relative flex flex-row items-center gap-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.6)]">
                      <div
                        className="z-[1] h-[calc(var(--base-size)*1.2)] w-[calc(var(--base-size)*1.2)] shrink-0 rounded-full border-2 border-primary bg-primary"
                        data-type="start"
                      />
                      <span className="er-t-body-medium flex-1">
                        {departure.name}
                      </span>
                    </div>

                    {route.map((place, idx) => (
                      <div key={`${place.id}-${idx}`} className="relative flex flex-row items-center gap-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.6)]">
                        <div
                          className="pointer-events-none absolute top-0 bottom-1/2 left-[calc(var(--base-size)*0.5)] w-0.5 -translate-x-1/2 bg-[rgba(128,128,128,0.25)]"
                          aria-hidden
                        />
                        <div className="z-[1] h-[calc(var(--base-size)*1.2)] w-[calc(var(--base-size)*1.2)] shrink-0 rounded-full border-2 border-[rgba(128,128,128,0.4)] bg-[rgba(128,128,128,0.4)]" />
                        <span className="er-t-body-medium flex-1">
                          {place.name}
                        </span>
                        <div className="flex shrink-0 flex-row gap-[calc(var(--base-size)*0.4)]">
                          <button
                            className="er-t-row flex h-[calc(var(--base-size)*2.6)] w-[calc(var(--base-size)*2.6)] cursor-pointer items-center justify-center rounded-[calc(var(--base-size)*0.5)] border border-[rgba(128,128,128,0.2)] bg-transparent text-foreground transition-[background,border-color] duration-150 hover:border-[rgba(128,128,128,0.4)] hover:bg-[rgba(128,128,128,0.1)] disabled:cursor-default disabled:opacity-25"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            aria-label="Переместить вверх"
                          >↑</button>
                          <button
                            className="er-t-row flex h-[calc(var(--base-size)*2.6)] w-[calc(var(--base-size)*2.6)] cursor-pointer items-center justify-center rounded-[calc(var(--base-size)*0.5)] border border-[rgba(128,128,128,0.2)] bg-transparent text-foreground transition-[background,border-color] duration-150 hover:border-[rgba(128,128,128,0.4)] hover:bg-[rgba(128,128,128,0.1)] disabled:cursor-default disabled:opacity-25"
                            onClick={() => moveDown(idx)}
                            disabled={idx === route.length - 1}
                            aria-label="Переместить вниз"
                          >↓</button>
                          <button
                            className="er-t-row flex h-[calc(var(--base-size)*2.6)] w-[calc(var(--base-size)*2.6)] cursor-pointer items-center justify-center rounded-[calc(var(--base-size)*0.5)] border border-[rgba(236,32,36,0.25)] bg-transparent text-primary transition-[background,border-color] duration-150 hover:border-[rgba(236,32,36,0.5)] hover:bg-[rgba(236,32,36,0.08)] disabled:cursor-default disabled:opacity-25"
                            onClick={() => removeFromRoute(idx)}
                            aria-label="Удалить"
                          >×</button>
                        </div>
                      </div>
                    ))}

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
                        <span className="er-t-body-medium flex-1 opacity-60">
                          {departure.name} (возврат)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <label className="er-t-body-medium flex cursor-pointer flex-row items-center gap-[calc(var(--base-size)*1)] border-t border-[rgba(128,128,128,0.12)] pt-[calc(var(--base-size)*0.8)] select-none">
                  <input
                    type="checkbox"
                    className="h-[calc(var(--base-size)*1.8)] w-[calc(var(--base-size)*1.8)] cursor-pointer accent-primary"
                    checked={returnTrip}
                    onChange={(e) => setReturnTrip(e.target.checked)}
                  />
                  <span>С обратной дорогой</span>
                </label>
              </div>

              {mapsUrl && (
                <div className="aspect-video overflow-hidden rounded-[calc(var(--base-size)*1.6)] border border-[rgba(128,128,128,0.2)]">
                  <iframe
                    key={mapsUrl}
                    src={mapsUrl}
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
                  <h2 className="er-t-title m-0">
                    Итого
                  </h2>

                  <div className="flex flex-col gap-[calc(var(--base-size)*0.8)] border-t border-[rgba(128,128,128,0.12)] pt-[calc(var(--base-size)*1.6)]">
                    <h3 className="er-t-overline mb-[calc(var(--base-size)*0.4)] opacity-45">
                      Расстояния
                    </h3>
                    {results.segments.map((seg, i) => (
                      <div key={i} className="er-t-row flex items-baseline justify-between gap-[calc(var(--base-size)*1)]">
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap opacity-70">
                          {seg.from} → {seg.to}
                        </span>
                        <span>~{seg.km} км</span>
                      </div>
                    ))}
                    <div className="er-t-row-strong flex justify-between border-t border-[rgba(128,128,128,0.1)] pt-[calc(var(--base-size)*0.8)]">
                      <span>Итого</span>
                      <span>{results.totalDistance} км</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[calc(var(--base-size)*0.8)] border-t border-[rgba(128,128,128,0.12)] pt-[calc(var(--base-size)*1.6)]">
                    <h3 className="er-t-overline mb-[calc(var(--base-size)*0.4)] opacity-45">
                      Расходы
                    </h3>
                    {results.socarDiscountGel > 0.001 ? (
                      <>
                        <div className="er-t-row flex items-start justify-between gap-[calc(var(--base-size)*1)]">
                          <span className="min-w-0 flex-1 opacity-70">
                            Топливо, без скидки ({results.liters.toFixed(1)} л × {results.fuelPrice.toFixed(2)} ₾/л)
                          </span>
                          <span>{formatPrice(results.fuelCostBaselineGel)}</span>
                        </div>
                        <div className="er-t-row flex items-start justify-between gap-[calc(var(--base-size)*1)] font-medium [&>span:last-child]:shrink-0 [&>span:last-child]:font-semibold [&>span:last-child]:text-primary">
                          <span className="min-w-0 flex-1 opacity-70">
                            Скидка карты SOCAR (10 тетри/л на АЗС SOCAR)
                          </span>
                          <span>−{formatPrice(results.socarDiscountGel)}</span>
                        </div>
                        <div className="er-t-row-strong mb-[calc(var(--base-size)*0.4)] flex justify-between border-t border-[rgba(128,128,128,0.1)] pt-[calc(var(--base-size)*0.8)]">
                          <span>Топливо с учётом скидки</span>
                          <span>{formatPrice(results.fuelCostGel)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="er-t-row flex items-start justify-between gap-[calc(var(--base-size)*1)]">
                        <span className="min-w-0 flex-1 opacity-70">
                          Топливо ({results.liters.toFixed(1)} л × {results.fuelPrice.toFixed(2)} ₾/л)
                        </span>
                        <span>{formatPrice(results.fuelCostGel)}</span>
                      </div>
                    )}
                    <div className="er-t-row flex justify-between">
                      <span>
                        Аренда ({results.rentalDays} {results.rentalDays === 1 ? "день" : "дней"})
                      </span>
                      <span>{formatPrice(results.rentalCostGel)}</span>
                    </div>
                  </div>

                  <div className="er-t-final flex items-center justify-between border-t border-[rgba(128,128,128,0.15)] pt-[calc(var(--base-size)*1.6)]">
                    <span>Примерный итог</span>
                    <span className="er-t-price-xl text-primary">
                      {formatPrice(results.totalGel)}
                    </span>
                  </div>

                  <p className="er-t-caption m-0 opacity-45">
                    Расстояния — приблизительные (прямая × 1.35). Цену топлива уточняйте на день поездки. Скидка
                    10 тетри за литр действует при оплате картой SOCAR на заправках SOCAR; без карты заложите полную
                    цену за литр в поле выше.
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
