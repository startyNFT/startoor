"use client";

import { useActionState } from "react";
import { submitOrder, type OrderState } from "../actions";

const initialState: OrderState = {};

export function CheckoutForm({ productSlug }: { productSlug: string }) {
  const [state, formAction, pending] = useActionState(submitOrder, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="productSlug" value={productSlug} />

      <section>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-clay">
          01 · Your details
        </h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Full name" name="buyerName" type="text" autoComplete="name" error={state.errors?.buyerName?.[0]} required />
          <Field label="Email" name="email" type="email" autoComplete="email" error={state.errors?.email?.[0]} required />
        </div>
      </section>

      <section>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-clay">
          02 · Payment
        </h3>
        <p className="mt-1 font-sans text-xs text-stone">
          Startoor is in preview — no charge will be made. Form data is saved so we can follow up.
        </p>
        <div className="mt-5 space-y-5">
          <Field
            label="Card number"
            name="cardNumber"
            type="text"
            placeholder="4242 4242 4242 4242"
            autoComplete="cc-number"
            error={state.errors?.cardNumber?.[0]}
            required
            inputMode="numeric"
          />
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Expiry (MM/YY)"
              name="cardExp"
              type="text"
              placeholder="04 / 30"
              autoComplete="cc-exp"
              error={state.errors?.cardExp?.[0]}
              required
            />
            <Field
              label="CVC"
              name="cardCvc"
              type="text"
              placeholder="123"
              autoComplete="cc-csc"
              error={state.errors?.cardCvc?.[0]}
              required
              inputMode="numeric"
            />
          </div>
        </div>
      </section>

      {state.message && (
        <p className="font-sans text-sm text-clay">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 font-sans text-sm text-bone transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {pending ? "Placing order…" : "Place order"}
        {!pending && <span className="transition-transform group-hover:translate-x-0.5">→</span>}
      </button>
      <p className="mt-3 font-sans text-xs text-stone">
        By placing this order you agree to Startoor&apos;s preview terms. Refunds in 14 days once live payments open.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  error,
  required,
  inputMode,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "decimal" | "email";
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        className={`mt-2 w-full border-b bg-transparent py-3 font-sans text-base text-ink placeholder:text-stone-light focus:outline-none ${
          error ? "border-clay" : "border-hairline focus:border-ink"
        }`}
      />
      {error && (
        <span className="mt-1.5 inline-block font-sans text-xs text-clay">
          {error}
        </span>
      )}
    </label>
  );
}
