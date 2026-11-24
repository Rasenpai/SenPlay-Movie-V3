import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import MovieInfiniteGrid from "@/components/MovieInfiniteGrid";
import { DEFAULT_CATEGORY, getCategory } from "@/lib/category";
import { createMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

const resolveType = async (searchParams: PageProps["searchParams"]) => {
  const { type } = await searchParams;
  return (Array.isArray(type) ? type[0] : type) || DEFAULT_CATEGORY;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const type = await resolveType(searchParams);
  const data = await getCategory(type);
  const name =
    data?.availableTypes.find((item) => item.slug === type)?.name ?? "Film";

  return createMetadata({
    title: `${name} Sub Indo`,
    description: `Kumpulan ${name} subtitle Indonesia terbaru di SenPlay.`,
    path: `/movie?type=${type}`,
  });
}

export default function MovieCategoryPage({ searchParams }: PageProps) {
  return (
    <main className="px-5 pb-8 pt-28 md:px-12">
      <Suspense
        fallback={<p className="mt-16 text-center text-muted">Memuat...</p>}
      >
        <MovieCategoryContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MovieCategoryContent({ searchParams }: PageProps) {
  const type = await resolveType(searchParams);
  const data = await getCategory(type);

  const types = data?.availableTypes ?? [];
  const activeName = types.find((item) => item.slug === type)?.name ?? "Film";

  return (
    <>
      <h1 className="text-2xl font-bold">{activeName}</h1>

      {types.length > 0 && (
        <nav aria-label="Kategori film" className="mt-4 flex flex-wrap gap-2">
          {types.map((item) => (
            <Link
              key={item.slug}
              href={`/movie?type=${item.slug}`}
              aria-current={item.slug === type ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                item.slug === type
                  ? "bg-accent/15 text-accent-text"
                  : "bg-surface text-muted hover:bg-surface-hover hover:text-text"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      <MovieInfiniteGrid
        key={type}
        endpoint={`/api/category/${encodeURIComponent(type)}/items`}
        initialItems={data?.results ?? []}
        emptyMessage="Belum ada film di kategori ini."
      />
    </>
  );
}
