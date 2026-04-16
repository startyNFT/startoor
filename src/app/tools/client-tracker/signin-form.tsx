"use client";

import { useActionState } from "react";
import { setAccountEmailForTracker } from "./actions";

export function SignInForm() {
  const [state, action, pending] = useActionState(setAccountEmailForTracker, {} as { error?: string });
  return (
    <form action={action} className="max-w-md space-y-5">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="you@domain.com"
          className="mt-2 w-full border-b border-hairline bg-transparent py-3 font-sans text-base text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
        />
        {state?.error && (
          <span className="mt-2 inline-block font-sans text-xs text-clay">
            {state.error}
          </span>
        )}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:opacity-60"
      >
        {pending ? "Setting up…" : "Open tracker"}
        {!pending && <span className="transition-transform group-hover:translate-x-0.5">→</span>}
      </button>
    </form>
  );
}
