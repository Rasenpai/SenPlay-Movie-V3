import { fetchData } from "./api";

export type HeroItem = {
  type: "movie" | "series";
  title_text: string;
  title_image: string | null;
  rating: number | null;
  release_year: number | null;
  country: string | null;
  country_flag: string | null;
  duration: string | null;
  status: string | null;
  genre: string | null;
  total_season: number | null;
  synopsis: string;
  slug: string;
  banner: string;
  bannerMobile: string;
};

type ApiItem = Omit<HeroItem, "bannerMobile">;

type BannerData = {
  desktop: ApiItem[];
  mobile: ApiItem[];
};

export async function getHeroItems(): Promise<HeroItem[]> {
  const data = await fetchData<BannerData>("/movie/banner-home");
  if (!data) return [];

  const mobileBanners = new Map(data.mobile.map((m) => [m.slug, m.banner]));

  return data.desktop.map((item) => ({
    ...item,
    bannerMobile: mobileBanners.get(item.slug) ?? item.banner,
  }));
}