import type { Metadata } from "next";
import { Suspense } from "react";
import MovieInfiniteGrid from "@/components/MovieInfiniteGrid";
import { getLatestItems } from "@/lib/latest";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Film Terbaru Sub Indo",
  description:
    "Daftar film dan serial terbaru subtitle Indonesia yang baru rilis di SenPlay.",
  path: "/latest",
});

export default function LatestPage() {
  return (
    <main className="px-5 pb-8 pt-28 md:px-12">
      <h1 className="text-2xl font-bold">Terbaru</h1>

      <Suspense
        fallback={<p className="mt-16 text-center text-muted">Memuat...</p>}
      >
        <LatestContent />
      </Suspense>
    </main>
  );
}

async function LatestContent() {
  const initialItems = await getLatestItems(1);

  return (
    <MovieInfiniteGrid
      endpoint="/api/latest"
      initialItems={initialItems}
      emptyMessage="Belum ada film terbaru."
    />
  );
}
