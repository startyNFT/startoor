"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/formatters";

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type Invoice = {
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  from: { name: string; email: string; address: string; website: string };
  to: { name: string; email: string; address: string };
  items: LineItem[];
  taxPercent: number;
  discountPercent: number;
  notes: string;
  paymentInstructions: string;
  accent: string;
};

const STORAGE_KEY = "startoor_invoice_draft_v1";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "SGD", "CHF"];
const ACCENTS = [
  { value: "#1F3A2F", label: "Forest" },
  { value: "#C85A3F", label: "Clay" },
  { value: "#1C1C1A", label: "Ink" },
  { value: "#9D7B4F", label: "Oak" },
  { value: "#3B5D7E", label: "Indigo" },
];

const DEFAULTS: Invoice = {
  number: "INV-0001",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  currency: "USD",
  from: {
    name: "Studio Romano",
    email: "hello@studio.romano",
    address: "Via Brera 12\n20121 Milano\nItalia",
    website: "studio.romano",
  },
  to: {
    name: "Acme Corp",
    email: "ap@acme.com",
    address: "500 Howard St, Suite 300\nSan Francisco, CA 94105",
  },
  items: [
    {
      id: "i1",
      description: "Brand identity system — primary direction",
      quantity: 1,
      rate: 3200,
    },
    {
      id: "i2",
      description: "Logo variants & usage guide",
      quantity: 1,
      rate: 1400,
    },
    {
      id: "i3",
      description: "Type system + color tokens",
      quantity: 1,
      rate: 900,
    },
  ],
  taxPercent: 8.875,
  discountPercent: 0,
  notes:
    "Thank you for the work. Full license transfer on payment. I'm around any time with questions.",
  paymentInstructions:
    "Bank: Starling Bank\nAccount: 12 34 56 78  Sort: 60-83-01\nReference: INV-0001\nWise and Stripe also accepted — reply for a link.",
  accent: "#1F3A2F",
};

