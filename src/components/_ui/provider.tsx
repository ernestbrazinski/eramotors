"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableColorScheme>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ThemeProvider>
  );
}
