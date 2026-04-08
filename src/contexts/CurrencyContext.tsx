"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type CurrencyCode = "GEL" | "USD" | "EUR" | "RUB" | "PLN" | "TL";

const GEL_RATES: Record<Exclude<CurrencyCode, "GEL">, number> = {
  USD: 0.37,
  EUR: 0.34,
  RUB: 37,
  PLN: 1.48,
  TL: 1.48,
};

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (gelAmount: number) => string;
  formatCurrencyLabel: (suffix?: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("GEL");

  const formatPrice = useCallback(
    (gelAmount: number): string => {
      if (currency === "GEL") {
        return `${Math.round(gelAmount)} ₾`;
      }
      const rate = GEL_RATES[currency];
      const converted = gelAmount * rate;
      const rounded = converted >= 1 ? Math.round(converted) : converted.toFixed(2);
      return `${Math.round(gelAmount)} ₾ ≈ ${rounded} ${currency}`;
    },
    [currency]
  );

  const formatCurrencyLabel = useCallback(
    (suffix?: string): string => {
      if (currency === "GEL") return suffix ? `₾/${suffix}` : "₾";
      return suffix ? `₾/${suffix} ≈ ${currency}` : `₾ ≈ ${currency}`;
    },
    [currency]
  );

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    formatPrice,
    formatCurrencyLabel,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export { GEL_RATES };
