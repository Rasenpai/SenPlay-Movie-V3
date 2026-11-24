import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { countUsers } from "@/lib/db";

async function TotalUsers() {
  await connection(); // supaya angka selalu terbaru, bukan beku saat build
  return <>{countUsers().toLocaleString("id-ID")}</>;
}

export default function SupportBanner() {
  return (
    <section
      aria-labelledby="support-title"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface px-6 py-5 md:flex-row md:items-center md:justify-between"
    >
      <div className="min-w-0">
        <h2
          id="support-title"
          className="flex items-center gap-2 text-xl font-bold text-text"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 text-accent-text"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.7 4.5 6.3 4.5c2 0 3.4 1 4.2 2.3l1.5 2.2 1.5-2.2c.8-1.3 2.2-2.3 4.2-2.3 3.6 0 5.4 3.7 3.9 7.2C19.5 16.4 12 21 12 21z" />
          </svg>
          <span>
            Dukung Sen<span className="text-accent-text">Play</span>!
          </span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ayo bantu kami untuk terus aktif dengan cara{" "}
          <strong className="font-semibold text-text">Berdonasi</strong>
          <br />
          Setiap kontribusi dan dukungan sekecil apapun akan sangat kami hargai
          🙏.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl bg-surface-hover px-5 py-3 text-sm text-muted">
          Total User:{" "}
          <span className="font-bold text-text">
            <Suspense fallback="…">
              <TotalUsers />
            </Suspense>
          </span>
        </div>

        <Link
          href="/hall-of-fame"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover"
        >
          Hall of Fame Donatur
        </Link>
      </div>
    </section>
  );
}
