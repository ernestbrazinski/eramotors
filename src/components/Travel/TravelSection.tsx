"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import type { Place } from "@/src/types/places";
import { places as placesData } from "@/src/api/demo/places";
import FuelCalculator from "./FuelCalculator";
import { buildYandexPlaceMapUrl } from "@/src/lib/yandexMapsEmbed";

const places = placesData;

export default function TravelSection() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const mapEmbedUrl = useMemo(() => {
    if (selectedPlace) {
      return buildYandexPlaceMapUrl({
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        zoom: 10,
      });
    }
    return buildYandexPlaceMapUrl({ zoom: 7 });
  }, [selectedPlace]);

  return (
    <section className="w-full py-[calc(var(--base-size)*4)]" id="travel">
      <div className="container">
        <div className="w-full">
          <h2 className="mb-[calc(var(--base-size)*3)] text-center text-[calc(var(--base-size)*3)] font-bold leading-[1.2]">
            Путешествия по Грузии
          </h2>
          <div className="flex w-full flex-row flex-wrap gap-[calc(var(--base-size)*3)]">
            <div className="flex min-w-0 flex-[1_1_calc(var(--base-size)*45)] flex-col">
              <h3 className="mb-[calc(var(--base-size)*2)] text-[calc(var(--base-size)*1.8)] font-semibold leading-[1.25]">
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
                      <span className="mb-[calc(var(--base-size)*0.5)] text-[calc(var(--base-size)*1.5)] leading-[1.5] font-semibold">
                        {place.name}
                      </span>
                      <span
                        className={clsx(
                          "m-0 text-[calc(var(--base-size)*1.3)] font-medium leading-[1.35] opacity-90",
                          selectedPlace?.id === place.id && "opacity-85",
                        )}
                      >
                        {place.description}
                      </span>
                      <span className="mt-[calc(var(--base-size)*0.5)] text-[calc(var(--base-size)*1.2)] leading-[1.35] opacity-80">
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
                  src={mapEmbedUrl}
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
