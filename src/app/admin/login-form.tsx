"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as { error?: string });
  return (
    <form action={action} className="mt-10 space-y-5">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Password
        </span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="mt-2 w-full border-b border-hairline bg-transparent py-3 font-sans text-base text-ink focus:border-ink focus:outline-none"
        />
        {state?.error && (
          <span className="mt-2 inline-block font-sans text-xs text-clay">{state.error}</span>
        )}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
