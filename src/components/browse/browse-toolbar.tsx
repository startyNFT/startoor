"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

const SORTS = [
  { value: "featured", label: "Curator picks" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function BrowseToolbar({
  total,
  categories,
}: {
  total: number;
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "featured";
  const initialSearch = searchParams.get("q") ?? "";
  const [searchValue, setSearchValue] = useState(initialSearch);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchValue !== initialSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue) params.set("q", searchValue);
        else params.delete("q");
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 220);
    return () => clearTimeout(handle);
  }, [searchValue, initialSearch, pathname, router, searchParams]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="border-y border-hairline bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search products, makers, tags..."
              className="w-full border border-hairline bg-paper py-3 pl-11 pr-4 font-sans text-sm placeholder:text-stone focus:border-ink focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
              {total} {total === 1 ? "product" : "products"}
            </span>
            <div className="h-4 w-px bg-hairline" />
            <label className="flex items-center gap-2 font-sans text-sm text-ink-soft">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                Sort
              </span>
              <select
                value={activeSort}
                onChange={(e) => setParam("sort", e.target.value === "featured" ? "" : e.target.value)}
                className="border border-hairline bg-paper px-3 py-1.5 font-sans text-sm focus:border-ink focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
          <FilterPill
            active={!activeCategory}
            label="All"
            onClick={() => setParam("category", "")}
          />
          {categories.map((c) => (
            <FilterPill
              key={c.slug}
              active={activeCategory === c.slug}
              label={c.name}
              onClick={() => setParam("category", c.slug === activeCategory ? "" : c.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 font-sans text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-bone"
          : "border-hairline bg-paper text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
