"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import clsx from "clsx";
import { PHONE_NUMBER, TELEGRAM_USERNAME } from "@/src/constants/main";

const PHONE_CLEAN = PHONE_NUMBER.replace("+", "");

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="none"
        d="m16.585 19.999 2.006-2.005-2.586-2.586-1.293 1.293a.991.991 0 0 1-.912.271c-.115-.024-2.842-.611-4.502-2.271s-2.247-4.387-2.271-4.502a.999.999 0 0 1 .271-.912l1.293-1.293-2.586-2.586L4 7.413c.02 1.223.346 5.508 3.712 8.874 3.355 3.356 7.625 3.691 8.873 3.712z"
      />
      <path
        fill="currentColor"
        d="M16.566 21.999h.028c.528 0 1.027-.208 1.405-.586l2.712-2.712a.999.999 0 0 0 0-1.414l-4-4a.999.999 0 0 0-1.414 0l-1.594 1.594c-.739-.22-2.118-.72-2.992-1.594s-1.374-2.253-1.594-2.992l1.594-1.594a.999.999 0 0 0 0-1.414l-4-4a1.03 1.03 0 0 0-1.414 0L2.586 5.999c-.38.38-.594.902-.586 1.435.023 1.424.4 6.37 4.298 10.268s8.844 4.274 10.268 4.297zM6.005 5.408l2.586 2.586-1.293 1.293a.996.996 0 0 0-.271.912c.024.115.611 2.842 2.271 4.502s4.387 2.247 4.502 2.271a.994.994 0 0 0 .912-.271l1.293-1.293 2.586 2.586-2.006 2.005c-1.248-.021-5.518-.356-8.873-3.712C4.346 12.921 4.02 8.636 4 7.413l2.005-2.005zm13.994 5.591h2c0-5.13-3.873-8.999-9.01-8.999v2c4.062 0 7.01 2.943 7.01 6.999z"
      />
      <path
        fill="currentColor"
        d="M12.999 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2z"
      />
    </svg>
  );
}

const MESSENGERS = [
  {
    id: "phone",
    label: "Позвонить",
    icon: <PhoneIcon />,
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
      return text ? `https://wa.me/${PHONE_CLEAN}?text=${text}` : `https://wa.me/${PHONE_CLEAN}`;
    case "viber":
      return `viber://chat?number=%2B${PHONE_CLEAN}`;
  }
}

export interface MessengerDropdownProps {
  iconsView?: "grid" | "row";
  placement?: "bottom" | "top";
  trigger?: ReactNode;
  triggerLabel?: string;
  className?: string;
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

  return (
    <div className={clsx("relative", className)} ref={ref}>
      {trigger ? (
        <div onClick={() => setOpen((v) => !v)} className="contents cursor-pointer">
          {trigger}
        </div>
      ) : triggerLabel ? (
        <button
          className="w-full cursor-pointer rounded-[calc(var(--base-size)*1)] border border-[rgba(128,128,128,0.3)] bg-transparent px-[calc(var(--base-size)*1.6)] py-[calc(var(--base-size)*0.9)] text-center text-[calc(var(--base-size)*1.3)] font-semibold leading-[1.3] text-foreground transition-[background,border-color,color] duration-200 hover:border-primary hover:text-primary"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {triggerLabel}
        </button>
      ) : (
        <button
          className="flex h-[calc(var(--base-size)*4)] w-[calc(var(--base-size)*4)] cursor-pointer items-center justify-center rounded-[calc(var(--base-size)*0.8)] border border-[rgba(128,128,128,0.3)] bg-transparent text-foreground transition-[background,border-color] duration-200 hover:bg-black/10 hover:border-[rgba(128,128,128,0.5)] dark:hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Contact us"
          aria-expanded={open}
        >
          <svg className="h-[calc(var(--base-size)*2)] w-[calc(var(--base-size)*2)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={1.91}
              d="M18.68,8.16V15.8a2.86,2.86,0,0,1-2.86,2.86H13.91v2.86L8.18,18.66H4.36A2.86,2.86,0,0,1,1.5,15.8V8.16A2.86,2.86,0,0,1,4.36,5.3H15.82A2.86,2.86,0,0,1,18.68,8.16Z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={1.91}
              d="M18.68,14.84h1A2.86,2.86,0,0,0,22.5,12V4.34a2.86,2.86,0,0,0-2.86-2.86H8.18A2.86,2.86,0,0,0,5.32,4.34v1"
            />
            <line
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={1.91}
              x1="5.32"
              y1="11.98"
              x2="7.23"
              y2="11.98"
            />
            <line
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={1.91}
              x1="9.14"
              y1="11.98"
              x2="11.05"
              y2="11.98"
            />
            <line
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={1.91}
              x1="12.95"
              y1="11.98"
              x2="14.86"
              y2="11.98"
            />
          </svg>
        </button>
      )}

      {open && (
        <div
          className={clsx(
            "absolute z-[200] rounded-[calc(var(--base-size)*1.2)] border border-[rgba(128,128,128,0.2)] bg-background p-[calc(var(--base-size)*1)] shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
            placement === "top"
              ? "bottom-[calc(100%+var(--base-size)*0.8)] right-0"
              : "top-[calc(100%+var(--base-size)*0.8)] right-0",
            iconsView === "row"
              ? "flex flex-row flex-nowrap gap-[calc(var(--base-size)*0.6)]"
              : "grid min-w-[calc(var(--base-size)*22)] grid-cols-2 gap-[calc(var(--base-size)*0.8)]",
          )}
        >
          {MESSENGERS.map(({ id, label, icon }) => (
            <a
              key={id}
              href={messengerHref(id, message)}
              className={clsx(
                "flex flex-col items-center justify-center gap-[calc(var(--base-size)*0.6)] rounded-[calc(var(--base-size)*1)] border border-[rgba(128,128,128,0.15)] bg-[rgba(128,128,128,0.04)] text-foreground no-underline transition-[background,border-color] duration-200 hover:border-[rgba(128,128,128,0.3)] hover:bg-[rgba(128,128,128,0.1)]",
                iconsView === "row"
                  ? "p-[calc(var(--base-size)*0.8)]"
                  : "p-[calc(var(--base-size)*1.2)]",
              )}
              target={id !== "phone" ? "_blank" : undefined}
              rel={id !== "phone" ? "noopener noreferrer" : undefined}
              aria-label={label}
              onClick={() => setOpen(false)}
            >
              <span className="flex h-[calc(var(--base-size)*3.2)] w-[calc(var(--base-size)*3.2)] shrink-0 items-center justify-center [&_img]:h-full [&_img]:w-full [&_img]:object-contain [&_svg]:h-full [&_svg]:w-full">
                {icon}
              </span>
              {iconsView === "grid" && (
                <span className="whitespace-nowrap text-[calc(var(--base-size)*1.2)] leading-[1.35]">
                  {label}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
