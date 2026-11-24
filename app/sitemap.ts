import type { MetadataRoute } from "next";
import { DEFAULT_CATEGORY, getCategory } from "@/lib/category";
import type { CategoryItem } from "@/lib/category";
import { getLatestItems } from "@/lib/latest";
import { getLatestSeries } from "@/lib/series";
import { episodeHref, getSeries } from "@/lib/seriesDetail";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const LATEST_PAGES = 20; 
const CATEGORY_PAGES = 10; 
const EPISODE_SERIES_LIMIT = 150;
const CONCURRENCY = 6; 

type Entry = MetadataRoute.Sitemap[number];

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await fn(items[index]);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

const isHidden = (item: { type?: string; quality?: string }) =>
  !!item.type?.startsWith("Disembunyikan") || item.quality === "Filter konten";

const itemPath = (item: CategoryItem) =>
  item.type === "Serial" ? `/series/${item.slug}` : `/movie/${item.slug}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const first = await getCategory(DEFAULT_CATEGORY).catch(() => null);
  const types = first?.availableTypes ?? [];

  const categoryJobs = types.flatMap((type) =>
    range(CATEGORY_PAGES).map((page) => ({ slug: type.slug, page })),
  );

  const [latestMovies, latestSeries, categoryItems] = await Promise.all([
    mapPool(range(LATEST_PAGES), CONCURRENCY, (page) =>
      getLatestItems(page).catch(() => [] as CategoryItem[]),
    ),
    mapPool(range(LATEST_PAGES), CONCURRENCY, (page) =>
      getLatestSeries(page).catch(() => []),
    ),
    mapPool(categoryJobs, CONCURRENCY, ({ slug, page }) =>
      getCategory(slug, page)
        .then((data) => data?.results ?? [])
        .catch(() => [] as CategoryItem[]),
    ),
  ]);

  const entries = new Map<string, Entry>();
  const seriesSlugs = new Set<string>();

  const add = (path: string, extra: Partial<Entry> = {}) => {
    if (!entries.has(path)) entries.set(path, { url: absoluteUrl(path), ...extra });
  };

  for (const path of [
    "/",
    "/latest",
    "/series/latest",
    "/jadwal",
    "/genre",
    "/country",
    "/network",
  ]) {
    add(path);
  }
  for (const type of types) add(`/movie?type=${type.slug}`);

  for (const item of latestSeries.flat()) {
    if (isHidden(item)) continue;
    add(`/series/${item.slug}`);
    seriesSlugs.add(item.slug);
  }

  for (const item of [...latestMovies.flat(), ...categoryItems.flat()]) {
    if (isHidden(item)) continue;
    add(itemPath(item));
    if (item.type === "Serial") seriesSlugs.add(item.slug);
  }

  // Episode
  if (EPISODE_SERIES_LIMIT > 0) {
    const slugs = [...seriesSlugs].slice(0, EPISODE_SERIES_LIMIT);
    const details = await mapPool(slugs, CONCURRENCY, (slug) =>
      getSeries(slug).catch(() => null),
    );
    const now = new Date();

    for (const series of details) {
      if (!series) continue;

      for (const season of series.seasons) {
        for (const ep of season.episodes) {
          const date = new Date(ep.releaseDate);
          const valid = !Number.isNaN(date.getTime());
          if (valid && date > now) continue;

          add(episodeHref(series.slug, ep), valid ? { lastModified: date } : {});
        }
      }
    }
  }

  return [...entries.values()];
}