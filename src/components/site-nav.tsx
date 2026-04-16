"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/categories/content-tools", label: "Categories" },
  { href: "/sell", label: "Sell" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300",
        scrolled
          ? "border-hairline bg-paper/85 backdrop-blur-md"
          : "border-transparent bg-paper"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-2xl leading-none tracking-tight text-ink">
            Startoor
          </span>
          <span className="mt-1 hidden font-mono text-[10px] uppercase tracking-widest text-stone md:inline">
            · est. 2026
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative font-sans text-sm tracking-tight transition-colors",
                pathname.startsWith(link.href)
                  ? "text-ink"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {link.label}
              {pathname.startsWith(link.href) && (
                <span className="absolute -bottom-[18px] left-0 right-0 h-[2px] bg-clay" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="hidden font-sans text-sm text-ink-soft transition-colors hover:text-ink md:inline"
          >
            My orders
          </Link>
          <Link
            href="/sell/apply"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-all hover:bg-forest"
          >
            <span>Become a maker</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
