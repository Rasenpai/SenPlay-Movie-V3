import { NextResponse } from "next/server";
import { deleteChatMessage, getChatMessage } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return fail("Masuk dulu.", 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return fail("ID pesan tidak valid.", 400);
  }

  const message = getChatMessage(id);
  if (!message) return fail("Pesan tidak ditemukan.", 404);

  if (message.userId !== user.id && !user.isAdmin) {
    return fail("Kamu tidak boleh menghapus pesan ini.", 403);
  }

  deleteChatMessage(id);
  return NextResponse.json({ ok: true });
}