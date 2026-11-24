import type { Metadata } from "next";
import Link from "next/link";
import { getGenres } from "@/lib/genre";

export const metadata: Metadata = {
  title: "Genre | Senplay Movie",
  description: "Telusuri film berdasarkan genre favoritmu.",
};

export default async function GenrePage() {
  const genres = await getGenres();

  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <h1 className="text-2xl font-bold md:text-3xl">Genre</h1>

      {genres.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          Daftar genre belum tersedia. Coba lagi beberapa saat lagi.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {genres.map((genre) => (
            <li key={genre.slug}>
              <Link
                href={`/genre/${genre.slug}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-5 text-sm font-semibold text-text transition-colors hover:border-accent hover:bg-surface-hover"
              >
                {genre.name}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-muted transition-colors group-hover:text-accent-text"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
