"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { PHONE_NUMBER, TELEGRAM_USERNAME } from "@/src/constants/main";
import styles from "./MessengerDropdown.module.scss";

const PHONE_CLEAN = PHONE_NUMBER.replace("+", "");

const MESSENGERS = [
  {
    id: "phone",
    label: "Позвонить",
    icon: <img src="/icons/common/phone.svg" alt="Phone" />,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: <img src="/icons/messengers/telegram.svg" alt="Telegram" />,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <img src="/icons/messengers/whatsapp.svg" alt="WhatsApp" />,
  },
  {
    id: "viber",
    label: "Viber",
    icon: <img src="/icons/messengers/viber.svg" alt="Viber" />,
  },
] as const;

type MessengerId = (typeof MESSENGERS)[number]["id"];

/**
 * URL for each messenger. Pre-filled draft text where supported (WhatsApp, Telegram username).
 * Viber uses `viber://` — needs the desktop/mobile app registered as handler (see Viber docs).
 */
function messengerHref(id: MessengerId, message?: string): string {
  const text = message ? encodeURIComponent(message) : null;
  switch (id) {
    case "phone":
      return `tel:${PHONE_NUMBER}`;
    case "telegram":
      return text
        ? `https://t.me/${TELEGRAM_USERNAME}?text=${text}`
        : `https://t.me/${TELEGRAM_USERNAME}`;
    case "whatsapp":
      return text
        ? `https://wa.me/${PHONE_CLEAN}?text=${text}`
        : `https://wa.me/${PHONE_CLEAN}`;
    case "viber":
      return `viber://chat?number=%2B${PHONE_CLEAN}`;
  }
}

export interface MessengerDropdownProps {
  /** Layout of icons inside the dropdown */
  iconsView?: "grid" | "row";
  /** Dropdown opening direction */
  placement?: "bottom" | "top";
  /** Custom trigger element. Defaults to the 9-dot apps icon button */
  trigger?: ReactNode;
  /** Text label for the trigger button (alternative to the icon trigger) */
  triggerLabel?: string;
  /** Additional class for the wrapper element */
  className?: string;
  /** Pre-filled draft text for WhatsApp and Telegram (Viber user chat has no supported API) */
  message?: string;
}

export default function MessengerDropdown({
  iconsView = "grid",
  placement = "bottom",
  trigger,
  triggerLabel,
  className,
  message,
}: MessengerDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownClass = [
    styles.dropdown,
    placement === "top" ? styles.dropdownTop : styles.dropdownBottom,
    iconsView === "row" ? styles.dropdownRow : styles.dropdownGrid,
  ].join(" ");

  return (
    <div className={`${styles.wrapper} ${className ?? ""}`} ref={ref}>
      {trigger ? (
        <div onClick={() => setOpen((v) => !v)} className={styles.customTrigger}>
          {trigger}
        </div>
      ) : triggerLabel ? (
        <button
          className={styles.triggerLabel}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {triggerLabel}
        </button>
      ) : (
        <button
          className={styles.triggerIcon}
          onClick={() => setOpen((v) => !v)}
          aria-label="Contact us"
          aria-expanded={open}
        >
          <AppsIcon />
        </button>
      )}

      {open && (
        <div className={dropdownClass}>
          {MESSENGERS.map(({ id, label, icon }) => (
            <a
              key={id}
              href={messengerHref(id, message)}
              className={`${styles.item} ${iconsView === "row" ? styles.itemRow : ""}`}
              target={id !== "phone" ? "_blank" : undefined}
              rel={id !== "phone" ? "noopener noreferrer" : undefined}
              aria-label={label}
              onClick={() => setOpen(false)}
            >
              <span className={styles.itemIcon}>{icon}</span>
              {iconsView === "grid" && (
                <span className={styles.itemLabel}>{label}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function AppsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "100%", height: "100%" }}>
      <circle cx="5" cy="5" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  );
}
