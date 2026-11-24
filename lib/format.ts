export const toBadgeLabel = (value: string) =>
  /^[\w-]{1,8}$/.test(value) ? value.toUpperCase() : null;

export const getYear = (slug: string) =>
  slug.match(/-(\d{4})(?:-\d+)?$/)?.[1];

export const getDetailHref = (type: "movie" | "series", slug: string) =>
  `/${type === "series" ? "series" : "movie"}/${slug}`;