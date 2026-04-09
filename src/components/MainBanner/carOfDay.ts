import type { Car } from "@/src/types/cars";

/** Featured car rotates by calendar day (UTC day index). */
export function getCarOfDayIndex(carsLength: number, date = new Date()): number {
  if (carsLength <= 0) return 0;
  const utcDay = Math.floor(date.getTime() / 86_400_000);
  return utcDay % carsLength;
}

export function getCarOfDay(cars: Car[], date = new Date()): Car | null {
  if (cars.length === 0) return null;
  return cars[getCarOfDayIndex(cars.length, date)] ?? null;
}

export const CAR_OF_DAY_DISCOUNT_PERCENT = 20;

export function discountedDailyPrice(pricePerDay: number, percent = CAR_OF_DAY_DISCOUNT_PERCENT): number {
  return Math.round(pricePerDay * (1 - percent / 100));
}
