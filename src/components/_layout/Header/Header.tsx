"use client";

// Constants
import { LANGUAGES, type LanguageCode, CURRENCIES } from "@/src/constants/main";
import { getHeaderMessages } from "@/src/constants/locales";

// Stores
import type { CurrencyCode } from "@/src/stores/currencyStore";
import { useCurrency } from "@/src/stores/currencyStore";
import { useLocale } from "@/src/stores/localeStore";

// Components
import { Select } from "@/src/components/_ui";
import MessengerDropdown from "@/src/components/_ui/MessengerDropdown/MessengerDropdown";
import ThemeToggle from "./ThemeToggle";
import HeaderNav from "./HeaderNav";
import Link from "next/link";
import { LogoAnimated } from "@/src/components/Icons";

// Data
const currencyOptions = CURRENCIES.map((c) => ({ value: c.value, label: c.label }));
const languageOptions = LANGUAGES.map((l) => ({
  value: l.value,
  label: l.code,
  icon: `/icons/locales/${l.value}.svg`,
}));

export default function Header() {
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLocale();
  const t = getHeaderMessages(language);

  return (
    <header className="fixed top-0 z-[999] w-full overflow-visible rounded-b-[calc(var(--base-size)*1)] bg-background shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.22)]">
      <div className="container">
        <div className="flex w-full flex-row items-center justify-between py-[calc(var(--base-size)*0.8)]">
          <Link href="/" className="w-[calc(var(--base-size)*15.5)] shrink-0">
            <LogoAnimated />
          </Link>
          <HeaderNav />
          <div className="flex shrink-0 flex-row items-center gap-[calc(var(--base-size)*0.9)]">
            <ThemeToggle />
            <MessengerDropdown iconsView="grid" placement="bottom" />

            <Select
              compact
              options={currencyOptions}
              value={currency}
              onChange={(v) => setCurrency(v as CurrencyCode)}
              ariaLabel={t.currency}
            />

            <Select
              compact
              options={languageOptions}
              value={language}
              onChange={(v) => setLanguage(v as LanguageCode)}
              ariaLabel={t.language}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
