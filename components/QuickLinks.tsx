import Link from "next/link";

type QuickLink = {
  label: string;
  href: string;
  icon?: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Film Terbaru",
    href: "/latest",
    icon: "M4 4h16v16H4zM8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4",
  },
  {
    label: "Serial TV Terbaru",
    href: "/series/latest",
    icon: "M3 7h18v11H3zM8 21h8M9 3l3 4 3-4",
  },
  { label: "Film Indonesia", href: "/movie?type=film-indonesia" },
  { label: "Horror Indonesia", href: "/movie?type=horror-indonesia" },
  { label: "Film Filipina", href: "/movie?type=film-filipina" },
  { label: "Film Korea", href: "/movie?type=film-korea" },
  { label: "Horror Thailand", href: "/movie?type=horror-thailand" },
];

export default function QuickLinks() {
  return (
    <nav
      aria-label="Pintasan"
      className="flex gap-2 overflow-x-auto px-5 py-4 [scrollbar-width:none] md:flex-wrap md:gap-3 md:overflow-visible md:px-12 md:py-6 [&::-webkit-scrollbar]:hidden"
    >
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-hover md:gap-2.5 md:px-5 md:py-3"
        >
          {link.icon && (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={link.icon} />
            </svg>
          )}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
