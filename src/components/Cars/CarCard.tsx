"use client";

import type { Car, CarAdditionalSpecKey } from "@/src/types/cars";
import { useCurrency } from "@/src/contexts/CurrencyContext";
import styles from "./CarCard.module.scss";
import Img from "@/src/components/_ui/Img/Img";

interface CarCardProps {
  car: Car;
}

function SpecRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean;
}) {
  const isBoolean = typeof value === "boolean";
  return (
    <li className={styles.cardSpecItem}>
      <span className={styles.cardSpecLabel}>{label}:</span>
      <span className={styles.cardSpecValue}>{value}</span>
    </li>
  );
}

const ADDITIONAL_SPEC_LABELS: Record<CarAdditionalSpecKey, string> = {
  bluetooth: "Bluetooth",
  aux: "AUX",
  ac: "Кондиционер",
  usb: "USB",
  carplay: "CarPlay",
};

export default function CarCard({ car }: CarCardProps) {
  const { formatPrice } = useCurrency();
  const s = car.specs;
  return (
    <article className={styles.card}>
      <div className={styles.cardImageWrap}>
        <Img
          src={car.image}
          alt={car.name}
          className={styles.cardImage}
        />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{car.name}</h3>
        <p className={styles.cardPrice}>
          {formatPrice(car.pricePerDay)} / день
        </p>
        <ul className={styles.cardSpecs}>
          <SpecRow label="КПП" value={s.transmission} />
          <SpecRow label="Расход" value={s.fuelConsumption} />
        </ul>

        {car.additionalSpecs && car.additionalSpecs.length > 0 && (
          <div className={styles.cardAdditionalSpecs}>
            {car.additionalSpecs.map((key) => (
              <span key={key} className={styles.cardAdditionalSpecItem}>
                {ADDITIONAL_SPEC_LABELS[key]}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
