import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMakerBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMakerBySlug(slug);
  if (!data) return { title: "Maker not found" };
  return {
    title: data.maker.displayName,
    description: data.maker.bio ?? `Products made by ${data.maker.displayName} on Startoor.`,
  };
}

export default async function MakerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMakerBySlug(slug);
  if (!data) notFound();
  const { maker, products } = data;

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
          <div className="mt-8 grid gap-14 md:grid-cols-[auto_1fr] md:items-start md:gap-16">
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full border border-hairline bg-stone-light/30 md:h-44 md:w-44">
              {maker.avatarUrl && (
                <Image
                  src={maker.avatarUrl}
                  alt={maker.displayName}
                  fill
                  priority
                  sizes="176px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
                  Maker
                </span>
                {maker.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone">
                    ✓ Verified
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-5xl leading-[0.96] tracking-tight text-ink md:text-7xl">
                {maker.displayName}
              </h1>
              {maker.location && (
                <p className="mt-3 font-sans text-sm text-stone">
                  Based in {maker.location}
                </p>
              )}
              {maker.bio && (
                <p className="mt-8 max-w-2xl font-display text-xl leading-relaxed text-ink-soft md:text-2xl">
                  {maker.bio}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-4 font-sans text-sm">
                {maker.website && (
                  <a
                    href={maker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline underline-offset-[6px] hover:decoration-clay"
                  >
                    {maker.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {maker.twitter && (
                  <a
                    href={`https://x.com/${maker.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline underline-offset-[6px] hover:decoration-clay"
                  >
                    {maker.twitter}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Products by {maker.displayName}
          </h2>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        </div>
        {products.length === 0 ? (
          <p className="mt-10 font-sans text-ink-soft">
            No products listed yet.
          </p>
        ) : (
          <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 3} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
