"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Kind = "donation" | "movie" | "series" | "episode";

type Notice = {
  id: string;
  kind: Kind;
  title: string;
  subtitle?: string;
  poster?: string;
  href: string;
};

type DonationRow = {
  transaction_id: string;
  created_at: string;
  supporter_name: string | null;
  price: number;
};

type TitleRow = {
  title: string;
  slug: string;
  poster?: string;
  quality?: string;
  rating?: string | number | null;
  season?: number;
  status?: string;
  episode_code?: string;
};

type ApiResponse = {
  donations?: DonationRow[];
  data?: { results?: TitleRow[] };
};

type State =
  | { status: "loading"; items: Notice[] }
  | { status: "ready"; items: Notice[] }
  | { status: "error"; items: Notice[] };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.senplay.web.id";
const MAX_NOTICES = 5;
const CACHE_MS = 60_000;

const ROUTES = {
  donation: "/hall-of-fame",
  movie: (slug: string) => `/movie/${slug}`,
  series: (slug: string) => `/series/${slug}`,
};

const BELL_ICON =
  "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0";
const HEART_ICON =
  "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 000-7.8z";

let cache: { at: number; items: Notice[] } | null = null;

const formatRupiah = (value: number) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

const thumb = (url?: string) => url?.replace("/original/", "/w154/");

function timeAgo(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return "baru saja";
}

async function getJson(path: string): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

const valueOf = (result: PromiseSettledResult<ApiResponse>): ApiResponse =>
  result.status === "fulfilled" ? result.value : {};

function interleave<T>(groups: T[][], max: number): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < max; i++) {
    let added = false;
    for (const group of groups) {
      if (group[i] && out.length < max) {
        out.push(group[i]);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

const fromDonations = (rows: DonationRow[] = []): Notice[] =>
  rows.slice(0, MAX_NOTICES).map(
    (d): Notice => ({
      id: `donation-${d.transaction_id}`,
      kind: "donation",
      title: `received ${formatRupiah(d.price)} from ${
        d.supporter_name?.trim() || "Anonim"
      }. >< Thankyou`,
      subtitle: timeAgo(d.created_at),
      href: ROUTES.donation,
    }),
  );

const fromMovies = (rows: TitleRow[] = []): Notice[] =>
  rows.slice(0, MAX_NOTICES).map(
    (m): Notice => ({
      id: `movie-${m.slug}`,
      kind: "movie",
      title: `Film baru: ${m.title}`,
      subtitle: [m.quality?.toUpperCase(), m.rating ? `★ ${m.rating}` : null]
        .filter(Boolean)
        .join(" · "),
      poster: thumb(m.poster),
      href: ROUTES.movie(m.slug),
    }),
  );

const fromSeries = (rows: TitleRow[] = []): Notice[] =>
  rows.slice(0, MAX_NOTICES).map(
    (s): Notice => ({
      id: `series-${s.slug}`,
      kind: "series",
      title: `Series baru: ${s.title}`,
      subtitle: [s.season ? `Season ${s.season}` : null, s.status]
        .filter(Boolean)
        .join(" · "),
      poster: thumb(s.poster),
      href: ROUTES.series(s.slug),
    }),
  );

const fromEpisodes = (rows: TitleRow[] = []): Notice[] =>
  rows.slice(0, MAX_NOTICES).map(
    (e): Notice => ({
      id: `episode-${e.slug}-${e.episode_code}`,
      kind: "episode",
      title: `Episode baru: ${e.title}`,
      subtitle: e.episode_code,
      poster: thumb(e.poster),
      href: ROUTES.series(e.slug),
    }),
  );

async function loadNotices(): Promise<Notice[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.items;

  const results = await Promise.allSettled([
    getJson(`/api/donations/all?limit=${MAX_NOTICES}`),
    getJson("/api/series/new-episode"),
    getJson("/api/movie/latest?page=1"),
    getJson("/api/series/latest?page=1"),
  ]);

  if (results.every((r) => r.status === "rejected")) {
    throw new Error("notifikasi gagal dimuat");
  }

  const [donations, episodes, movies, series] = results.map(valueOf);

  const items = interleave(
    [
      fromDonations(donations.donations),
      fromEpisodes(episodes.data?.results),
      fromMovies(movies.data?.results),
      fromSeries(series.data?.results),
    ],
    MAX_NOTICES,
  );

  cache = { at: Date.now(), items };
  return items;
}

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

function Thumb({ notice }: { notice: Notice }) {
  if (notice.poster) {
    return (
      <img
        src={notice.poster}
        alt=""
        loading="lazy"
        className="h-14 w-10 shrink-0 rounded-md bg-bg object-cover"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-text">
      <Svg path={HEART_ICON} className="h-5 w-5" />
    </span>
  );
}

export default function NotificationPopover({
  onOpen,
}: {
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ status: "loading", items: [] });
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setState({ status: "loading", items: [] });
    loadNotices()
      .then((items) => setState({ status: "ready", items }))
      .catch(() => setState({ status: "error", items: [] }));
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      onOpen?.();
      load();
    }
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifikasi"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-hover"
      >
        <Svg path={BELL_ICON} className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/40 animate-[dialog-in_0.18s_ease-out] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Svg path={BELL_ICON} className="h-4 w-4 text-accent-text" />
            <h2 className="text-sm font-semibold">Notifikasi</h2>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-2">
            {state.status === "loading" && (
              <ul className="space-y-1" aria-busy="true">
                {Array.from({ length: MAX_NOTICES }, (_, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="h-14 w-10 shrink-0 animate-pulse rounded-md bg-surface-hover" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-3 w-4/5 animate-pulse rounded bg-surface-hover" />
                      <span className="block h-3 w-2/5 animate-pulse rounded bg-surface-hover" />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {state.status === "error" && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted">Gagal memuat notifikasi.</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {state.status === "ready" && state.items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Belum ada notifikasi.
              </p>
            )}

            {state.status === "ready" && state.items.length > 0 && (
              <ul className="space-y-1">
                {state.items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-hover"
                    >
                      <Thumb notice={n} />
                      <span className="min-w-0">
                        <span className="line-clamp-2 block text-sm font-medium text-text">
                          {n.title}
                        </span>
                        {n.subtitle && (
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {n.subtitle}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
