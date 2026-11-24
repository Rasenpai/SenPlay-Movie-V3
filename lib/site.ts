export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://movie.senplay.web.id";
export const SITE_NAME = "SenPlay";
export const SITE_DESCRIPTION =
  "Nonton film dan serial subtitle Indonesia terbaru di SenPlay. Koleksi film Indonesia, Korea, Barat, horor, dan serial TV dengan update harian.";

export const absoluteUrl = (path = "/") => new URL(path, SITE_URL).toString();