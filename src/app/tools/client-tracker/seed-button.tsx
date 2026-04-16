"use client";

import { useTransition } from "react";
import { seedSampleClients } from "./actions";

export function SeedButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => seedSampleClients())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
    >
      {pending ? "Loading..." : "Seed sample clients"}
    </button>
  );
}
