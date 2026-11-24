"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { genreSlug, groupProviders, type Provider } from "@/lib/movie";
import BookmarkButton from "@/components/BookmarkButton";

type MovieHeroProps = {
  slug: string;
  title: string;
  banner: string;
  genres: string[];
  rating: string | null;
  year: number;
  duration: string;
  quality: string;
  age: string;
  country: string;
  director: string;
  trailer: { name: string; url: string } | null;
  providers: Provider[];
};

const heroIn = "animate-[hero-in_500ms_ease-out_both]";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Stat({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div>
      <p className={`text-2xl font-bold leading-none md:text-3xl ${className}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function TrailerDialog({
  url,
  title,
  open,
  onClose,
}: {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const src = `${url}${url.includes("?") ? "&" : "?"}autoplay=1&rel=0`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(960px,92vw)] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-text open:animate-[dialog-in_200ms_ease-out_both] backdrop:bg-black/80 backdrop:animate-[dialog-fade-in_200ms_ease-out_both]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <p className="truncate text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup trailer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="aspect-video w-full bg-black">
        {open && (
          <iframe
            src={src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>
    </dialog>
  );
}

export default function MovieHero({
  slug,
  title,
  banner,
  genres,
  rating,
  year,
  duration,
  quality,
  age,
  country,
  director,
  trailer,
  providers,
}: MovieHeroProps) {
  const groups = useMemo(() => groupProviders(providers), [providers]);
  const defaultId = (groups.find((g) => g.key === "hydrax") ?? groups[0])
    ?.sources[0].id;

  const [watching, setWatching] = useState(false);
  const [activeId, setActiveId] = useState(defaultId);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const active = providers.find((p) => p.id === activeId);

  const startWatching = () => {
    setWatching(true);
    window.scrollTo({ top: 0 });
  };

  const stopWatching = () => setWatching(false);

  // Next.js menyembunyikan halaman lama (bukan membongkarnya) saat pindah
  // route, sehingga iframe-nya tetap hidup dan videonya terus berbunyi.
  // Cleanup effect berjalan saat halaman disembunyikan maupun di-unmount,
  // jadi di sini pemutar dimatikan supaya iframe benar-benar dilepas.
  useEffect(() => {
    return () => setWatching(false);
  }, []);

  useEffect(() => {
    if (!watching) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWatching(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [watching]);

  if (watching && active) {
    return (
      <section className={`bg-bg pt-24 ${heroIn}`}>
        <div className="flex items-center gap-3 px-5 pb-4 md:px-12">
          <button
            type="button"
            onClick={stopWatching}
            aria-label="Tutup pemutar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:bg-surface-hover"
          >
            <CloseIcon />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Sedang diputar
            </p>
            <p className="truncate text-sm font-medium">{title}</p>
          </div>
        </div>

        <div className="px-5 md:px-12">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              key={active.id}
              src={active.embedUrl}
              title={`Putar ${title}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>

          <div
            role="group"
            aria-label="Pilih server dan kualitas"
            className="mt-3 flex flex-wrap gap-2 pb-2"
          >
            {groups.map((group) => {
              const isGroupActive = group.sources.some(
                (s) => s.id === activeId,
              );
              const hasQuality = group.sources.some((s) => s.quality);

              return (
                <div
                  key={group.key}
                  className={`flex items-stretch overflow-hidden rounded-lg border bg-surface ${
                    isGroupActive ? "border-accent" : "border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      !isGroupActive && setActiveId(group.sources[0].id)
                    }
                    aria-pressed={isGroupActive}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                      isGroupActive
                        ? "bg-accent text-on-accent"
                        : "text-text hover:bg-surface-hover"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        isGroupActive
                          ? "border-on-accent"
                          : "border-accent-text"
                      }`}
                    />
                    {group.name}
                  </button>

                  {hasQuality &&
                    group.sources.map((source) => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => setActiveId(source.id)}
                        aria-pressed={source.id === activeId}
                        className={`border-l border-border px-3 py-2 text-xs transition-colors ${
                          source.id === activeId
                            ? "bg-surface-hover font-semibold text-accent-text"
                            : "text-muted hover:bg-surface-hover hover:text-text"
                        }`}
                      >
                        {source.quality}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-bg md:h-[100svh] md:min-h-[600px] md:max-h-[860px] md:bg-surface">
      {/* Mobile: banner di atas, konten mengalir di bawahnya. Desktop: konten menimpa banner. */}
      <div className="relative h-[52svh] min-h-[300px] md:absolute md:inset-0 md:h-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-bg/20 md:via-bg/50 md:to-bg/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent md:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-bg/70 via-transparent to-transparent md:block"
        />

        {providers.length === 0 ? (
          <div
            role="note"
            className="absolute left-1/2 top-1/2 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface/80 px-5 py-5 text-center shadow-xl shadow-black/50 backdrop-blur-md"
          >
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-accent px-2 text-sm font-bold text-on-accent">
              18+
            </span>
            <p className="mt-3 text-base font-semibold">
              Konten dewasa dibatasi
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Film ini mengandung konten seksual eksplisit dan tidak tersedia
              untuk diputar di SenPlay.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={startWatching}
            aria-label={`Putar ${title}`}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-surface/60 text-on-accent shadow-xl shadow-black/50 backdrop-blur-md transition-transform hover:scale-110 hover:bg-accent md:h-20 md:w-20"
          >
            <PlayIcon className="ml-1 h-7 w-7 md:h-8 md:w-8" />
          </button>
        )}
      </div>

      <div
        className={`relative -mt-24 px-5 pb-8 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:px-12 md:pb-10 ${heroIn}`}
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-8">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-3 text-xs text-muted md:mb-5 md:text-sm"
            >
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-text">
                    Beranda
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li>Film</li>
                <li aria-hidden="true">›</li>
                <li className="truncate text-text" aria-current="page">
                  {title}
                </li>
              </ol>
            </nav>

            <p className="text-sm text-muted">Nonton film sub Indo</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight md:text-6xl">
              {title}
            </h1>

            {genres.length > 0 && (
              <ul className="mt-4 flex flex-wrap items-center gap-x-2 text-base font-medium">
                {genres.map((genre, index) => (
                  <li key={genre} className="flex items-center gap-2">
                    {index > 0 && (
                      <span aria-hidden="true" className="text-muted">
                        ·
                      </span>
                    )}
                    <Link
                      href={`/genre/${genreSlug(genre)}`}
                      className="transition-colors hover:text-accent-text"
                    >
                      {genre}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 md:mt-5 md:gap-x-8 md:gap-y-4">
              {rating && (
                <Stat
                  value={`★ ${rating}`}
                  label="rating"
                  className="text-rating"
                />
              )}
              {year > 0 && <Stat value={String(year)} label="tahun" />}
              {duration && <Stat value={duration} label="durasi" />}
              {quality && (
                <Stat
                  value={quality}
                  label="kualitas"
                  className="text-success"
                />
              )}
              {age && <Stat value={age} label="usia" />}
            </div>

            <div className="mt-5 flex gap-2 md:mt-6">
              <BookmarkButton slug={slug} />

              {trailer && (
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface/70 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-surface-hover md:flex-none"
                >
                  <PlayIcon className="h-4 w-4 text-accent-text" />
                  Tonton Trailer
                </button>
              )}
            </div>
          </div>

          <dl className="w-full shrink-0 overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur-md md:w-[380px]">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <dt className="text-sm text-muted">Negara</dt>
              <dd className="text-sm font-semibold">{country}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted">Sutradara</dt>
              <dd className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent"
                >
                  {director.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{director}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {trailer && (
        <TrailerDialog
          url={trailer.url}
          title={trailer.name}
          open={trailerOpen}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </section>
  );
}
