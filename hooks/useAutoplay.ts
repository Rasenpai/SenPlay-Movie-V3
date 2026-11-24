"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoplay(length: number, duration: number) {
  const [active, setActive] = useState(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);

  const select = useCallback((index: number) => {
    progress.current = 0;
    setActive(index);
  }, []);

  useEffect(() => {
    if (length < 2) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      progress.current += Math.min(now - last, 100) / duration;
      last = now;

      if (progress.current >= 1) {
        progress.current = 0;
        setActive((current) => (current + 1) % length);
      }

      barRef.current?.style.setProperty("transform", `scaleX(${progress.current})`);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [length, duration]);

  return { active, select, barRef };
}