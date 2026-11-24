"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/session";

type Item = {
  type: "movie" | "series";
  slug: string;
  title: string;
  poster: string | null;
  year: number | null;
  rating: string | null;
  quality: string | null;
};

type Pending = { blob: Blob | null; url: string | null; remove: boolean };
type Filter = "all" | "movie" | "series";

const NAME_MAX = 40;
const BIO_MAX = 160;
const AVATAR_SIZE = 400;
const BANNER_W = 1520;
const BANNER_H = 480;

const EMPTY: Pending = { blob: null, url: null, remove: false };

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "movie", label: "Film" },
  { key: "series", label: "Serial" },
];

const keyOf = (i: { type: string; slug: string }) => `${i.type}:${i.slug}`;

async function cropToBlob(file: File, w: number, h: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(w / bitmap.width, h / bitmap.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#141110";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/jpeg",
      0.88,
    ),
  );
}

function Svg({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) {
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

const CAMERA =
  "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z";
const CLOSE = "M6 6l12 12M18 6L6 18";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } catch {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-hover disabled:opacity-60"
    >
      {busy ? "Keluar..." : "Keluar"}
    </button>
  );
}

function EditProfileModal({
  user,
  onClose,
}: {
  user: PublicUser;
  onClose: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const urlsRef = useRef<string[]>([]);
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState<Pending>(EMPTY);
  const [banner, setBanner] = useState<Pending>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ref.current?.showModal();
    const urls = urlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const avatarSrc =
    avatar.url ?? (avatar.remove ? user.googlePicture : user.picture);
  const bannerSrc = banner.url ?? (banner.remove ? null : user.banner);
  const canRemoveAvatar =
    !!avatar.blob || (user.hasCustomAvatar && !avatar.remove);
  const canRemoveBanner = !!banner.blob || (!!user.banner && !banner.remove);

  const pick = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "avatar" | "banner",
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");

    try {
      const blob =
        kind === "avatar"
          ? await cropToBlob(file, AVATAR_SIZE, AVATAR_SIZE)
          : await cropToBlob(file, BANNER_W, BANNER_H);
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      (kind === "avatar" ? setAvatar : setBanner)({ blob, url, remove: false });
    } catch {
      setError("Gambar tidak bisa dibaca.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const fd = new FormData();
    fd.set("name", name);
    fd.set("bio", bio);
    if (avatar.blob) fd.set("avatar", avatar.blob, "avatar.jpg");
    else if (avatar.remove) fd.set("removeAvatar", "1");
    if (banner.blob) fd.set("banner", banner.blob, "banner.jpg");
    else if (banner.remove) fd.set("removeBanner", "1");

    try {
      const res = await fetch("/api/profile", { method: "PATCH", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal menyimpan. Coba lagi.");
        setBusy(false);
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto max-h-[92svh] w-[min(560px,92vw)] overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-text open:animate-[dialog-in_200ms_ease-out_both] backdrop:bg-black/80 backdrop:animate-[dialog-fade-in_200ms_ease-out_both]"
    >
      <form onSubmit={submit}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold">Edit profil</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <Svg path={CLOSE} className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-[19/6] w-full bg-gradient-to-br from-accent/30 via-surface-hover to-bg">
          {bannerSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerSrc}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute bottom-2 right-2 flex gap-2">
            {canRemoveBanner && (
              <button
                type="button"
                onClick={() =>
                  setBanner({ blob: null, url: null, remove: !!user.banner })
                }
                className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              >
                Hapus
              </button>
            )}
            <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors focus-within:ring-2 focus-within:ring-accent hover:bg-black/80">
              <Svg path={CAMERA} className="h-3.5 w-3.5" />
              Ganti banner
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => pick(e, "banner")}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5">
          <div className="-mt-10 flex items-end gap-3">
            <div className="relative h-20 w-20 shrink-0">
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-surface-hover text-2xl font-bold text-muted">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (name || user.email).charAt(0).toUpperCase()
                )}
              </span>
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent shadow-md transition-colors focus-within:ring-2 focus-within:ring-text hover:bg-accent-hover">
                <Svg path={CAMERA} />
                <span className="sr-only">Ganti foto profil</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pick(e, "avatar")}
                />
              </label>
            </div>

            {canRemoveAvatar && (
              <button
                type="button"
                onClick={() =>
                  setAvatar({
                    blob: null,
                    url: null,
                    remove: user.hasCustomAvatar,
                  })
                }
                className="pb-1 text-xs font-semibold text-muted underline transition-colors hover:text-text"
              >
                Hapus foto
              </button>
            )}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted">Nama</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="Nama kamu"
              className="mt-1 w-full rounded-xl border border-border bg-bg/40 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Kosongkan untuk memakai nama dari Google.
            </span>
          </label>

          <label className="block">
            <span className="flex items-center justify-between text-xs font-semibold text-muted">
              Bio
              <span className="font-normal">
                {bio.length}/{BIO_MAX}
              </span>
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={BIO_MAX}
              rows={3}
              placeholder="Ceritakan sedikit tentang dirimu"
              className="mt-1 w-full resize-none rounded-xl border border-border bg-bg/40 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-accent-text">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-hover"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

export function ProfileActions({ user }: { user: PublicUser }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-text/90"
      >
        Edit profil
      </button>
      <LogoutButton />
      {editing && (
        <EditProfileModal user={user} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}

export function BookmarkList({
  items,
  readOnly = false,
}: {
  items: Item[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [removed, setRemoved] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = items.filter((item) => !removed.includes(keyOf(item)));
  const shown =
    filter === "all" ? visible : visible.filter((i) => i.type === filter);
  const countOf = (key: Filter) =>
    key === "all"
      ? visible.length
      : visible.filter((i) => i.type === key).length;

  const remove = async (item: Item) => {
    const key = keyOf(item);
    setRemoved((prev) => [...prev, key]);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug, type: item.type }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setRemoved((prev) => prev.filter((k) => k !== key));
    }
  };

  return (
    <section aria-labelledby="bookmark-title" className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="bookmark-title" className="text-lg font-semibold">
          Tersimpan
        </h2>

        <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              aria-pressed={filter === tab.key}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === tab.key
                  ? "bg-accent/15 text-accent-text"
                  : "text-muted hover:text-text"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">{countOf(tab.key)}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="font-semibold text-text">Belum ada yang tersimpan</p>
          {!readOnly && (
            <>
              <p className="mt-1 text-sm text-muted">
                Tekan tombol Simpan di halaman film atau serial untuk
                menambahkannya ke sini.
              </p>
              <Link
                href="/"
                className="mt-5 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              >
                Jelajahi film
              </Link>
            </>
          )}
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Belum ada {filter === "movie" ? "film" : "serial"} yang tersimpan.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((item) => (
            <li key={keyOf(item)} className="group relative">
              <Link
                href={`/${item.type}/${item.slug}`}
                className="block overflow-hidden rounded-xl bg-surface"
              >
                <div className="relative aspect-[2/3] w-full bg-surface-hover">
                  {item.poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {(item.type === "series" || item.quality) && (
                    <span className="absolute right-2 top-2 rounded-md bg-surface/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-text backdrop-blur-sm">
                      {item.type === "series" ? "Serial" : item.quality}
                    </span>
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-text">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {[item.year, item.rating && `★ ${item.rating}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </Link>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={`Hapus ${item.title} dari tersimpan`}
                  className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-accent-text backdrop-blur-sm transition-colors hover:bg-accent hover:text-on-accent"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
