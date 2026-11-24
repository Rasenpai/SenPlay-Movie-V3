import { fetchData } from "./api";

export type PopularItem = {
  title: string;
  slug: string;
  poster: string;
  rating: string | null;
  type: string | null;
};

export async function getPopularItems(): Promise<PopularItem[]> {
  const data = await fetchData<{ results: PopularItem[] }>("/movie/popular");
  return data?.results ?? [];
}