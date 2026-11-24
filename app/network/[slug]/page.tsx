import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import MovieInfiniteGrid from "@/components/MovieInfiniteGrid";
import { POSTER_GRID_CLASS } from "@/lib/genre";
import { getNetworkPage } from "@/lib/network";

export const metadata: Metadata = {
  title: "Network | Senplay Movie",
  description: "Telusuri tontonan berdasarkan network dan platform streaming.",
};

async function NetworkContent({
  params,
}: {
  params: PageProps<"/network/[slug]">["params"];
}) {
  const { slug } = await params;
  const data = await getNetworkPage(slug, 1);

  if (!data) {
    return (
      <p className="mt-16 text-center text-muted">
        Gagal memuat network. Coba lagi beberapa saat lagi.
      </p>
    );
  }

  return (
    <>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">
        {data.network.name}
      </h1>
      <MovieInfiniteGrid
        key={slug}
        endpoint={`/api/network/${encodeURIComponent(slug)}`}
        initialItems={data.results}
        emptyMessage="Belum ada tontonan untuk network ini."
      />
    </>
  );
}

function NetworkFallback() {
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

export default function NetworkDetailPage({
  params,
}: PageProps<"/network/[slug]">) {
  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <Suspense fallback={<NetworkFallback />}>
        <NetworkContent params={params} />
      </Suspense>
    </main>
  );
}
