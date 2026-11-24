import Link from "next/link";
import { getYear, toBadgeLabel } from "@/lib/format";
import { resizeImage } from "@/lib/image";

export type Badge = {
  label: string;
  tone: "accent" | "success" | "muted";
};

export const createBadge = (
  value: string,
  tone: Badge["tone"],
): Badge | undefined => {
  const label = toBadgeLabel(value);
  return label ? { label, tone } : undefined;
};

type PosterCardProps = {
  title: string;
  slug: string;
  poster: string;
  rating: string | null;
  href: string;
  badgeLeft?: Badge;
  badgeRight?: Badge;
  rank?: number;
  priority?: boolean;
  subtitle?: string;
  fluid?: boolean;
};

const badgeBase =
  "whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide shadow-sm shadow-black/40";

const toneClass: Record<Badge["tone"], string> = {
  accent: "bg-accent text-on-accent",
  success: "bg-success text-bg",
  muted: "bg-surface-hover text-text",
};

function BadgeLabel({ badge }: { badge: Badge }) {
  return (
    <span className={`${badgeBase} ${toneClass[badge.tone]}`}>
      {badge.label}
    </span>
  );
}

export default function PosterCard({
  title,
  slug,
  poster,
  rating,
  href,
  badgeLeft,
  badgeRight,
  rank,
  priority = false,
  subtitle,
  fluid = false,
}: PosterCardProps) {
  const year = getYear(slug);

  return (
    <li
      className={
        fluid ? undefined : "w-[150px] shrink-0 snap-start md:w-[190px]"
      }
    >
      <Link href={href} className="group relative block">
        {rank !== undefined && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-1 -top-3 z-10 text-6xl font-bold leading-none text-transparent [-webkit-text-stroke:2px_var(--text)] md:text-7xl"
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}

        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resizeImage(poster, "w500")}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {(badgeLeft || badgeRight) && (
            <div className="absolute inset-x-2 top-2 hidden items-start justify-between md:flex">
              {badgeLeft ? <BadgeLabel badge={badgeLeft} /> : <span />}
              {badgeRight && <BadgeLabel badge={badgeRight} />}
            </div>
          )}

          {rating && (
            <span
              className={`absolute bottom-2 left-2 ${badgeBase} bg-rating text-bg`}
            >
              ★ {rating}
            </span>
          )}
        </div>

        <h3 className="mt-2 truncate text-sm font-medium text-text group-hover:text-accent-text">
          {title}
          {year && ` (${year})`}
        </h3>

        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>
        )}
      </Link>
    </li>
  );
}
