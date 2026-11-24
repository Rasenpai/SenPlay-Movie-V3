"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Status = "loading" | "guest" | "ready";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
    </svg>
  );
}

export default function BookmarkButton({
  slug,
  type = "movie",
}: {
  slug: string;
  type?: "movie" | "series";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/bookmarks?slug=${encodeURIComponent(slug)}&type=${type}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.loggedIn ? "ready" : "guest");
        setBookmarked(Boolean(data.bookmarked));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [slug, type]);

  const goLogin = () =>
    router.push(`/login?next=${encodeURIComponent(pathname)}`);

  const toggle = async () => {
    if (status === "loading" || busy) return;
    if (status === "guest") return goLogin();

    const next = !bookmarked;
    setBookmarked(next);
    setBusy(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
      });

      if (res.status === 401) {
        setBookmarked(false);
        setStatus("guest");
        return goLogin();
      }
      if (!res.ok) throw new Error();
    } catch {
      setBookmarked(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={bookmarked}
      aria-busy={status === "loading"}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface/70 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-surface-hover md:flex-none ${
        bookmarked ? "text-accent-text" : ""
      }`}
    >
      <BookmarkIcon filled={bookmarked} />
      {bookmarked ? "Tersimpan" : "Simpan"}
    </button>
  );
}
