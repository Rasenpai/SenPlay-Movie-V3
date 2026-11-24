import { fetchData } from "./api";
import type { CategoryItem } from "./category";

export type Country = {
  slug: string;
  name: string;
};

export type CountryPage = {
  country: Country;
  page: number;
  results: CategoryItem[];
};

type CountryListResponse = {
  countries: Country[];
};

export async function getCountries(): Promise<Country[]> {
  const data = await fetchData<CountryListResponse>("/movie/countries");
  return data?.countries ?? [];
}

export const getCountryPage = (slug: string, page: number) =>
  fetchData<CountryPage>(
    `/movie/country/${encodeURIComponent(slug)}?page=${page}`,
  );