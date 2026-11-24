import { ImageResponse } from "next/og";
import { resizeImage } from "@/lib/image";
import { getSeries } from "@/lib/seriesDetail";
import { OG_SIZE, OgCard, toDataUrl } from "@/lib/og";

export const alt = "Poster serial di SenPlay";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getSeries(slug);

  if (!series) {
    return new ImageResponse(<OgCard title="Serial tidak ditemukan" />, size);
  }

  const poster = await toDataUrl(resizeImage(series.poster, "w500"));
  const meta = [
    series.year,
    series.totalSeasons > 0 ? `${series.totalSeasons} Season` : null,
    ...series.genres.slice(0, 2),
  ]
    .filter(Boolean)
    .join(" • ");

  return new ImageResponse(
    <OgCard title={series.title} meta={meta} poster={poster} />,
    size,
  );
}
