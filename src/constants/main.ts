export const LANGUAGES = [
  { value: "ru", code: "RU" },
  { value: "en", code: "EN" },
  { value: "ka", code: "KA" },
  // { value: "pl", code: "PL" },
  // { value: "de", code: "DE" },
  { value: "ar", code: "AR" },
  // { value: "tr", code: "TR" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["value"];

export const CURRENCIES = [
  { value: "GEL", label: "GEL ₾" },
  { value: "RUB", label: "RUB ₽" },
  { value: "USD", label: "USD $" },
  // { value: "EUR", label: "EUR - €" },
  // { value: "PLN", label: "PLN - zł" },
  // { value: "TL", label: "TL - ₺" },
] as const;

export const PHONE_NUMBER = "+995555123456";
export const PHONE_NUMBER_DISPLAY = "+995 591116535";

/** Telegram public username without @ (t.me/… links) */
export const TELEGRAM_USERNAME = "chasenstatus7";
