import { NextResponse } from "next/server";
import {
  addChatMessage,
  getChatMessage,
  lastChatAt,
  latestChatId,
  listChat,
} from "@/lib/db";
import { isChannel, MESSAGE_MAX } from "@/lib/chat";
import { getCurrentUser } from "@/lib/session";

const RATE_SECONDS = 2;
const noStore = { headers: { "Cache-Control": "no-store" } };

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const channel = params.get("channel");
  if (!isChannel(channel)) return fail("Channel tidak valid.", 400);

  const afterRaw = params.get("after");
  const after = afterRaw === null ? NaN : Number(afterRaw);
  const messages = listChat(channel, Number.isInteger(after) ? after : undefined);
  const user = await getCurrentUser();

  return NextResponse.json(
    {
      messages,
      latestId: latestChatId(),
      meId: user?.id ?? null,
      meIsAdmin: user?.isAdmin ?? false,
    },
    noStore,
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Masuk dulu untuk mengirim pesan.", 401);

  const body = await req.json().catch(() => null);
  const channel = body?.channel;
  if (!isChannel(channel)) return fail("Channel tidak valid.", 400);

  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) return fail("Pesan tidak boleh kosong.", 400);
  if (content.length > MESSAGE_MAX) {
    return fail(`Pesan maksimal ${MESSAGE_MAX} karakter.`, 400);
  }

  let replyTo: number | null = null;
  if (body?.replyTo != null) {
    const id = Number(body.replyTo);
    const target = Number.isInteger(id) ? getChatMessage(id) : undefined;
    if (!target || target.channel !== channel) {
      return fail("Pesan yang dibalas tidak ditemukan.", 400);
    }
    replyTo = target.id;
  }

  const last = lastChatAt(user.id);
  if (last && Date.now() / 1000 - last < RATE_SECONDS) {
    return fail("Pelan-pelan, tunggu sebentar.", 429);
  }

  const message = addChatMessage({
    channel,
    userId: user.id,
    content,
    replyTo,
  });
  return NextResponse.json({ message });
}