"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PosterCard, { type Badge } from "./PosterCard";
import { POSTER_GRID_CLASS } from "@/lib/genre";
import type { SeriesItem } from "@/lib/series";

type SeriesInfiniteGridProps = {
  endpoint: string;
  initialItems: SeriesItem[];
  emptyMessage?: string;
};

const STATUS_BADGES: Record<string, Badge> = {
  Ongoing: { label: "ONGOING", tone: "success" },
  End: { label: "TAMAT", tone: "muted" },
};

export default function SeriesInfiniteGrid({
  endpoint,
  initialItems,
  emptyMessage = "Belum ada serial.",
}: SeriesInfiniteGridProps) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length > 0);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(`${endpoint}?page=${pageRef.current + 1}`);
      const next: SeriesItem[] = res.ok ? await res.json() : [];

      if (next.length === 0) {
        setHasMore(false);
        return;
      }

      pageRef.current += 1;
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.slug));
        const fresh = next.filter((item) => !seen.has(item.slug));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  if (items.length === 0) {
    return <p className="mt-16 text-center text-muted">{emptyMessage}</p>;
  }

  return (
    <>
      <ul className={`mt-6 ${POSTER_GRID_CLASS}`}>
        {items.map((item) => (
          <PosterCard
            key={item.slug}
            fluid
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={item.rating?.toFixed(1) ?? null}
            href={`/series/${item.slug}`}
            badgeLeft={{ label: `S${item.season}`, tone: "accent" }}
            badgeRight={STATUS_BADGES[item.status]}
          />
        ))}
      </ul>

      {hasMore && (
        <div
          ref={sentinelRef}
          aria-live="polite"
          className="flex min-h-16 items-center justify-center py-8 text-sm text-muted"
        >
          {loading && (
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent"
              />
              Memuat...
            </span>
          )}
        </div>
      )}
    </>
  );
}
