import { NextResponse } from "next/server";
import { removeImage, setImage, updateProfile } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const MAX_BYTES = 2 * 1024 * 1024;
const NAME_MAX = 40;
const BIO_MAX = 160;

type Upload = { data: Buffer; mime: string };

function sniff(buf: Buffer) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length > 8 &&
    buf.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return "image/png";
  }
  if (
    buf.length > 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

async function readImage(form: FormData, field: string, label: string) {
  const file = form.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error(`${label} terlalu besar (maks 2 MB).`);

  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniff(data);
  if (!mime) throw new Error(`Format ${label.toLowerCase()} tidak didukung.`);

  return { data, mime } satisfies Upload;
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  const name = String(form.get("name") ?? "").trim();
  const bio = String(form.get("bio") ?? "").trim();
  if (name.length > NAME_MAX) {
    return NextResponse.json({ error: `Nama maksimal ${NAME_MAX} karakter.` }, { status: 400 });
  }
  if (bio.length > BIO_MAX) {
    return NextResponse.json({ error: `Bio maksimal ${BIO_MAX} karakter.` }, { status: 400 });
  }

  let avatar: Upload | null;
  let banner: Upload | null;
  try {
    avatar = await readImage(form, "avatar", "Foto");
    banner = await readImage(form, "banner", "Banner");
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gambar tidak valid." },
      { status: 400 },
    );
  }

  updateProfile(user.id, { display_name: name || null, bio: bio || null });

  if (avatar) setImage(user.id, "avatar", avatar.mime, avatar.data);
  else if (form.get("removeAvatar") === "1") removeImage(user.id, "avatar");

  if (banner) setImage(user.id, "banner", banner.mime, banner.data);
  else if (form.get("removeBanner") === "1") removeImage(user.id, "banner");

  return NextResponse.json({ ok: true });
}