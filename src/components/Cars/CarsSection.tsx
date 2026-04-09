"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { Select } from "@/src/components/_ui";
import type { CarCategory } from "@/src/types/cars";
import { CAR_CATEGORY_LABELS } from "@/src/types/cars";
import { cars as carsData } from "@/src/api/demo/cars";
import CarCard from "./CarCard";

type SortType = "price-asc" | "price-desc" | "newest" | "oldest";

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "price-asc", label: "По цене (сначала дешевле)" },
  { value: "price-desc", label: "По цене (сначала дороже)" },
  { value: "newest", label: "По новизне (сначала новые)" },
  { value: "oldest", label: "По новизне (сначала старые)" },
];

const cars = carsData;
const ALL_CATEGORIES: CarCategory[] = [
  "economy",
  "compact",
  "sedan",
  "fullsize",
  "suv",
  "minivan",
  "premium",
  "luxury",
];

const categoryBtnClass =
  "er-t-ui-md min-h-0 whitespace-nowrap rounded-[calc(var(--base-size)*0.4)] px-[calc(var(--base-size)*1.6)] py-[calc(var(--base-size)*0.8)]";

export default function CarsSection() {
  const [category, setCategory] = useState<CarCategory | "all">("all");
  const [sort, setSort] = useState<SortType>("price-asc");

  const filteredAndSorted = useMemo(() => {
    const list = category === "all" ? [...cars] : cars.filter((c) => c.category === category);

    if (sort === "price-asc") list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else if (sort === "price-desc") list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    else if (sort === "newest") list.sort((a, b) => b.year - a.year);
    else if (sort === "oldest") list.sort((a, b) => a.year - b.year);

    return list;
  }, [category, sort]);

  return (
    <section
      className="w-full rounded-t-[calc(var(--base-size)*1)] bg-background py-[calc(var(--base-size)*4)]"
      id="cars"
    >
      <div className="container">
        <div className="w-full">
          <div className="mb-[calc(var(--base-size)*3)] flex flex-row flex-wrap items-center justify-between gap-[calc(var(--base-size)*2)]">
            <div className="flex flex-row flex-wrap items-center justify-center gap-[calc(var(--base-size)*1)]">
              <Button
                size="sm"
                variant={category === "all" ? "solid" : "bordered"}
                onPress={() => setCategory("all")}
                className={categoryBtnClass}
              >
                Все
              </Button>
              {ALL_CATEGORIES.filter((cat) => cars.some((c) => c.category === cat)).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={category === cat ? "solid" : "bordered"}
                  onPress={() => setCategory(cat)}
                  className={categoryBtnClass}
                >
                  {CAR_CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>
            <div className="flex flex-row items-center gap-[calc(var(--base-size)*1)]">
              <span className="er-t-label">Сортировка:</span>
              <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={(v) => setSort(v as SortType)}
                ariaLabel="Сортировка"
              />
            </div>
          </div>
          <div className="flex flex-row flex-wrap items-stretch gap-[calc(var(--base-size)*1.8)]">
            {filteredAndSorted.map((car) => (
              <div
                key={car.id}
                id={`car-${car.id}`}
                className="flex flex-[0_1_calc(var(--base-size)*34)] [&>*]:min-w-0 [&>*]:w-full [&>*]:flex-1"
              >
                <CarCard car={car} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
