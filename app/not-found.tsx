import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70svh] flex-1 items-center justify-center px-4 pb-12 pt-28">
      <div className="w-full max-w-md animate-[hero-in_0.6s_ease-out_both] text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Error 404
        </p>

        <h1 className="mt-6 bg-gradient-to-b from-text to-text/20 bg-clip-text text-8xl font-black leading-none tracking-tight text-transparent sm:text-9xl">
          404
        </h1>

        <h2 className="mt-6 text-2xl font-bold text-text">
          Yah, halamannya nggak ketemu
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Film atau halaman yang kamu cari mungkin sudah dipindah, dihapus, atau
          alamatnya salah ketik.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/search"
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-hover"
          >
            Cari film
          </Link>
        </div>
      </div>
    </main>
  );
}
