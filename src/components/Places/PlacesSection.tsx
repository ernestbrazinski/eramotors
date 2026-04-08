"use client";

import Link from "next/link";
import type { Place } from "@/src/types/places";
import { places } from "@/src/api/demo/places";
import { useTravel } from "@/src/stores/travelStore";
import styles from "./PlacesSection.module.scss";

function PlaceCard({ place }: { place: Place }) {
  const { route, togglePlace } = useTravel();
  const idx = route.findIndex((p) => p.id === place.id);
  const isSelected = idx !== -1;

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}>
      <div className={styles.cardTop}>
        <span className={styles.cardDistance}>
          {place.distanceFromTbilisi} км от Тбилиси
        </span>
        {isSelected && (
          <span className={styles.cardBadge}>{idx + 1}</span>
        )}
      </div>
      <h3 className={styles.cardName}>{place.name}</h3>
      <p className={styles.cardDesc}>{place.description}</p>
      <div className={styles.cardFooter}>
        <Link href={`/travel?place=${place.id}`} className={styles.cardCta}>
          Маршрут →
        </Link>
        <button
          className={`${styles.cardSelectBtn} ${isSelected ? styles.cardSelectBtnActive : ""}`}
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
    <section className={styles.section} id="places">
      <div className="container">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Куда поехать</h2>
          <p className={styles.sectionSubtitle}>
            Популярные направления из Батуми и Тбилиси
          </p>
          <div className={styles.grid}>
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
