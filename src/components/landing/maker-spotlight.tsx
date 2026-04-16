import Link from "next/link";
import Image from "next/image";
import { getMakerBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export async function MakerSpotlight() {
  const data = await getMakerBySlug("mina-kwon");
  if (!data) return null;
  const { maker, products } = data;
  const picks = products.slice(0, 2);

  return (
    <section className="border-t border-hairline bg-forest text-bone">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-butter">
              Maker in focus
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-bone md:text-5xl">
              {maker.displayName}
            </h2>
            <p className="mt-2 font-sans text-sm text-bone/60">
              {maker.location}
            </p>
            <p className="mt-8 max-w-md font-display text-xl leading-relaxed text-bone/90 md:text-2xl">
              &ldquo;{maker.bio}&rdquo;
            </p>
            <div className="mt-10 flex items-center gap-5">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-bone/20 bg-bone/10">
                {maker.avatarUrl && (
                  <Image
                    src={maker.avatarUrl}
                    alt={maker.displayName}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <Link
                href={`/makers/${maker.slug}`}
                className="inline-flex items-center gap-2 font-sans text-sm text-bone underline underline-offset-[6px] decoration-1 decoration-butter hover:decoration-clay"
              >
                Visit maker page →
              </Link>
            </div>
          </div>

          <div className="grid gap-10">
            {picks.map((product) => (
              <div key={product.id} className="bg-bone p-6 md:p-7">
                <ProductCard product={product} variant="compact" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
