"use client";

import { useState, useMemo } from "react";
import type { Place } from "@/src/types/places";
import placesData from "@/src/data/places.json";
import FuelCalculator from "./FuelCalculator";
import styles from "./TravelSection.module.scss";

const places = placesData as Place[];

/** URL iframe Google Maps (без API key): центр на выбранном месте или Грузия. */
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
    <section className={styles.section} id="travel">
      <div className="container">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Путешествия по Грузии</h2>
          <div className={styles.layout}>
            <div className={styles.placesCol}>
              <h3 className={styles.placesTitle}>Куда поехать</h3>
              <ul className={styles.placesList}>
                {places.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      className={`${styles.placeItem} ${selectedPlace?.id === place.id ? styles.placeItemActive : ""}`}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <span className={styles.placeName}>{place.name}</span>
                      <span className={styles.placeDesc}>{place.description}</span>
                      <span className={styles.placeDistance}>
                        от Тбилиси: {place.distanceFromTbilisi} км
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.mapCol}>
              <div className={styles.mapWrap}>
                <iframe
                  title="Карта Грузии с достопримечательностями"
                  src={mapUrl}
                  className={styles.mapFrame}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className={styles.calculatorWrap}>
                <FuelCalculator place={selectedPlace} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
