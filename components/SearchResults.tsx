import PosterCard, { createBadge, type Badge } from "./PosterCard";
import { getDetailHref } from "@/lib/format";
import type { SearchItem } from "@/lib/search";

const STATUS_BADGES: Record<string, Badge> = {
  Ongoing: { label: "ONGOING", tone: "success" },
  End: { label: "TAMAT", tone: "muted" },
};

function getBadges(item: SearchItem): { left?: Badge; right?: Badge } {
  if (item.type === "series") {
    return {
      left: item.season ? { label: item.season, tone: "accent" } : undefined,
      right: STATUS_BADGES[item.status ?? ""],
    };
  }

  return {
    left: { label: "FILM", tone: "accent" },
    right: createBadge(item.quality ?? "", "success"),
  };
}

export default function SearchResults({ items }: { items: SearchItem[] }) {
  return (
    <ul className="mt-8 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {items.map((item) => {
        const { left, right } = getBadges(item);

        return (
          <PosterCard
            key={item.slug}
            fluid
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={item.rating}
            href={getDetailHref(item.type, item.slug)}
            badgeLeft={left}
            badgeRight={right}
          />
        );
      })}
    </ul>
  );
}
