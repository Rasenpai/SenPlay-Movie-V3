import { fetchData } from "./api";
import type { CategoryItem } from "./category";

export type Network = {
  slug: string;
  name: string;
  logo: string;
};

export type NetworkPage = {
  network: Network;
  page: number;
  results: CategoryItem[];
};

type NetworkListResponse = {
  networks: Network[];
};

export async function getNetworks(): Promise<Network[]> {
  const data = await fetchData<NetworkListResponse>("/movie/networks");
  return data?.networks ?? [];
}

export const getNetworkPage = (slug: string, page: number) =>
  fetchData<NetworkPage>(
    `/movie/network/${encodeURIComponent(slug)}?page=${page}`,
  );