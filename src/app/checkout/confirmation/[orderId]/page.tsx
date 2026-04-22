import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orders, products, makers, categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatPrice, formatDate } from "@/lib/formatters";
import { getDelivery } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Startoor order is confirmed.",
  robots: { index: false, follow: false },
};

async function getOrder(orderId: string) {
  const rows = await db
    .select({
      order: orders,
      product: products,
      maker: {
        slug: makers.slug,
        displayName: makers.displayName,
        avatarUrl: makers.avatarUrl,
      },
      category: {
        slug: categories.slug,
        name: categories.name,
      },
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(orders.id, orderId))
    .limit(1);
  return rows[0] || null;
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const data = await getOrder(orderId);
  if (!data || !data.product) notFound();
  const { order, product, maker, category } = data;
  const delivery = getDelivery(product.slug);

  return (
    <div className="relative border-t border-hairline">
      <div className="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-3 border border-hairline bg-bone px-4 py-2">
            <span className="inline-block h-2 w-2 rounded-full bg-forest" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
              Order confirmed · Demo mode
            </span>
          </div>
          <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
            Thank you, <span className="italic text-forest">{order.buyerName.split(" ")[0]}</span>.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
            We&apos;ve saved your order. A confirmation email is on its way to{" "}
            <span className="text-ink">{order.email}</span>. Since Startoor is in
            preview, no payment was captured — you&apos;ll be first in line when
            live checkout opens.
          </p>
        </div>

        {/* Receipt */}
        <div className="mt-16 border border-hairline bg-bone">
          <div className="flex items-center justify-between border-b border-hairline px-7 py-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Receipt
              </span>
              <p className="mt-1 font-display text-xl tracking-tight text-ink tabular-nums">
                {order.orderNumber}
              </p>
            </div>
            <p className="font-mono text-xs text-stone">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="grid gap-8 px-7 py-7 md:grid-cols-[auto_1fr]">
            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden border border-hairline bg-stone-light/30 md:h-36 md:w-36">
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              {category && (
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                  {category.name}
                </span>
              )}
              <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight text-ink">
                {product.title}
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft">
                {product.tagline}
              </p>
              {maker && (
                <p className="mt-3 font-sans text-xs text-stone">
                  by{" "}
                  <Link href={`/makers/${maker.slug}`} className="underline">
                    {maker.displayName}
                  </Link>
                </p>
              )}

              <div className="mt-6 flex items-baseline justify-between border-t border-hairline pt-4">
                <span className="font-sans text-sm text-ink-soft">
                  Amount held (not charged)
                </span>
                <span className="font-display text-2xl tracking-tight text-ink tabular-nums">
                  {formatPrice(order.amountCents)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What you're receiving */}
        {delivery && (
          <section className="mt-16 border border-hairline bg-bone p-7 md:p-9">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              What you&apos;re receiving
            </span>
            <p className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {delivery.label}
            </p>
            <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-ink-soft">
              {delivery.summary}
            </p>
            <ul className="mt-7 grid gap-4 md:grid-cols-2">
              {delivery.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 border-t border-hairline-soft pt-4"
                >
                  <span className="font-mono text-xs tabular-nums text-stone">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-sm leading-relaxed text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-hairline pt-5 font-sans text-sm leading-relaxed text-ink-soft">
              {delivery.afterPurchase}
            </p>
          </section>
        )}

        {/* What's next */}
        <section className="mt-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
            What happens next
          </span>
          <div className="mt-6 grid gap-10 md:grid-cols-3">
            <Step
              n="01"
              title="Check your inbox"
              body={`Confirmation email sent to ${order.email}. It includes your order number and receipt.`}
            />
            <Step
              n="02"
              title="We open live checkout"
              body="When payments go live, you get first access and the preview price — even if we've raised rates."
            />
            <Step
              n="03"
              title={
                delivery?.type === "repo"
                  ? "Repo invite + ZIP"
                  : delivery?.type === "hosted"
                    ? "Start using it"
                    : "Instant download"
              }
              body={
                delivery?.type === "repo"
                  ? "Once live, you get a GitHub invite and ZIP link in the order email. MIT licensed."
                  : delivery?.type === "hosted"
                    ? "Once live, you'll use it right here on Startoor with your email. Data is yours to export."
                    : delivery?.type === "download"
                      ? "Once live, download link lands in your email. CSV, Notion, and PDF where applicable."
                      : "Once live, download is instant and you'll have a direct line to the maker."
              }
            />
          </div>
        </section>

        <div className="mt-16 flex flex-wrap gap-4">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
          >
            Keep browsing →
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            Back to {product.title}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <span className="font-display text-4xl leading-none tracking-tight text-clay">
        {n}
      </span>
      <h3 className="mt-4 font-display text-xl tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
        {body}
      </p>
    </div>
  );
}
