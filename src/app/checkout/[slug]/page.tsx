import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { formatPrice } from "@/lib/formatters";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Startoor order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();
  const { product, maker, category } = data;

  const isFree = product.priceCents === 0;
  const fees = isFree ? 0 : Math.round(product.priceCents * 0.029 + 30);
  const total = product.priceCents + fees;

  return (
    <div className="border-t border-hairline">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
        {/* Left: form */}
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone hover:text-ink"
          >
            ← Back to product
          </Link>
          <span className="mt-8 block font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
            Checkout
          </span>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl">
            One-time purchase.
          </h1>
          <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-ink-soft">
            Fill the form, place the order. You&apos;ll get a confirmation email
            and instant access when Startoor goes live.
          </p>

          <div className="mt-12">
            <CheckoutForm productSlug={product.slug} />
          </div>
        </div>

        {/* Right: order summary (sticky on desktop) */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="border border-hairline bg-bone">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-light/30">
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 540px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-7">
              {category && (
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                  {category.name}
                </span>
              )}
              <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight text-ink">
                {product.title}
              </h2>
              <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                {product.tagline}
              </p>
              {maker && (
                <p className="mt-4 font-sans text-xs text-stone">
                  by {maker.displayName}
                </p>
              )}

              <div className="mt-6 space-y-3 border-t border-hairline pt-6 font-sans text-sm">
                <Row label="Product" value={formatPrice(product.priceCents)} />
                <Row
                  label="Processing (simulated)"
                  value={formatPrice(fees)}
                  muted
                />
                <Row
                  label="Total"
                  value={formatPrice(total)}
                  bold
                  className="border-t border-hairline pt-4"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 border border-hairline-soft bg-paper p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Demo mode
            </span>
            <p className="mt-2 font-sans text-xs leading-relaxed text-ink-soft">
              Startoor is in preview. Orders are saved and confirmation emails
              sent, but no payment is captured. You&apos;ll be first in line
              when live checkout opens.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
  className = "",
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className={muted ? "text-stone" : "text-ink-soft"}>{label}</span>
      <span
        className={`font-mono tabular-nums ${bold ? "text-ink text-base" : muted ? "text-stone" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
