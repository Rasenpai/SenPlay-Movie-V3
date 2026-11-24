import PosterCard, { type Badge } from "./PosterCard";
import PosterRow from "./PosterRow";
import SeeAllLink from "./SeeAllLink";
import type { SeriesItem } from "@/lib/series";

const STATUS_BADGES: Record<string, Badge> = {
  Ongoing: { label: "ONGOING", tone: "success" },
  End: { label: "TAMAT", tone: "muted" },
};

export default function LatestSeriesSection({
  items,
}: {
  items: SeriesItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="latest-series-title" className="pb-12">
      <div className="flex items-center justify-between px-5 md:px-12">
        <h2 id="latest-series-title" className="text-lg font-semibold">
          Serial Baru Ditambahkan
        </h2>
        <SeeAllLink href="/series/latest" />
      </div>

      <PosterRow>
        {items.map((item) => (
          <PosterCard
            key={item.slug}
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={item.rating?.toFixed(1) ?? null}
            href={`/series/${item.slug}`}
            badgeLeft={{ label: `S${item.season}`, tone: "accent" }}
            badgeRight={STATUS_BADGES[item.status]}
          />
        ))}
      </PosterRow>
    </section>
  );
}
