import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { orders, products, categories, makers } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { formatPrice, formatDate } from "@/lib/formatters";
import { getAccountEmail, clearAccountEmail } from "./actions";
import { SignInForm } from "./account-forms";

export const metadata: Metadata = {
  title: "My orders",
  description: "Review your Startoor orders.",
  robots: { index: false, follow: false },
};

async function getOrdersByEmail(email: string) {
  return await db
    .select({
      order: orders,
      product: products,
      category: {
        slug: categories.slug,
        name: categories.name,
      },
      maker: {
        slug: makers.slug,
        displayName: makers.displayName,
      },
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .where(eq(orders.email, email))
    .orderBy(desc(orders.createdAt));
}

export default async function AccountPage() {
  const email = await getAccountEmail();

  if (!email) {
    return (
      <div className="border-t border-hairline">
        <div className="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
            My orders
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
            Look up your orders.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
            Enter the email you used at checkout. We&apos;ll show every order
            you&apos;ve placed. No password — we&apos;ll switch to magic links
            when live checkout opens.
          </p>
          <SignInForm />
        </div>
      </div>
    );
  }

  const records = await getOrdersByEmail(email);

  return (
    <div className="border-t border-hairline">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-clay">
              My orders
            </span>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl">
              Hi, <span className="italic text-forest">{email}</span>.
            </h1>
            <p className="mt-4 font-sans text-sm text-ink-soft">
              {records.length === 0
                ? "No orders yet. Browse the catalog to get started."
                : `${records.length} ${records.length === 1 ? "order" : "orders"} on file.`}
            </p>
          </div>
          <form action={clearAccountEmail}>
            <button
              type="submit"
              className="font-sans text-sm text-ink-soft underline underline-offset-[6px] hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>

        {records.length === 0 ? (
          <div className="mt-16 border border-hairline bg-bone p-12 text-center">
            <p className="font-display text-2xl tracking-tight text-ink">
              You haven&apos;t ordered anything yet.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              Browse catalog →
            </Link>
          </div>
        ) : (
          <ul className="mt-16 space-y-5">
            {records.map((record) => {
              if (!record.product) return null;
              return (
                <li
                  key={record.order.id}
                  className="grid gap-6 border border-hairline bg-bone p-6 md:grid-cols-[auto_1fr_auto] md:items-center"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-stone-light/30">
                    <Image
                      src={record.product.coverImage}
                      alt={record.product.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    {record.category && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                        {record.category.name}
                      </span>
                    )}
                    <h3 className="mt-1 font-display text-xl leading-tight tracking-tight text-ink">
                      <Link
                        href={`/products/${record.product.slug}`}
                        className="hover:text-forest"
                      >
                        {record.product.title}
                      </Link>
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs tabular-nums text-stone">
                      <span>{record.order.orderNumber}</span>
                      <span>·</span>
                      <span>{formatDate(record.order.createdAt)}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-2.5 py-0.5 text-clay">
                        <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                        {record.order.status === "demo_mode"
                          ? "Demo mode"
                          : record.order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-end gap-4 md:flex-col md:items-end">
                    <span className="font-display text-2xl tracking-tight text-ink tabular-nums">
                      {formatPrice(record.order.amountCents)}
                    </span>
                    <Link
                      href={`/checkout/confirmation/${record.order.id}`}
                      className="font-sans text-xs text-ink-soft underline underline-offset-[5px] hover:text-ink"
                    >
                      View receipt →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
