"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { Select } from "@/src/components/_ui";
import type { CarCategory } from "@/src/types/cars";
import { CAR_CATEGORY_LABELS } from "@/src/types/cars";
import { cars as carsData } from "@/src/api/demo/cars";
import CarCard from "./CarCard";
import styles from "./CarsSection.module.scss";

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

export default function CarsSection() {
  const [category, setCategory] = useState<CarCategory | "all">("all");
  const [sort, setSort] = useState<SortType>("price-asc");

  const filteredAndSorted = useMemo(() => {
    const list =
      category === "all"
        ? [...cars]
        : cars.filter((c) => c.category === category);

    if (sort === "price-asc") list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else if (sort === "price-desc")
      list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    else if (sort === "newest") list.sort((a, b) => b.year - a.year);
    else if (sort === "oldest") list.sort((a, b) => a.year - b.year);

    return list;
  }, [category, sort]);

  return (
    <section className={styles.section} id="cars">
      <div className="container">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Автомобили</h2>
          <div className={styles.toolbar}>
            <div className={styles.categories}>
              <Button
                size="sm"
                variant={category === "all" ? "solid" : "bordered"}
                onPress={() => setCategory("all")}
                className={styles.categoryBtn}
              >
                Все
              </Button>
              {ALL_CATEGORIES.filter((cat) =>
                cars.some((c) => c.category === cat),
              ).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={category === cat ? "solid" : "bordered"}
                  onPress={() => setCategory(cat)}
                  className={styles.categoryBtn}
                >
                  {CAR_CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>
            <div className={styles.sortWrap}>
              <span className={styles.sortLabel}>Сортировка:</span>
              <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={(v) => setSort(v as SortType)}
                ariaLabel="Сортировка"
              />
            </div>
          </div>
          <div className={styles.grid}>
            {filteredAndSorted.map((car) => (
              <div key={car.id} className={styles.gridItem}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
