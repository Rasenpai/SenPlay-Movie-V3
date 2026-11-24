import { fetchData } from "./api";

export type CategoryItem = {
  title: string;
  poster: string;
  type: string;
  quality: string;
  rating: string | null;
  slug: string;
};

export type CategoryType = {
  slug: string;
  name: string;
};

export type CategoryData = {
  type: string;
  results: CategoryItem[];
  availableTypes: CategoryType[];
};

export const DEFAULT_CATEGORY = "film-indonesia";

export const getCategory = (type: string, page = 1) =>
  fetchData<CategoryData>(`/movie/type=${encodeURIComponent(type)}?page=${page}`);