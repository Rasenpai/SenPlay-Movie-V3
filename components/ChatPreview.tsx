"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readSeen, writeSeen, type ChatMessage } from "@/lib/chat";
import ChatAvatar from "./ChatAvatar";

const POLL_MS = 10000;

const CHAT_ICON =
  "M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12zM8.5 12h.01M12 12h.01M15.5 12h.01";

export default function ChatPreview() {
  const [latest, setLatest] = useState<ChatMessage | null>(null);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (!document.hidden) {
        try {
          const since = readSeen();
          const res = await fetch(`/api/chat/preview?since=${since}`, {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!res.ok) throw new Error();
          const data: { latest: ChatMessage | null; unread: number } =
            await res.json();
          setLatest(data.latest);
          setUnread(data.unread);
          if (!since && data.latest) writeSeen(data.latest.id);
        } catch {
          if (controller.signal.aborted) return;
        }
        setReady(true);
      }
      timer = setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section aria-label="Chat global" className="px-5 pb-2 pt-4 md:px-12">
      <Link
        href="/chat"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 transition-colors hover:bg-surface-hover"
      >
        <span className="flex shrink-0 items-center gap-2 rounded-xl bg-accent/15 px-3 py-2 text-sm font-bold text-accent-text">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={CHAT_ICON} />
          </svg>
          Global
        </span>

        {latest ? (
          <>
            <ChatAvatar
              name={latest.name}
              src={latest.avatar}
              className="h-9 w-9"
            />
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="font-semibold text-rating">{latest.name}</span>
              <span className="text-muted">: {latest.content}</span>
            </p>
          </>
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm text-muted">
            {ready
              ? "Belum ada pesan. Jadilah yang pertama menyapa!"
              : "Memuat chat..."}
          </p>
        )}

        {unread > 0 && (
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-on-accent">
            {unread > 99 ? "99+" : unread}
          </span>
        )}

        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-muted"
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
    </section>
  );
}
