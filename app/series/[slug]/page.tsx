import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PosterCard, { type Badge } from "@/components/PosterCard";
import PosterRow from "@/components/PosterRow";
import { resizeImage } from "@/lib/image";
import { bannerUrl, joinList } from "@/lib/movie";
import { episodeHref, getSeries } from "@/lib/seriesDetail";
import EpisodeList from "./EpisodeList";
import SeriesHero from "./SeriesHero";
import SeriesSkeleton from "./SeriesSkeleton";
import { createMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

const CAST_LIMIT = 20;
const CAST_MENTION = 3;

const STATUS_BADGES: Record<string, Badge> = {
  Ongoing: { label: "ONGOING", tone: "success" },
  End: { label: "TAMAT", tone: "muted" },
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);

  if (!series) {
    return {
      title: "Serial tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return createMetadata({
    title: `Nonton ${series.title} (${series.year}) Sub Indo`,
    description:
      series.synopsis ||
      `Nonton serial ${series.title} (${series.year}) subtitle Indonesia di SenPlay.`,
    path: `/series/${series.slug}`,
    type: "video.tv_show",
  });
}

export default function SeriesPage({ params }: PageProps) {
  return (
    <Suspense fallback={<SeriesSkeleton />}>
      <SeriesContent params={params} />
    </Suspense>
  );
}

async function SeriesContent({ params }: PageProps) {
  const { slug } = await params;
  const series = await getSeries(slug);

  if (!series) notFound();

  const cast = series.cast.slice(0, CAST_LIMIT);
  const starring = joinList(
    series.cast.slice(0, CAST_MENTION).map((member) => member.name),
  );

  const firstEpisode = series.seasons[0]?.episodes[0];
  const episodeTotal = series.seasons.reduce(
    (sum, s) => sum + s.episodes.length,
    0,
  );

  const seoText = [
    `Nonton ${series.title} (${series.year}) subtitle Indonesia di SenPlay (movie.senplay.web.id).`,
    `Serial ${joinList(series.genres)} dari ${series.country}${
      series.network ? ` yang tayang di ${series.network}` : ""
    }${starring ? ` ini dibintangi ${starring}` : ""}.`,
    `Tersedia ${series.seasons.length} season dengan total ${episodeTotal} episode${
      series.rating ? `, rating ${series.rating}/10` : ""
    }.`,
  ].join(" ");

  const url = absoluteUrl(`/series/${series.slug}`);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      name: series.title,
      url,
      description: series.synopsis,
      image: series.poster,
      startDate: String(series.year),
      numberOfSeasons: series.totalSeasons || undefined,
      genre: series.genres,
      countryOfOrigin: series.country
        ? { "@type": "Country", name: series.country }
        : undefined,
      actor: series.cast.slice(0, 10).map((member) => ({
        "@type": "Person",
        name: member.name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Serial TV",
          item: absoluteUrl("/series/latest"),
        },
        { "@type": "ListItem", position: 3, name: series.title, item: url },
      ],
    },
  ];

  return (
    <main>
      <JsonLd data={structuredData} />
      <SeriesHero
        slug={series.slug}
        title={series.title}
        banner={bannerUrl(series.banner)}
        genres={series.genres}
        rating={series.rating}
        year={series.year}
        totalSeasons={series.seasons.length || series.totalSeasons}
        status={series.status}
        age={series.age}
        country={series.country}
        network={series.network}
        trailer={series.trailer}
        nextEpisode={series.nextEpisode}
        playHref={firstEpisode ? episodeHref(series.slug, firstEpisode) : null}
      />

      <section className="px-5 py-8 md:px-12">
        <div className="max-w-4xl">
          <p className="text-lg leading-relaxed">{series.synopsis}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{seoText}</p>

          {series.studios.length > 0 && (
            <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
              {series.studios.map((studio) => (
                <li key={studio.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={studio.logo}
                    alt={studio.name}
                    loading="lazy"
                    className="h-12 w-auto max-w-[160px] object-contain opacity-70"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <EpisodeList slug={series.slug} seasons={series.seasons} />

      {cast.length > 0 && (
        <section aria-labelledby="cast-title" className="pb-6">
          <h2
            id="cast-title"
            className="mb-2 px-5 text-lg font-semibold md:px-12"
          >
            Pemeran
          </h2>

          <PosterRow buttonTop={90}>
            {cast.map((member, index) => (
              <li
                key={`${member.name}-${member.role}-${index}`}
                className="w-32 shrink-0 snap-start overflow-hidden rounded-xl bg-surface"
              >
                <div className="aspect-[3/4] w-full bg-surface-hover">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resizeImage(member.photo, "w500")}
                      alt={member.name}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center text-4xl font-bold text-border"
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-muted">{member.role}</p>
                </div>
              </li>
            ))}
          </PosterRow>
        </section>
      )}

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
