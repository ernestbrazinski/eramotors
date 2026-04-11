"use client";

import { useMemo, useState } from "react";
import type { Car } from "@/src/types/cars";
import type { Place } from "@/src/types/places";
import { useCurrency } from "@/src/stores/currencyStore";
import { cars as carsData } from "@/src/api/demo/cars";

const cars = carsData;

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
    return cars.map((car: Car) => {
      const liters = (distanceRoundTrip / 100) * car.consumptionL100;
      const costGel = liters * fuelPricePerLiter;
      return { car, liters, costGel };
    });
  }, [place, fuelPricePerLiter]);

  if (!place) {
    return (
      <div className="flex w-full max-w-[calc(var(--base-size)*50)] flex-col gap-[calc(var(--base-size)*2)] rounded-[calc(var(--base-size)*0.8)] border border-foreground p-[calc(var(--base-size)*2)]">
        <h3 className="m-0 text-[calc(var(--base-size)*1.8)] font-bold leading-[1.25]">
          Калькулятор топлива
        </h3>
        <p className="m-0 text-[calc(var(--base-size)*1.2)] leading-[1.35] opacity-80">
          Выберите место поездки — расчёт будет с учётом расстояния туда и обратно и расхода каждой машины.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[calc(var(--base-size)*50)] flex-col gap-[calc(var(--base-size)*2)] rounded-[calc(var(--base-size)*0.8)] border border-foreground p-[calc(var(--base-size)*2)]">
      <h3 className="m-0 text-[calc(var(--base-size)*1.8)] font-bold leading-[1.25]">
        Топливо до «{place.name}» и обратно
      </h3>
      <p className="m-0 text-[calc(var(--base-size)*1.2)] leading-[1.35] opacity-80">
        Расстояние от Тбилиси: {place.distanceFromTbilisi} км (туда и обратно:{" "}
        {place.distanceFromTbilisi * 2} км).
      </p>
      <div className="flex flex-row flex-wrap items-center gap-[calc(var(--base-size)*2)]">
        <label htmlFor="fuel-price" className="text-[calc(var(--base-size)*1.4)] leading-[1.35]">
          Цена топлива ({formatCurrencyLabel("л")}):
        </label>
        <input
          id="fuel-price"
          type="number"
          min="0"
          step="0.01"
          className="w-[calc(var(--base-size)*10)] rounded-[calc(var(--base-size)*0.4)] border border-foreground bg-background px-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.6)] text-[calc(var(--base-size)*1.6)] leading-[1.25] text-foreground"
          value={fuelPricePerLiter}
          onChange={(e) =>
            setFuelPricePerLiter(parseFloat(e.target.value) || 0)
          }
        />
      </div>
      <div className="flex flex-col gap-[calc(var(--base-size)*1)]">
        {results?.map(({ car, liters, costGel }) => (
          <div
            key={car.id}
            className="flex flex-row items-center justify-between rounded-[calc(var(--base-size)*0.4)] border border-foreground px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*1)] text-[calc(var(--base-size)*1.3)] leading-[1.2]"
          >
            <span className="font-semibold">{car.name}</span>
            <span className="ml-[calc(var(--base-size)*2)] shrink-0">
              {liters.toFixed(1)} л {formatPrice(costGel)}
            </span>
          </div>
        ))}
      </div>
      <p className="m-0 text-[calc(var(--base-size)*1.2)] leading-[1.35] opacity-80">
        Цены на топливо можно уточнять на день брони (например, через API или
        парсинг актуальных данных).
      </p>
    </div>
  );
}
