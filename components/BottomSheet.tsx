"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const DURATION_MS = 320;
const EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = 0.6;
const BACKDROP_FADE_DISTANCE = 320;

type BottomSheetProps = {
  id?: string;
  label: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

type DragState = {
  startY: number;
  lastY: number;
  lastAt: number;
  velocity: number;
  offset: number;
};

export default function BottomSheet({
  id,
  label,
  open,
  onClose,
  children,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<DragState | null>(null);

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!open) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;

    const timer = setTimeout(() => {
      setMounted(false);
      setShown(false);
    }, DURATION_MS);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const visible = open && shown;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startY: e.clientY,
      lastY: e.clientY,
      lastAt: performance.now(),
      velocity: 0,
      offset: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;

    const now = performance.now();
    const instant = (e.clientY - d.lastY) / Math.max(now - d.lastAt, 1);
    d.velocity = 0.7 * instant + 0.3 * d.velocity;
    d.lastY = e.clientY;
    d.lastAt = now;
    d.offset = Math.max(0, e.clientY - d.startY);
    setDragY(d.offset);
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d) return;

    drag.current = null;
    setDragging(false);
    setDragY(0);

    if (d.offset > CLOSE_DISTANCE || d.velocity > CLOSE_VELOCITY) onClose();
  };

  const transition = dragging ? "none" : undefined;

  return (
    <div className={`md:hidden ${open ? "" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Tutup menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        style={{
          opacity: visible ? Math.max(0, 1 - dragY / BACKDROP_FADE_DISTANCE) : 0,
          transition: transition ?? `opacity ${DURATION_MS}ms ${EASING}`,
        }}
      />

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-surface px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black will-change-transform"
        style={{
          transform: visible ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: transition ?? `transform ${DURATION_MS}ms ${EASING}`,
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="-mx-4 flex cursor-grab touch-none justify-center py-4 active:cursor-grabbing"
        >
          <span
            aria-hidden="true"
            className="h-1 w-10 rounded-full bg-border"
          />
        </div>

        {children}
      </div>
    </div>
  );
}