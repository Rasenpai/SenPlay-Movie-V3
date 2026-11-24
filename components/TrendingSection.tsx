import PosterCard, { type Badge } from "./PosterCard";
import PosterRow from "./PosterRow";
import type { PopularItem } from "@/lib/popular";

const TRENDING_LIMIT = 10;
const PRIORITY_COUNT = 5;

const isSeries = (item: PopularItem) => item.type === null;

const detailHref = (item: PopularItem) =>
  `/${isSeries(item) ? "series" : "movie"}/${item.slug}`;

const getBadge = (item: PopularItem): Badge =>
  item.type === null
    ? { label: "SERIAL", tone: "accent" }
    : { label: item.type, tone: "success" };

export default function TrendingSection({ items }: { items: PopularItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="trending-title" className="pb-6">
      <h2
        id="trending-title"
        className="mb-4 px-5 text-lg font-semibold md:px-12"
      >
        Sedang Trending
      </h2>

      <PosterRow>
        {items.slice(0, TRENDING_LIMIT).map((item, index) => (
          <PosterCard
            key={item.slug}
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={item.rating}
            href={detailHref(item)}
            badgeRight={getBadge(item)}
            rank={index + 1}
            priority={index < PRIORITY_COUNT}
          />
        ))}
      </PosterRow>
    </section>
  );
}
