import type { Car, CarCategory } from "@/src/types/cars";

/** Rotate until you add real photos under public/images/cars/… */
const PLACEHOLDER_IMAGES = [
  "/images/cars/nissan-rogue-1/nissan-rogue-2016-gray.webp",
  "/images/cars/mazda-6-1/mazda-6-2013-silver.webp",
  "/images/cars/toyota-prius-1/toyota-prius-2015-lightblue.webp",
] as const;

type CarSeed = {
  id: string;
  name: string;
  category: CarCategory;
  pricePerDay: number;
  year: number;
  consumptionL100: number;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  additionalSpecs?: Car["additionalSpecs"];
};

function specsFromSeed(s: CarSeed): Car["specs"] {
  return {
    transmission: s.transmission ?? "Автомат",
    fuelConsumption: `${s.consumptionL100} л/100км`,
    fuelType: s.fuelType ?? "Бензин",
    seats: s.seats ?? 5,
    bluetooth: true,
    aux: true,
    ac: true,
    usb: true,
  };
}

function seedToCar(s: CarSeed, imageIndex: number): Car {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    pricePerDay: s.pricePerDay,
    year: s.year,
    consumptionL100: s.consumptionL100,
    image: PLACEHOLDER_IMAGES[imageIndex % PLACEHOLDER_IMAGES.length],
    specs: specsFromSeed(s),
    additionalSpecs: s.additionalSpecs ?? ["bluetooth", "aux", "ac", "usb"],
  };
}

/** Popular models in Georgia rental market (placeholder data — replace photos & details). */
const CAR_SEEDS: CarSeed[] = [
  {
    id: "1",
    name: "Nissan Rogue (2019)",
    category: "suv",
    pricePerDay: 50,
    year: 2023,
    consumptionL100: 5.2,
    additionalSpecs: ["bluetooth", "aux", "ac", "usb", "carplay"],
  },
  {
    id: "2",
    name: "Mazda 6 (2013)",
    category: "sedan",
    pricePerDay: 45,
    year: 2013,
    consumptionL100: 7.2,
  },
  {
    id: "3",
    name: "Toyota Prius (2015)",
    category: "economy",
    pricePerDay: 40,
    year: 2015,
    consumptionL100: 4.2,
    fuelType: "Гибрид",
    transmission: "Вариатор",
  },
  { id: "4", name: "Toyota Land Cruiser Prado (2012)", category: "suv", pricePerDay: 95, year: 2012, consumptionL100: 11.2, fuelType: "Дизель" },
  { id: "5", name: "Toyota Corolla (2018)", category: "sedan", pricePerDay: 42, year: 2018, consumptionL100: 6.5 },
  { id: "6", name: "Kia Sportage (2017)", category: "suv", pricePerDay: 48, year: 2017, consumptionL100: 8.1 },
  { id: "7", name: "Nissan Kicks (2020)", category: "compact", pricePerDay: 38, year: 2020, consumptionL100: 6.2 },
  { id: "8", name: "Suzuki Vitara (2019)", category: "suv", pricePerDay: 44, year: 2019, consumptionL100: 6.8 },
  { id: "9", name: "Hyundai Elantra (2019)", category: "sedan", pricePerDay: 40, year: 2019, consumptionL100: 7.0 },
  { id: "10", name: "Ford Fiesta (2016)", category: "compact", pricePerDay: 32, year: 2016, consumptionL100: 5.8 },
  { id: "11", name: "Toyota Camry (2017)", category: "sedan", pricePerDay: 55, year: 2017, consumptionL100: 8.0 },
  { id: "12", name: "Mitsubishi ASX (2018)", category: "suv", pricePerDay: 43, year: 2018, consumptionL100: 7.5 },
  { id: "13", name: "Renault Duster (2019)", category: "suv", pricePerDay: 41, year: 2019, consumptionL100: 7.8, fuelType: "Дизель" },
  { id: "14", name: "Subaru Forester (2016)", category: "suv", pricePerDay: 49, year: 2016, consumptionL100: 9.2 },
  { id: "15", name: "Volkswagen Polo (2018)", category: "compact", pricePerDay: 35, year: 2018, consumptionL100: 5.4 },
  { id: "16", name: "Škoda Octavia (2017)", category: "sedan", pricePerDay: 44, year: 2017, consumptionL100: 6.0, fuelType: "Дизель" },
  { id: "17", name: "BMW 320i (2016)", category: "premium", pricePerDay: 72, year: 2016, consumptionL100: 6.8 },
  { id: "18", name: "Mercedes-Benz E220 (2015)", category: "luxury", pricePerDay: 88, year: 2015, consumptionL100: 7.2, fuelType: "Дизель" },
  { id: "19", name: "Honda CR-V (2018)", category: "suv", pricePerDay: 52, year: 2018, consumptionL100: 8.2 },
  { id: "20", name: "Toyota RAV4 (2019)", category: "suv", pricePerDay: 54, year: 2019, consumptionL100: 7.6 },
  { id: "21", name: "Nissan X-Trail (2017)", category: "suv", pricePerDay: 47, year: 2017, consumptionL100: 8.0 },
  { id: "22", name: "Lexus RX 350 (2014)", category: "premium", pricePerDay: 78, year: 2014, consumptionL100: 11.0 },
  { id: "23", name: "Hyundai Tucson (2020)", category: "suv", pricePerDay: 46, year: 2020, consumptionL100: 7.9 },
  { id: "24", name: "Kia Rio (2019)", category: "economy", pricePerDay: 33, year: 2019, consumptionL100: 6.0 },
  { id: "25", name: "Volkswagen Tiguan (2018)", category: "suv", pricePerDay: 51, year: 2018, consumptionL100: 8.5 },
  { id: "26", name: "Mazda CX-5 (2019)", category: "suv", pricePerDay: 50, year: 2019, consumptionL100: 7.8 },
  { id: "27", name: "Toyota Yaris (2018)", category: "economy", pricePerDay: 34, year: 2018, consumptionL100: 5.2 },
  { id: "28", name: "Fiat 500 (2017)", category: "compact", pricePerDay: 36, year: 2017, consumptionL100: 5.0 },
];

export const cars: Car[] = CAR_SEEDS.map((seed, i) => seedToCar(seed, i));
