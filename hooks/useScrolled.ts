"use client";

import { useSyncExternalStore } from "react";

const SCROLL_THRESHOLD_PX = 24;

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

const getSnapshot = () => window.scrollY > SCROLL_THRESHOLD_PX;
const getServerSnapshot = () => false;

export function useScrolled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}