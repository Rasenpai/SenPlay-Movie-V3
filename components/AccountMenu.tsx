"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/session";

const USER_ICON =
  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z";
const CHEVRON_ICON = "M6 9l6 6 6-6";
const LOGIN_ICON =
  "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3";
const LOGOUT_ICON =
  "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9";

function Svg({ path, className }: { path: string; className: string }) {
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

function Avatar({
  user,
  className,
  iconClassName,
}: {
  user: PublicUser | null;
  className: string;
  iconClassName: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-hover ${className}`}
    >
      {user?.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.picture}
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <Svg path={USER_ICON} className={iconClassName} />
      )}
    </span>
  );
}

export function AccountPanel({
  user,
  onNavigate,
}: {
  user: PublicUser | null;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onNavigate?.();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 rounded-xl border border-border bg-bg/40 p-4">
        <Avatar user={user} className="h-12 w-12" iconClassName="h-5 w-5" />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-text">
            {user ? (user.name ?? user.email) : "Akun"}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted">
            {user ? user.email : "Masuk untuk menyimpan daftarmu."}
          </span>
        </span>
      </div>

      {user ? (
        <>
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-hover"
          >
            <Svg path={USER_ICON} className="h-4 w-4" />
            Profil
          </Link>
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-hover disabled:opacity-60"
          >
            <Svg path={LOGOUT_ICON} className="h-4 w-4" />
            {busy ? "Keluar..." : "Keluar"}
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-hover"
        >
          <Svg path={LOGIN_ICON} className="h-4 w-4" />
          Masuk
        </Link>
      )}
    </>
  );
}

export default function AccountMenu({
  user,
  loading = false,
  onOpen,
}: {
  user: PublicUser | null;
  loading?: boolean;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen?.();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full border border-border bg-surface/60 sm:w-28" />
    );
  }

  const label = user ? (user.name?.split(" ")[0] ?? "Akun") : "Akun";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Akun"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-1 text-sm font-semibold text-text transition-colors hover:bg-surface-hover sm:pr-3"
      >
        <Avatar user={user} className="h-8 w-8" iconClassName="h-4 w-4" />
        <span className="hidden max-w-24 truncate sm:inline">{label}</span>
        <Svg
          path={CHEVRON_ICON}
          className={`hidden h-4 w-4 text-muted transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Akun"
          className="fixed inset-x-4 top-20 z-50 space-y-2 rounded-2xl border border-border bg-surface p-2 shadow-lg shadow-black/40 animate-[dialog-in_0.18s_ease-out] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80"
        >
          <AccountPanel user={user} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
