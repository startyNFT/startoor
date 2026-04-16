import Link from "next/link";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="sticky top-16 z-30 border-y border-hairline bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 md:px-10">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone transition-colors hover:text-ink"
          >
            <span>←</span>
            <span>Back to catalog</span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-bone px-3 py-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-clay" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
              Live demo · preview mode
            </span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
