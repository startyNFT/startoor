import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { ProductListItem } from "@/lib/queries";

type Variant = "default" | "large" | "compact";

export function ProductCard({
  product,
  variant = "default",
  priority = false,
}: {
  product: ProductListItem;
  variant?: Variant;
  priority?: boolean;
}) {
  if (variant === "large") {
    return <LargeCard product={product} priority={priority} />;
  }
  if (variant === "compact") {
    return <CompactCard product={product} priority={priority} />;
  }
  return <DefaultCard product={product} priority={priority} />;
}

function DefaultCard({ product, priority }: { product: ProductListItem; priority?: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block focus-visible:outline-none"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-light/30">
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 33vw, 90vw"
            className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.03]"
          />
          {product.featured && (
            <div className="absolute left-3 top-3 border border-ink bg-paper px-2 py-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink">
                ✦ Curator pick
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            {product.category && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                {product.category.name}
              </span>
            )}
            <span className="font-mono text-sm tabular-nums text-ink">
              {formatPrice(product.priceCents)}
            </span>
          </div>
          <h3 className="mt-2 font-display text-[22px] leading-[1.1] tracking-tight text-ink transition-colors group-hover:text-forest">
            {product.title}
          </h3>
          <p className="mt-2 line-clamp-2 font-sans text-sm leading-snug text-ink-soft">
            {product.tagline}
          </p>
          {product.maker && (
            <p className="mt-4 font-sans text-xs text-stone">
              by{" "}
              <span className="text-ink-soft underline-offset-2 group-hover:underline">
                {product.maker.displayName}
              </span>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function LargeCard({ product, priority }: { product: ProductListItem; priority?: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block focus-visible:outline-none"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-light/30">
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 720px, 100vw"
            className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.02]"
          />
          {product.featured && (
            <div className="absolute left-5 top-5 border border-ink bg-paper px-3 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
                ✦ Curator pick
              </span>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            {product.category && (
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                {product.category.name}
              </span>
            )}
            <span className="font-mono text-base tabular-nums text-ink">
              {formatPrice(product.priceCents)}
            </span>
          </div>
          <h3 className="mt-3 font-display text-4xl leading-[0.96] tracking-tight text-ink transition-colors group-hover:text-forest md:text-5xl">
            {product.title}
          </h3>
          <p className="mt-4 max-w-md font-sans text-base leading-relaxed text-ink-soft">
            {product.tagline}
          </p>
          {product.maker && (
            <p className="mt-5 font-sans text-sm text-stone">
              by{" "}
              <span className="text-ink-soft underline-offset-2 group-hover:underline">
                {product.maker.displayName}
              </span>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function CompactCard({ product, priority }: { product: ProductListItem; priority?: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex gap-4 focus-visible:outline-none"
    >
      <div className="relative aspect-square h-28 w-28 flex-shrink-0 overflow-hidden bg-stone-light/30">
        <Image
          src={product.coverImage}
          alt={product.title}
          fill
          priority={priority}
          sizes="112px"
          className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center">
        {product.category && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
            {product.category.name}
          </span>
        )}
        <h4 className="mt-1 font-display text-lg leading-tight tracking-tight text-ink transition-colors group-hover:text-forest">
          {product.title}
        </h4>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-ink">
            {formatPrice(product.priceCents)}
          </span>
          {product.maker && (
            <span className="font-sans text-xs text-stone">
              by {product.maker.displayName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ variant = "default" }: { variant?: Variant } = {}) {
  const aspect = variant === "large" ? "aspect-[16/10]" : "aspect-[4/3]";
  return (
    <div className="flex flex-col">
      <div className={cn("w-full animate-pulse bg-stone-light/30", aspect)} />
      <div className="mt-5 h-4 w-24 animate-pulse bg-stone-light/30" />
      <div className="mt-3 h-6 w-full animate-pulse bg-stone-light/30" />
      <div className="mt-2 h-4 w-3/4 animate-pulse bg-stone-light/30" />
    </div>
  );
}
