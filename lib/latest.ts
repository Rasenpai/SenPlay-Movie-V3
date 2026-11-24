import { fetchData } from "./api";
import type { CategoryItem } from "./category";

export async function getLatestItems(page = 1): Promise<CategoryItem[]> {
  const data = await fetchData<{ page: number; results: CategoryItem[] }>(
    `/movie/latest?page=${page}`,
  );
  return data?.results ?? [];
}