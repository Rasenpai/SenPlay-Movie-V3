import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import MovieInfiniteGrid from "@/components/MovieInfiniteGrid";
import { getCountryPage } from "@/lib/country";
import { POSTER_GRID_CLASS } from "@/lib/genre";

export const metadata: Metadata = {
  title: "Negara | Senplay Movie",
  description: "Telusuri film berdasarkan negara asal.",
};

async function CountryContent({
  params,
}: {
  params: PageProps<"/country/[slug]">["params"];
}) {
  const { slug } = await params;
  const data = await getCountryPage(slug, 1);

  if (!data) {
    return (
      <p className="mt-16 text-center text-muted">
        Gagal memuat negara. Coba lagi beberapa saat lagi.
      </p>
    );
  }

  return (
    <>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">
        {data.country.name}
      </h1>
      <MovieInfiniteGrid
        key={slug}
        endpoint={`/api/country/${encodeURIComponent(slug)}`}
        initialItems={data.results}
        emptyMessage="Belum ada film untuk negara ini."
      />
    </>
  );
}

function CountryFallback() {
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

export default function CountryDetailPage({
  params,
}: PageProps<"/country/[slug]">) {
  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <Suspense fallback={<CountryFallback />}>
        <CountryContent params={params} />
      </Suspense>
    </main>
  );
}
