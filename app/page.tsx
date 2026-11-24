import type { Metadata } from "next";
import Image from "next/image";
import AdBanner from "@/components/AdBanner";
import CategorySection from "@/components/CategorySection";
import HeroBanner from "@/components/HeroBanner";
import LatestSection from "@/components/LatestSection";
import LatestSeriesSection from "@/components/LatestSeriesSection";
import NewEpisodeSection from "@/components/NewEpisodeSection";
import NoticeBar from "@/components/NoticeBar";
import QuickLinks from "@/components/QuickLinks";
import TrendingSection from "@/components/TrendingSection";
import { ADS } from "@/lib/ads";
import { getHeroItems } from "@/lib/banners";
import { DEFAULT_CATEGORY, getCategory } from "@/lib/category";
import { getNewEpisodes } from "@/lib/episodes";
import { getLatestItems } from "@/lib/latest";
import { getPopularItems } from "@/lib/popular";
import { getLatestSeries } from "@/lib/series";
import ChatPreview from "@/components/ChatPreview";
import SupportBanner from "@/components/SupportBanner";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [
    heroItems,
    popularItems,
    newEpisodes,
    category,
    latestItems,
    latestSeries,
  ] = await Promise.all([
    getHeroItems(),
    getPopularItems(),
    getNewEpisodes(),
    getCategory(DEFAULT_CATEGORY),
    getLatestItems(),
    getLatestSeries(),
  ]);

  return (
    <main className="flex-1">
      <HeroBanner items={heroItems} />
      <NoticeBar />

      <section className="grid gap-3 px-5 pb-2 pt-4 md:grid-cols-2 md:px-12">
        <div className="relative aspect-[3/1] overflow-hidden rounded-2xl border border-border">
          <Image
            src="/senpai-banner.jpeg"
            alt="Jasa pembuatan website Senpaii"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-muted/60">
            Iklan
          </span>
          <div className="min-[1600px]:hidden">
            <AdBanner {...ADS.mobile} />
          </div>
          <div className="hidden min-[1600px]:block">
            <AdBanner {...ADS.desktop} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 md:px-12">
        <SupportBanner />
      </div>

      <QuickLinks />
      <ChatPreview />
      <TrendingSection items={popularItems} />
      {category && <CategorySection initialData={category} />}
      <LatestSection items={latestItems} />
      <LatestSeriesSection items={latestSeries} />
      <NewEpisodeSection items={newEpisodes} />
    </main>
  );
}
