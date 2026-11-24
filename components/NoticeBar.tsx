import type { ReactNode } from "react";

type Notice = {
  icon: ReactNode;
  before: string;
  label: string;
  href: string;
  after: string;
};

const iconProps = {
  viewBox: "0 0 24 24",
  className: "h-4 w-4",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const BookmarkIcon = (
  <svg {...iconProps}>
    <path d="M6 3h12v18l-6-4-6 4V3z" />
  </svg>
);

const ChatIcon = (
  <svg {...iconProps}>
    <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
  </svg>
);

const NOTICES: Notice[] = [
  {
    icon: BookmarkIcon,
    before: "Simpan",
    label: "link.senplay.web.id",
    href: "https://link.senplay.web.id",
    after: "di bookmark untuk mendapatkan link SenPlay terbaru.",
  },
  {
    icon: ChatIcon,
    before: "Gabung server Discord",
    label: "SenPlay",
    href: "https://discord.gg/5rCDYCTsG2",
    after: "untuk mendapatkan update tercepat dari kami.",
  },
];

export default function NoticeBar() {
  return (
    <div className="px-5 py-6 md:px-12">
      <ul className="grid gap-4 rounded-2xl border border-border bg-surface px-5 py-4 md:grid-cols-2 md:gap-8">
        {NOTICES.map(({ icon, before, label, href, after }) => (
          <li key={href} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-text">
              {icon}
            </span>
            <p className="text-sm text-muted">
              {before}{" "}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-text underline underline-offset-2 transition-colors hover:text-accent-text"
              >
                {label}
              </a>{" "}
              {after}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
