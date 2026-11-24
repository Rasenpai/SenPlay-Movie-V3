"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PosterCard, { type Badge } from "./PosterCard";
import PosterRow from "./PosterRow";
import type { CategoryData } from "@/lib/category";
import { toBadgeLabel } from "@/lib/format";

const getBadge = (value: string, tone: Badge["tone"]): Badge | undefined => {
  const label = toBadgeLabel(value);
  return label ? { label, tone } : undefined;
};

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function CategorySection({
  initialData,
}: {
  initialData: CategoryData;
}) {
  const [activeSlug, setActiveSlug] = useState(initialData.type);
  const [items, setItems] = useState(initialData.results);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const cache = useRef(new Map([[initialData.type, initialData.results]]));
  const requested = useRef(initialData.type);
  const menuRef = useRef<HTMLDivElement>(null);

  const { availableTypes } = initialData;
  const activeName =
    availableTypes.find((type) => type.slug === activeSlug)?.name ?? activeSlug;

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectCategory = async (slug: string) => {
    setOpen(false);
    if (slug === activeSlug) return;

    const previous = activeSlug;
    requested.current = slug;
    setActiveSlug(slug);

    const cached = cache.current.get(slug);
    if (cached) {
      setItems(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/category/${slug}`);
      if (!res.ok) throw new Error("Gagal memuat kategori");

      const data: CategoryData = await res.json();
      cache.current.set(slug, data.results);
      if (requested.current === slug) setItems(data.results);
    } catch {
      if (requested.current === slug) {
        requested.current = previous;
        setActiveSlug(previous);
      }
    } finally {
      if (requested.current === slug || requested.current === previous) {
        setLoading(false);
      }
    }
  };

  return (
    <section className="pb-12">
      <div className="flex items-center justify-between px-5 md:px-12">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <span className="text-accent-text">{activeName}</span>
            <ChevronIcon className={`text-muted ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute left-0 top-full z-30 mt-3 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/50"
            >
              {availableTypes.map((type) => (
                <li
                  key={type.slug}
                  role="option"
                  aria-selected={type.slug === activeSlug}
                >
                  <button
                    type="button"
                    onClick={() => selectCategory(type.slug)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-surface-hover ${
                      type.slug === activeSlug
                        ? "bg-surface-hover text-text"
                        : "text-muted"
                    }`}
                  >
                    {type.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href={`/movie?type=${activeSlug}`}
          className="group flex items-center gap-1 text-sm font-semibold text-text"
        >
          <span className="transition-colors group-hover:text-accent-text">
            Lihat Semua
          </span>
          <ChevronIcon className="-rotate-90 text-muted" />
        </Link>
      </div>

      <PosterRow
        key={activeSlug}
        aria-busy={loading}
        className={`transition-opacity ${loading ? "opacity-50" : ""}`}
      >
        {items.map((item, index) => (
          <PosterCard
            key={item.slug}
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={item.rating}
            href={`/movie/${item.slug}`}
            badgeLeft={getBadge(item.type, "accent")}
            badgeRight={getBadge(item.quality, "success")}
            priority={index < 5}
          />
        ))}
      </PosterRow>
    </section>
  );
}
