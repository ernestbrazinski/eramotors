import type { LanguageCode } from "@/src/constants/main";
import ar from "./ar.json";
import en from "./en.json";
import ka from "./ka.json";
import ru from "./ru.json";

const messages = { ru, en, ka, ar } as const;

export type HeaderMessages = {
  currency: string;
  language: string;
  logoAlt: string;
};

export function getHeaderMessages(locale: LanguageCode): HeaderMessages {
  return (messages[locale] ?? messages.en).header as HeaderMessages;
}
