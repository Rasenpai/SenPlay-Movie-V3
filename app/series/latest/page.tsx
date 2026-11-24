import type { Metadata } from "next";
import { Suspense } from "react";
import SeriesInfiniteGrid from "@/components/SeriesInfiniteGrid";
import { getLatestSeries } from "@/lib/series";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Serial Terbaru Sub Indo",
  description:
    "Daftar serial terbaru subtitle Indonesia yang baru ditambahkan di SenPlay.",
  path: "/series/latest",
});

export default function LatestSeriesPage() {
  return (
    <main className="px-5 pb-8 pt-28 md:px-12">
      <h1 className="text-2xl font-bold">Serial Baru Ditambahkan</h1>

      <Suspense
        fallback={<p className="mt-16 text-center text-muted">Memuat...</p>}
      >
        <LatestSeriesContent />
      </Suspense>
    </main>
  );
}

async function LatestSeriesContent() {
  const initialItems = await getLatestSeries(1);

  return (
    <SeriesInfiniteGrid
      endpoint="/api/series/latest"
      initialItems={initialItems}
      emptyMessage="Belum ada serial terbaru."
    />
  );
}
