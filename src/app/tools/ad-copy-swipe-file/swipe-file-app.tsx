"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  type Ad,
  PATTERN_LABELS,
  PLATFORM_LABELS,
  VERTICAL_LABELS,
  FUNNEL_LABELS,
} from "@/lib/data/ad-copy";
import { AdCard, AdDetailModal } from "./ad-card";
import {
  type Filters,
  defaultFilters,
  FiltersBar,
  PLATFORM_ORDER,
} from "./filters";

const FAVORITES_KEY = "startoor_adcopy_favorites_v1";

// Stable seeded shuffle so "random" feels curated on first load.
function seededShuffle<T>(arr: T[], seed = 42): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function adPlaintext(ad: Ad): string {
  return `${ad.headline}\n\n${ad.body}\n\nCTA: ${ad.cta}`;
}

function csvEscape(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function downloadBlob(contents: string, type: string, filename: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function SwipeFileApp({ ads }: { ads: Ad[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(42);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate favorites
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setFavorites(new Set(parsed));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist favorites
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {}
  }, [favorites, hydrated]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [filters.query]);

  const results = useMemo(() => {
    let out = ads;

    if (debouncedQuery) {
      out = out.filter((ad) => {
        return (
          ad.headline.toLowerCase().includes(debouncedQuery) ||
          ad.body.toLowerCase().includes(debouncedQuery) ||
          ad.cta.toLowerCase().includes(debouncedQuery) ||
          ad.annotation.toLowerCase().includes(debouncedQuery) ||
          ad.platform.includes(debouncedQuery) ||
          ad.vertical.includes(debouncedQuery) ||
          ad.pattern.includes(debouncedQuery)
        );
      });
    }
    if (filters.platforms.size) {
      out = out.filter((a) => filters.platforms.has(a.platform));
    }
    if (filters.vertical !== "all") {
      out = out.filter((a) => a.vertical === filters.vertical);
    }
    if (filters.pattern !== "all") {
      out = out.filter((a) => a.pattern === filters.pattern);
    }
    if (filters.funnel !== "all") {
      out = out.filter((a) => a.funnel_stage === filters.funnel);
    }
    if (filters.favoritesOnly) {
      out = out.filter((a) => favorites.has(a.id));
    }

    if (filters.sort === "random") {
      out = seededShuffle(out, shuffleSeed);
    } else if (filters.sort === "platform") {
      out = [...out].sort(
        (a, b) =>
          PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform) ||
          a.id.localeCompare(b.id),
      );
    } else if (filters.sort === "length") {
      out = [...out].sort(
        (a, b) => a.body.length - b.body.length || a.id.localeCompare(b.id),
      );
    }

    return out;
  }, [
    ads,
    debouncedQuery,
    filters.platforms,
    filters.vertical,
    filters.pattern,
    filters.funnel,
    filters.favoritesOnly,
    filters.sort,
    favorites,
    shuffleSeed,
  ]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const copyAd = useCallback(async (ad: Ad) => {
    try {
      await navigator.clipboard.writeText(adPlaintext(ad));
      setCopiedId(ad.id);
      setTimeout(() => setCopiedId((curr) => (curr === ad.id ? null : curr)), 1200);
      toast.success("Ad copied", {
        description: ad.headline.length > 60 ? ad.headline.slice(0, 60) + "…" : ad.headline,
      });
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }, []);

  const clearAll = () => {
    setFilters(defaultFilters());
    toast.message("Filters cleared");
  };

  const exportCsv = () => {
    const header = [
      "id",
      "platform",
      "vertical",
      "pattern",
      "angle",
      "funnel",
      "headline",
      "body",
      "cta",
      "visual_desc",
      "annotation",
    ];
    const rows = [header];
    for (const ad of results) {
      rows.push([
        ad.id,
        ad.platform,
        ad.vertical,
        ad.pattern,
        ad.angle,
        ad.funnel_stage,
        csvEscape(ad.headline),
        csvEscape(ad.body),
        csvEscape(ad.cta),
        csvEscape(ad.visual_desc),
        csvEscape(ad.annotation),
      ]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    downloadBlob(csv, "text/csv;charset=utf-8", "startoor-ad-swipe-file.csv");
    toast.success(`Exported ${results.length} ads as CSV`);
  };

  const printPdf = () => {
    if (results.length === 0) {
      toast.error("No ads to print. Loosen your filters.");
      return;
    }
    toast.message(`Printing ${results.length} ads — use 'Save as PDF' in the dialog.`);
    // Next paint so toast doesn't end up in the print.
    setTimeout(() => window.print(), 80);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (openIndex !== null) return; // modal owns its keys
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (inField) {
        if (e.key === "Escape" && target?.tagName === "INPUT") {
          (target as HTMLInputElement).blur();
        }
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelpOpen((v) => !v);
      } else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("ad-search")?.focus();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFilters((f) => ({ ...f, favoritesOnly: !f.favoritesOnly }));
      } else if (e.key === "Escape") {
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openIndex]);

  const openAd = results[openIndex ?? -1];

  return (
    <div className="relative">
      <FiltersBar
        filters={filters}
        setFilters={(updater) => setFilters(updater)}
        favoritesCount={favorites.size}
        resultsCount={results.length}
        totalCount={ads.length}
        onReshuffle={() => setShuffleSeed((s) => s + 1)}
        onClearAll={clearAll}
        onExportCsv={exportCsv}
        onPrint={printPdf}
        onOpenShortcuts={() => setHelpOpen(true)}
      />

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14 print:hidden">
        {results.length === 0 ? (
          <EmptyState onReset={clearAll} />
        ) : (
          <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
            {results.map((ad, i) => (
              <AdCard
                key={ad.id}
                ad={ad}
                index={i}
                saved={favorites.has(ad.id)}
                copied={copiedId === ad.id}
                onCopy={() => copyAd(ad)}
                onToggleSave={() => toggleFavorite(ad.id)}
                onOpen={() => setOpenIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Print layout — rendered for print only */}
      <div className="hidden print:block">
        <PrintSheet ads={results} />
      </div>

      {openAd && openIndex !== null && (
        <AdDetailModal
          ad={openAd}
          saved={favorites.has(openAd.id)}
          onClose={() => setOpenIndex(null)}
          onPrev={() => setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() =>
            setOpenIndex((i) => (i !== null && i < results.length - 1 ? i + 1 : i))
          }
          onToggleSave={() => toggleFavorite(openAd.id)}
          onCopy={() => copyAd(openAd)}
          copied={copiedId === openAd.id}
          hasPrev={openIndex > 0}
          hasNext={openIndex < results.length - 1}
        />
      )}

      {helpOpen && <ShortcutsPanel onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

// ---- Empty state ----

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
        The archive is quiet
      </span>
      <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ink">
        Nothing matches that combination.
      </h2>
      <p className="mt-4 font-sans text-base leading-relaxed text-ink-soft">
        Loosen a filter, or clear everything. 500 ads wait on the other side — there&apos;s
        a framework in here for whatever you&apos;re writing.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
      >
        Clear filters
      </button>
    </div>
  );
}

// ---- Shortcuts panel ----

function ShortcutsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden bg-bone shadow-warm-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Cheat sheet
            </span>
            <h3 className="mt-1 font-display text-2xl leading-tight tracking-tight text-ink">
              Keyboard shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-stone hover:bg-paper hover:text-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="divide-y divide-hairline-soft px-6 py-2 font-sans text-sm">
          <Row k="/" v="Focus search" />
          <Row k="F" v="Toggle favorites-only" />
          <Row k="Click a card" v="Open detail view" />
          <Row k="← →" v="Previous / next (detail)" />
          <Row k="C" v="Copy current ad (detail)" />
          <Row k="S" v="Save current ad (detail)" />
          <Row k="Esc" v="Close detail / panel" />
          <Row k="?" v="Toggle this panel" />
        </dl>
        <div className="border-t border-hairline bg-paper px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Favorites save to this browser · no sign-in
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt>
        <kbd className="rounded border border-hairline bg-paper px-2 py-0.5 font-mono text-xs text-ink">
          {k}
        </kbd>
      </dt>
      <dd className="text-ink-soft">{v}</dd>
    </div>
  );
}

// ---- Print sheet ----

function PrintSheet({ ads }: { ads: Ad[] }) {
  return (
    <div className="print-sheet">
      <header className="print-header">
        <span className="print-eyebrow">Startoor · Ad Copy Swipe File</span>
        <h1 className="print-title">
          {ads.length} annotated ads · filtered selection
        </h1>
        <p className="print-meta">
          Printed from startoor.vercel.app / tools / ad-copy-swipe-file
        </p>
      </header>
      <div className="print-list">
        {ads.map((ad, i) => (
          <section key={ad.id} className="print-card">
            <div className="print-meta-row">
              <span>
                №&nbsp;{ad.id.split("-")[1]} · {PLATFORM_LABELS[ad.platform]} ·{" "}
                {VERTICAL_LABELS[ad.vertical]} · {FUNNEL_LABELS[ad.funnel_stage]}
              </span>
              <span>{PATTERN_LABELS[ad.pattern]}</span>
            </div>
            <h2 className="print-headline">{ad.headline}</h2>
            <p className="print-body">{ad.body}</p>
            <p className="print-cta">CTA → {ad.cta}</p>
            <p className="print-visual">Implied visual: {ad.visual_desc}</p>
            <p className="print-annotation">Why it works: {ad.annotation}</p>
            {(i + 1) % 2 === 0 && i !== ads.length - 1 && (
              <div className="print-pagebreak" />
            )}
          </section>
        ))}
      </div>
      {/* Inline print CSS so the tool is self-contained. */}
      <style>{`
        @media print {
          @page { size: Letter; margin: 0.6in; }
          body { background: #fff !important; }
          .print-sheet { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color: #1c1c1a; }
          .print-header { margin-bottom: 18pt; padding-bottom: 10pt; border-bottom: 0.5pt solid #1c1c1a; }
          .print-eyebrow { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 8pt; letter-spacing: 0.22em; text-transform: uppercase; color: #8f8b80; }
          .print-title { font-family: ui-serif, "Iowan Old Style", Georgia, serif; font-size: 22pt; line-height: 1.1; margin: 6pt 0 4pt; font-weight: 500; letter-spacing: -0.01em; }
          .print-meta { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: #8f8b80; }
          .print-list { display: block; }
          .print-card { break-inside: avoid; page-break-inside: avoid; padding: 14pt 0; border-bottom: 0.5pt solid rgba(28,28,26,0.18); }
          .print-meta-row { display: flex; justify-content: space-between; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 7.5pt; letter-spacing: 0.18em; text-transform: uppercase; color: #8f8b80; }
          .print-headline { font-family: ui-serif, "Iowan Old Style", Georgia, serif; font-size: 16pt; line-height: 1.15; margin: 6pt 0 4pt; font-weight: 500; letter-spacing: -0.01em; color: #1c1c1a; }
          .print-body { font-size: 10pt; line-height: 1.5; margin: 0 0 4pt; color: #2e2e2b; }
          .print-cta { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: #1f3a2f; margin: 4pt 0 2pt; }
          .print-visual { font-style: italic; font-size: 9pt; color: #8f8b80; margin: 0 0 4pt; }
          .print-annotation { font-size: 9pt; line-height: 1.5; color: #2e2e2b; margin: 2pt 0 0; border-top: 0.3pt solid rgba(28,28,26,0.18); padding-top: 4pt; }
          .print-pagebreak { break-after: page; page-break-after: always; height: 0; }
        }
      `}</style>
    </div>
  );
}
