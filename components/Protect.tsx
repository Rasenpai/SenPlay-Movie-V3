"use client";

import { useEffect } from "react";

export default function Protect() {
  useEffect(() => {
    // Aktif hanya di production supaya kamu tetap bisa debug saat development.
    if (process.env.NODE_ENV !== "production") return;

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      const blocked =
        e.key === "F12" ||
        (ctrl && e.shiftKey && ["i", "j", "c", "k"].includes(k)) || // DevTools
        (ctrl && ["u", "s"].includes(k)) || // view source, save
        (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(k)); // Mac

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
