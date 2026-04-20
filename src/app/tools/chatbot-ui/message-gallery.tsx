"use client";

import { cn } from "@/lib/cn";
import { ThumbsUp, ThumbsDown, ExternalLink, AlertTriangle, Wrench } from "lucide-react";

/**
 * Static gallery of every message sub-type the kit supports.
 * These render in the outer warm-editorial chrome, not inside the theme preview —
 * the point is to show developers the full inventory at a glance.
 */
export function MessageGallery() {
  return (
    <section className="mt-20 border-t border-hairline pt-12">
      <div className="mb-8 flex items-baseline justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            § 03 · Components
          </span>
          <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
            Every message type, one page.
          </h2>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:inline">
          Warm editorial — 10 examples
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <GalleryCard label="Text">
          <div className="rounded-2xl rounded-bl-md border border-hairline bg-bone px-4 py-2.5 text-[15px] leading-relaxed text-ink">
            Totally — pulling up your order now.
          </div>
        </GalleryCard>

        <GalleryCard label="Markdown">
          <div className="rounded-2xl rounded-bl-md border border-hairline bg-bone px-4 py-2.5 text-[15px] leading-relaxed text-ink">
            <p>
              Sure — here are the <strong>three</strong> usual suspects:
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>
                Bold for <strong>emphasis</strong>
              </li>
              <li>
                Inline <code className="rounded bg-black/5 px-1 font-mono text-[0.9em]">code</code>
              </li>
              <li>
                Italics for <em>nuance</em>
              </li>
            </ul>
          </div>
        </GalleryCard>

        <GalleryCard label="Code block">
          <div className="overflow-hidden rounded-lg border border-hairline bg-white">
            <div className="flex items-center justify-between border-b border-hairline px-3 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                typescript
              </span>
              <span className="font-mono text-[10px] text-stone-light">copy</span>
            </div>
            <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink">
              <code>
                <span style={{ color: "#C85A3F" }}>const</span> ok ={" "}
                <span style={{ color: "#8BA374" }}>&quot;fine&quot;</span>;
              </code>
            </pre>
          </div>
        </GalleryCard>

        <GalleryCard label="Image">
          <div className="overflow-hidden rounded-2xl rounded-bl-md border border-hairline bg-bone">
            <div
              className="h-32 w-full"
              style={{
                background:
                  "linear-gradient(135deg, #E8C77F 0%, #C85A3F 45%, #1F3A2F 100%)",
              }}
            />
            <div className="px-4 py-2 text-[13px] text-ink-soft">
              sunset_over_lisboa.jpg · 420 KB
            </div>
          </div>
        </GalleryCard>

        <GalleryCard label="Link card">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="group block overflow-hidden rounded-lg border border-hairline bg-white transition-colors hover:border-ink"
          >
            <div className="flex items-start gap-3 p-3">
              <div
                className="h-10 w-10 shrink-0 rounded"
                style={{ background: "#1F3A2F" }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-sm font-medium text-ink">
                  The world&apos;s oldest bookshop — Bertrand
                </div>
                <div className="truncate font-sans text-xs text-stone">
                  bertrand.pt · Livraria
                </div>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone group-hover:text-ink" />
            </div>
          </a>
        </GalleryCard>

        <GalleryCard label="Suggestion chips">
          <div className="flex flex-wrap gap-2">
            {["Refund it", "Check status", "Change address", "Talk to human"].map((t) => (
              <button
                key={t}
                className="rounded-full border border-hairline bg-bone px-3 py-1.5 font-sans text-[13px] text-ink transition-colors hover:border-ink hover:bg-white"
              >
                {t}
              </button>
            ))}
          </div>
        </GalleryCard>

        <GalleryCard label="Feedback">
          <div className="flex items-center justify-between rounded-2xl border border-hairline bg-bone px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Was this helpful?
            </span>
            <div className="flex items-center gap-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-stone transition-colors hover:border-forest hover:text-forest">
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-stone transition-colors hover:border-clay hover:text-clay">
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </GalleryCard>

        <GalleryCard label="Typing indicator">
          <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-hairline bg-bone px-4 py-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-1.5 w-1.5 rounded-full bg-stone"
                style={{
                  animation: `cbui-dot 1.1s ease-in-out ${i * 140}ms infinite`,
                }}
              />
            ))}
          </div>
        </GalleryCard>

        <GalleryCard label="Error state">
          <div
            className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[14px] leading-relaxed"
            style={{ borderColor: "#C85A3F33", background: "#C85A3F0A", color: "#7a2e1d" }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#C85A3F" }} />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Error</div>
              <div className="mt-0.5">Couldn&apos;t reach the model. Retry in a moment.</div>
            </div>
          </div>
        </GalleryCard>

        <GalleryCard label="Tool running">
          <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-bone px-3 py-2.5 text-[14px] text-ink-soft">
            <Wrench className="h-3.5 w-3.5 shrink-0 animate-pulse text-clay" />
            <span className="font-mono text-[12px]">
              running <span className="text-ink">search_inbox</span>
              <span className="ml-1 inline-flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-1 w-1 rounded-full bg-stone"
                    style={{
                      animation: `cbui-dot 1.1s ease-in-out ${i * 140}ms infinite`,
                    }}
                  />
                ))}
              </span>
            </span>
          </div>
        </GalleryCard>
      </div>
    </section>
  );
}

function GalleryCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative rounded-xl border border-hairline bg-warm-white p-5 transition-colors hover:border-ink",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
          {label}
        </span>
        <span className="font-mono text-[10px] text-stone-light">▸</span>
      </div>
      <div>{children}</div>
    </article>
  );
}
