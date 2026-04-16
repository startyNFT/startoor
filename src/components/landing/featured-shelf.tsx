import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/queries";

export async function FeaturedShelf() {
  const featured = await getFeaturedProducts(4);
  if (featured.length === 0) return null;

  const [hero, ...rest] = featured;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
            ✦ Curator picks · April
          </span>
          <h2 className="mt-4 font-display text-4xl tracking-tight text-ink md:text-5xl">
            What we&apos;re loving right now.
          </h2>
        </div>
        <Link
          href="/browse"
          className="font-sans text-sm text-ink underline underline-offset-[6px] decoration-1 hover:decoration-clay"
        >
          View all →
        </Link>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-x-14 md:gap-y-20">
        <div className="md:row-span-2">
          {hero && <ProductCard product={hero} variant="large" priority />}
        </div>
        <div className="grid gap-10">
          {rest.slice(0, 2).map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              priority={idx === 0}
            />
          ))}
        </div>
        {rest[2] && (
          <div className="md:col-start-2">
            <ProductCard product={rest[2]} variant="default" />
          </div>
        )}
      </div>
    </section>
  );
}
