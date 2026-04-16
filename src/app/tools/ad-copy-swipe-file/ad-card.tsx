"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type Ad,
  FUNNEL_LABELS,
  PATTERN_LABELS,
  PLATFORM_LABELS,
  VERTICAL_ACCENT,
  VERTICAL_LABELS,
} from "@/lib/data/ad-copy";

export function AdCard({
  ad,
  index,
  saved,
  onToggleSave,
  onCopy,
  copied,
  onOpen,
}: {
  ad: Ad;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
  onCopy: () => void;
  copied: boolean;
  onOpen: () => void;
}) {
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const accent = VERTICAL_ACCENT[ad.vertical];
  const stampClass =
    index % 3 === 0 ? "" : index % 3 === 1 ? "stamp-rotate-1" : "stamp-rotate-3";

  return (
    <article
      className={cn(
        "group relative mb-5 flex break-inside-avoid flex-col overflow-hidden bg-bone shadow-warm-xs transition-shadow hover:shadow-warm-sm",
        "before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-hairline before:via-transparent before:to-transparent",
      )}
      style={{
        animation: `fade-up 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) backwards`,
        animationDelay: `${Math.min(index, 20) * 18}ms`,
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 min-w-0 cursor-pointer flex-col p-6 text-left md:p-7"
        aria-label={`Open ad ${ad.id}`}
      >
        <div
          className={cn(
            "flex min-w-0 items-center justify-between gap-3",
            stampClass,
          )}
        >
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            {PLATFORM_LABELS[ad.platform]}
            <span className="text-stone-light">{" · "}</span>
            <span className="text-stone">{VERTICAL_LABELS[ad.vertical]}</span>
            <span className="text-stone-light">{" · "}</span>
            <span className="text-stone">{FUNNEL_LABELS[ad.funnel_stage]}</span>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone-light tabular-nums">
            №&nbsp;{ad.id.split("-")[1]}
          </span>
        </div>

        <h3 className="mt-5 line-clamp-3 min-w-0 font-display text-[22px] leading-[1.1] tracking-tight text-ink md:text-[26px]">
          {ad.headline}
        </h3>

        <p className="mt-3 line-clamp-4 min-w-0 font-sans text-sm leading-relaxed text-ink-soft md:text-[15px]">
          {ad.body}
        </p>

        <p className="mt-4 line-clamp-2 min-w-0 font-display text-xs italic leading-snug text-stone">
          ↳ {ad.visual_desc}
        </p>

        <div className="mt-5 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3.5 py-1.5 font-sans text-xs tracking-tight",
              accent.bg,
              accent.text,
            )}
          >
            {ad.cta}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            {PATTERN_LABELS[ad.pattern]}
          </span>
        </div>
      </button>

      {/* Annotation toggle + actions */}
      <div className="border-t border-hairline-soft px-6 py-3 md:px-7">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAnnotationOpen((v) => !v);
            }}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft hover:text-ink"
          >
            {annotationOpen ? "Hide why it works" : "Why it works"}
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                copied
                  ? "bg-forest text-bone"
                  : "text-ink-soft hover:bg-paper hover:text-ink",
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" strokeWidth={1.5} />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                saved ? "text-clay" : "text-stone hover:text-ink",
              )}
              aria-label={saved ? "Unsave" : "Save"}
            >
              <Star
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
        {annotationOpen && (
          <p className="mt-3 font-display text-xs italic leading-relaxed text-stone animate-fade-in">
            {ad.annotation}
          </p>
        )}
      </div>
    </article>
  );
}

// ---- Detail modal ----

export function AdDetailModal({
  ad,
  saved,
  onClose,
  onPrev,
  onNext,
  onToggleSave,
  onCopy,
  copied,
  hasPrev,
  hasNext,
}: {
  ad: Ad;
  saved: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleSave: () => void;
  onCopy: () => void;
  copied: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const accent = VERTICAL_ACCENT[ad.vertical];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        onCopy();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onToggleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev, onCopy, onToggleSave, hasNext, hasPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm print:hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden bg-bone shadow-warm-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            {PLATFORM_LABELS[ad.platform]}
            <span className="text-stone-light">{" · "}</span>
            <span className="text-stone">{VERTICAL_LABELS[ad.vertical]}</span>
            <span className="text-stone-light">{" · "}</span>
            <span className="text-stone">{FUNNEL_LABELS[ad.funnel_stage]}</span>
            <span className="text-stone-light">{" · "}</span>
            <span className="text-stone">№ {ad.id.split("-")[1]}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-stone hover:bg-paper hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="px-8 py-8 md:px-10 md:py-10">
            <h2 className="font-display text-[30px] leading-[1.05] tracking-tight text-ink md:text-[38px]">
              {ad.headline}
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-ink-soft md:text-lg">
              {ad.body}
            </p>
            <p className="mt-6 font-display text-sm italic leading-relaxed text-stone">
              Implied visual: {ad.visual_desc}
            </p>

            <div className="mt-8 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-5 py-2 font-sans text-sm tracking-tight",
                  accent.bg,
                  accent.text,
                )}
              >
                {ad.cta}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                {PATTERN_LABELS[ad.pattern]}
              </span>
            </div>

            <div className="mt-10 border-t border-hairline-soft pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Why it works
              </span>
              <p className="mt-2 font-display text-[17px] italic leading-relaxed text-ink-soft">
                {ad.annotation}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-hairline bg-paper px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                hasPrev
                  ? "text-ink-soft hover:bg-bone hover:text-ink"
                  : "text-stone-light cursor-not-allowed",
              )}
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={1.5} />
              Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                hasNext
                  ? "text-ink-soft hover:bg-bone hover:text-ink"
                  : "text-stone-light cursor-not-allowed",
              )}
            >
              Next
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleSave}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                saved
                  ? "bg-clay text-bone"
                  : "text-ink-soft hover:bg-bone hover:text-ink",
              )}
            >
              <Star
                className="h-3 w-3"
                strokeWidth={1.5}
                fill={saved ? "currentColor" : "none"}
              />
              {saved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCopy}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                copied
                  ? "bg-forest text-bone"
                  : "text-ink-soft hover:bg-bone hover:text-ink",
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2} />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" strokeWidth={1.5} />
                  Copy all
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
