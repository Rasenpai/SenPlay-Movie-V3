"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { resizeImage } from "@/lib/image";
import { episodeHref, type Season } from "@/lib/seriesDetail";

function SortIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 15l6-6 6 6" />
    </svg>
  );
}

function SeasonPicker({
  seasons,
  value,
  onChange,
}: {
  seasons: Season[];
  value: number;
  onChange: (season: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trigger =
    "flex h-11 items-center gap-3 rounded-xl border border-border bg-surface px-4 text-sm font-semibold";

  if (seasons.length <= 1) {
    return <div className={trigger}>Season {value}</div>;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${trigger} transition-colors hover:bg-surface-hover`}
      >
        Season {value}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Pilih season"
          className="absolute right-0 top-full z-20 mt-2 max-h-72 min-w-full overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-xl shadow-black/50 animate-[dialog-in_150ms_ease-out_both]"
        >
          {seasons.map(({ season }) => {
            const selected = season === value;
            return (
              <li key={season} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(season);
                    setOpen(false);
                  }}
                  className={`block w-full whitespace-nowrap px-5 py-3 text-left text-sm transition-colors hover:bg-surface-hover ${
                    selected ? "font-bold text-text" : "text-muted"
                  }`}
                >
                  Season {season}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function EpisodeList({
  slug,
  seasons,
  current,
}: {
  slug: string;
  seasons: Season[];
  current?: { season: number; episode: number };
}) {
  const [seasonNo, setSeasonNo] = useState(
    current?.season ?? seasons[0]?.season ?? 1,
  );
  const [newestFirst, setNewestFirst] = useState(false);

  const episodes = useMemo(() => {
    const list = seasons.find((s) => s.season === seasonNo)?.episodes ?? [];
    return newestFirst ? [...list].reverse() : list;
  }, [seasons, seasonNo, newestFirst]);

  if (seasons.length === 0) return null;

  return (
    <section aria-labelledby="episode-title" className="pb-8">
      <div className="mb-4 flex items-center justify-between gap-3 px-5 md:px-12">
        <h2 id="episode-title" className="text-lg font-semibold">
          Daftar Episode
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            aria-label={`Urutkan: ${newestFirst ? "terbaru" : "terlama"} dulu`}
            className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-hover"
          >
            <SortIcon />
            {newestFirst ? "Terbaru" : "Terlama"}
          </button>

          <SeasonPicker
            seasons={seasons}
            value={seasonNo}
            onChange={setSeasonNo}
          />
        </div>
      </div>

      <ul
        key={seasonNo}
        className="grid grid-cols-1 gap-x-4 gap-y-6 px-5 sm:grid-cols-2 md:grid-cols-3 md:px-12 xl:grid-cols-4 2xl:grid-cols-6 animate-[hero-in_300ms_ease-out_both]"
      >
        {episodes.map((ep) => {
          const isCurrent =
            current?.season === ep.season && current?.episode === ep.episode;

          return (
            <li key={ep.slug}>
              <Link
                href={episodeHref(slug, ep)}
                aria-current={isCurrent ? "page" : undefined}
                className="group block"
              >
                <div
                  className={`relative aspect-video overflow-hidden rounded-xl bg-surface ${
                    isCurrent ? "ring-2 ring-accent" : ""
                  }`}
                >
                  {ep.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resizeImage(ep.poster, "w500")}
                      alt={ep.title}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center bg-surface-hover text-2xl font-bold text-border"
                    >
                      {ep.code}
                    </div>
                  )}

                  <span className="absolute left-2 top-2 whitespace-nowrap rounded-md bg-text px-2 py-0.5 text-[11px] font-bold tracking-wide text-bg shadow-sm shadow-black/40">
                    {ep.code}
                  </span>
                  <span className="absolute right-2 top-2 whitespace-nowrap rounded-md bg-bg/80 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                    {ep.releaseDate}
                  </span>

                  {ep.rating && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-rating px-2 py-0.5 text-[11px] font-bold text-bg">
                      ★ {ep.rating}
                    </span>
                  )}
                  {ep.duration && (
                    <span className="absolute bottom-2 right-2 rounded-md bg-bg/80 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                      {ep.duration}
                    </span>
                  )}
                </div>

                <h3
                  className={`mt-2 truncate text-sm font-semibold group-hover:text-accent-text ${
                    isCurrent ? "text-accent-text" : ""
                  }`}
                >
                  {ep.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {ep.description}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
