import { NextResponse } from "next/server";
import { getChatMessage, reportChatMessage } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = Number(body?.messageId);
  const message = Number.isInteger(id) ? getChatMessage(id) : undefined;

  if (!message) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (message.userId === user.id) {
    return NextResponse.json({ error: "own message" }, { status: 400 });
  }

  reportChatMessage(message.id, user.id);
  return NextResponse.json({ ok: true });
}