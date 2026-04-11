export const LANGUAGES = [
  { value: "ar", code: "AR" },
  { value: "en", code: "EN" },
  { value: "ka", code: "KA" },
  { value: "ru", code: "RU" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["value"];

export const CURRENCIES = [
  { value: "GEL", label: "GEL ₾" },
  { value: "RUB", label: "RUB ₽" },
  { value: "USD", label: "USD $" },
] as const;

export const PHONE_NUMBER = "+995555123456";
export const PHONE_NUMBER_DISPLAY = "+995555123456";
export const TELEGRAM_USERNAME = "username";
