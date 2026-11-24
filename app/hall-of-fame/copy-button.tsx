"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-rating/40 bg-rating/10 px-2.5 py-1 text-xs font-semibold text-rating transition hover:bg-rating/20"
    >
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}
