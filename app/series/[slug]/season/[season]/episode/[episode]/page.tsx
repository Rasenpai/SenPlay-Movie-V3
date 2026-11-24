import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PosterCard, { type Badge } from "@/components/PosterCard";
import PosterRow from "@/components/PosterRow";
import { getEpisodeWatch } from "@/lib/episodeWatch";
import { bannerUrl, joinList } from "@/lib/movie";
import {
  episodeHref,
  getSeries,
  type Episode,
  type SeriesDetail,
} from "@/lib/seriesDetail";
import EpisodeList from "../../../../EpisodeList";
import SeriesSkeleton from "../../../../SeriesSkeleton";
import EpisodeHero from "./EpisodeHero";

const STATUS_BADGES: Record<string, Badge> = {
  Ongoing: { label: "ONGOING", tone: "success" },
  End: { label: "TAMAT", tone: "muted" },
};

type PageProps = {
  params: Promise<{ slug: string; season: string; episode: string }>;
};

function parseParams(season: string, episode: string) {
  const s = Number.parseInt(season, 10);
  const e = Number.parseInt(episode, 10);
  return Number.isFinite(s) && Number.isFinite(e) ? { s, e } : null;
}

function findEpisode(series: SeriesDetail, s: number, e: number) {
  const flat = series.seasons.flatMap((item) => item.episodes);
  const index = flat.findIndex((ep) => ep.season === s && ep.episode === e);
  if (index === -1) return null;

  return {
    current: flat[index],
    previous: flat[index - 1] ?? null,
    next: flat[index + 1] ?? null,
  };
}

const toLink = (slug: string, ep: Episode | null) =>
  ep
    ? {
        href: episodeHref(slug, ep),
        code: ep.code,
        title: ep.title,
        poster: ep.poster,
      }
    : null;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, season, episode } = await params;
  const parsed = parseParams(season, episode);
  const series = parsed ? await getSeries(slug) : null;
  const found =
    series && parsed ? findEpisode(series, parsed.s, parsed.e) : null;

  if (!series || !parsed || !found) {
    return { title: "Episode tidak ditemukan - SenPlay" };
  }

  const { current } = found;
  const title = `Nonton ${series.title} Season ${parsed.s} Episode ${parsed.e} Sub Indo`;
  const description = current.description || series.synopsis;

  return {
    title,
    description,
    openGraph: {
      title: `${series.title} S${parsed.s} E${parsed.e}${
        current.title ? ` - ${current.title}` : ""
      }`,
      description,
      images: [current.poster ?? series.poster],
    },
  };
}

export default function EpisodePage({ params }: PageProps) {
  return (
    <Suspense fallback={<SeriesSkeleton />}>
      <EpisodeContent params={params} />
    </Suspense>
  );
}

async function EpisodeContent({ params }: PageProps) {
  const { slug, season, episode } = await params;
  const parsed = parseParams(season, episode);
  if (!parsed) notFound();

  const series = await getSeries(slug);
  if (!series) notFound();

  const found = findEpisode(series, parsed.s, parsed.e);
  if (!found) notFound();

  const { current, previous, next } = found;

  // Tanpa play=true API mengembalikan providers kosong, jadi selalu minta play=true.
  const watch = await getEpisodeWatch(series.slug, current.slug);

  const starring = joinList(series.cast.slice(0, 3).map((m) => m.name));
  const description = current.description || series.synopsis;

  const seoText = [
    `Nonton ${series.title} Season ${parsed.s} Episode ${parsed.e}${
      current.title ? ` "${current.title}"` : ""
    } subtitle Indonesia di SenPlay (movie.senplay.web.id).`,
    `Serial ${joinList(series.genres)} dari ${series.country}${
      series.network ? ` yang tayang di ${series.network}` : ""
    }${starring ? ` ini dibintangi ${starring}` : ""}.`,
  ].join(" ");

  return (
    <main>
      <EpisodeHero
        key={current.slug}
        seriesTitle={series.title}
        seriesHref={`/series/${series.slug}`}
        seasonNo={parsed.s}
        episodeNo={parsed.e}
        episodeTitle={current.title}
        banner={bannerUrl(watch?.banner || current.poster || series.banner)}
        rating={current.rating}
        duration={current.duration}
        releaseDate={current.releaseDate}
        age={series.age}
        providers={watch?.providers ?? []}
        previous={toLink(series.slug, previous)}
        next={toLink(series.slug, next)}
      />

      <section className="px-5 py-8 md:px-12">
        <div className="max-w-4xl">
          <p className="text-lg leading-relaxed">{description}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{seoText}</p>
        </div>
      </section>

      <EpisodeList
        slug={series.slug}
        seasons={series.seasons}
        current={{ season: parsed.s, episode: parsed.e }}
      />

      {series.recommendations.length > 0 && (
        <section aria-labelledby="recommendation-title" className="pb-10">
          <h2
            id="recommendation-title"
            className="mb-2 px-5 text-lg font-semibold md:px-12"
          >
            Rekomendasi Serupa
          </h2>

          <PosterRow>
            {series.recommendations.map((item) => (
              <PosterCard
                key={item.slug}
                title={item.title}
                slug={item.slug}
                poster={item.poster}
                rating={item.rating}
                href={`/series/${item.slug}`}
                badgeLeft={{ label: `S${item.season}`, tone: "accent" }}
                badgeRight={STATUS_BADGES[item.status]}
              />
            ))}
          </PosterRow>
        </section>
      )}
    </main>
  );
}
