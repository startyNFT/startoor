"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Heart, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import {
  ALL_INDUSTRIES,
  ALL_STYLES,
  type LandingTemplate,
  type TemplateIndustry,
  type TemplateStyle,
} from "@/lib/landing-templates";

type SortKey = "newest" | "loved";

export function Gallery({ templates }: { templates: LandingTemplate[] }) {
  const [industry, setIndustry] = useState<TemplateIndustry | "all">("all");
  const [style, setStyle] = useState<TemplateStyle | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = templates.filter((t) => {
      if (industry !== "all" && t.industry !== industry) return false;
      if (style !== "all" && !t.styleTags.includes(style)) return false;
      if (q) {
        const blob = `${t.name} ${t.industryLabel} ${t.description}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "loved" ? b.lovedCount - a.lovedCount : a.addedDays - b.addedDays,
    );
    return list;
  }, [templates, industry, style, query, sort]);

  const copyHero = async (tpl: LandingTemplate) => {
    try {
      await navigator.clipboard.writeText(tpl.heroSource);
      toast.success("Hero JSX copied to clipboard", {
        description: `${tpl.name} — paste into any React file.`,
      });
    } catch {
      toast.error("Clipboard blocked by browser");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 pt-12 md:px-10">
      {/* Filter bar */}
      <div className="sticky top-[112px] z-20 -mx-6 border-y border-hairline bg-paper/90 px-6 py-4 backdrop-blur-md md:-mx-10 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex flex-1 min-w-[240px] items-center gap-2 rounded-full border border-hairline bg-bone px-4 py-2">
            <Search className="h-3.5 w-3.5 text-stone" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates, verticals, vibes…"
              className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-stone"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone hover:text-ink"
              >
                clear
              </button>
            )}
          </label>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Sort
            </span>
            <div className="flex rounded-full border border-hairline bg-bone p-0.5">
              {(["newest", "loved"] as SortKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors",
                    sort === s ? "bg-ink text-bone" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {s === "newest" ? "Newest" : "Most loved"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            Industry
          </span>
          {ALL_INDUSTRIES.map((i) => (
            <button
              key={i.key}
              onClick={() => setIndustry(i.key)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors",
                industry === i.key
                  ? "border-ink bg-ink text-bone"
                  : "border-hairline bg-bone text-ink-soft hover:border-ink/50",
              )}
            >
              {i.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            Style
          </span>
          {ALL_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStyle(s.key)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors",
                style === s.key
                  ? "border-clay bg-clay text-bone"
                  : "border-hairline bg-bone text-ink-soft hover:border-clay/50",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone">
          Showing{" "}
          <span className="tabular-nums text-ink">{filtered.length}</span> of{" "}
          <span className="tabular-nums text-ink">{templates.length}</span>{" "}
          templates
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-20 text-center font-display text-3xl italic text-stone">
          Nothing matches yet — try another style.
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <TemplateCard key={tpl.slug} template={tpl} onCopyHero={copyHero} />
          ))}
        </div>
      )}
    </section>
  );
}

function TemplateCard({
  template,
  onCopyHero,
}: {
  template: LandingTemplate;
  onCopyHero: (t: LandingTemplate) => void;
}) {
  const Component = template.Component;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-hairline bg-bone shadow-warm-xs transition-shadow hover:shadow-warm-md">
      {/* Scaled-down live preview */}
      <div
        className="relative block aspect-[4/3] overflow-hidden"
        style={{ backgroundColor: "#F5F1E8" }}
      >
        <div
          className="pointer-events-none absolute left-0 top-0"
          style={{
            width: 1440,
            height: 1080,
            transform: "scale(0.24)",
            transformOrigin: "top left",
          }}
          aria-hidden
        >
          <Component />
        </div>

        {/* Hover layer */}
        <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href={`/templates/${template.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-bone px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink shadow-warm-sm transition-transform hover:-translate-y-0.5"
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </Link>
          <button
            onClick={() => onCopyHero(template)}
            className="inline-flex items-center gap-1.5 rounded-full border border-bone/40 bg-ink/70 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone backdrop-blur-sm transition-transform hover:-translate-y-0.5"
          >
            <Copy className="h-3 w-3" />
            Copy hero JSX
          </button>
        </div>

        {/* Accent chip */}
        <div
          className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-hairline bg-paper/90 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-soft backdrop-blur"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: template.accent }}
          />
          {template.industryLabel}
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-hairline bg-paper/90 px-2.5 py-1 font-mono text-[10px] tabular-nums text-ink-soft backdrop-blur">
          <Heart className="h-3 w-3 text-clay" />
          {template.lovedCount}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[22px] leading-[1.15] text-ink md:text-[26px]">
            {template.name}
          </h3>
          <span className="mt-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            {template.addedDays === 0 ? "today" : `${template.addedDays}d ago`}
          </span>
        </div>
        <p className="text-[13.5px] leading-[1.6] text-ink-soft">
          {template.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {template.styleTags.map((s) => (
            <span
              key={s}
              className="rounded-full border border-hairline bg-paper px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-hairline-soft pt-3">
          <Link
            href={`/templates/${template.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-forest transition-colors hover:text-ink"
          >
            Open preview <span aria-hidden>→</span>
          </Link>
          <button
            onClick={() => onCopyHero(template)}
            className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
          >
            <Copy className="h-3 w-3" /> Copy hero
          </button>
        </div>
      </div>
    </article>
  );
}
