import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PosterCard, { createBadge } from "@/components/PosterCard";
import PosterRow from "@/components/PosterRow";
import { resizeImage } from "@/lib/image";
import {
  formatDurationLong,
  formatDurationShort,
  getMovie,
  joinList,
  bannerUrl,
} from "@/lib/movie";
import MovieHero from "./MovieHero";
import MovieSkeleton from "./MovieSkeleton";
import { createMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

const CAST_LIMIT = 20;
const CAST_MENTION = 3;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    return {
      title: "Film tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return createMetadata({
    title: `Nonton ${movie.title} (${movie.year}) Sub Indo`,
    description:
      movie.synopsis ||
      `Nonton ${movie.title} (${movie.year}) subtitle Indonesia di SenPlay.`,
    path: `/movie/${movie.slug}`,
    type: "video.movie",
  });
}

export default function MoviePage({ params }: PageProps) {
  return (
    <Suspense fallback={<MovieSkeleton />}>
      <MovieContent params={params} />
    </Suspense>
  );
}

async function MovieContent({ params }: PageProps) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) notFound();

  const cast = movie.cast.slice(0, CAST_LIMIT);
  const starring = joinList(
    movie.cast.slice(0, CAST_MENTION).map((member) => member.name),
  );

  const seoText = [
    `Nonton ${movie.title} (${movie.year}) subtitle Indonesia di SenPlay (movie.senplay.web.id).`,
    `Film ${joinList(movie.genres)} dari ${movie.country} ini disutradarai ${movie.director}${
      starring ? ` dan dibintangi ${starring}` : ""
    }.`,
    `Durasi ${formatDurationLong(movie.duration)}${
      movie.rating ? `, rating ${movie.rating}/10` : ""
    }.`,
  ].join(" ");

  const url = absoluteUrl(`/movie/${movie.slug}`);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: movie.title,
      url,
      description: movie.synopsis,
      image: movie.poster,
      dateCreated: String(movie.year),
      genre: movie.genres,
      countryOfOrigin: movie.country
        ? { "@type": "Country", name: movie.country }
        : undefined,
      director: movie.director
        ? { "@type": "Person", name: movie.director }
        : undefined,
      actor: cast.slice(0, 10).map((member) => ({
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
          name: "Film",
          item: absoluteUrl("/movie"),
        },
        { "@type": "ListItem", position: 3, name: movie.title, item: url },
      ],
    },
  ];

  return (
    <main>
      <JsonLd data={structuredData} />
      <MovieHero
        key={movie.slug}
        slug={movie.slug}
        title={movie.title}
        banner={bannerUrl(movie.banner)}
        genres={movie.genres}
        rating={movie.rating}
        year={movie.year}
        duration={formatDurationShort(movie.duration)}
        quality={movie.quality}
        age={movie.age}
        country={movie.country}
        director={movie.director}
        trailer={movie.trailer}
        providers={movie.player.providers}
      />

      <section className="px-5 py-8 md:px-12">
        <div className="max-w-4xl">
          <p className="text-lg leading-relaxed">{movie.synopsis}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{seoText}</p>

          {movie.studio?.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.studio.logo}
              alt={movie.studio.name}
              loading="lazy"
              className="mt-6 h-12 w-auto max-w-[160px] object-contain opacity-70"
            />
          )}
        </div>
      </section>

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
                key={`${member.name}-${member.character}-${index}`}
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
                  <p className="truncate text-xs text-muted">
                    {member.character}
                  </p>
                </div>
              </li>
            ))}
          </PosterRow>
        </section>
      )}

      {movie.recommendations.length > 0 && (
        <section aria-labelledby="recommendation-title" className="pb-10">
          <h2
            id="recommendation-title"
            className="mb-2 px-5 text-lg font-semibold md:px-12"
          >
            Rekomendasi Serupa
          </h2>

          <PosterRow>
            {movie.recommendations.map((item) => (
              <PosterCard
                key={item.slug}
                title={item.title}
                slug={item.slug}
                poster={item.poster}
                rating={item.rating}
                href={`/movie/${item.slug}`}
                badgeLeft={{ label: "FILM", tone: "accent" }}
                badgeRight={createBadge(item.quality, "muted")}
              />
            ))}
          </PosterRow>
        </section>
      )}
    </main>
  );
}
