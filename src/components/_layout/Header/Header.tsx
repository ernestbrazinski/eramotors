"use client";
import styles from "./Header.module.scss";

// Constants
import {
  LANGUAGES,
  type LanguageCode,
  CURRENCIES,
} from "@/src/constants/main";
import { getHeaderMessages } from "@/src/constants/locales";

import type { CurrencyCode } from "@/src/stores/currencyStore";
import { useCurrency } from "@/src/stores/currencyStore";
import { useLocale } from "@/src/stores/localeStore";

// Components
import { Select } from "@/src/components/_ui";
import Img from "@/src/components/_ui/Img/Img";
import MessengerDropdown from "@/src/components/_ui/MessengerDropdown/MessengerDropdown";
import ThemeToggle from "./ThemeToggle";
import HeaderNav from "./HeaderNav";
import Link from "next/link";

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
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerInner}>
          <Link href="/" className={styles.headerLogo}>
            <Img src="/icons/eramotors-logo-animated-dark.svg" alt={t.logoAlt} />
          </Link>
          <HeaderNav />
          <div className={styles.headerRight}>
            <ThemeToggle />
            <MessengerDropdown iconsView="grid" placement="bottom" />

            <div className={styles.selectWrapper}>
              <Select
                options={currencyOptions}
                value={currency}
                onChange={(v) => setCurrency(v as CurrencyCode)}
                ariaLabel={t.currency}
              />
            </div>

            <div className={styles.selectWrapper}>
              <Select
                options={languageOptions}
                value={language}
                onChange={(v) => setLanguage(v as LanguageCode)}
                ariaLabel={t.language}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
