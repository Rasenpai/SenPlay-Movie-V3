"use client";

/* eslint-disable @next/next/no-img-element */
import type { RefObject } from "react";
import Link from "next/link";
import { useAutoplay } from "@/hooks/useAutoplay";
import type { HeroItem } from "@/lib/banners";
import { resizeImage } from "@/lib/image";

const SLIDE_DURATION_MS = 7000;

const detailHref = ({ type, slug }: HeroItem) =>
  `/${type === "series" ? "series" : "movie"}/${slug}`;

function getMeta(item: HeroItem) {
  const length =
    item.type === "series"
      ? item.total_season && `${item.total_season} Season`
      : item.duration;

  return [item.release_year, length, item.genre].filter(Boolean).map(String);
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
      aria-hidden="true"
    >
      <path d="M7 4.5v15l13-7.5L7 4.5z" />
    </svg>
  );
}

function HeroTitle({ item }: { item: HeroItem }) {
  if (item.title_image) {
    return (
      <img
        src={item.title_image}
        alt={item.title_text}
        className="max-h-24 w-auto max-w-[80%] object-contain object-left md:max-h-32"
      />
    );
  }

  return (
    <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
      {item.title_text}
    </h1>
  );
}

function HeroMeta({ item }: { item: HeroItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
      {item.rating !== null && (
        <span className="flex items-center gap-1 font-semibold text-text">
          <StarIcon />
          {item.rating.toFixed(1)}
        </span>
      )}

      {item.country_flag && (
        <img
          src={item.country_flag}
          alt={item.country ?? ""}
          title={item.country ?? undefined}
          className="h-3.5 w-5 rounded-[2px] object-cover"
        />
      )}

      {getMeta(item).map((text, index) => (
        <span key={text} className="flex items-center gap-3">
          {index > 0 && <span className="h-1 w-1 rounded-full bg-muted/60" />}
          {text}
        </span>
      ))}

      {item.status && (
        <span className="rounded border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-text">
          {item.status}
        </span>
      )}
    </div>
  );
}

type IndicatorsProps = {
  items: HeroItem[];
  active: number;
  barRef: RefObject<HTMLSpanElement | null>;
  onSelect: (index: number) => void;
};

function HeroIndicators({ items, active, barRef, onSelect }: IndicatorsProps) {
  return (
    <div className="mt-8 flex items-center gap-2">
      {items.map((item, index) => (
        <button
          key={item.slug}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Tampilkan ${item.title_text}`}
          aria-current={index === active}
          className="flex h-4 items-center"
        >
          {index === active ? (
            <span className="block h-1.5 w-14 overflow-hidden rounded-full bg-border">
              <span
                ref={barRef}
                style={{ transform: "scaleX(0)" }}
                className="block h-full w-full origin-left bg-accent will-change-transform"
              />
            </span>
          ) : (
            <span className="block h-1.5 w-1.5 rounded-full bg-muted/50 transition-colors hover:bg-muted" />
          )}
        </button>
      ))}
    </div>
  );
}

function HeroBackground({
  items,
  active,
}: {
  items: HeroItem[];
  active: number;
}) {
  return (
    <>
      {items.map((item, index) => (
        <picture
          key={item.slug}
          aria-hidden={index !== active}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <source
            media="(min-width: 768px)"
            srcSet={resizeImage(item.banner, "w1280")}
          />
          <img
            src={resizeImage(item.bannerMobile, "w780")}
            alt=""
            className="h-full w-full object-cover object-center"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            draggable={false}
          />
        </picture>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
    </>
  );
}

export default function HeroBanner({ items }: { items: HeroItem[] }) {
  const { active, select, barRef } = useAutoplay(
    items.length,
    SLIDE_DURATION_MS,
  );

  if (items.length === 0) return null;

  const item = items[active];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Film dan serial pilihan"
      className="relative h-[88svh] min-h-[520px] w-full overflow-hidden bg-bg"
    >
      <HeroBackground items={items} active={active} />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-12 md:px-12 md:pb-16">
        <div
          key={active}
          className="max-w-2xl animate-[hero-in_600ms_ease-out_both]"
        >
          <span className="inline-block rounded bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-on-accent">
            {item.type === "series" ? "Serial TV" : "Film"}
          </span>

          <div className="mt-4">
            <HeroTitle item={item} />
          </div>

          <div className="mt-4">
            <HeroMeta item={item} />
          </div>

          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-text/80 md:text-base">
            {item.synopsis}
          </p>

          <Link
            href={detailHref(item)}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
          >
            <PlayIcon />
            Tonton
          </Link>
        </div>

        <HeroIndicators
          items={items}
          active={active}
          barRef={barRef}
          onSelect={select}
        />
      </div>
    </section>
  );
}
