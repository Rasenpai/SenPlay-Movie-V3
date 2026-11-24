import { fetchData } from "./api";
import type { CategoryItem } from "./category";

export type Genre = {
  slug: string;
  name: string;
};

export type GenrePage = {
  genre: Genre;
  page: number;
  results: CategoryItem[];
};

type GenreListResponse = {
  genres: Genre[];
};

export const POSTER_GRID_CLASS =
  "grid grid-cols-3 gap-x-4 gap-y-6 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";

export async function getGenres(): Promise<Genre[]> {
  const data = await fetchData<GenreListResponse>("/movie/genres");
  return data?.genres ?? [];
}

export const getGenrePage = (slug: string, page: number) =>
  fetchData<GenrePage>(`/movie/genre/${encodeURIComponent(slug)}?page=${page}`);