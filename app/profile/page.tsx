import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUser, listBookmarks } from "@/lib/db";
import { resizeImage } from "@/lib/image";
import { getCurrentUser } from "@/lib/session";
import { BookmarkList, ProfileActions } from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profil",
  robots: { index: false, follow: false },
};

function VerifiedBadge() {
  return (
    <span title="Admin terverifikasi" className="inline-flex shrink-0">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 md:h-7 md:w-7"
        role="img"
        aria-label="Admin terverifikasi"
      >
        <circle cx="12" cy="12" r="10" fill="#1d9bf0" />
        <path
          d="M7.5 12.5l3 3 6-6.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-24 md:px-12">
      <div className="aspect-[19/6] w-full animate-pulse rounded-2xl bg-surface" />
      <div className="px-1 sm:px-6">
        <div className="-mt-12 h-24 w-24 animate-pulse rounded-full border-4 border-bg bg-surface-hover sm:-mt-16 sm:h-32 sm:w-32" />
        <div className="mt-4 h-8 w-56 animate-pulse rounded bg-surface" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-surface" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-xl bg-surface"
          />
        ))}
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const record = getUser(user.id);
  const joined = record
    ? new Date(record.created_at * 1000).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      })
    : null;

  const bookmarks = listBookmarks(user.id).map((b) => ({
    type: b.type,
    slug: b.movie_slug,
    title: b.title,
    poster: b.poster ? resizeImage(b.poster, "w500") : null,
    year: b.year,
    rating: b.rating,
    quality: b.quality,
  }));
  const movieCount = bookmarks.filter((b) => b.type === "movie").length;
  const seriesCount = bookmarks.length - movieCount;

  const displayName = user.name ?? user.email;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-24 md:px-12">
      <div className="relative aspect-[19/6] w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/30 via-surface-hover to-bg">
        {user.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.banner}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent"
        />
      </div>

      <section
        aria-label="Informasi akun"
        className="relative z-10 px-1 sm:px-6"
      >
        <div className="-mt-12 flex items-end justify-between gap-3 sm:-mt-16">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-bg bg-surface-hover text-4xl font-bold text-muted sm:h-32 sm:w-32 sm:text-5xl">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </span>

          <div className="pb-1">
            <ProfileActions user={user} />
          </div>
        </div>

        <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold text-text md:text-3xl">
          <span className="min-w-0 break-words">{displayName}</span>
          {user.isAdmin && <VerifiedBadge />}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {user.email}
          {joined && <span> · Bergabung {joined}</span>}
        </p>

        {user.bio ? (
          <p className="mt-4 max-w-2xl whitespace-pre-line break-words text-sm leading-relaxed text-text/90">
            {user.bio}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Belum ada bio. Ceritakan sedikit tentang dirimu lewat Edit profil.
          </p>
        )}

        <dl className="mt-5 flex gap-8">
          {[
            { label: "Tersimpan", value: bookmarks.length },
            { label: "Film", value: movieCount },
            { label: "Serial", value: seriesCount },
          ].map((stat) => (
            <div key={stat.label}>
              <dd className="text-2xl font-bold leading-none text-text">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <BookmarkList items={bookmarks} />
    </main>
  );
}
