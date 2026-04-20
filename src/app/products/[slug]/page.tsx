import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/formatters";
import { StarRating } from "@/components/star-rating";
import { ProductCard } from "@/components/product-card";

const DEMO_URLS: Record<string, string> = {
  "invoice-maker": "/tools/invoice-maker",
  "link-in-bio-maker": "/tools/link-in-bio",
  "client-tracker": "/tools/client-tracker",
  "seo-roi-calculator": "/tools/seo-roi-calculator",
  "hook-library": "/tools/hook-library",
  "portfolio-builder": "/tools/portfolio-builder",
  "content-calendar-kit": "/tools/content-calendar",
  "ad-copy-swipe-file": "/tools/ad-copy-swipe-file",
  "chatbot-ui-kit": "/tools/chatbot-ui",
  "api-playground": "/tools/api-playground",
  "campaign-dashboard": "/tools/campaign-dashboard",
  "landing-page-templates": "/tools/landing-page-templates",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return { title: "Product not found" };
  return {
    title: data.product.title,
    description: data.product.tagline,
    openGraph: {
      title: data.product.title,
      description: data.product.tagline,
      images: [data.product.coverImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  const { product, category, maker } = data;

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id),
    category ? getRelatedProducts(product.id, category.id, 3) : Promise.resolve([]),
  ]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <article>
      {/* Breadcrumbs */}
      <div className="border-b border-hairline">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-stone md:px-10">
          <Link href="/browse" className="hover:text-ink">
            Catalog
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link
                href={`/categories/${category.slug}`}
                className="hover:text-ink"
              >
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate text-ink">{product.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-20">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-light/30">
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                priority
                sizes="(min-width: 1280px) 720px, 100vw"
                className="object-cover"
              />
              {product.featured && (
                <div className="absolute left-5 top-5 border border-ink bg-paper px-3 py-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
                    ✦ Curator pick
                  </span>
                </div>
              )}
            </div>
            {product.previewImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {product.previewImages.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] overflow-hidden bg-stone-light/30"
                  >
                    <Image
                      src={img}
                      alt={`${product.title} preview ${idx + 1}`}
                      fill
                      sizes="(min-width: 1280px) 240px, 30vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta panel */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              {category && (
                <Link
                  href={`/categories/${category.slug}`}
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-clay hover:text-ink"
                >
                  {category.name}
                </Link>
              )}
              {avgRating !== null && (
                <>
                  <span className="h-[1px] w-6 bg-hairline" />
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(avgRating)} size="sm" />
                    <span className="font-mono text-xs tabular-nums text-stone">
                      {avgRating.toFixed(1)} · {reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <h1 className="mt-6 font-display text-5xl leading-[0.96] tracking-tight text-ink md:text-6xl">
              {product.title}
            </h1>
            <p className="mt-6 max-w-lg font-display text-xl leading-relaxed text-ink-soft md:text-2xl">
              {product.tagline}
            </p>

            <div className="mt-10 flex items-end justify-between gap-6 border-t border-hairline pt-8">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  One-time
                </span>
                <div className="mt-2 font-display text-5xl leading-none tracking-tight text-ink tabular-nums">
                  {formatPrice(product.priceCents)}
                </div>
              </div>
              <Link
                href={`/checkout/${product.slug}`}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 font-sans text-sm text-bone transition-colors hover:bg-forest"
              >
                Buy now
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            {DEMO_URLS[product.slug] && (
              <Link
                href={DEMO_URLS[product.slug]}
                className="group mt-4 inline-flex items-center justify-between gap-3 border border-hairline bg-bone px-5 py-3 font-sans text-sm text-ink transition-colors hover:border-ink"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-clay animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">
                    Live demo
                  </span>
                  <span className="text-ink-soft">
                    Try it before you buy →
                  </span>
                </span>
              </Link>
            )}

            <p className="mt-4 font-sans text-xs leading-relaxed text-stone">
              Instant download · Year of updates · Support from the maker ·{" "}
              <span className="text-ink-soft">14-day refund if it&apos;s not a fit</span>
            </p>

            {/* Maker */}
            {maker && (
              <Link
                href={`/makers/${maker.slug}`}
                className="mt-8 flex items-center gap-4 border border-hairline bg-bone p-5 transition-colors hover:border-ink"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-stone-light/30">
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                      Maker
                    </span>
                    {maker.verified && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-clay">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-display text-lg leading-tight tracking-tight text-ink">
                    {maker.displayName}
                  </p>
                  <p className="font-sans text-xs text-ink-soft">
                    {maker.location}
                  </p>
                </div>
                <span className="font-mono text-sm text-ink-soft group-hover:text-ink">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Description + features */}
      <section className="border-t border-hairline">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              About
            </span>
            <div className="mt-6 space-y-6 font-display text-xl leading-relaxed text-ink md:text-2xl">
              <p>{product.description}</p>
              {product.longDescription && (
                <p className="font-sans text-base leading-relaxed text-ink-soft md:text-lg">
                  {product.longDescription}
                </p>
              )}
            </div>

            {product.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-hairline bg-bone px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              What you get
            </span>
            <ul className="mt-6 space-y-5">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex gap-4 border-t border-hairline-soft pt-5 first:border-t-0 first:pt-0">
                  <span className="font-mono text-xs tabular-nums text-stone">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-base leading-relaxed text-ink">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Demo outputs (AI products) */}
      {product.demoOutputs && product.demoOutputs.length > 0 && (
        <section className="border-t border-hairline bg-bone">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
                  Sample output
                </span>
                <h2 className="mt-4 font-display text-4xl tracking-tight text-ink md:text-5xl">
                  What it ships.
                </h2>
              </div>
              <p className="max-w-sm font-sans text-sm text-ink-soft">
                Pre-generated examples from real runs — not cherry-picked marketing.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {product.demoOutputs.map((output, idx) => (
                <div
                  key={idx}
                  className="border border-hairline bg-paper p-7"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                    Output {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-xl tracking-tight text-ink">
                    {output.title}
                  </h3>
                  <pre className="mt-5 whitespace-pre-wrap border-t border-hairline-soft pt-5 font-sans text-sm leading-relaxed text-ink-soft">
                    {output.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
                  Reviews
                </span>
                <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
                  From people<br />who shipped with it.
                </h2>
                {avgRating !== null && (
                  <div className="mt-8 border-t border-hairline pt-6">
                    <StarRating rating={Math.round(avgRating)} size="lg" />
                    <p className="mt-3 font-display text-3xl tracking-tight text-ink tabular-nums">
                      {avgRating.toFixed(1)}
                      <span className="ml-2 font-sans text-sm text-stone">
                        / 5.0
                      </span>
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-stone">
                      {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="border border-hairline bg-bone p-6"
                  >
                    <div className="flex items-center justify-between">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="font-mono text-[10px] tabular-nums text-stone">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="mt-4 font-display text-lg leading-relaxed text-ink">
                      &ldquo;{review.content}&rdquo;
                    </p>
                    <p className="mt-4 font-sans text-sm text-ink-soft">
                      — {review.reviewerName}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-hairline bg-bone">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
                More from {category?.name ?? "this category"}
              </h2>
              {category && (
                <Link
                  href={`/categories/${category.slug}`}
                  className="font-sans text-sm text-ink underline underline-offset-[6px] hover:decoration-clay"
                >
                  See all →
                </Link>
              )}
            </div>
            <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
