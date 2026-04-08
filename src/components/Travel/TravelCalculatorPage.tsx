"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Place } from "@/src/types/places";
import { useCurrency } from "@/src/stores/currencyStore";
import { useTravel } from "@/src/stores/travelStore";
import { cars } from "@/src/api/demo/cars";
import { places } from "@/src/api/demo/places";
import styles from "./TravelCalculatorPage.module.scss";

const DEFAULT_FUEL_PRICE_GEL = 3.05;

const DEPARTURE_POINTS = [
  { id: "batumi", name: "Батуми", lat: 41.6168, lng: 41.6367 },
  { id: "tbilisi", name: "Тбилиси", lat: 41.6941, lng: 44.8337 },
] as const;

type DepartureId = (typeof DEPARTURE_POINTS)[number]["id"];

/** Расстояние между двумя координатами (км, прямая линия × 1.35 ≈ дорога) */
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

function TravelCalculatorContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const {
    selectedCarId, setCarId,
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
    const fuelCostGel = liters * fuelPrice;
    const rentalDays = Math.max(1, Math.ceil(totalDistance / 400));
    const rentalCostGel = selectedCar.pricePerDay * rentalDays;

    return { totalDistance, segments, liters, fuelCostGel, rentalDays, rentalCostGel, totalGel: fuelCostGel + rentalCostGel };
  }, [selectedCar, route, returnTrip, departure, fuelPrice]);

  const mapsUrl = useMemo(
    () => route.length > 0 ? buildMapsUrl(departure, route, returnTrip) : null,
    [departure, route, returnTrip]
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Калькулятор путешествий</h1>
            <p className={styles.pageSubtitle}>
              Составьте маршрут — мы посчитаем расходы на топливо и аренду
            </p>
          </div>

          <div className={styles.layout}>
            {/* ── Left column ── */}
            <div className={styles.sideCol}>

              {/* 1. Departure point */}
              <section className={styles.block}>
                <h2 className={styles.blockTitle}>1. Откуда едем</h2>
                <div className={styles.depList}>
                  {DEPARTURE_POINTS.map((dep) => (
                    <button
                      key={dep.id}
                      className={`${styles.depItem} ${departureId === dep.id ? styles.depItemActive : ""}`}
                      onClick={() => setDepartureId(dep.id)}
                    >
                      {dep.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* 2. Car selection */}
              <section className={styles.block}>
                <h2 className={styles.blockTitle}>2. Автомобиль</h2>
                <div className={styles.carList}>
                  {cars.map((car) => (
                    <button
                      key={car.id}
                      className={`${styles.carItem} ${selectedCarId === car.id ? styles.carItemActive : ""}`}
                      onClick={() => setCarId(car.id)}
                    >
                      <span className={styles.carName}>{car.name}</span>
                      <span className={styles.carMeta}>
                        {car.specs.transmission} · {car.consumptionL100} л/100км · {formatPrice(car.pricePerDay)}/день
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 3. Place selection */}
              <section className={styles.block}>
                <h2 className={styles.blockTitle}>3. Добавьте места в маршрут</h2>
                <p className={styles.blockHint}>Нажимайте по очереди — места добавятся в нужном порядке</p>
                <div className={styles.placeGrid}>
                  {places.map((place) => {
                    const idx = routeIndexOf(place.id);
                    const inRoute = idx !== -1;
                    return (
                      <button
                        key={place.id}
                        className={`${styles.placeItem} ${inRoute ? styles.placeItemActive : ""}`}
                        onClick={() => togglePlace(place)}
                      >
                        {inRoute && <span className={styles.placeOrder}>{idx + 1}</span>}
                        <span className={styles.placeName}>{place.name}</span>
                        <span className={styles.placeMeta}>{place.distanceFromTbilisi} км от Тбилиси</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 4. Fuel price */}
              <section className={styles.block}>
                <h2 className={styles.blockTitle}>4. Цена топлива (GEL/л)</h2>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.fuelInput}
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                />
              </section>
            </div>

            {/* ── Right column ── */}
            <div className={styles.resultCol}>

              {/* Route builder */}
              <div className={styles.routeCard}>
                <h2 className={styles.routeTitle}>Маршрут</h2>

                {route.length === 0 ? (
                  <p className={styles.routeEmpty}>Добавьте места из списка слева</p>
                ) : (
                  <div className={styles.routeList}>
                    {/* Departure stop */}
                    <div className={styles.routeStop}>
                      <div className={styles.routeStopDot} data-type="start" />
                      <span className={styles.routeStopName}>{departure.name}</span>
                    </div>

                    {route.map((place, idx) => (
                      <div key={`${place.id}-${idx}`} className={styles.routeStop}>
                        <div className={styles.routeStopLine} />
                        <div className={styles.routeStopDot} />
                        <span className={styles.routeStopName}>{place.name}</span>
                        <div className={styles.routeStopControls}>
                          <button
                            className={styles.routeBtn}
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            aria-label="Переместить вверх"
                          >↑</button>
                          <button
                            className={styles.routeBtn}
                            onClick={() => moveDown(idx)}
                            disabled={idx === route.length - 1}
                            aria-label="Переместить вниз"
                          >↓</button>
                          <button
                            className={`${styles.routeBtn} ${styles.routeBtnRemove}`}
                            onClick={() => removeFromRoute(idx)}
                            aria-label="Удалить"
                          >×</button>
                        </div>
                      </div>
                    ))}

                    {/* Return stop */}
                    {returnTrip && (
                      <div className={styles.routeStop}>
                        <div className={styles.routeStopLine} />
                        <div className={styles.routeStopDot} data-type="end" />
                        <span className={`${styles.routeStopName} ${styles.routeStopReturn}`}>
                          {departure.name} (возврат)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <label className={styles.returnCheck}>
                  <input
                    type="checkbox"
                    checked={returnTrip}
                    onChange={(e) => setReturnTrip(e.target.checked)}
                  />
                  <span>С обратной дорогой</span>
                </label>
              </div>

              {/* Map */}
              {mapsUrl && (
                <div className={styles.mapCard}>
                  <iframe
                    key={mapsUrl}
                    src={mapsUrl}
                    className={styles.mapFrame}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Маршрут"
                  />
                </div>
              )}

              {/* Summary */}
              {results && (
                <div className={styles.resultCard}>
                  <h2 className={styles.resultTitle}>Итого</h2>

                  <div className={styles.resultSection}>
                    <h3 className={styles.resultSectionTitle}>Расстояния</h3>
                    {results.segments.map((seg, i) => (
                      <div key={i} className={styles.resultRow}>
                        <span className={styles.resultRowLabel}>
                          {seg.from} → {seg.to}
                        </span>
                        <span>~{seg.km} км</span>
                      </div>
                    ))}
                    <div className={styles.resultTotal}>
                      <span>Итого</span>
                      <span>{results.totalDistance} км</span>
                    </div>
                  </div>

                  <div className={styles.resultSection}>
                    <h3 className={styles.resultSectionTitle}>Расходы</h3>
                    <div className={styles.resultRow}>
                      <span>Топливо ({results.liters.toFixed(1)} л)</span>
                      <span>{formatPrice(results.fuelCostGel)}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span>
                        Аренда ({results.rentalDays} {results.rentalDays === 1 ? "день" : "дней"})
                      </span>
                      <span>{formatPrice(results.rentalCostGel)}</span>
                    </div>
                  </div>

                  <div className={styles.resultFinal}>
                    <span>Примерный итог</span>
                    <span className={styles.resultFinalPrice}>{formatPrice(results.totalGel)}</span>
                  </div>

                  <p className={styles.resultNote}>
                    Расстояния — приблизительные (прямая × 1.35). Цены на топливо уточняйте на день поездки.
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
