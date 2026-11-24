import { fetchData } from "./api";

export type NewEpisodeItem = {
  title: string;
  slug: string;
  release_year: number;
  episode_title: string;
  season: number;
  episode: number;
  episode_code: string;
  poster: string;
  url: string;
};

export async function getNewEpisodes(): Promise<NewEpisodeItem[]> {
  const data = await fetchData<{ results: NewEpisodeItem[] }>("/series/new-episode");
  return data?.results ?? [];
}