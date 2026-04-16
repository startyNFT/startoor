import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { browseProducts, getAllCategories, getCategoryBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name}`,
    description:
      category.description ||
      `Hand-curated ${category.name.toLowerCase()} on Startoor.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [{ products }, otherCategories] = await Promise.all([
    browseProducts({ category: slug, limit: 60 }),
    getAllCategories(),
  ]);

  return (
    <>
      <header className="border-b border-hairline bg-bone">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <Link
            href="/browse"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone hover:text-ink"
          >
            ← Catalog
          </Link>
          <div className="mt-6 grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
                Department
              </span>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
                {category.name}.
              </h1>
            </div>
            {category.description && (
              <p className="max-w-md font-sans text-lg leading-relaxed text-ink-soft">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="border-b border-hairline">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-4 no-scrollbar md:px-10">
          {otherCategories.map((c) => {
            const active = c.slug === slug;
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 font-sans text-sm transition-colors ${
                  active
                    ? "border-ink bg-ink text-bone"
                    : "border-hairline bg-paper text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {c.name}
                <span className="ml-2 font-mono text-[10px] tabular-nums opacity-60">
                  {c.productCount}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        {products.length === 0 ? (
          <p className="font-sans text-ink-soft">
            No products in this department yet. Check back next week.
          </p>
        ) : (
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 3} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
