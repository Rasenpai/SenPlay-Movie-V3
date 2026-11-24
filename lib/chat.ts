export const CHANNELS = [
  { id: "ch1", label: "Ch 1" },
  { id: "ch2", label: "Ch 2" },
  { id: "ch3", label: "Ch 3" },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];

export const isChannel = (v: unknown): v is ChannelId =>
  CHANNELS.some((c) => c.id === v);

export const MESSAGE_MAX = 255;
export const SEEN_KEY = "chat:lastSeen";

export type ChatMessage = {
  id: number;
  channel: string;
  userId: string;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
  content: string;
  createdAt: number;
  replyTo: { id: number; name: string; content: string } | null;
};

export function readSeen() {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function writeSeen(id: number) {
  try {
    if (id > readSeen()) localStorage.setItem(SEEN_KEY, String(id));
  } catch {}
}