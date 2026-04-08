"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/src/stores/localeStore";

/** Syncs document direction with the active locale (RTL for Arabic). */
export default function LocaleHtmlDirSync() {
  const language = useLocaleStore((s) => s.language);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      language === "ar" ? "rtl" : "ltr",
    );
  }, [language]);

  return null;
}
