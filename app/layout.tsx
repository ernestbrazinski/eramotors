import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Provider as AppProvider } from "@/src/components/_ui/provider";
import { CurrencyProvider } from "@/src/contexts/CurrencyContext";
import { LocaleProvider } from "@/src/contexts/LocaleContext";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ERAMOTORS | Rent a car in Batumi",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.variable} antialiased`}>
        <AppProvider>
          <CurrencyProvider>
            <LocaleProvider>{children}</LocaleProvider>
          </CurrencyProvider>
        </AppProvider>
      </body>
    </html>
  );
}
