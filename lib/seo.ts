import type { Metadata } from "next";
import { SITE_NAME } from "./site";

type Options = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "video.movie" | "video.tv_show";
  noindex?: boolean;
};

export const truncate = (text: string, max = 160) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
};

export function createMetadata({
  title,
  description,
  path,
  type = "website",
  noindex = false,
}: Options): Metadata {
  const desc = truncate(description);

  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "id_ID",
      title,
      description: desc,
      url: path,
    },
    twitter: { card: "summary_large_image", title, description: desc },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}