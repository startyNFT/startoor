import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterApp } from "./newsletter-app";

export const metadata: Metadata = {
  title: "Newsletter Starter · Try the demo",
  description:
    "A fully-working newsletter site filled with sample issues. Editorial typography, an archive, a reader, and a subscribe flow — deployable in a weekend.",
};

type PageProps = {
  // Next 16: searchParams is a Promise that must be awaited.
  searchParams: Promise<{ view?: string; id?: string }>;
};

export default async function NewsletterDemoPage({ searchParams }: PageProps) {
  // Await once on the server so the URL is legal; client reads via useSearchParams.
  await searchParams;

  return (
    <div className="relative bg-paper">
      <Suspense fallback={<BootFallback />}>
        <NewsletterApp />
      </Suspense>
    </div>
  );
}

function BootFallback() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center px-6 py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone">
        Setting the type…
      </p>
    </div>
  );
}
