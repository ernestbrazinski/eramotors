export type CarCategory =
  | "economy"
  | "compact"
  | "sedan"
  | "fullsize"
  | "suv"
  | "minivan"
  | "premium"
  | "luxury";

export interface CarSpecs {
  transmission: string;
  fuelConsumption: string;
  fuelType: string;
  seats: number;
  bluetooth: boolean;
  aux: boolean;
  ac: boolean;
  usb: boolean;
  fourWheelDrive?: boolean;
  leather?: boolean;
}

export type CarAdditionalSpecKey =
  | "bluetooth"
  | "aux"
  | "ac"
  | "usb"
  | "carplay";

export interface Car {
  id: string;
  name: string;
  category: CarCategory;
  pricePerDay: number;
  year: number;
  image: string;
  /** Расход топлива л/100км (для калькулятора) */
  consumptionL100: number;
  specs: CarSpecs;
  additionalSpecs?: CarAdditionalSpecKey[];
}

export const CAR_CATEGORY_LABELS: Record<CarCategory, string> = {
  economy: "Эконом",
  compact: "Компакт",
  sedan: "Седан",
  fullsize: "Полноразмерный",
  suv: "Внедорожник",
  minivan: "Минивэн",
  premium: "Премиум",
  luxury: "Люкс",
};
