"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrolled } from "@/hooks/useScrolled";
import AccountMenu, { AccountPanel } from "./AccountMenu";
import NotificationPopover from "./NotificationPopover";
import SearchDialog from "./SearchDialog";
import type { PublicUser } from "@/lib/session";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/", icon: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  {
    label: "Jadwal",
    href: "/jadwal",
    icon: "M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zM16 3v4M8 3v4M3 11h18",
  },
  {
    label: "Genre",
    href: "/genre",
    icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  },
  {
    label: "Country",
    href: "/country",
    icon: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18",
  },
  {
    label: "Network",
    href: "/network",
    icon: "M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2zM8 3l4 4 4-4",
  },
];

const SEARCH_ICON = "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3";
const MENU_ICON = "M4 7h16M4 12h16M4 17h16";

const CLOSE_DISTANCE_RATIO = 0.3;
const CLOSE_VELOCITY = 0.6;

const isActive = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

function Icon({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
};

function NavLink({ item, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-accent/15 text-accent-text"
          : "text-text/80 hover:bg-surface-hover hover:text-text"
      }`}
    >
      <Icon path={item.icon} />
      {item.label}
    </Link>
  );
}

function useSheetDrag(onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const state = useRef({
    startY: 0,
    dy: 0,
    lastY: 0,
    lastT: 0,
    v: 0,
    active: false,
  });

  const apply = (transition: string, translate: string, opacity: string) => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (sheet) {
      sheet.style.transition = transition;
      sheet.style.translate = translate;
    }
    if (backdrop) {
      backdrop.style.transition = transition;
      backdrop.style.opacity = opacity;
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    state.current = {
      startY: e.clientY,
      dy: 0,
      lastY: e.clientY,
      lastT: e.timeStamp,
      v: 0,
      active: true,
    };
    apply("none", "", "");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    const sheet = sheetRef.current;
    if (!s.active || !sheet) return;

    const delta = e.clientY - s.startY;
    s.dy = delta > 0 ? delta : delta * 0.12;

    const dt = e.timeStamp - s.lastT;
    if (dt > 0) s.v = (e.clientY - s.lastY) / dt;
    s.lastY = e.clientY;
    s.lastT = e.timeStamp;

    const progress = Math.max(0, 1 - s.dy / sheet.offsetHeight);
    apply("none", `0 ${s.dy}px`, String(progress));
  };

  const onPointerUp = () => {
    const s = state.current;
    const sheet = sheetRef.current;
    if (!s.active || !sheet) return;
    s.active = false;

    const shouldClose =
      s.dy > sheet.offsetHeight * CLOSE_DISTANCE_RATIO || s.v > CLOSE_VELOCITY;

    apply("", "", "");
    if (shouldClose) onClose();
  };

  return {
    sheetRef,
    backdropRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}

export default function Navbar({
  user,
  loading = false,
}: {
  user: PublicUser | null;
  loading?: boolean;
}) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { sheetRef, backdropRef, handleProps } = useSheetDrag(closeMenu);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-12">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      />

      <nav
        aria-label="Navigasi utama"
        className={`relative mx-auto flex max-w-6xl items-center gap-2 rounded-full border px-2 py-2 transition-colors duration-300 ${
          scrolled
            ? "border-border bg-surface shadow-lg shadow-black/40"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="px-3 text-xl font-extrabold tracking-tight text-text"
        >
          Sen<span className="text-accent-text">Play</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              closeMenu();
              setSearchOpen(true);
            }}
            aria-label="Cari"
            aria-haspopup="dialog"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-hover"
          >
            <Icon path={SEARCH_ICON} className="h-5 w-5" />
          </button>

          <NotificationPopover onOpen={closeMenu} />

          <div className="hidden md:block">
            <AccountMenu user={user} loading={loading} onOpen={closeMenu} />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Buka menu"
            className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-4 text-sm font-semibold text-text transition-colors hover:bg-surface-hover md:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover">
              <Icon path={MENU_ICON} />
            </span>
            Menu
          </button>
        </div>
      </nav>

      <div className="md:hidden">
        <button
          ref={backdropRef}
          type="button"
          aria-label="Tutup menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
          className={`fixed inset-0 z-40 bg-black/60 transition-[opacity,visibility] duration-300 ease-out ${
            menuOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        />

        <div
          ref={sheetRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          aria-hidden={!menuOpen}
          className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-surface px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl shadow-black will-change-[translate] transition-[translate,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            menuOpen ? "visible translate-y-0" : "invisible translate-y-full"
          }`}
        >
          <div
            {...handleProps}
            className="-mx-4 -mt-3 cursor-grab touch-none px-4 py-3 active:cursor-grabbing"
          >
            <div
              aria-hidden="true"
              className="mx-auto h-1 w-10 rounded-full bg-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                onClick={closeMenu}
              />
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <AccountPanel user={user} onNavigate={closeMenu} />
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
