import { fetchData } from "./api";
import type { Provider } from "./movie";

type RawWatch = {
  title: string;
  slug: string;
  series: { title: string; slug: string };
  season: number;
  episode: number;
  episode_code: string;
  poster: string | null;
  banner: string | null;
  description: string;
  release_date: string;
  player: {
    providers: {
      id: string;
      name: string;
      quality: string | null;
      embedUrl: string;
    }[];
  };
};

export type EpisodeWatch = {
  slug: string;
  title: string;
  banner: string | null;
  description: string;
  providers: Provider[];
};

/**
 * Tanpa `?play=true` API mengembalikan `providers: []`,
 * jadi untuk halaman watch kita selalu meminta `play=true`.
 */
export async function getEpisodeWatch(
  seriesSlug: string,
  episodeSlug: string,
): Promise<EpisodeWatch | null> {
  const raw = await fetchData<RawWatch>(
    `/series/${encodeURIComponent(seriesSlug)}/watch/${encodeURIComponent(
      episodeSlug,
    )}?play=true`,
  );
  if (!raw) return null;

  return {
    slug: raw.slug,
    title: raw.title,
    banner: raw.banner ?? raw.poster,
    description: raw.description,
    providers: (raw.player?.providers ?? []) as Provider[],
  };
}