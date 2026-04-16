import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { BrowseToolbar } from "@/components/browse/browse-toolbar";
import { browseProducts, getAllCategories } from "@/lib/queries";
import type { BrowseFilters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Browse the catalog",
  description:
    "Every product on Startoor — curated AI-built apps, templates, and tools. Search, filter, and find what you need.",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: BrowseFilters["sort"];
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 24;
  const filters: BrowseFilters = {
    search: params.q,
    category: params.category,
    sort: params.sort,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
  const [{ products, total }, cats] = await Promise.all([
    browseProducts(filters),
    getAllCategories(),
  ]);

  return (
    <>
      <header className="border-b border-hairline">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
            The catalog
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
            Browse everything.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
            Every product is hand-picked, tested end-to-end, and shipped by a
            maker who uses it daily.
          </p>
        </div>
      </header>

      <BrowseToolbar total={total} categories={cats.map((c) => ({ slug: c.slug, name: c.name }))} />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 3} />
            ))}
          </div>
        )}
        {total > pageSize && (
          <Pagination total={total} pageSize={pageSize} currentPage={page} params={params} />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
        Nothing to show
      </span>
      <h2 className="mt-4 font-display text-3xl tracking-tight text-ink">
        No matches yet.
      </h2>
      <p className="mt-4 font-sans text-sm text-ink-soft">
        Try a broader search, or{" "}
        <Link href="/browse" className="underline underline-offset-4">
          reset the filters
        </Link>
        .
      </p>
    </div>
  );
}

function Pagination({
  total,
  pageSize,
  currentPage,
  params,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.ceil(total / pageSize);
  const buildHref = (page: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.sort) sp.set("sort", params.sort);
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return qs ? `/browse?${qs}` : "/browse";
  };
  return (
    <nav className="mt-20 flex items-center justify-center gap-1">
      {Array.from({ length: pages }).map((_, i) => {
        const pageNum = i + 1;
        const isActive = pageNum === currentPage;
        return (
          <Link
            key={pageNum}
            href={buildHref(pageNum)}
            className={`flex h-10 w-10 items-center justify-center font-mono text-sm tabular-nums transition-colors ${
              isActive
                ? "bg-ink text-bone"
                : "border border-hairline bg-paper text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {pageNum}
          </Link>
        );
      })}
    </nav>
  );
}
