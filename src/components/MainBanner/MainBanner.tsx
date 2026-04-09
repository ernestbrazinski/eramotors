"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { cars } from "@/src/api/demo/cars";
import { useCurrency } from "@/src/stores/currencyStore";
import Img from "@/src/components/_ui/Img/Img";
import {
  CAR_OF_DAY_DISCOUNT_PERCENT,
  discountedDailyPrice,
  getCarOfDayIndex,
} from "./carOfDay";

import "swiper/css";
import "swiper/css/pagination";

const slideContentClass =
  "relative z-[3] mx-auto flex h-full max-w-[calc(var(--base-size)*72)] flex-col items-center justify-center gap-[calc(var(--base-size)*1.2)] px-[calc(var(--base-size)*2)] py-[calc(var(--base-size)*4)] text-center";

const badgeClass =
  "er-t-badge inline-block rounded-[calc(var(--base-size)*2)] bg-primary px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*0.45)] text-white";

const slideTitleClass = "er-t-banner-headline text-white";

const slideTextClass =
  "er-t-banner-lead m-0 max-w-[calc(var(--base-size)*48)] text-white/88";

const ctaClass =
  "er-t-cta mt-[calc(var(--base-size)*0.4)] inline-flex items-center justify-center rounded-[calc(var(--base-size)*0.9)] border border-white/35 bg-white/12 px-[calc(var(--base-size)*2.4)] py-[calc(var(--base-size)*1)] text-white no-underline transition-[background,border-color,transform] duration-200 hover:-translate-y-px hover:border-white/55 hover:bg-white/20";

export default function MainBanner() {
  const { formatPrice } = useCurrency();
  const carOfDayIndex = useMemo(() => getCarOfDayIndex(cars.length), []);

  const carOfDay = cars[carOfDayIndex] ?? cars[0];
  const carDayPrice = useMemo(
    () => discountedDailyPrice(carOfDay.pricePerDay),
    [carOfDay.pricePerDay],
  );

  return (
    <div className="relative h-[calc(var(--base-size)*65)] bg-[#242424]">
      <Swiper
        className="er-main-banner-swiper"
        modules={[Autoplay, Pagination]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        loop={cars.length >= 1}
        speed={600}
      >
        <SwiperSlide className="relative box-border h-full">
          <div className="absolute inset-0 z-0">
            <Img src={carOfDay.image} alt="" className="block h-full w-full object-cover" />
            <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden />
          </div>
          <div className={slideContentClass}>
            <span className={badgeClass}>Машина дня</span>
            <h2 className={slideTitleClass}>{carOfDay.name}</h2>
            <p className={slideTextClass}>
              Скидка <strong>{CAR_OF_DAY_DISCOUNT_PERCENT}%</strong> на аренду сегодня — успейте забронировать по специальной цене.
            </p>
            <div className="flex flex-wrap items-baseline justify-center gap-[calc(var(--base-size)*1.2)]">
              <span className="er-t-price-old text-white/50 line-through">
                {formatPrice(carOfDay.pricePerDay)} / день
              </span>
              <span className="er-t-price text-white">
                {formatPrice(carDayPrice)} / день
              </span>
            </div>
            <Link href={`/#car-${carOfDay.id}`} className={ctaClass}>
              Смотреть в каталоге
            </Link>
          </div>
        </SwiperSlide>

        <SwiperSlide className="relative box-border h-full">
          <div className="absolute inset-0 z-0">
            <Img src="/images/batumi.jpg" alt="" className="block h-full w-full object-cover" />
            <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden />
          </div>
          <div className={slideContentClass}>
            <span className={badgeClass}>Топливо</span>
            <h2 className={slideTitleClass}>Скидка на АЗС SOCAR</h2>
            <p className={slideTextClass}>
              <strong>10 тетри с литра</strong> при оплате картой SOCAR на заправках сети — выгодно в поездках по Грузии.
            </p>
            <Link href="/travel" className={ctaClass}>
              К калькулятору поездки
            </Link>
          </div>
        </SwiperSlide>

        <SwiperSlide className="relative box-border h-full">
          <div className="absolute inset-0 z-0">
            <Img src="/images/batumi.jpg" alt="" className="block h-full w-full object-cover" />
            <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden />
          </div>
          <div className={slideContentClass}>
            <span className={badgeClass}>Длительная аренда</span>
            <h2 className={slideTitleClass}>Выгода от 7 дней</h2>
            <p className={slideTextClass}>
              Планируете длительную поездку? Спросите у нас персональные условия и скидку на аренду от недели.
            </p>
            <Link href="/#cars" className={ctaClass}>
              Выбрать автомобиль
            </Link>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