export function InvoiceMakerApp() {
  const [invoice, setInvoice] = useState<Invoice>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInvoice(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
    } catch {}
  }, [invoice, hydrated]);

  const subtotal = invoice.items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const discount = subtotal * (invoice.discountPercent / 100);
  const taxable = subtotal - discount;
  const tax = taxable * (invoice.taxPercent / 100);
  const total = taxable + tax;

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice((inv) => ({
      ...inv,
      items: inv.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => {
    setInvoice((inv) => ({
      ...inv,
      items: [
        ...inv.items,
        {
          id: crypto.randomUUID(),
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setInvoice((inv) => ({ ...inv, items: inv.items.filter((i) => i.id !== id) }));
  };

  const reset = () => {
    if (!confirm("Start over with a blank invoice?")) return;
    const next: Invoice = {
      ...DEFAULTS,
      number: `INV-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`,
      from: { name: "", email: "", address: "", website: "" },
      to: { name: "", email: "", address: "" },
      items: [
        { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 },
      ],
      notes: "",
      paymentInstructions: "",
    };
    setInvoice(next);
    toast.success("Cleared to a blank invoice.");
  };

  const download = () => {
    toast.info("Opening print dialog. Choose 'Save as PDF' to download.");
    window.print();
  };

  return (
    <div className="print-wrapper">
      {/* Action bar (screen only) */}
      <div className="border-b border-hairline bg-bone print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-10">
          <div>
            <h1 className="font-display text-2xl leading-tight tracking-tight text-ink">
              Invoice Maker
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              Part of{" "}
              <Link
                href="/products/invoice-maker"
                className="text-ink hover:text-clay"
              >
                Startoor · Invoice Maker
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Reset
            </button>
            <button
              onClick={download}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 font-sans text-sm text-bone transition-colors hover:bg-forest"
            >
              <span>Download PDF</span>
              <span className="transition-transform group-hover:translate-x-0.5">↓</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 print:block print:p-0">
        {/* Form */}
        <section className="print:hidden">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Edit · autosaves to this device
          </span>

          <FormSection title="Invoice" number="01">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Invoice #"
                value={invoice.number}
                onChange={(v) => setInvoice({ ...invoice, number: v })}
              />
              <SelectField
                label="Currency"
                value={invoice.currency}
                options={CURRENCIES}
                onChange={(v) => setInvoice({ ...invoice, currency: v })}
              />
              <Field
                label="Issue date"
                type="date"
                value={invoice.issueDate}
                onChange={(v) => setInvoice({ ...invoice, issueDate: v })}
              />
              <Field
                label="Due date"
                type="date"
                value={invoice.dueDate}
                onChange={(v) => setInvoice({ ...invoice, dueDate: v })}
              />
            </div>
            <div className="mt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                Accent color
              </span>
              <div className="mt-3 flex gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setInvoice({ ...invoice, accent: a.value })}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
                      invoice.accent === a.value ? "border-ink" : "border-transparent"
                    )}
                    style={{ backgroundColor: a.value }}
                    aria-label={a.label}
                  >
                    {invoice.accent === a.value && (
                      <span className="text-xs text-bone">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>

          <FormSection title="From" number="02">
            <Field
              label="Business / your name"
              value={invoice.from.name}
              onChange={(v) => setInvoice({ ...invoice, from: { ...invoice.from, name: v } })}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Email"
                type="email"
                value={invoice.from.email}
                onChange={(v) => setInvoice({ ...invoice, from: { ...invoice.from, email: v } })}
              />
              <Field
                label="Website"
                value={invoice.from.website}
                onChange={(v) => setInvoice({ ...invoice, from: { ...invoice.from, website: v } })}
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Address"
                rows={3}
                value={invoice.from.address}
                onChange={(v) => setInvoice({ ...invoice, from: { ...invoice.from, address: v } })}
              />
            </div>
          </FormSection>

          <FormSection title="Bill to" number="03">
            <Field
              label="Client / company"
              value={invoice.to.name}
              onChange={(v) => setInvoice({ ...invoice, to: { ...invoice.to, name: v } })}
            />
            <div className="mt-4">
              <Field
                label="Email"
                type="email"
                value={invoice.to.email}
                onChange={(v) => setInvoice({ ...invoice, to: { ...invoice.to, email: v } })}
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Billing address"
                rows={3}
                value={invoice.to.address}
                onChange={(v) => setInvoice({ ...invoice, to: { ...invoice.to, address: v } })}
              />
            </div>
          </FormSection>

          <FormSection title="Line items" number="04">
            <div className="space-y-4">
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 border-t border-hairline-soft pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="col-span-12 md:col-span-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                      № {String(idx + 1).padStart(2, "0")}
                    </span>
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Description"
                      className="mt-1 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                      Qty
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", Number(e.target.value) || 0)
                      }
                      className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-right font-mono text-sm tabular-nums text-ink focus:border-ink focus:outline-none"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                      Rate
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", Number(e.target.value) || 0)}
                      className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-right font-mono text-sm tabular-nums text-ink focus:border-ink focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-1 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={invoice.items.length <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-clay/10 hover:text-clay disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone"
                      aria-label="Remove line"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 border-b border-hairline pb-1 font-sans text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <span className="text-base">+</span>
                <span>Add line item</span>
              </button>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Field
                label="Tax %"
                type="number"
                value={String(invoice.taxPercent)}
                onChange={(v) => setInvoice({ ...invoice, taxPercent: Number(v) || 0 })}
              />
              <Field
                label="Discount %"
                type="number"
                value={String(invoice.discountPercent)}
                onChange={(v) => setInvoice({ ...invoice, discountPercent: Number(v) || 0 })}
              />
            </div>
          </FormSection>

          <FormSection title="Notes & payment" number="05">
            <TextAreaField
              label="Notes on this invoice"
              rows={3}
              value={invoice.notes}
              onChange={(v) => setInvoice({ ...invoice, notes: v })}
            />
            <div className="mt-4">
              <TextAreaField
                label="Payment instructions"
                rows={4}
                value={invoice.paymentInstructions}
                onChange={(v) => setInvoice({ ...invoice, paymentInstructions: v })}
              />
            </div>
          </FormSection>
        </section>

        {/* Preview */}
        <section className="lg:sticky lg:top-28 lg:h-fit print:static">
          <div className="mb-4 flex items-center gap-2 print:hidden">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              Preview · this is exactly what prints
            </span>
          </div>
          <InvoiceSheet
            invoice={invoice}
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
          />
        </section>
      </div>

      <PrintStyles />
    </div>
  );
}

function FormSection({
  title,
  number,
  children,
}: {
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-hairline pt-10 first:mt-6 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-4">
        <span className="font-display text-4xl leading-none tracking-tight text-clay">
          {number}
        </span>
        <span className="font-display text-xl leading-none tracking-tight text-ink">
          {title}
        </span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full resize-none border border-hairline bg-transparent p-3 font-sans text-sm leading-relaxed text-ink focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- Invoice sheet ----------

function InvoiceSheet({
  invoice,
  subtotal,
  discount,
  tax,
  total,
}: {
  invoice: Invoice;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}) {
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency,
        minimumFractionDigits: 2,
      }),
    [invoice.currency]
  );
  const dateFmt = (iso: string) => {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <article
      className="relative overflow-hidden bg-warm-white shadow-warm-lg print:shadow-none"
      style={{ "--accent": invoice.accent } as React.CSSProperties}
      id="invoice-sheet"
    >
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{ background: invoice.accent }}
      />
      <div className="px-10 pt-14 pb-10 md:px-14 md:pt-20 md:pb-14">
        {/* Masthead */}
        <header className="flex items-start justify-between gap-6">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: invoice.accent }}
            >
              Invoice
            </p>
            <h1 className="mt-2 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl">
              {invoice.number || "Untitled"}
            </h1>
          </div>
          <div className="text-right font-sans text-sm text-ink-soft">
            {invoice.from.website && (
              <p className="font-mono text-xs uppercase tracking-[0.14em]">
                {invoice.from.website}
              </p>
            )}
            {invoice.from.email && <p className="mt-1">{invoice.from.email}</p>}
          </div>
        </header>

        {/* Parties */}
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          <div>
            <Label>From</Label>
            <p className="mt-2 font-display text-xl leading-tight tracking-tight text-ink">
              {invoice.from.name || "—"}
            </p>
            <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">
              {invoice.from.address}
            </pre>
          </div>
          <div>
            <Label>Billed to</Label>
            <p className="mt-2 font-display text-xl leading-tight tracking-tight text-ink">
              {invoice.to.name || "—"}
            </p>
            {invoice.to.email && (
              <p className="mt-1 font-sans text-sm text-ink-soft">{invoice.to.email}</p>
            )}
            <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">
              {invoice.to.address}
            </pre>
          </div>
          <div>
            <div>
              <Label>Issued</Label>
              <p className="mt-2 font-display text-lg tracking-tight text-ink">
                {dateFmt(invoice.issueDate)}
              </p>
            </div>
            <div className="mt-5">
              <Label>Due</Label>
              <p
                className="mt-2 font-display text-lg tracking-tight"
                style={{ color: invoice.accent }}
              >
                {dateFmt(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Items table */}
        <section className="mt-14">
          <div
            className="grid grid-cols-12 gap-4 border-b border-hairline pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone"
          >
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-2 text-right">Rate</span>
            <span className="col-span-2 text-right">Amount</span>
          </div>
          <div className="divide-y divide-hairline-soft">
            {invoice.items.map((item) => {
              const amount = item.quantity * item.rate;
              return (
                <div key={item.id} className="grid grid-cols-12 gap-4 py-5">
                  <p className="col-span-6 font-sans text-base leading-snug text-ink">
                    {item.description || <span className="text-stone-light">—</span>}
                  </p>
                  <p className="col-span-2 text-right font-mono text-sm tabular-nums text-ink-soft">
                    {item.quantity}
                  </p>
                  <p className="col-span-2 text-right font-mono text-sm tabular-nums text-ink-soft">
                    {fmt.format(item.rate)}
                  </p>
                  <p className="col-span-2 text-right font-mono text-sm tabular-nums text-ink">
                    {fmt.format(amount)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-xs space-y-2 font-sans text-sm">
              <Row label="Subtotal" value={fmt.format(subtotal)} />
              {invoice.discountPercent > 0 && (
                <Row
                  label={`Discount (${invoice.discountPercent}%)`}
                  value={`− ${fmt.format(discount)}`}
                />
              )}
              {invoice.taxPercent > 0 && (
                <Row label={`Tax (${invoice.taxPercent}%)`} value={fmt.format(tax)} />
              )}
              <div
                className="mt-4 flex items-baseline justify-between border-t border-ink pt-4"
              >
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: invoice.accent }}
                >
                  Total due
                </span>
                <span
                  className="font-display text-3xl leading-none tracking-tight tabular-nums"
                  style={{ color: invoice.accent }}
                >
                  {fmt.format(total)}
                </span>
              </div>
            </dl>
          </div>
        </section>

        {(invoice.notes || invoice.paymentInstructions) && (
          <section className="mt-14 grid gap-10 border-t border-hairline pt-10 md:grid-cols-2">
            {invoice.notes && (
              <div>
                <Label>Notes</Label>
                <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.paymentInstructions && (
              <div>
                <Label>Payment</Label>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
                  {invoice.paymentInstructions}
                </pre>
              </div>
            )}
          </section>
        )}

        <footer className="mt-20 flex items-baseline justify-between border-t border-hairline pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
            {formatPrice(total * 100)} · {invoice.currency}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
            Invoice {invoice.number}
          </p>
        </footer>
      </div>
    </article>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
      {children}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-mono tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page { margin: 0; size: letter; }
        body { background: white !important; }
        .print\\:hidden { display: none !important; }
        .print-wrapper { background: white; }
        #invoice-sheet { box-shadow: none !important; max-width: none !important; width: 100%; }
        header[class*="sticky"], footer, nav, aside { display: none !important; }
      }
    `}</style>
  );
}
