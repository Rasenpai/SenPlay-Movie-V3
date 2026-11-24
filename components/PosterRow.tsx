"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";

const SLIDE_RATIO = 0.8;
const EDGE_TOLERANCE_PX = 4;
const DEFAULT_BUTTON_TOP_PX = 158;

type SlideButtonProps = {
  direction: "prev" | "next";
  top: number;
  onClick: () => void;
};

function SlideButton({ direction, top, onClick }: SlideButtonProps) {
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top }}
      aria-label={isPrev ? "Geser ke kiri" : "Geser ke kanan"}
      className={`absolute z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg shadow-black/50 transition-colors hover:bg-surface-hover md:flex ${
        isPrev ? "left-1" : "right-1"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

type PosterRowProps = ComponentProps<"ul"> & {
  buttonTop?: number;
};

export default function PosterRow({
  buttonTop = DEFAULT_BUTTON_TOP_PX,
  className = "",
  children,
  ...props
}: PosterRowProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const updateEdges = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    setEdges({
      prev: list.scrollLeft > EDGE_TOLERANCE_PX,
      next:
        list.scrollLeft + list.clientWidth <
        list.scrollWidth - EDGE_TOLERANCE_PX,
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(updateEdges);
    observer.observe(list);
    return () => observer.disconnect();
  }, [updateEdges]);

  const slide = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;

    list.scrollBy({
      left: direction * list.clientWidth * SLIDE_RATIO,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {edges.prev && (
        <SlideButton
          direction="prev"
          top={buttonTop}
          onClick={() => slide(-1)}
        />
      )}
      {edges.next && (
        <SlideButton
          direction="next"
          top={buttonTop}
          onClick={() => slide(1)}
        />
      )}

      <ul
        ref={listRef}
        onScroll={updateEdges}
        className={`flex gap-4 overflow-x-auto px-5 pb-4 pt-4 scroll-px-5 max-md:snap-x md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
        {...props}
      >
        {children}
      </ul>
    </div>
  );
}
