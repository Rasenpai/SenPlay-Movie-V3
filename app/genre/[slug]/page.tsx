import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import MovieInfiniteGrid from "@/components/MovieInfiniteGrid";
import { getGenrePage, POSTER_GRID_CLASS } from "@/lib/genre";

export const metadata: Metadata = {
  title: "Genre | Senplay Movie",
  description: "Telusuri film berdasarkan genre favoritmu.",
};

async function GenreContent({
  params,
}: {
  params: PageProps<"/genre/[slug]">["params"];
}) {
  const { slug } = await params;
  const data = await getGenrePage(slug, 1);

  if (!data) {
    return (
      <p className="mt-16 text-center text-muted">
        Gagal memuat genre. Coba lagi beberapa saat lagi.
      </p>
    );
  }

  return (
    <>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">{data.genre.name}</h1>
      <MovieInfiniteGrid
        key={slug}
        endpoint={`/api/genre/${encodeURIComponent(slug)}`}
        initialItems={data.results}
        emptyMessage="Belum ada film untuk genre ini."
      />
    </>
  );
}

function GenreFallback() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="mt-2 h-8 w-40 rounded-lg bg-surface" />
      <div className={`mt-6 ${POSTER_GRID_CLASS}`}>
        {Array.from({ length: 16 }, (_, index) => (
          <div key={index} className="aspect-[2/3] rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default function GenreDetailPage({
  params,
}: PageProps<"/genre/[slug]">) {
  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <Suspense fallback={<GenreFallback />}>
        <GenreContent params={params} />
      </Suspense>
    </main>
  );
}
