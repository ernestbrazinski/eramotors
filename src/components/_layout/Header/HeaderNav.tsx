"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTravel } from "@/src/stores/travelStore";
import clsx from "clsx";

const NAV_LINKS = [
  {
    label: "Автомобили",
    href: "/#cars",
    anchor: "cars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2v-4a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
        <circle cx="7.5" cy="17" r="1.5" />
        <circle cx="16.5" cy="17" r="1.5" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    label: "Места",
    href: "/places",
    anchor: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Калькулятор",
    href: "/travel",
    anchor: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 7h8M8 12h4M8 17h2M16 14l-2 3 2 0" />
      </svg>
    ),
  },
] as const;

function scrollToAnchor(anchor: string) {
  const el = document.getElementById(anchor);
  if (!el) return;
  const headerHeight = (document.querySelector("header") as HTMLElement | null)?.offsetHeight ?? 0;
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top, behavior: "smooth" });
}

function calculatorSelectionHint(hasCar: boolean, hasPlaces: boolean): string {
  if (hasCar && hasPlaces) {
    return "Автомобиль и маршрут учтены в расчёте поездки — откройте калькулятор";
  }
  if (hasCar) {
    return "Автомобиль добавлен в расчёт стоимости поездки — откройте калькулятор";
  }
  return "Маршрут добавлен в расчёт стоимости поездки — откройте калькулятор";
}

const CALCULATOR_HINT_MS = 2600;

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasSelection, selectedCarId, route } = useTravel();
  const hasCar = selectedCarId !== null;
  const hasPlaces = route.length > 0;
  const routeSignature = useMemo(() => route.map((p) => p.id).join(","), [route]);

  const [showCalculatorHint, setShowCalculatorHint] = useState(false);

  useEffect(() => {
    if (!hasSelection) {
      queueMicrotask(() => setShowCalculatorHint(false));
      return;
    }
    queueMicrotask(() => setShowCalculatorHint(true));
    const t = window.setTimeout(() => setShowCalculatorHint(false), CALCULATOR_HINT_MS);
    return () => window.clearTimeout(t);
  }, [hasSelection, selectedCarId, routeSignature]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, anchor: string | null) {
    if (!anchor) return;
    e.preventDefault();
    if (pathname === "/") {
      scrollToAnchor(anchor);
    } else {
      router.push("/");
      setTimeout(() => scrollToAnchor(anchor), 300);
    }
  }

  return (
    <nav className="flex flex-row items-center gap-[calc(var(--base-size)*0.4)] overflow-visible">
      {NAV_LINKS.map(({ label, href, anchor, icon }) => {
        const isActive = anchor ? false : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "er-t-nav relative flex flex-row items-center gap-[calc(var(--base-size)*0.8)] whitespace-nowrap rounded-[calc(var(--base-size)*0.8)] px-[calc(var(--base-size)*1.2)] py-[calc(var(--base-size)*0.8)] text-foreground no-underline opacity-65 transition-[opacity,background] duration-200",
              "hover:bg-black/8 hover:opacity-100 dark:hover:bg-white/8",
              isActive && "bg-black/8 font-semibold opacity-100 dark:bg-white/8",
            )}
            onClick={(e) => handleClick(e, anchor)}
          >
            <span className="flex shrink-0 items-center [&_svg]:h-[calc(var(--base-size)*1.8)] [&_svg]:w-[calc(var(--base-size)*1.8)]">
              {icon}
            </span>
            <span>{label}</span>
            {href === "/travel" && showCalculatorHint && (
              <span
                className="er-header-calculator-hint er-t-floating-hint"
                role="status"
                aria-live="polite"
              >
                {calculatorSelectionHint(hasCar, hasPlaces)}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
