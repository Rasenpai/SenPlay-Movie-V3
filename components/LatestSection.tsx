import PosterCard, { createBadge } from "./PosterCard";
import PosterRow from "./PosterRow";
import SeeAllLink from "./SeeAllLink";
import type { CategoryItem } from "@/lib/category";

export default function LatestSection({ items }: { items: CategoryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="latest-title" className="pb-12">
      <div className="flex items-center justify-between px-5 md:px-12">
        <h2 id="latest-title" className="text-lg font-semibold">
          Film Baru Ditambahkan
        </h2>
        <SeeAllLink href="/latest" />
      </div>

      <PosterRow>
        {items.map((item) => (
          <PosterCard
            key={item.slug}
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={item.rating}
            href={`/movie/${item.slug}`}
            badgeLeft={createBadge(item.type, "accent")}
            badgeRight={createBadge(item.quality, "success")}
          />
        ))}
      </PosterRow>
    </section>
  );
}
