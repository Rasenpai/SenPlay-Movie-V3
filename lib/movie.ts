import { fetchData } from "./api";

export type CastMember = {
  name: string;
  character: string;
  photo: string | null;
  url: string;
};

export type Provider = {
  id: string;
  name: string;
  quality: string | null;
  embedUrl: string;
};

export type MovieRecommendation = {
  title: string;
  slug: string;
  poster: string;
  rating: string | null;
  year: number;
  quality: string;
};

export type MovieDetail = {
  title: string;
  slug: string;
  banner: string;
  poster: string;
  genres: string[];
  rating: string | null;
  year: number;
  releaseDate: string;
  duration: string;
  quality: string;
  age: string;
  country: string;
  director: string;
  synopsis: string;
  trailer: { name: string; url: string; thumbnail: string } | null;
  studio: { name: string; logo: string | null } | null;
  cast: CastMember[];
  recommendations: MovieRecommendation[];
  player: { providers: Provider[] };
};

export const getMovie = (slug: string) =>
  fetchData<MovieDetail>(`/movie/${encodeURIComponent(slug)}`);

export const genreSlug = (genre: string) =>
  genre.trim().toLowerCase().replace(/\s+/g, "-");

export const bannerUrl = (url: string) =>
  url.replace("/t/p/original/", "/t/p/w1280/");

function parseDuration(iso: string | null | undefined) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso ?? "");
  return { hours: Number(match?.[1] ?? 0), minutes: Number(match?.[2] ?? 0) };
}

/** PT1H37M -> "1j 37m" */
export function formatDurationShort(iso: string | null | undefined) {
  const { hours, minutes } = parseDuration(iso);
  return [hours && `${hours}j`, minutes && `${minutes}m`]
    .filter(Boolean)
    .join(" ");
}

/** PT1H37M -> "1 jam 37 menit" */
export function formatDurationLong(iso: string | null | undefined) {
  const { hours, minutes } = parseDuration(iso);
  return [hours && `${hours} jam`, minutes && `${minutes} menit`]
    .filter(Boolean)
    .join(" ");
}

/** ["A","B","C"] -> "A, B, dan C" */
export function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

export type ProviderGroup = {
  key: string;
  name: string;
  sources: Provider[];
};

const PROVIDER_ORDER = ["hydrax", "gdriveplayer", "streamtape", "vikingfile"];

const qualityValue = (quality: string | null) =>
  Number.parseInt(quality ?? "", 10) || 0;

const orderOf = (key: string) => {
  const index = PROVIDER_ORDER.indexOf(key);
  return index === -1 ? PROVIDER_ORDER.length : index;
};

export function groupProviders(providers: Provider[]): ProviderGroup[] {
  const map = new Map<string, ProviderGroup>();

  for (const provider of providers) {
    const key = provider.id.split("-")[0];
    const group = map.get(key);
    if (group) group.sources.push(provider);
    else map.set(key, { key, name: provider.name, sources: [provider] });
  }

  return [...map.values()]
    .map((group) => ({
      ...group,
      sources: [...group.sources].sort(
        (a, b) => qualityValue(b.quality) - qualityValue(a.quality),
      ),
    }))
    .sort((a, b) => orderOf(a.key) - orderOf(b.key));
}