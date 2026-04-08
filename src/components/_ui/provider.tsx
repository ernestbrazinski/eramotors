"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import LocaleHtmlDirSync from "@/src/components/_ui/LocaleHtmlDirSync";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableColorScheme={false}>
      <HeroUIProvider>
        <LocaleHtmlDirSync />
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  );
}
