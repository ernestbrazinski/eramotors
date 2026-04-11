"use client";

import clsx from "clsx";
import type { Car, CarAdditionalSpecKey } from "@/src/types/cars";
import { useCurrency } from "@/src/stores/currencyStore";
import { useTravel } from "@/src/stores/travelStore";
import MessengerDropdown from "@/src/components/_ui/MessengerDropdown/MessengerDropdown";
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
    <li className="flex flex-row items-center gap-[calc(var(--base-size)*0.8)] text-[calc(var(--base-size)*1.4)] leading-[1.4]">
      <span className="opacity-85">{label}:</span>
      <span className="font-medium">{value}</span>
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
    <article
      className={clsx(
        "group flex h-full w-full max-w-[calc(var(--base-size)*36)] flex-col overflow-hidden rounded-[calc(var(--base-size)*2.4)] border border-[rgba(128,128,128,0.2)] transition-[border-color] duration-200",
        isSelected && "border-primary",
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-white p-[10px]">
        <Img
          src={car.image}
          alt={car.name}
          className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        {isSelected && (
          <div className="absolute top-[calc(var(--base-size)*1.2)] left-[calc(var(--base-size)*1.2)] flex items-center gap-[calc(var(--base-size)*0.6)] rounded-[calc(var(--base-size)*2)] bg-primary px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*0.5)] text-[calc(var(--base-size)*1.2)] font-bold leading-[1.2] text-white">
            <svg className="h-[calc(var(--base-size)*1.4)] w-[calc(var(--base-size)*1.4)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Выбрано
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[calc(var(--base-size)*1)] p-[calc(var(--base-size)*2)]">
        <h3 className="m-0 text-[calc(var(--base-size)*2)] font-bold leading-[1.2]">
          {car.name}
        </h3>
        <p className="rounded-[calc(var(--base-size)*1.6)] bg-primary py-[calc(var(--base-size)*0.4)] text-center text-[calc(var(--base-size)*1.6)] leading-[1.5] font-semibold text-white">
          {formatPrice(car.pricePerDay)} / день
        </p>
        <ul className="m-0 flex list-none flex-col gap-[calc(var(--base-size)*0.6)] p-0">
          <SpecRow label="КПП" value={s.transmission} />
          <SpecRow label="Расход" value={s.fuelConsumption} />
        </ul>

        {car.additionalSpecs && car.additionalSpecs.length > 0 && (
          <div className="flex flex-wrap gap-[calc(var(--base-size)*0.8)] text-[calc(var(--base-size)*1.3)] leading-[1.2]">
            {car.additionalSpecs.map((key) => (
              <span
                key={key}
                className="rounded-[calc(var(--base-size)*1.6)] bg-foreground px-[calc(var(--base-size)*1)] py-[calc(var(--base-size)*0.2)] text-background"
              >
                {ADDITIONAL_SPEC_LABELS[key]}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-[calc(var(--base-size)*0.8)]">
          <button
            className={clsx(
              "w-full cursor-pointer rounded-[calc(var(--base-size)*1)] border border-[rgba(128,128,128,0.3)] bg-transparent px-[calc(var(--base-size)*1.6)] py-[calc(var(--base-size)*0.9)] text-[calc(var(--base-size)*1.3)] font-semibold leading-[1.3] text-foreground transition-[background,border-color,color] duration-200 hover:border-primary hover:text-primary",
              isSelected && "border-primary bg-[rgba(236,32,36,0.08)] text-primary",
            )}
            onClick={() => setCarId(car.id)}
          >
            {isSelected ? "Снять выбор" : "Выбрать для расчёта"}
          </button>
          <MessengerDropdown
            iconsView="row"
            placement="top"
            triggerLabel="Арендовать"
            className="w-full"
            message={`Здравствуйте, я хочу арендовать у вас автомобиль ${car.name}`}
          />
        </div>
      </div>
    </article>
  );
}
