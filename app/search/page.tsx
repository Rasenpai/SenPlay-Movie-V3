import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import { searchTitles } from "@/lib/search";

export const metadata: Metadata = {
  title: "Cari - SenPlay",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const SKELETON_COUNT = 12;

function SearchSkeleton() {
  return (
    <div aria-busy="true">
      <div className="h-8 w-72 max-w-full animate-pulse rounded-lg bg-surface" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            className="aspect-[2/3] animate-pulse rounded-xl bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : (q ?? "")).trim();
  const items = await searchTitles(query);

  return (
    <>
      <h1 className="text-xl font-semibold md:text-2xl">
        {query ? (
          <>
            Hasil pencarian untuk{" "}
            <span className="text-accent-text">“{query}”</span>
          </>
        ) : (
          "Pencarian"
        )}
      </h1>

      {query && (
        <p className="mt-1 text-sm text-muted">
          {items.length} judul ditemukan
        </p>
      )}

      <form
        action="/search"
        role="search"
        className="mt-5 flex max-w-xl items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 focus-within:border-muted"
      >
        <input
          name="q"
          defaultValue={query}
          placeholder="Cari film atau series..."
          autoComplete="off"
          className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label="Cari"
          className="text-muted transition-colors hover:text-text"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3" />
          </svg>
        </button>
      </form>

      {items.length > 0 ? (
        <SearchResults items={items} />
      ) : (
        <p className="mt-16 text-center text-sm text-muted">
          {query
            ? `Tidak ada hasil untuk “${query}”. Coba kata kunci lain.`
            : "Ketik judul film atau serial untuk mulai mencari."}
        </p>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <main className="min-h-screen flex-1 px-5 pb-16 pt-28 md:px-12">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
