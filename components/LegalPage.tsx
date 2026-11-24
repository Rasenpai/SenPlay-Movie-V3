import type { ReactNode } from "react";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  footer?: ReactNode;
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-32 md:px-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-text md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Terakhir diperbarui: {updatedAt}
      </p>
      <p className="mt-8 leading-relaxed text-text/90">{intro}</p>

      <div className="mt-10 flex flex-col gap-10">
        {sections.map((section, index) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-text">
              {index + 1}. {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-text/80">
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed text-text/80 marker:text-accent-text">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.footer}
          </section>
        ))}
      </div>
    </main>
  );
}
