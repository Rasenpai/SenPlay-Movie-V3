import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aplikasi Android (APK)",
  description:
    "Download SenPlay untuk Android. Hanya tersedia dari sumber resmi.",
};

type Release = {
  version: string;
  build: number;
  label?: string;
  date: string;
  downloadUrl: string;
  changes: string[];
};

// Release terbaru taruh paling atas. Tiap versi punya link download sendiri.
const RELEASES: Release[] = [
  {
    version: "1.0.0",
    build: 1,
    label: "beta",
    date: "25/11/2026",
    downloadUrl: "https://sfile.co/OhKkwk1Vrmy",
    changes: [
      "Rilis pertama SenPlay untuk Android (versi beta).",
      "Navigasi cepat antar halaman: Beranda, Jadwal, Genre, Country, dan Network.",
      "Notifikasi HP untuk film, series, dan episode baru.",
    ],
  },
];

const ANDROID_ICON =
  "M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 001 18h22a10.78 10.78 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z";

const DOWNLOAD_ICON = "M12 4v11M7 11l5 5 5-5M5 20h14";
const WARNING_ICON = "M12 3l10 18H2L12 3zM12 10v5M12 18.5v.01";

function Icon({
  path,
  className = "h-4 w-4",
  fill = false,
}: {
  path: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function PopupAdIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-bg/60 text-sm text-muted"
    >
      Iklan pop-up
      <span className="absolute left-1/2 top-1/2 h-0.5 w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] bg-accent-text" />
    </div>
  );
}

function NotificationIllustration() {
  return (
    <div
      aria-hidden="true"
      className="flex h-24 items-center gap-3 rounded-xl border border-border bg-bg/60 px-4"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-on-accent">
        S
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">Episode baru</p>
        <p className="truncate text-sm text-muted">Serial yang kamu ikuti</p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Bebas iklan pop-up",
    description: "Nonton tanpa tab iklan yang tiba-tiba terbuka.",
    illustration: <PopupAdIllustration />,
  },
  {
    title: "Notifikasi HP realtime",
    description:
      "Film, series, dan episode baru langsung masuk ke HP kamu begitu rilis.",
    illustration: <NotificationIllustration />,
  },
];

export default function ApkPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-12">
      {/* Catatan sumber resmi */}
      <section
        role="note"
        className="flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 md:p-5"
      >
        <Icon
          path={WARNING_ICON}
          className="mt-0.5 h-5 w-5 shrink-0 text-accent-text"
        />
        <p className="text-sm leading-relaxed text-text">
          <strong className="font-semibold">Catatan:</strong> SenPlay Android
          hanya dibagikan lewat web resmi ini, dengan link download dari{" "}
          <a
            href="https://sfile.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent-text underline underline-offset-2 hover:text-accent-hover"
          >
            sfile.co
          </a>
          . Jangan download dari situs atau sumber lain.
        </p>
      </section>

      {/* Fitur */}
      <section aria-labelledby="fitur-heading" className="mt-10">
        <h1
          id="fitur-heading"
          className="mb-6 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-text"
        >
          <Icon path={ANDROID_ICON} fill className="h-8 w-8 text-accent-text" />
          SenPlay untuk Android
        </h1>

        <div className="grid divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2 md:divide-x md:divide-y-0">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="p-5 md:p-6">
              {feature.illustration}
              <h2 className="mt-5 text-base font-semibold text-text">
                {feature.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Log update */}
      <section aria-labelledby="log-heading" className="mt-12">
        <h2
          id="log-heading"
          className="mb-6 text-2xl font-extrabold tracking-tight text-text"
        >
          Log Update
        </h2>

        <div className="space-y-6">
          {RELEASES.map((release) => (
            <article
              key={`${release.version}-${release.build}`}
              className="rounded-2xl border border-border bg-surface p-5 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-text">
                    Versi {release.version} (+{release.build}){" "}
                    {release.label && (
                      <span className="ml-1 rounded-full bg-accent/15 px-2.5 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-accent-text">
                        {release.label}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Update {release.date}
                  </p>
                </div>

                <a
                  href={release.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
                >
                  <Icon path={DOWNLOAD_ICON} className="h-4 w-4" />
                  Download
                </a>
              </div>

              <p className="mt-5 text-sm font-medium text-text underline underline-offset-4">
                Diperbarui:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm font-medium leading-relaxed text-text marker:text-accent-text">
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
