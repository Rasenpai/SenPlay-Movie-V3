"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDetailHref, toBadgeLabel } from "@/lib/format";
import { resizeImage } from "@/lib/image";
import type { SearchItem } from "@/lib/search";

const DEBOUNCE_MS = 300;
const EXIT_MS = 200;
const MAX_LIVE_RESULTS = 6;

const SEARCH_PATH = "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3";
const CLOSE_PATH = "M6 6l12 12M18 6L6 18";
const ARROW_PATH = "M9 6l6 6-6 6";

type Status = "idle" | "loading" | "done" | "error";

function Icon({ path, className }: { path: string; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const getMeta = (item: SearchItem) =>
  [
    item.type === "series" ? "Serial" : "Film",
    item.rating && `★ ${item.rating}`,
    item.type === "series" ? item.season : toBadgeLabel(item.quality ?? ""),
  ]
    .filter(Boolean)
    .join(" · ");

function ResultRow({
  item,
  onSelect,
}: {
  item: SearchItem;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        href={getDetailHref(item.type, item.slug)}
        onClick={onSelect}
        className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-hover"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resizeImage(item.poster, "w92")}
          alt=""
          className="h-14 w-10 shrink-0 rounded-md bg-bg object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted">{getMeta(item)}</p>
        </div>
      </Link>
    </li>
  );
}

const EMPTY_MESSAGES: Record<Status, string> = {
  idle: "Ketik judul film atau serial untuk mulai mencari.",
  loading: "Mencari…",
  done: "",
  error: "Gagal memuat hasil. Coba lagi.",
};

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  const timerRef = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);

  if (open && !rendered) setRendered(true);

  const visible = open && entered;

  const cancelPending = useCallback(() => {
    window.clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  useEffect(() => {
    if (!open) return;

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setEntered(true));
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [open]);

  useEffect(() => {
    if (open || !rendered) return;

    const timer = window.setTimeout(() => {
      cancelPending();
      setRendered(false);
      setEntered(false);
      setQuery("");
      setResults([]);
      setStatus("idle");
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [open, rendered, cancelPending]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  const handleChange = (value: string) => {
    setQuery(value);
    cancelPending();

    const keyword = value.trim();
    if (!keyword) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    timerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(keyword)}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) throw new Error("Pencarian gagal");

        setResults(await res.json());
        setStatus("done");
      } catch (error) {
        if ((error as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const keyword = query.trim();
    if (!keyword) return;

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
    onClose();
  };

  if (!rendered) return null;

  const keyword = query.trim();
  const liveResults = results.slice(0, MAX_LIVE_RESULTS);
  const emptyMessage =
    status === "done"
      ? `Tidak ada hasil untuk “${keyword}”.`
      : EMPTY_MESSAGES[status];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/60 transition-all duration-200 ease-out ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-95 opacity-0"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          role="search"
          className="flex items-center gap-3 border-b border-border px-5 py-4"
        >
          <Icon path={SEARCH_PATH} className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            name="q"
            type="text"
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Cari film atau series..."
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="w-full bg-transparent text-base text-text outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pencarian"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <Icon path={CLOSE_PATH} className="h-4 w-4" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {liveResults.length > 0 ? (
            <>
              <ul
                className={`transition-opacity ${status === "loading" ? "opacity-60" : ""}`}
              >
                {liveResults.map((item) => (
                  <ResultRow key={item.slug} item={item} onSelect={onClose} />
                ))}
              </ul>

              <Link
                href={`/search?q=${encodeURIComponent(keyword)}`}
                onClick={onClose}
                className="mt-1 flex items-center justify-between rounded-xl border-t border-border px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
              >
                <span className="truncate">
                  Lihat semua hasil untuk “{keyword}”
                </span>
                <Icon
                  path={ARROW_PATH}
                  className="h-4 w-4 shrink-0 text-muted"
                />
              </Link>
            </>
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
