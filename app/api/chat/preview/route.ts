import { NextResponse } from "next/server";
import { countChatAfter, latestChatMessage } from "@/lib/db";

export async function GET(req: Request) {
  const since = Number(new URL(req.url).searchParams.get("since")) || 0;
  const latest = latestChatMessage();

  return NextResponse.json(
    { latest, unread: since && latest ? countChatAfter(since) : 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}