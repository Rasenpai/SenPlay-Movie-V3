import { fetchData } from "./api";

type Nullable<T> = T | null | undefined;

type RawEpisode = {
  slug: string;
  season: number;
  episode: number;
  episode_code: string;
  title: Nullable<string>;
  poster: string | null;
  release_date: string;
  rating: number | null;
  duration: string | null;
  description: Nullable<string>;
};

type RawSeries = {
  title: string;
  slug: string;
  poster: string;
  banner: Nullable<string>;
  genres: Nullable<string[]>;
  rating: number | null;
  release_year: number;
  total_seasons: number;
  age_rating: Nullable<string>;
  status: string;
  trailer: { title: string; url: string; thumbnail: string } | null;
  country: Nullable<string>;
  network: Nullable<string>;
  studios: Nullable<{ name: string; image: string | null }[]>;
  synopsis: Nullable<string>;
  next_episode: { code: string; date: string; time: string } | null;
  episodes: Nullable<RawEpisode[]>;
  seasons: Nullable<{ season: number; episodes: RawEpisode[] }[]>;
  cast: Nullable<
    { name: Nullable<string>; character: Nullable<string>; image: string | null }[]
  >;
  similar: Nullable<
    {
      title: string;
      slug: string;
      poster: string;
      release_year: number;
      season: number;
      rating: number | null;
      status: string;
    }[]
  >;
};

export type Episode = {
  slug: string;
  season: number;
  episode: number;
  code: string;
  title: string;
  poster: string | null;
  releaseDate: string;
  rating: string | null;
  duration: string | null;
  description: string;
};

export type Season = { season: number; episodes: Episode[] };

export type SeriesCastMember = {
  name: string;
  role: string;
  photo: string | null;
};

export type SeriesRecommendation = {
  title: string;
  slug: string;
  poster: string;
  rating: string | null;
  year: number;
  season: number;
  status: string;
};

export type SeriesDetail = {
  title: string;
  slug: string;
  poster: string;
  banner: string;
  genres: string[];
  rating: string | null;
  year: number;
  totalSeasons: number;
  age: string;
  status: string;
  country: string;
  network: string;
  synopsis: string;
  trailer: { name: string; url: string } | null;
  studios: { name: string; logo: string }[];
  nextEpisode: { code: string; date: string; time: string } | null;
  seasons: Season[];
  cast: SeriesCastMember[];
  recommendations: SeriesRecommendation[];
};

const text = (value: Nullable<string>) => value?.trim() ?? "";

const toRating = (value: number | null) =>
  value != null ? value.toFixed(1) : null;

const toEpisode = (e: RawEpisode): Episode => ({
  slug: e.slug,
  season: e.season,
  episode: e.episode,
  code: e.episode_code,
  title: text(e.title),
  poster: e.poster,
  releaseDate: e.release_date,
  rating: toRating(e.rating),
  duration: e.duration,
  description: text(e.description),
});

function toCast(c: NonNullable<RawSeries["cast"]>[number]): SeriesCastMember {
  const full = text(c.name);
  const actor = text(c.character);

  if (actor && full.startsWith(actor)) {
    return { name: actor, role: full.slice(actor.length).trim(), photo: c.image };
  }

  return { name: full, role: "", photo: c.image };
}

function toSeasons(raw: RawSeries): Season[] {
  const source = raw.seasons?.length
    ? raw.seasons
    : Object.values(
        Object.groupBy(raw.episodes ?? [], (e) => String(e.season)),
      ).map((list) => ({ season: list![0].season, episodes: list! }));

  return source
    .filter((s) => s.episodes.length > 0)
    .map((s) => ({
      season: s.season,
      episodes: [...s.episodes]
        .sort((a, b) => a.episode - b.episode)
        .map(toEpisode),
    }))
    .sort((a, b) => a.season - b.season);
}

function normalize(raw: RawSeries): SeriesDetail {
  return {
    title: raw.title,
    slug: raw.slug,
    poster: raw.poster,
    banner: text(raw.banner),
    genres: raw.genres ?? [],
    rating: toRating(raw.rating),
    year: raw.release_year,
    totalSeasons: raw.total_seasons,
    age: text(raw.age_rating),
    status: raw.status,
    country: text(raw.country),
    network: text(raw.network),
    synopsis: text(raw.synopsis),
    trailer: raw.trailer
      ? { name: raw.trailer.title, url: raw.trailer.url }
      : null,
    studios: (raw.studios ?? [])
      .filter((s): s is { name: string; image: string } => !!s.image)
      .map((s) => ({ name: s.name, logo: s.image })),
    nextEpisode: raw.next_episode,
    seasons: toSeasons(raw),
    cast: (raw.cast ?? []).map(toCast).filter((member) => member.name),
    recommendations: (raw.similar ?? []).map((s) => ({
      title: s.title,
      slug: s.slug,
      poster: s.poster,
      rating: toRating(s.rating),
      year: s.release_year,
      season: s.season,
      status: s.status,
    })),
  };
}

export async function getSeries(slug: string): Promise<SeriesDetail | null> {
  const raw = await fetchData<RawSeries>(`/series/${encodeURIComponent(slug)}`);
  return raw ? normalize(raw) : null;
}

export const episodeHref = (
  slug: string,
  { season, episode }: { season: number; episode: number },
) => `/series/${slug}/season/${season}/episode/${episode}`;