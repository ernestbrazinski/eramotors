import { create } from "zustand";

export type CurrencyCode = "GEL" | "USD" | "RUB";

const GEL_RATES: Record<Exclude<CurrencyCode, "GEL">, number> = {
  USD: 0.37,
  RUB: 37,
};

type CurrencyState = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (gelAmount: number) => string;
  formatCurrencyLabel: (suffix?: string) => string;
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: "GEL",
  setCurrency: (currency) => set({ currency }),
  formatPrice: (gelAmount: number) => {
    const { currency } = get();
    if (currency === "GEL") {
      return `${Math.round(gelAmount)} ₾`;
    }
    const rate = GEL_RATES[currency];
    const converted = gelAmount * rate;
    const rounded = converted >= 1 ? Math.round(converted) : converted.toFixed(2);
    return `${Math.round(gelAmount)} ₾ ≈ ${rounded} ${currency}`;
  },
  formatCurrencyLabel: (suffix?: string) => {
    const { currency } = get();
    if (currency === "GEL") return suffix ? `₾/${suffix}` : "₾";
    return suffix ? `₾/${suffix} ≈ ${currency}` : `₾ ≈ ${currency}`;
  },
}));

export function useCurrency() {
  return useCurrencyStore((s) => s);
}
