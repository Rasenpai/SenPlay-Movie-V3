import { cacheLife } from "next/cache";

type Donation = {
  transaction_id: string;
  created_at: string;
  type: string;
  supporter_name: string | null;
  supporter_message: string | null;
  price: number;
  net_amount: number | null;
};

type Tier = { name: string; color: string; icon: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.senplay.web.id";
const MONTHLY_TARGET = 300_000;

const TRAKTEER_URL = "https://trakteer.id/rasena";
const SAWERIA_URL = "https://saweria.co/SenpaiiGantenk";

const TIERS: { min: number; tier: Tier }[] = [
  {
    min: 250_001,
    tier: { name: "Diamond Legend", color: "text-cyan-400", icon: "💎" },
  },
  {
    min: 100_001,
    tier: { name: "Gold Hero", color: "text-rating", icon: "🥇" },
  },
  {
    min: 25_001,
    tier: { name: "Silver Guardian", color: "text-slate-300", icon: "🥈" },
  },
  {
    min: 0,
    tier: { name: "Bronze Supporter", color: "text-orange-400", icon: "🥉" },
  },
];

const LEGEND = [
  { tier: TIERS[0].tier, range: "> Rp 250.000" },
  { tier: TIERS[1].tier, range: "Rp 100.001 - Rp 250.000" },
  { tier: TIERS[2].tier, range: "Rp 25.001 - Rp 100.000" },
  { tier: TIERS[3].tier, range: "s/d Rp 25.000" },
];

const PAYMENT_METHODS = [
  {
    name: "Trakteer",
    badge: "Trakteer",
    region: "Indonesia",
    url: TRAKTEER_URL,
    methods: ["QRIS", "GoPay / OVO", "DANA / ShopeePay", "Transfer Bank"],
    card: "border-accent/40",
    badgeClass: "bg-accent/15 text-accent-text",
    button: "bg-accent text-on-accent hover:bg-accent-hover",
  },
  {
    name: "Saweria",
    badge: "Saweria",
    region: "Indonesia",
    url: SAWERIA_URL,
    methods: ["QRIS", "GoPay", "OVO", "DANA", "ShopeePay"],
    card: "border-rating/40",
    badgeClass: "bg-rating/15 text-rating",
    button: "bg-rating text-bg hover:opacity-90",
  },
];

const formatRupiah = (value: number) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  })
    .format(new Date(iso))
    .replaceAll("/", "-");

const monthKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));

const monthLabel = (key: string) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(`${key}-01T00:00:00+07:00`),
  );

const amountOf = (d: Donation) => d.net_amount ?? d.price;
const nameOf = (d: Donation) => d.supporter_name?.trim() || "Anonim";
const tierOf = (amount: number) => TIERS.find((t) => amount >= t.min)!.tier;

async function getData() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  let donations: Donation[] = [];
  try {
    const res = await fetch(`${API_URL}/api/donations/all?limit=500`);
    if (res.ok) {
      const data = await res.json();
      donations = (data.donations ?? []) as Donation[];
    }
  } catch {}

  return { donations, currentKey: monthKey(new Date().toISOString()) };
}

