"use client";

import Link from "next/link";
import clsx from "clsx";
import type { Place } from "@/src/types/places";
import { places } from "@/src/api/demo/places";
import { useTravel } from "@/src/stores/travelStore";

function PlaceCard({ place }: { place: Place }) {
  const { route, togglePlace } = useTravel();
  const idx = route.findIndex((p) => p.id === place.id);
  const isSelected = idx !== -1;

  return (
    <div
      className={clsx(
        "flex flex-[0_1_calc(var(--base-size)*34)] flex-col gap-[calc(var(--base-size)*1)] rounded-[calc(var(--base-size)*1.6)] border border-[rgba(128,128,128,0.2)] p-[calc(var(--base-size)*2.4)] text-foreground transition-[border-color,background] duration-200",
        "hover:border-[rgba(128,128,128,0.4)] hover:bg-[rgba(128,128,128,0.04)]",
        isSelected && "border-primary bg-[rgba(236,32,36,0.04)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="er-t-caption font-medium opacity-50">
          {place.distanceFromTbilisi} км от Тбилиси
        </span>
        {isSelected && (
          <span className="er-t-caption-bold flex h-[calc(var(--base-size)*2.4)] w-[calc(var(--base-size)*2.4)] shrink-0 items-center justify-center rounded-full bg-primary text-white">
            {idx + 1}
          </span>
        )}
      </div>
      <h3 className="er-t-h3 m-0">
        {place.name}
      </h3>
      <p className="er-t-body-sm m-0 flex-1 opacity-70">
        {place.description}
      </p>
      <div className="mt-[calc(var(--base-size)*0.4)] flex items-center justify-between gap-[calc(var(--base-size)*1)]">
        <Link
          href={`/travel?place=${place.id}`}
          className="er-t-ui text-primary opacity-70 no-underline transition-opacity duration-200 hover:opacity-100"
        >
          Маршрут →
        </Link>
        <button
          className={clsx(
            "er-t-ui cursor-pointer rounded-[calc(var(--base-size)*0.8)] border border-[rgba(128,128,128,0.3)] bg-transparent px-[calc(var(--base-size)*1.4)] py-[calc(var(--base-size)*0.5)] text-foreground transition-[background,border-color,color] duration-200 hover:border-primary hover:text-primary",
            isSelected && "border-primary bg-[rgba(236,32,36,0.08)] text-primary",
          )}
          onClick={() => togglePlace(place)}
        >
          {isSelected ? "Убрать" : "+ В маршрут"}
        </button>
      </div>
    </div>
  );
}

export default function PlacesSection() {
  return (
    <section className="w-full py-[calc(var(--base-size)*10)] pb-[calc(var(--base-size)*6)]" id="places">
      <div className="container">
        <div className="flex w-full flex-col items-center">
          <h2 className="er-t-h2 mb-[calc(var(--base-size)*1)] text-center">
            Куда поехать
          </h2>
          <p className="er-t-lead mb-[calc(var(--base-size)*4)] text-center opacity-60">
            Популярные направления из Батуми и Тбилиси
          </p>
          <div className="flex w-full flex-wrap gap-[calc(var(--base-size)*2)]">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
