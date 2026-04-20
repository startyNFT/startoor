"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Copy, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "startoor_template_interest_v1";

export function PreviewControls({
  slug,
  name,
  industry,
  heroSource,
  fullSource,
}: {
  slug: string;
  name: string;
  industry: string;
  heroSource: string;
  fullSource: string;
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [useOpen, setUseOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSourceOpen(false);
        setUseOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = async (text: string, note: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(note);
    } catch {
      toast.error("Clipboard blocked by browser");
    }
  };

  const saveInterest = () => {
    if (!email || !email.includes("@")) {
      toast.error("Add a valid email first");
      return;
    }
    try {
      const existing = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]",
      ) as Array<{ slug: string; email: string; at: number }>;
      existing.push({ slug, email, at: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      toast.success("We'll email you when this template is ready to fork.", {
        description: `Saved · ${name}`,
      });
      setEmail("");
      setUseOpen(false);
    } catch {
      toast.error("Couldn't save — private mode?");
    }
  };

  return (
    <>
      {/* Floating control strip */}
      <div
        className={cn(
          "fixed right-4 top-4 z-50 transition-all duration-200",
          collapsed ? "translate-x-[calc(100%-2.4rem)]" : "translate-x-0",
        )}
      >
        <div className="flex items-stretch gap-1.5 rounded-full border border-hairline bg-bone/95 p-1.5 font-sans shadow-warm-lg backdrop-blur-md">
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand controls" : "Collapse controls"}
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-paper hover:text-ink"
          >
            <span
              className={cn(
                "block h-1.5 w-1.5 rounded-full bg-clay transition-transform",
                collapsed ? "scale-125" : "scale-100",
              )}
            />
          </button>
          <Link
            href="/tools/landing-page-templates"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" />
            Templates
          </Link>
          <div className="w-px self-stretch bg-hairline" />
          <button
            onClick={() => copy(heroSource, "Hero JSX copied to clipboard")}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            <Copy className="h-3 w-3" />
            Hero JSX
          </button>
          <button
            onClick={() => setSourceOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            <Code2 className="h-3 w-3" />
            Source
          </button>
          <button
            onClick={() => setUseOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-bone transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-3 w-3" />
            Use this template
          </button>
        </div>

        {/* Floating hint tag */}
        {!collapsed && (
          <div className="mt-2 flex justify-end">
            <span className="rounded-full border border-hairline bg-paper/80 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-stone backdrop-blur">
              {industry}
            </span>
          </div>
        )}
      </div>

      {/* Source modal */}
      {sourceOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(28,28,26,0.55)" }}
          onClick={() => setSourceOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-hairline bg-bone shadow-warm-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                  Template source
                </p>
                <p className="font-display text-[20px] leading-tight">{name}</p>
              </div>
              <button
                onClick={() => setSourceOpen(false)}
                className="rounded-full p-1.5 text-stone hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[60vh] overflow-auto bg-paper/60 p-5">
              <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.65] text-ink-soft">
                {fullSource}
              </pre>
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-hairline bg-bone px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Full component lives in <code>src/lib/landing-templates.tsx</code>
              </span>
              <button
                onClick={() => copy(fullSource, "Source notes copied")}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Use-this-template modal */}
      {useOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(28,28,26,0.55)" }}
          onClick={() => setUseOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-hairline bg-bone shadow-warm-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                  Use this template
                </p>
                <p className="font-display text-[20px] leading-tight">{name}</p>
              </div>
              <button
                onClick={() => setUseOpen(false)}
                className="rounded-full p-1.5 text-stone hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="space-y-4 p-5">
              <p className="text-[14px] leading-[1.6] text-ink-soft">
                Drop your email and we'll send a fork link with the full
                template source, deployable to Vercel in one click.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-hairline bg-paper px-4 py-2.5 text-[14px] outline-none focus:border-ink"
              />
              <button
                onClick={saveInterest}
                className="w-full rounded-full bg-ink py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-bone"
              >
                Send me the fork link →
              </button>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Saved to this browser only · no spam
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
