"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { cars } from "@/src/api/demo/cars";
import { useCurrency } from "@/src/stores/currencyStore";
import Img from "@/src/components/_ui/Img/Img";
import { CAR_OF_DAY_DISCOUNT_PERCENT, discountedDailyPrice, getCarOfDayIndex } from "./carOfDay";

import "swiper/css";
import "swiper/css/effect-fade";

const BANNER_SLIDE_COUNT = 3;
const BANNER_AUTOPLAY_MS = 6500;

const slideContentClass =
  "relative z-[3] mx-auto flex h-full max-w-[calc(var(--base-size)*72)] flex-col items-center justify-center gap-[calc(var(--base-size)*1.2)] px-[calc(var(--base-size)*2)] py-[calc(var(--base-size)*4)] text-center";

const badgeClass =
  "inline-block rounded-[calc(var(--base-size)*2)] bg-primary px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*0.45)] text-[calc(var(--base-size)*1.2)] font-bold uppercase tracking-[0.04em] leading-[1.2] text-white";

const slideTitleClass =
  "m-0 text-[clamp(calc(var(--base-size)*2.4),4vw,calc(var(--base-size)*4.2)))] font-bold leading-[1.15] text-white";

const slideTextClass =
  "m-0 max-w-[calc(var(--base-size)*48)] text-[calc(var(--base-size)*1.5)] leading-[1.5] text-white/88";

const ctaClass =
  "mt-[calc(var(--base-size)*0.4)] inline-flex items-center justify-center rounded-[calc(var(--base-size)*0.9)] border border-white/35 bg-white/12 px-[calc(var(--base-size)*2.4)] py-[calc(var(--base-size)*1)] text-[calc(var(--base-size)*1.45)] font-semibold leading-[1.3] text-white no-underline transition-[background,border-color,transform] duration-200 hover:-translate-y-px hover:border-white/55 hover:bg-white/20";

const dotClass = "h-[calc(var(--base-size)*1.25)] w-[calc(var(--base-size)*1.25)]";
const pillClass = "h-[calc(var(--base-size)*1.25)] w-[calc(var(--base-size)*5.6)] overflow-hidden";

const edgeNavBtnClass =
  "absolute inset-y-0 z-[15] w-[20px] cursor-pointer border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30";

export default function MainBanner() {
  const { formatPrice } = useCurrency();
  const carOfDayIndex = useMemo(() => getCarOfDayIndex(cars.length), []);

  const carOfDay = cars[carOfDayIndex] ?? cars[0];
  const carDayPrice = useMemo(
    () => discountedDailyPrice(carOfDay.pricePerDay),
    [carOfDay.pricePerDay]
  );

  const swiperRef = useRef<SwiperType | null>(null);
  const [realIndex, setRealIndex] = useState(0);

  const onSlideChange = useCallback((swiper: SwiperType) => {
    setRealIndex(swiper.realIndex);
  }, []);

  const goToSlide = useCallback((index: number) => {
    swiperRef.current?.slideToLoop(index);
  }, []);

  return (
    <div className="relative h-[calc(var(--base-size)*75)] bg-[#242424]">
      <Swiper
        className="er-main-banner-swiper h-full"
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={false}
        autoplay={{ delay: BANNER_AUTOPLAY_MS, disableOnInteraction: false }}
        loop
        speed={700}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={onSlideChange}
      >
        <SwiperSlide className="relative box-border h-full">
          <div className="absolute inset-0 z-0">
            <Img
              src="/images/banner/car-of-day.png"
              alt=""
              className="block h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden />
          </div>
          <div className={slideContentClass}>
            <span className={badgeClass}>Машина дня</span>
            <h2 className={slideTitleClass}>{carOfDay.name}</h2>
            <p className={slideTextClass}>
              Скидка <strong>{CAR_OF_DAY_DISCOUNT_PERCENT}%</strong> на аренду сегодня — успейте
              забронировать по специальной цене.
            </p>
            <div className="flex flex-wrap items-baseline justify-center gap-[calc(var(--base-size)*1.2)]">
              <span className="text-[calc(var(--base-size)*1.6)] leading-[1.2] text-white/50 line-through">
                {formatPrice(carOfDay.pricePerDay)} / день
              </span>
              <span className="text-[calc(var(--base-size)*2.2)] font-bold leading-[1.15] text-white">
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
            <Img
              src="/images/banner/socar1.png"
              alt=""
              className="block h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden />
          </div>
          <div className={slideContentClass}>
            <span className={badgeClass}>Топливо</span>
            <h2 className={slideTitleClass}>Скидка на АЗС SOCAR</h2>
            <p className={slideTextClass}>
              <strong>15 тетри с литра</strong> при оплате картой SOCAR на заправках сети — выгодно
              в поездках по Грузии.
            </p>
            <Link href="/travel" className={ctaClass}>
              К калькулятору поездки
            </Link>
          </div>
        </SwiperSlide>

        <SwiperSlide className="relative box-border h-full">
          <div className="absolute inset-0 z-0">
            <Img
              src="/images/banner/batumi.jpg"
              alt=""
              className="block h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-[1] bg-black/55" aria-hidden />
          </div>
          <div className={slideContentClass}>
            <span className={badgeClass}>Длительная аренда</span>
            <h2 className={slideTitleClass}>Выгода от 7 дней</h2>
            <p className={slideTextClass}>
              Планируете длительную поездку? Спросите у нас персональные условия и скидку на аренду
              от недели.
            </p>
            <Link href="/#cars" className={ctaClass}>
              Выбрать автомобиль
            </Link>
          </div>
        </SwiperSlide>
      </Swiper>

      <button
        type="button"
        aria-label="Предыдущий слайд"
        onClick={() => swiperRef.current?.slidePrev()}
        className={clsx(
          edgeNavBtnClass,
          "left-0 bg-gradient-to-r from-black/45 via-black/12 to-transparent hover:from-black/55 hover:via-black/18"
        )}
      />
      <button
        type="button"
        aria-label="Следующий слайд"
        onClick={() => swiperRef.current?.slideNext()}
        className={clsx(
          edgeNavBtnClass,
          "right-0 bg-gradient-to-l from-black/45 via-black/12 to-transparent hover:from-black/55 hover:via-black/18"
        )}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--base-size)*1.8)] z-20 flex justify-center"
        role="tablist"
        aria-label="Слайды баннера"
      >
        <div className="pointer-events-auto flex items-center gap-[calc(var(--base-size)*0.9)]">
          {Array.from({ length: BANNER_SLIDE_COUNT }, (_, i) => {
            const active = i === realIndex;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Слайд ${i + 1} из ${BANNER_SLIDE_COUNT}`}
                onClick={() => goToSlide(i)}
                className={clsx(
                  "rounded-full border-0 bg-white/92 p-0 shadow-[0_3px_12px_rgba(0,0,0,0.22)] transition-[width,box-shadow] duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
                  active ? pillClass : dotClass
                )}
              >
                {active ? (
                  <span
                    key={realIndex}
                    className="er-banner-pagination-progress block h-full min-w-0 bg-primary"
                    style={
                      {
                        "--er-banner-autoplay": `${BANNER_AUTOPLAY_MS}ms`,
                      } as CSSProperties
                    }
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
