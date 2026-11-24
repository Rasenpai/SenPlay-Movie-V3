import { ImageResponse } from "next/og";
import { resizeImage } from "@/lib/image";
import { getMovie } from "@/lib/movie";
import { OG_SIZE, OgCard, toDataUrl } from "@/lib/og";

export const alt = "Poster film di SenPlay";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    return new ImageResponse(<OgCard title="Film tidak ditemukan" />, size);
  }

  const poster = await toDataUrl(resizeImage(movie.poster, "w500"));
  const meta = [movie.year, ...movie.genres.slice(0, 2)]
    .filter(Boolean)
    .join(" • ");

  return new ImageResponse(
    <OgCard title={movie.title} meta={meta} poster={poster} />,
    size,
  );
}
