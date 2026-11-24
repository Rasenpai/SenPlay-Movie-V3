import Link from "next/link";
import type { NewEpisodeItem } from "@/lib/episodes";

const episodeHref = ({ slug, season, episode }: NewEpisodeItem) =>
  `/series/${slug}/season/${season}/episode/${episode}`;

type EpisodeCardProps = {
  item: NewEpisodeItem;
  priority?: boolean;
};

export default function EpisodeCard({
  item,
  priority = false,
}: EpisodeCardProps) {
  return (
    <li className="w-[260px] shrink-0 snap-start md:w-[335px]">
      <Link href={episodeHref(item)} className="group block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.poster}
            alt={item.title}
            loading={priority ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <span className="absolute left-2 top-2 whitespace-nowrap rounded-md bg-text px-2 py-0.5 text-[11px] font-bold tracking-wide text-bg shadow-sm shadow-black/40">
            {item.episode_code}
          </span>
        </div>

        <h3 className="mt-2 truncate text-sm font-semibold text-text group-hover:text-accent-text">
          {item.episode_code}: {item.episode_title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted">
          {item.title} ({item.release_year})
        </p>
      </Link>
    </li>
  );
}
