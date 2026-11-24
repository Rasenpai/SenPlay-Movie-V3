import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Ketentuan Layanan", href: "/ketentuan-layanan" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="grid gap-8 px-4 py-10 md:grid-cols-[1fr_minmax(0,40rem)_1fr] md:items-start md:px-12">
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-text"
          >
            Sen<span className="text-accent-text">Play</span>
          </Link>

          <nav aria-label="Tautan footer" className="flex gap-5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-sm leading-relaxed text-muted md:text-center">
          SenPlay tidak menyimpan, meng-host, atau mendistribusikan file media
          apa pun. Seluruh konten diambil secara otomatis dari penyedia pihak
          ketiga di Internet.
        </p>

        <p className="text-sm text-muted/70 md:text-right">
          &copy; 2026 SenPlay
        </p>
      </div>
    </footer>
  );
}
