import Link from "next/link";
import { getAllCategories } from "@/lib/queries";

const LABELS: Record<string, string> = {
  "starter-kits": "01",
  "content-tools": "02",
  "creator-tools": "03",
  productivity: "04",
  "developer-tools": "05",
  marketing: "06",
};

export async function CategoryGrid() {
  const all = await getAllCategories();
  return (
    <section className="border-t border-hairline bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
              Departments
            </span>
            <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
              Six rooms.
              <br />
              <span className="italic text-forest">Hundreds</span> of things to ship.
            </h2>
          </div>
          <p className="max-w-sm font-sans text-sm leading-relaxed text-ink-soft">
            We grow the catalog slowly and carefully — new listings ship every week
            after a hand review.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3">
          {all.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative flex min-h-[240px] flex-col justify-between bg-paper p-8 transition-colors hover:bg-warm-white"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                  № {LABELS[category.slug] ?? "--"}
                </span>
                <span className="font-mono text-xs tabular-nums text-stone">
                  {String(category.productCount).padStart(2, "0")} products
                </span>
              </div>
              <div>
                <h3 className="font-display text-3xl tracking-tight text-ink transition-colors group-hover:text-forest md:text-4xl">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
                    {category.description}
                  </p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm text-ink">
                  Browse {category.name.toLowerCase()}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
