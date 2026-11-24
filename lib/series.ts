import { fetchData } from "./api";

export type SeriesItem = {
  title: string;
  poster: string;
  type: string;
  season: number;
  rating: number | null;
  status: string;
  release_year: number;
  slug: string;
};

export async function getLatestSeries(page = 1): Promise<SeriesItem[]> {
  const data = await fetchData<{ page: number; results: SeriesItem[] }>(
    `/series/latest?page=${page}`,
  );
  return data?.results ?? [];
}