"use client";

import { useMemo, useState } from "react";
import type { Car } from "@/src/types/cars";
import type { Place } from "@/src/types/places";
import { useCurrency } from "@/src/stores/currencyStore";
import { cars as carsData } from "@/src/api/demo/cars";
import styles from "./FuelCalculator.module.scss";

const cars = carsData;

/** Default fuel price in Georgia (GEL/l) — update or fetch on booking date */
const DEFAULT_FUEL_PRICE_GEL = 3.05;

interface FuelCalculatorProps {
  place: Place | null;
}

export default function FuelCalculator({ place }: FuelCalculatorProps) {
  const { formatPrice, formatCurrencyLabel } = useCurrency();
  const [fuelPricePerLiter, setFuelPricePerLiter] =
    useState<number>(DEFAULT_FUEL_PRICE_GEL);

  const results = useMemo(() => {
    if (!place) return null;
    const distanceRoundTrip = place.distanceFromTbilisi * 2;
    return cars.map((car) => {
      const liters = (distanceRoundTrip / 100) * car.consumptionL100;
      const costGel = liters * fuelPricePerLiter;
      return { car, liters, costGel };
    });
  }, [place, fuelPricePerLiter]);

  if (!place) {
    return (
      <div className={styles.calculator}>
        <h3 className={styles.calculatorTitle}>Калькулятор топлива</h3>
        <p className={styles.note}>
          Выберите место поездки — расчёт будет с учётом расстояния туда и обратно и расхода каждой машины.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.calculator}>
      <h3 className={styles.calculatorTitle}>
        Топливо до «{place.name}» и обратно
      </h3>
      <p className={styles.note}>
        Расстояние от Тбилиси: {place.distanceFromTbilisi} км (туда и обратно:{" "}
        {place.distanceFromTbilisi * 2} км).
      </p>
      <div className={styles.priceRow}>
        <label htmlFor="fuel-price" className={styles.priceLabel}>
          Цена топлива ({formatCurrencyLabel("л")}):
        </label>
        <input
          id="fuel-price"
          type="number"
          min="0"
          step="0.01"
          className={styles.priceInput}
          value={fuelPricePerLiter}
          onChange={(e) =>
            setFuelPricePerLiter(parseFloat(e.target.value) || 0)
          }
        />
      </div>
      <div className={styles.carList}>
        {results?.map(({ car, liters, costGel }) => (
          <div key={car.id} className={styles.carRow}>
            <span className={styles.carName}>{car.name}</span>
            <span className={styles.carFuel}>
              {liters.toFixed(1)} л {formatPrice(costGel)}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.note}>
        Цены на топливо можно уточнять на день брони (например, через API или
        парсинг актуальных данных).
      </p>
    </div>
  );
}
