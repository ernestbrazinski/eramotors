"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LanguageCode } from "@/src/constants/locales";

type LocaleContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      language === "ar" ? "rtl" : "ltr",
    );
  }, [language]);

  const value: LocaleContextValue = {
    language,
    setLanguage: useCallback(setLanguage, []),
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
