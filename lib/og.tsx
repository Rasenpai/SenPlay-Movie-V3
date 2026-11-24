const COLORS = {
  bg: "#141110",
  text: "#ede6da",
  muted: "#a39889",
  accent: "#d92b1f",
  accentText: "#f0483c",
};

export const OG_SIZE = { width: 1200, height: 630 };

export async function toDataUrl(url?: string | null) {
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

type OgCardProps = {
  title: string;
  meta?: string;
  poster?: string | null;
};

export function OgCard({ title, meta, poster }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: COLORS.bg,
        color: COLORS.text,
      }}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          width={420}
          height={630}
          style={{ width: 420, height: 630, objectFit: "cover" }}
        />
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          borderLeft: poster ? `6px solid ${COLORS.accent}` : undefined,
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
          <span>Sen</span>
          <span style={{ color: COLORS.accentText }}>Play</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: poster ? 64 : 84,
              fontWeight: 800,
              lineHeight: 1.1,
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          {meta && (
            <div style={{ fontSize: 32, color: COLORS.muted, marginTop: 20 }}>
              {meta}
            </div>
          )}
        </div>

        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: COLORS.accent,
              color: "#fff4ea",
              fontSize: 28,
              fontWeight: 700,
              padding: "10px 28px",
              borderRadius: 9999,
            }}
          >
            Nonton Sub Indo
          </div>
        </div>
      </div>
    </div>
  );
}
