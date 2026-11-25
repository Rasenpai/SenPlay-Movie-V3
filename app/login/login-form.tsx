"use client";

import { useState } from "react";
import Link from "next/link";

const NOTCH = 12;

const notchMask = (edge: "top" | "bottom") => {
  const y = edge === "top" ? "0" : "100%";
  const value =
    `radial-gradient(circle ${NOTCH}px at 0 ${y}, #0000 98%, #000) left / 51% 100% no-repeat, ` +
    `radial-gradient(circle ${NOTCH}px at 100% ${y}, #0000 98%, #000) right / 51% 100% no-repeat`;
  return { mask: value, WebkitMask: value };
};

const SPROCKET: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, var(--border) 0 16px, transparent 16px 34px)",
  maskImage:
    "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const ERRORS: Record<string, string> = {
  cancelled: "Login dibatalkan.",
  state: "Sesi login kedaluwarsa. Coba lagi ya.",
  code: "Gagal masuk. Coba lagi ya.",
  token: "Gagal masuk. Coba lagi ya.",
};

export default function LoginForm({ errorKey }: { errorKey?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorKey ? (ERRORS[errorKey] ?? "Gagal masuk. Coba lagi ya.") : "",
  );

  // Redirect penuh (bukan popup) supaya jalan juga di WebView aplikasi.
  const handleGoogle = () => {
    setError("");
    setLoading(true);
    window.location.assign("/api/auth/google");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-28">
      <div
        aria-hidden="true"
        style={SPROCKET}
        className="absolute inset-y-0 left-4 hidden w-3 opacity-60 md:left-12 md:block"
      />
      <div
        aria-hidden="true"
        style={SPROCKET}
        className="absolute inset-y-0 right-4 hidden w-3 opacity-60 md:right-12 md:block"
      />

      <div className="relative w-full max-w-sm animate-[hero-in_0.6s_ease-out_both] drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]">
        <section
          aria-labelledby="login-title"
          style={notchMask("bottom")}
          className="rounded-t-2xl border border-b-0 border-border bg-surface px-6 pb-9 pt-6"
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Tiket masuk
          </p>

          <h1
            id="login-title"
            className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-text"
          >
            Tadi nonton apa ya?
          </h1>

          <p className="mt-5 text-sm leading-relaxed text-muted">
            Masuk dulu, biar daftar tontonan dan watchlist-mu nggak hilang.
          </p>
        </section>

        <div
          style={notchMask("top")}
          className="relative rounded-b-2xl border border-t-0 border-border bg-surface px-6 pb-6 pt-8"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-6 top-0 border-t border-dashed border-border"
          />

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-text px-4 py-3.5 text-sm font-semibold text-bg transition hover:bg-text/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-bg/20 border-t-bg" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? "Menunggu Google..." : "Masuk dengan Google"}
          </button>

          {error && (
            <p role="alert" className="mt-3 text-sm text-accent-text">
              {error}
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-muted">
            Dengan masuk, kamu menyetujui{" "}
            <Link href="/terms" className="underline hover:text-text">
              Ketentuan Layanan
            </Link>{" "}
            dan{" "}
            <Link href="/privacy" className="underline hover:text-text">
              Kebijakan Privasi
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
