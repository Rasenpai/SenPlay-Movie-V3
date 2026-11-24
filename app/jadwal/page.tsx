import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PosterCard from "@/components/PosterCard";
import { getSchedule, type ScheduleItem } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Jadwal Rilis | Senplay Movie",
  description: "Jadwal rilis episode serial terbaru minggu ini.",
};

const toSubtitle = ({ season, episode, episode_title }: ScheduleItem) => {
  const label = `S${season} E${episode}`;
  return episode_title ? `${label} · ${episode_title}` : label;
};

const GRID_CLASS =
  "grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";

async function ScheduleContent({
  searchParams,
}: {
  searchParams: PageProps<"/jadwal">["searchParams"];
}) {
  const { hari } = await searchParams;
  const days = await getSchedule();

  const requested = typeof hari === "string" ? hari : undefined;
  const activeDay =
    days.find((day) => day.slug === requested) ??
    days.find((day) => day.is_today) ??
    days[0];

  if (!activeDay) {
    return (
      <p className="mt-16 text-center text-muted">
        Jadwal belum tersedia. Coba lagi beberapa saat lagi.
      </p>
    );
  }

  return (
    <>
      <nav
        aria-label="Pilih hari"
        className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const active = day.slug === activeDay.slug;
          return (
            <Link
              key={day.slug}
              href={`/jadwal?hari=${day.slug}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 flex-col items-center rounded-2xl border px-5 py-2 transition-colors ${
                active
                  ? "border-accent bg-accent/15 text-accent-text"
                  : "border-border bg-surface text-text/80 hover:bg-surface-hover hover:text-text"
              }`}
            >
              <span className="text-sm font-semibold">{day.name}</span>
              <span className="text-xs text-muted">
                {day.is_today ? "Hari ini" : day.date}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold">
          {activeDay.name}, {activeDay.date}
        </h2>
        <span className="text-sm text-muted">{activeDay.total} episode</span>
      </div>

      <ul className={`mt-4 ${GRID_CLASS}`}>
        {activeDay.items.map((item) => (
          <PosterCard
            key={item.id}
            fluid
            title={item.title}
            slug={item.slug}
            poster={item.poster}
            rating={Number(item.rating) > 0 ? item.rating : null}
            href={`/series/${item.slug}`}
            subtitle={toSubtitle(item)}
            badgeLeft={{ label: `E${item.episode}`, tone: "accent" }}
            badgeRight={
              item.available
                ? { label: "TERSEDIA", tone: "success" }
                : undefined
            }
          />
        ))}
      </ul>
    </>
  );
}

function ScheduleFallback() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="h-[54px] w-20 rounded-2xl bg-surface" />
        ))}
      </div>
      <div className={`mt-12 ${GRID_CLASS}`}>
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="aspect-[2/3] rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default function JadwalPage({ searchParams }: PageProps<"/jadwal">) {
  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <h1 className="text-2xl font-bold md:text-3xl">Jadwal Rilis</h1>
      <p className="mt-1 text-sm text-muted">
        Episode serial yang tayang minggu ini.
      </p>

      <Suspense fallback={<ScheduleFallback />}>
        <ScheduleContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
