import { fetchData } from "./api";

export type SearchItem = {
  title: string;
  poster: string;
  type: "movie" | "series";
  season: string | null;
  quality: string | null;
  rating: string | null;
  status: string | null;
  slug: string;
};

export async function searchTitles(query: string): Promise<SearchItem[]> {
  const keyword = query.trim();
  if (!keyword) return [];

  const data = await fetchData<{ query: string; results: SearchItem[] }>(
    `/movie/search?q=${encodeURIComponent(keyword)}`,
  );
  return data?.results ?? [];
}