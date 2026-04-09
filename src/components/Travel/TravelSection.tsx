"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import type { Place } from "@/src/types/places";
import { places as placesData } from "@/src/api/demo/places";
import FuelCalculator from "./FuelCalculator";

const places = placesData;

function getMapEmbedUrl(selected: Place | null): string {
  const q = selected ? `${selected.lat},${selected.lng}` : "Georgia";
  const z = selected ? 10 : 7;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed`;
}

export default function TravelSection() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const mapUrl = useMemo(
    () => getMapEmbedUrl(selectedPlace),
    [selectedPlace],
  );

  return (
    <section className="w-full py-[calc(var(--base-size)*4)]" id="travel">
      <div className="container">
        <div className="w-full">
          <h2 className="er-t-h2 mb-[calc(var(--base-size)*3)] text-center">
            Путешествия по Грузии
          </h2>
          <div className="flex w-full flex-row flex-wrap gap-[calc(var(--base-size)*3)]">
            <div className="flex min-w-0 flex-[1_1_calc(var(--base-size)*45)] flex-col">
              <h3 className="er-t-h3-soft mb-[calc(var(--base-size)*2)]">
                Куда поехать
              </h3>
              <ul className="m-0 flex list-none flex-col gap-[calc(var(--base-size)*1)] p-0">
                {places.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      className={clsx(
                        "flex w-full cursor-pointer flex-col rounded-[calc(var(--base-size)*0.6)] border border-foreground p-[calc(var(--base-size)*1.5)] text-left transition-opacity duration-200 hover:opacity-85",
                        selectedPlace?.id === place.id &&
                          "bg-foreground text-background",
                      )}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <span className="er-t-body mb-[calc(var(--base-size)*0.5)] font-semibold">
                        {place.name}
                      </span>
                      <span
                        className={clsx(
                          "er-t-hint-inline m-0 opacity-90",
                          selectedPlace?.id === place.id && "opacity-85",
                        )}
                      >
                        {place.description}
                      </span>
                      <span className="er-t-caption mt-[calc(var(--base-size)*0.5)] opacity-80">
                        от Тбилиси: {place.distanceFromTbilisi} км
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex min-w-0 flex-[1_1_calc(var(--base-size)*55)] flex-col gap-[calc(var(--base-size)*2)]">
              <div className="w-full min-h-[calc(var(--base-size)*40)] overflow-hidden rounded-[calc(var(--base-size)*0.8)] border border-foreground">
                <iframe
                  title="Карта Грузии с достопримечательностями"
                  src={mapUrl}
                  className="block h-full min-h-[calc(var(--base-size)*40)] w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="shrink-0">
                <FuelCalculator place={selectedPlace} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
