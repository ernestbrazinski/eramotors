import { create } from "zustand";
import type { LanguageCode } from "@/src/constants/main";

type LocaleState = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  language: "en",
  setLanguage: (language) => set({ language }),
}));

export function useLocale() {
  return useLocaleStore((s) => s);
}
