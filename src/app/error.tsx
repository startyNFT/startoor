"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-6 py-20 md:px-10">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
        Something broke
      </span>
      <h1 className="mt-6 font-display text-6xl leading-[0.92] tracking-tight text-ink md:text-8xl">
        Pardon the <span className="italic text-forest">mess.</span>
      </h1>
      <p className="mt-8 max-w-lg font-sans text-base leading-relaxed text-ink-soft">
        We hit an unexpected error. Our team has been notified. You can retry
        or head back to the catalog.
      </p>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-stone">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
        >
          Retry
          <span className="transition-transform group-hover:translate-x-0.5">↻</span>
        </button>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
        >
          Browse catalog
        </Link>
      </div>
    </div>
  );
}
