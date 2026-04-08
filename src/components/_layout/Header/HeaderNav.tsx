"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTravel } from "@/src/stores/travelStore";
import styles from "./HeaderNav.module.scss";

const NAV_LINKS = [
  {
    label: "Автомобили",
    href: "/#cars",
    anchor: "cars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2v-4a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
        <circle cx="7.5" cy="17" r="1.5" />
        <circle cx="16.5" cy="17" r="1.5" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    label: "Места",
    href: "/places",
    anchor: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Калькулятор",
    href: "/travel",
    anchor: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 7h8M8 12h4M8 17h2M16 14l-2 3 2 0" />
      </svg>
    ),
  },
] as const;

function scrollToAnchor(anchor: string) {
  const el = document.getElementById(anchor);
  if (!el) return;
  const headerHeight = (document.querySelector("header") as HTMLElement | null)?.offsetHeight ?? 0;
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasSelection } = useTravel();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, anchor: string | null, href: string) {
    if (!anchor) return;
    e.preventDefault();
    if (pathname === "/") {
      scrollToAnchor(anchor);
    } else {
      router.push("/");
      // After navigation the anchor will be resolved via the native hash
      setTimeout(() => scrollToAnchor(anchor), 300);
    }
  }

  return (
    <nav className={styles.nav}>
      {NAV_LINKS.map(({ label, href, anchor, icon }) => {
        const isActive = anchor ? false : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
            onClick={(e) => handleClick(e, anchor, href)}
          >
            <span className={styles.linkIcon}>{icon}</span>
            <span>{label}</span>
            {href === "/travel" && hasSelection && (
              <span className={styles.dot} aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
