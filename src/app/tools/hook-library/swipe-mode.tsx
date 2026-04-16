"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Keyboard,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type Hook,
  PATTERN_LABELS,
  PLATFORM_LABELS,
  VERTICAL_LABELS,
} from "@/lib/data/hooks";

export function SwipeMode({
  hooks,
  startIndex,
  favorites,
  onToggleFavorite,
  onCopy,
  onClose,
}: {
  hooks: Hook[];
  startIndex: number;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, startIndex), Math.max(0, hooks.length - 1)),
  );
  const [direction, setDirection] = useState<"next" | "prev" | "enter">("enter");

  const clamp = useCallback(
    (n: number) => {
      if (hooks.length === 0) return 0;
      if (n < 0) return hooks.length - 1;
      if (n >= hooks.length) return 0;
      return n;
    },
    [hooks.length],
  );

  const next = useCallback(() => {
    setDirection("next");
    setIndex((i) => clamp(i + 1));
  }, [clamp]);

  const prev = useCallback(() => {
    setDirection("prev");
    setIndex((i) => clamp(i - 1));
  }, [clamp]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        prev();
      } else if (e.key === " ") {
        e.preventDefault();
        const h = hooks[index];
        if (h) onToggleFavorite(h.id);
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        const h = hooks[index];
        if (h) onCopy(h.hook, h.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hooks, index, next, prev, onToggleFavorite, onCopy, onClose]);

  // Lock background scroll.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (hooks.length === 0) return null;
  const hook = hooks[index];
  const saved = favorites.has(hook.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <div className="paper-grain absolute inset-0 pointer-events-none" />
      {/* Top bar */}
      <div className="relative flex items-center justify-between gap-4 border-b border-hairline px-6 py-4 md:px-10">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Swipe mode
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone tabular-nums">
            {String(index + 1).padStart(3, "0")} / {String(hooks.length).padStart(3, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          <span className="hidden items-center gap-1 md:inline-flex">
            <Keyboard className="h-3 w-3" strokeWidth={1.5} />
            ← → · space · C · Esc
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <X className="h-3 w-3" strokeWidth={1.5} />
            Exit
          </button>
        </div>
      </div>

      {/* Card stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 md:px-10">
        <button
          type="button"
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-hairline bg-bone p-3 text-ink-soft shadow-warm-sm transition-all hover:border-ink hover:text-ink md:left-8"
          aria-label="Previous hook"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-hairline bg-bone p-3 text-ink-soft shadow-warm-sm transition-all hover:border-ink hover:text-ink md:right-8"
          aria-label="Next hook"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <article
          key={hook.id}
          className={cn(
            "relative mx-auto w-full max-w-3xl rounded-sm bg-bone p-10 shadow-warm-lg md:p-16",
            direction === "next" && "animate-swipe-in-right",
            direction === "prev" && "animate-swipe-in-left",
            direction === "enter" && "animate-fade-up",
          )}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-clay">
                № <span className="tabular-nums">{hook.id}</span>
              </span>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                {PLATFORM_LABELS[hook.platform]} · {PATTERN_LABELS[hook.pattern]} · {hook.length}
                {hook.vertical ? ` · ${VERTICAL_LABELS[hook.vertical]}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleFavorite(hook.id)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                saved
                  ? "border-clay bg-clay text-bone"
                  : "border-hairline text-stone hover:border-ink hover:text-ink",
              )}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <Star className="h-4 w-4" strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          <p className="mt-10 font-display text-[2.2rem] leading-[1.12] tracking-tight text-ink md:text-[3.2rem] md:leading-[1.08]">
            {hook.hook}
          </p>

          <p className="mt-10 max-w-2xl border-t border-hairline pt-6 font-display text-lg italic leading-relaxed text-ink-soft md:text-xl">
            {hook.annotation}
          </p>

          <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              {saved ? "Saved to your shortlist" : "Space to save · C to copy"}
            </div>
            <button
              type="button"
              onClick={() => onCopy(hook.hook, hook.id)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              Copy hook
            </button>
          </div>
        </article>
      </div>

      {/* Bottom strip — mini nav */}
      <div className="relative border-t border-hairline bg-bone/70 px-6 py-3 md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          <span>{favorites.size} saved so far</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              className="text-ink-soft hover:text-ink"
            >
              ← Previous
            </button>
            <span className="text-stone-light">·</span>
            <button
              type="button"
              onClick={next}
              className="text-ink-soft hover:text-ink"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes swipe-in-right {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes swipe-in-left {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-swipe-in-right { animation: swipe-in-right 0.36s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
        .animate-swipe-in-left  { animation: swipe-in-left  0.36s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
      `}</style>
    </div>
  );
}
