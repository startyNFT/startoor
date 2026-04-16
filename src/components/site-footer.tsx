import Link from "next/link";

const SECTIONS = [
  {
    heading: "Discover",
    links: [
      { href: "/browse", label: "All products" },
      { href: "/categories/starter-kits", label: "Starter kits" },
      { href: "/categories/content-tools", label: "Content tools" },
      { href: "/categories/creator-tools", label: "Creator tools" },
    ],
  },
  {
    heading: "For makers",
    links: [
      { href: "/sell", label: "Become a maker" },
      { href: "/sell/apply", label: "Apply to sell" },
      { href: "/sell#how-it-works", label: "How it works" },
    ],
  },
  {
    heading: "Startoor",
    links: [
      { href: "/about", label: "About" },
      { href: "/signin", label: "Sign in" },
      { href: "/account", label: "My orders" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-hairline bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl tracking-tight text-ink">
                Startoor
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone">
                est. 2026
              </span>
            </div>
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-ink-soft">
              A curated marketplace for AI-built apps, templates, and tools.
              Hand-picked by people who ship. Buy once. Use forever.
            </p>
            <form
              action="/api/waitlist"
              method="post"
              className="mt-8 flex max-w-sm items-stretch gap-0 border border-hairline bg-paper"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 bg-transparent px-4 py-3 font-sans text-sm placeholder:text-stone focus:outline-none"
              />
              <input type="hidden" name="source" value="footer" />
              <button
                type="submit"
                className="bg-ink px-5 font-sans text-sm text-bone transition-colors hover:bg-forest"
              >
                Notify me
              </button>
            </form>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone">
                {section.heading}
              </h4>
              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hairline-soft pt-8 text-xs md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-stone">
            © {new Date().getFullYear()} Startoor. Shipping things that work.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone">
            Curated with care · Made for people who make
          </p>
        </div>
      </div>
    </footer>
  );
}
