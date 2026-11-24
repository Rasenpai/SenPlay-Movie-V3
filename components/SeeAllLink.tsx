import Link from "next/link";

export default function SeeAllLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1 text-sm font-semibold text-text"
    >
      <span className="transition-colors group-hover:text-accent-text">
        Lihat Semua
      </span>
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
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