export default async function HallOfFamePage() {
  const { donations: raw, currentKey } = await getData();
  const donations = [...raw].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );

  const monthTotal = donations
    .filter((d) => monthKey(d.created_at) === currentKey)
    .reduce((sum, d) => sum + amountOf(d), 0);
  const progress = Math.min((monthTotal / MONTHLY_TARGET) * 100, 100);

  const totals = new Map<
    string,
    { name: string; total: number; last: string }
  >();
  for (const d of donations) {
    const name = nameOf(d);
    if (name === "Anonim") continue;
    const key = name.toLowerCase();
    const prev = totals.get(key);
    totals.set(key, {
      name,
      total: (prev?.total ?? 0) + amountOf(d),
      last: prev?.last ?? d.created_at,
    });
  }
  const top = [...totals.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  const podium = [top[1], top[0], top[2]];

  const groups = new Map<string, Donation[]>();
  for (const d of donations) {
    const key = monthKey(d.created_at);
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-28 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-accent-text sm:text-4xl">
          Hall of Fame Donatur
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
          Dukungan Anda membantu kami menjaga server tetap aktif, cepat, dan
          terus menyajikan tayangan anime, komik, serta novel berkualitas!
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Terkumpul Bulan Ini</p>
            <p className="mt-1 text-2xl font-bold">
              {formatRupiah(monthTotal)}
            </p>
          </div>
          <p className="text-sm text-muted">
            Target: {formatRupiah(MONTHLY_TARGET)}
          </p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-bg">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-right text-sm font-semibold text-accent-text">
          {progress.toFixed(1)}% Tercapai
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">
          <span className="text-accent">♥</span> Pilihan Metode Pembayaran &amp;
          Donasi
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {PAYMENT_METHODS.map((p) => (
            <article
              key={p.name}
              className={`flex flex-col rounded-2xl border bg-surface p-5 ${p.card}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold ${p.badgeClass}`}
                >
                  ID Lokal
                </span>
                <span className="text-muted">{p.region}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.methods.map((m) => (
                  <span
                    key={m}
                    className="rounded border border-border bg-bg px-2 py-0.5 text-[11px] text-muted"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-bold transition ${p.button}`}
              >
                Dukung via {p.badge} ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      {top.length > 0 && (
        <section className="mt-14">
          <h2 className="text-center text-xl font-bold">
            🏆 Top 3 Sultan SenPlay 🏆
          </h2>
          <div className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-6">
            {podium.map((entry, i) => {
              if (!entry) return <div key={i} />;
              const first = i === 1;
              const medal = first ? "👑" : i === 0 ? "🥈" : "🥉";
              const accent = first
                ? "border-b-rating text-rating"
                : i === 0
                  ? "border-b-slate-400 text-slate-300"
                  : "border-b-orange-500 text-orange-400";
              return (
                <div
                  key={entry.name}
                  className={`relative rounded-2xl border border-border border-b-4 bg-surface px-3 text-center ${accent} ${
                    first ? "pb-6 pt-10" : "pb-5 pt-9"
                  }`}
                >
                  <span className="absolute -top-5 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-bg text-xl">
                    {medal}
                  </span>
                  <p className="truncate font-bold text-text">{entry.name}</p>
                  <p className="mt-1 font-bold">{formatRupiah(entry.total)}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(entry.last)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-center font-bold">Legenda Peringkat Donatur</h2>
        <div className="mt-5 grid grid-cols-2 gap-5 text-center sm:grid-cols-4">
          {LEGEND.map(({ tier, range }) => (
            <div key={tier.name}>
              <div className="text-2xl">{tier.icon}</div>
              <p className={`mt-1 text-sm font-semibold ${tier.color}`}>
                {tier.name}
              </p>
              <p className="text-xs text-muted">{range}</p>
            </div>
          ))}
        </div>
      </section>

      {[...groups.entries()].map(([key, items]) => {
        const total = items.reduce((sum, d) => sum + amountOf(d), 0);
        return (
          <section key={key} className="mt-12">
            <div className="flex items-end justify-between border-b border-border pb-2">
              <h2 className="text-2xl font-bold">{monthLabel(key)}</h2>
              <p className="text-sm text-muted">
                Donasi Bulan Ini:{" "}
                <span className="font-semibold text-accent-text">
                  {formatRupiah(total)}
                </span>
              </p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((d) => {
                const amount = amountOf(d);
                const tier = tierOf(amount);
                return (
                  <article
                    key={d.transaction_id}
                    className="flex flex-col rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold">{nameOf(d)}</p>
                      <p
                        className={`shrink-0 text-xs font-semibold ${tier.color}`}
                      >
                        {tier.icon} {tier.name}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted">
                      <span>{formatDate(d.created_at)}</span>
                      <span className="font-bold text-text">
                        {formatRupiah(amount)}
                      </span>
                    </div>
                    {d.supporter_message && (
                      <p className="mt-3 border-t border-border pt-3 text-sm italic text-muted">
                        &ldquo;{d.supporter_message}&rdquo;
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {donations.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted">
          Belum ada donasi yang tercatat.
        </p>
      )}
    </main>
  );
}
