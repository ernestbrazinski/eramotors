"use client";

import type { Car, CarAdditionalSpecKey } from "@/src/types/cars";
import { useCurrency } from "@/src/stores/currencyStore";
import { useTravel } from "@/src/stores/travelStore";
import MessengerDropdown from "@/src/components/_ui/MessengerDropdown/MessengerDropdown";
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
  const { selectedCarId, setCarId } = useTravel();
  const isSelected = selectedCarId === car.id;
  const s = car.specs;
  return (
    <article className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}>
      <div className={styles.cardImageWrap}>
        <Img
          src={car.image}
          alt={car.name}
          className={styles.cardImage}
        />
        {isSelected && (
          <div className={styles.cardSelectedBadge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Выбрано
          </div>
        )}
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

        <div className={styles.cardActions}>
          <button
            className={`${styles.cardSelectBtn} ${isSelected ? styles.cardSelectBtnActive : ""}`}
            onClick={() => setCarId(car.id)}
          >
            {isSelected ? "Снять выбор" : "Выбрать для расчёта"}
          </button>
          <MessengerDropdown
            iconsView="row"
            placement="top"
            triggerLabel="Арендовать"
            className={styles.cardRentDropdown}
            message={`Здравствуйте, я хочу арендовать у вас автомобиль ${car.name}`}
          />
        </div>
      </div>
    </article>
  );
}
