import type { Metadata } from "next";
import Link from "next/link";
import { resizeImage } from "@/lib/image";
import { getNetworks } from "@/lib/network";

export const metadata: Metadata = {
  title: "Network | Senplay Movie",
  description: "Telusuri tontonan berdasarkan network dan platform streaming.",
};

export default async function NetworkPage() {
  const networks = await getNetworks();

  return (
    <main className="px-5 pb-16 pt-28 md:px-12">
      <h1 className="text-2xl font-bold md:text-3xl">Network</h1>

      {networks.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          Daftar network belum tersedia. Coba lagi beberapa saat lagi.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {networks.map((network) => (
            <li key={network.slug}>
              <Link
                href={`/network/${network.slug}`}
                className="group flex h-40 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface px-4 transition-colors hover:border-accent hover:bg-surface-hover"
              >
                <div className="flex h-14 w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resizeImage(network.logo, "w500")}
                    alt={network.name}
                    loading="lazy"
                    draggable={false}
                    className="max-h-full max-w-[75%] object-contain opacity-60 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <span className="text-sm font-medium text-text/80 transition-colors group-hover:text-text">
                  {network.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
