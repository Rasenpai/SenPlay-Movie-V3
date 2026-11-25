"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatAvatar from "@/components/ChatAvatar";
import {
  CHANNELS,
  MESSAGE_MAX,
  writeSeen,
  type ChannelId,
  type ChatMessage,
} from "@/lib/chat";

const POLL_MS = 3000;
const LOGIN_URL = "/login?next=/chat";

type ChatResponse = {
  messages: ChatMessage[];
  latestId: number;
  meId: string | null;
  meIsAdmin: boolean;
};

const ICONS = {
  back: "M19 12H5M12 19l-7-7 7-7",
  warn: "M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01",
  hash: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  reply: "M9 14L4 9l5-5M4 9h10a6 6 0 016 6v3",
  copy: "M9 9h11v11H9zM5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1",
  flag: "M4 22V4M4 4h13l-2 4 2 4H4",
  trash:
    "M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6",
  close: "M6 6l12 12M18 6L6 18",
};

function Svg({
  path,
  className = "h-5 w-5",
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

function Verified() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      role="img"
      aria-label="Admin"
    >
      <circle cx="12" cy="12" r="10" fill="#1d9bf0" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const nameColor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 72%)`;
};

const clock = (seconds: number) =>
  new Date(seconds * 1000)
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
    .replace(".", ":");

const dayKey = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

const dayLabel = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

const URL_RE = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_RE).map((part, i) => {
        if (i % 2 === 0) return part;

        const trailing = part.match(/[.,!?;:)\]]+$/)?.[0] ?? "";
        const url = trailing ? part.slice(0, -trailing.length) : part;
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;

        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="break-all text-sky-400 underline underline-offset-2 hover:text-sky-300"
            >
              {url}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}

export default function ChatRoom() {
  const router = useRouter();
  const [channel, setChannel] = useState<ChannelId>("ch1");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [meIsAdmin, setMeIsAdmin] = useState(false);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<ChatMessage | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stick = useRef(true);

  const merge = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let lastId = 0;

    const load = async (after?: number) => {
      const qs = new URLSearchParams({ channel });
      if (after !== undefined) qs.set("after", String(after));
      const res = await fetch(`/api/chat?${qs}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      return (await res.json()) as ChatResponse;
    };

    const poll = () => {
      timer = setTimeout(async () => {
        if (!document.hidden) {
          try {
            const data = await load(lastId);
            if (data.messages.length) {
              lastId = data.messages[data.messages.length - 1].id;
              merge(data.messages);
            }
            setMeId(data.meId);
            setMeIsAdmin(data.meIsAdmin);
            writeSeen(data.latestId);
          } catch {
            if (controller.signal.aborted) return;
          }
        }
        if (!controller.signal.aborted) poll();
      }, POLL_MS);
    };

    (async () => {
      try {
        const data = await load();
        lastId = data.messages.length
          ? data.messages[data.messages.length - 1].id
          : 0;
        setMessages(data.messages);
        setMeId(data.meId);
        setMeIsAdmin(data.meIsAdmin);
        setLoaded(true);
        writeSeen(data.latestId);
      } catch {
        if (controller.signal.aborted) return;
        setLoaded(true);
      }
      poll();
    })();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [channel, merge]);

  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTo({ top: el.scrollHeight });
  }, [messages, loaded]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const switchChannel = (id: ChannelId) => {
    if (id === channel) return;
    setChannel(id);
    setMessages([]);
    setLoaded(false);
    setReply(null);
    setError("");
    stick.current = true;
  };

  const openMenu = (m: ChatMessage) => {
    setSelected(m);
    setMenuOpen(true);
  };
  const closeMenu = () => setMenuOpen(false);

  const startReply = () => {
    if (!selected) return;
    if (!meId) return router.push(LOGIN_URL);
    setReply(selected);
    closeMenu();
    inputRef.current?.focus();
  };

  const copy = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.content);
      flash("Pesan disalin");
    } catch {
      flash("Gagal menyalin");
    }
    closeMenu();
  };

  const report = async () => {
    if (!selected) return;
    if (!meId) return router.push(LOGIN_URL);
    closeMenu();
    try {
      const res = await fetch("/api/chat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selected.id }),
      });
      flash(
        res.ok ? "Laporan terkirim. Terima kasih!" : "Gagal mengirim laporan.",
      );
    } catch {
      flash("Gagal mengirim laporan.");
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!meId) return router.push(LOGIN_URL);
    const id = selected.id;
    closeMenu();

    try {
      const res = await fetch(`/api/chat/${id}`, { method: "DELETE" });

      if (res.ok || res.status === 404) {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== id)
            .map((m) => (m.replyTo?.id === id ? { ...m, replyTo: null } : m)),
        );
        setReply((r) => (r?.id === id ? null : r));
        flash("Pesan dihapus");
      } else if (res.status === 401) {
        router.push(LOGIN_URL);
      } else if (res.status === 403) {
        flash("Kamu tidak boleh menghapus pesan ini.");
      } else {
        flash("Gagal menghapus pesan.");
      }
    } catch {
      flash("Gagal menghapus pesan.");
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, content, replyTo: reply?.id ?? null }),
      });
      if (res.status === 401) return router.push(LOGIN_URL);

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Gagal mengirim pesan.");

      stick.current = true;
      merge([data.message]);
      writeSeen(data.message.id);
      setText("");
      setReply(null);
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  const isGuest = loaded && !meId;
  const canDelete =
    !!selected && !!meId && (selected.userId === meId || meIsAdmin);

  return (
    <>
      <div className="relative flex items-center justify-center pb-3">
        <Link
          href="/"
          aria-label="Kembali"
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-hover"
        >
          <Svg path={ICONS.back} />
        </Link>
        <h1 className="text-lg font-bold">Chat Global</h1>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-rating/30 bg-rating/10 px-4 py-3 text-sm leading-snug text-text/90">
        <Svg
          path={ICONS.warn}
          className="mt-0.5 h-5 w-5 shrink-0 text-rating"
        />
        <p>
          Hati-hati banyak scam, jangan mudah percaya orang lain, dan dilarang
          berjualan di sini.
        </p>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => switchChannel(c.id)}
            aria-pressed={channel === c.id}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              channel === c.id
                ? "border-accent bg-accent/15 text-accent-text"
                : "border-border bg-surface text-muted hover:text-text"
            }`}
          >
            <Svg path={ICONS.hash} className="h-4 w-4" />
            {c.label}
          </button>
        ))}
      </div>

      <div
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        }}
        className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {!loaded ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-surface" />
                <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-surface" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            Belum ada pesan di channel ini. Mulai obrolan duluan!
          </p>
        ) : (
          <ul className="space-y-3 pb-2">
            {messages.map((m, i) => {
              const mine = m.userId === meId;
              const newDay =
                i === 0 ||
                dayKey(messages[i - 1].createdAt) !== dayKey(m.createdAt);

              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <li className="flex justify-center py-1">
                      <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold text-muted">
                        {dayLabel(m.createdAt)}
                      </span>
                    </li>
                  )}
                  <li
                    className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}
                  >
                    <Link
                      href={`/user/${m.userId}`}
                      aria-label={`Lihat profil ${m.name}`}
                      className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ChatAvatar name={m.name} src={m.avatar} />
                    </Link>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openMenu(m)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        openMenu(m);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") openMenu(m);
                      }}
                      className={`max-w-[80%] cursor-pointer rounded-2xl px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        mine
                          ? "rounded-br-md bg-accent/20"
                          : "rounded-bl-md bg-surface"
                      }`}
                    >
                      {m.replyTo && (
                        <div className="mb-1.5 rounded-lg border-l-4 border-accent bg-bg/40 px-2.5 py-1.5">
                          <p
                            className="truncate text-xs font-semibold"
                            style={{ color: nameColor(m.replyTo.name) }}
                          >
                            {m.replyTo.name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {m.replyTo.content}
                          </p>
                        </div>
                      )}
                      <p
                        className="flex items-center gap-1 text-sm font-semibold"
                        style={{ color: nameColor(m.userId) }}
                      >
                        <span className="truncate">{m.name}</span>
                        {m.isAdmin && <Verified />}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm text-text">
                        <Linkified text={m.content} />
                      </p>
                      <p className="mt-1 text-right text-[10px] text-muted">
                        {clock(m.createdAt)}
                      </p>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        )}
      </div>

      <div className="pt-3">
        {notice && (
          <p
            role="status"
            className="mb-2 rounded-full bg-surface-hover px-4 py-2 text-center text-xs font-semibold text-text"
          >
            {notice}
          </p>
        )}

        {isGuest ? (
          <Link
            href={LOGIN_URL}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-text transition-colors hover:bg-surface-hover"
          >
            Masuk untuk ikut mengobrol
          </Link>
        ) : (
          <form onSubmit={send}>
            {reply && (
              <div className="mb-2 flex items-center gap-3 rounded-xl border-l-4 border-accent bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-accent-text">
                    Membalas {reply.name}
                  </p>
                  <p className="truncate text-xs text-muted">{reply.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReply(null)}
                  aria-label="Batalkan balasan"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-text"
                >
                  <Svg path={ICONS.close} className="h-4 w-4" />
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="mb-2 text-sm text-accent-text">
                {error}
              </p>
            )}

            <p className="mb-1 text-right text-[11px] text-muted">
              {text.length}/{MESSAGE_MAX}
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MESSAGE_MAX}
                disabled={!loaded}
                placeholder="Silakan masukkan pesan..."
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border border-border bg-surface px-5 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                aria-label="Kirim"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                <Svg path={ICONS.send} />
              </button>
            </div>
          </form>
        )}
      </div>

      <button
        type="button"
        aria-label="Tutup menu pesan"
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
        className={`fixed inset-0 z-[60] bg-black/60 transition-[opacity,visibility] duration-300 ease-out ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Aksi pesan"
        aria-hidden={!menuOpen}
        className={`fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-md rounded-t-3xl border-t border-border bg-surface pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black transition-[translate,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          menuOpen ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-3 h-1 w-10 rounded-full bg-border"
        />

        {selected && (
          <div className="mx-5 mt-4 border-b border-border pb-4">
            <div className="border-l-4 border-accent pl-3">
              <p
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: nameColor(selected.userId) }}
              >
                <span className="truncate">{selected.name}</span>
                {selected.isAdmin && <Verified />}
              </p>
              <p className="line-clamp-2 break-words text-sm text-muted">
                {selected.content}
              </p>
            </div>
          </div>
        )}

        <div className="px-2 pt-2">
          <button
            type="button"
            onClick={startReply}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            <Svg path={ICONS.reply} className="h-5 w-5 text-accent-text" />
            Reply
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            <Svg path={ICONS.copy} className="h-5 w-5 text-muted" />
            Copy
          </button>
          {selected && selected.userId !== meId && (
            <button
              type="button"
              onClick={report}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              <Svg path={ICONS.flag} className="h-5 w-5 text-rating" />
              Report
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={remove}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-surface-hover"
            >
              <Svg path={ICONS.trash} className="h-5 w-5" />
              Hapus
            </button>
          )}
        </div>
      </div>
    </>
  );
}
