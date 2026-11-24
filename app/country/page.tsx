import type { Metadata } from "next";
import Link from "next/link";
import { getCountries } from "@/lib/country";

export const metadata: Metadata = {
  title: "Negara | Senplay Movie",
  description: "Telusuri film berdasarkan negara asal.",
};

export default async function CountryPage() {
  const countries = await getCountries();

  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <h1 className="text-2xl font-bold md:text-3xl">Negara</h1>

      {countries.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          Daftar negara belum tersedia. Coba lagi beberapa saat lagi.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {countries.map((country) => (
            <li key={country.slug}>
              <Link
                href={`/country/${country.slug}`}
                className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-5 py-5 text-sm font-semibold text-text transition-colors hover:border-accent hover:bg-surface-hover"
              >
                <span className="truncate">{country.name}</span>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent-text"
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
