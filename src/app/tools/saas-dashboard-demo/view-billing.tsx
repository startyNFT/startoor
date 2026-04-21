"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Download, FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  INVOICES,
  PLAN_OPTIONS,
  USAGE_METERS,
  formatDate,
  formatMoney,
} from "@/lib/data/saas-dashboard-mock";

export function BillingView({
  currentPlanId,
  onPlanChange,
}: {
  currentPlanId: string;
  onPlanChange: (id: string) => void;
}) {
  const currentPlan = useMemo(
    () => PLAN_OPTIONS.find((p) => p.id === currentPlanId) ?? PLAN_OPTIONS[1],
    [currentPlanId],
  );

  return (
    <div className="px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Billing
          </p>
          <h2 className="mt-2 font-display text-[30px] leading-[1.05] tracking-tight text-ink md:text-[36px]">
            Plan, usage, and the paper trail.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Demo — receipt download disabled.")}
          className="inline-flex items-center gap-2 rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft hover:border-ink hover:text-ink"
        >
          <Download className="h-3 w-3" /> Download all receipts
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Current plan + upgrade picker */}
        <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
          <div className="flex items-start justify-between gap-4 border-b border-hairline-soft px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Current plan
              </p>
              <h3 className="mt-1 font-display text-2xl tracking-tight text-ink">
                {currentPlan.name}
              </h3>
            </div>
            <p className="text-right font-display text-[22px] leading-[1.05] tracking-tight text-ink tabular-nums md:text-[26px]">
              {formatMoney(currentPlan.priceCents)}
              <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                /{currentPlan.cadence}
              </span>
            </p>
          </div>
          <div className="px-5 pt-4">
            <p className="font-sans text-sm text-ink-soft">
              Billed monthly · next invoice on{" "}
              <span className="text-ink tabular-nums">May 01, 2026</span>
            </p>
          </div>

          <div className="grid gap-3 px-5 py-5 md:grid-cols-3">
            {PLAN_OPTIONS.map((p) => {
              const current = p.id === currentPlanId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPlanChange(p.id)}
                  className={cn(
                    "group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-sm border bg-warm-white p-4 text-left transition-all",
                    current
                      ? "border-ink bg-bone"
                      : "border-hairline hover:border-ink/50 hover:bg-bone/50",
                  )}
                >
                  {p.recommended && !current && (
                    <span className="absolute right-3 top-3 rounded-full bg-butter px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink">
                      recommended
                    </span>
                  )}
                  {current && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-forest">
                      <CheckCircle2 className="h-3 w-3" /> current
                    </span>
                  )}
                  <p className="font-display text-lg tracking-tight text-ink">{p.name}</p>
                  <p className="font-display text-[22px] leading-[1.05] tracking-tight text-ink tabular-nums">
                    {formatMoney(p.priceCents)}
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                      /{p.cadence}
                    </span>
                  </p>
                  <ul className="mt-1 space-y-1.5 border-t border-hairline-soft pt-3 font-sans text-xs text-ink-soft">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-forest" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        {/* Payment method */}
        <section className="overflow-hidden rounded-sm border border-hairline bg-warm-white">
          <div className="border-b border-hairline-soft px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Payment method
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              Card on file.
            </h3>
          </div>
          <div className="px-5 py-5">
            <div className="relative overflow-hidden rounded-[10px] border border-ink/70 bg-gradient-to-br from-ink via-forest to-ink-soft p-5 text-bone">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
                    Visa · ends in
                  </p>
                  <p className="mt-3 font-display text-[28px] tracking-[0.08em] tabular-nums">
                    •• 4242
                  </p>
                </div>
                <CreditCard className="h-7 w-7 opacity-60" strokeWidth={1.5} />
              </div>
              <div className="mt-6 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.22em] opacity-80">
                <span>
                  <span className="block opacity-60">Holder</span>
                  Ada Okafor
                </span>
                <span>
                  <span className="block opacity-60">Expires</span>
                  09 / 28
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toast.info("Demo — card update disabled.")}
                className="rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink hover:border-ink"
              >
                Update card
              </button>
              <button
                type="button"
                onClick={() => toast.info("Demo — ACH flow disabled.")}
                className="rounded-sm border border-hairline bg-warm-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:border-ink hover:text-ink"
              >
                Add ACH
              </button>
              <p className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                Secured · PCI DSS
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Usage meters */}
      <section className="mt-8 overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="border-b border-hairline-soft px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
            Usage · this billing period
          </p>
          <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
            Where you are against the caps.
          </h3>
        </div>
        <div className="grid gap-px bg-hairline-soft md:grid-cols-2">
          {USAGE_METERS.map((m) => {
            const pct = (m.used / m.cap) * 100;
            const tone =
              pct > 85 ? "bg-clay" : pct > 65 ? "bg-butter" : "bg-forest";
            const formatVal = (v: number) =>
              m.unit === "GB" ? v.toFixed(1) : v.toLocaleString("en-US");
            return (
              <div key={m.label} className="bg-warm-white px-5 py-5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-sans text-sm text-ink">{m.label}</p>
                  <p className="font-mono text-xs tabular-nums text-ink-soft">
                    <span className="text-ink">{formatVal(m.used)}</span>
                    <span className="text-stone"> / {formatVal(m.cap)} {m.unit}</span>
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bone">
                  <div
                    className={cn("h-full rounded-full transition-all", tone)}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                  {pct.toFixed(0)}% used · {(100 - pct).toFixed(0)}% headroom
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Invoices */}
      <section className="mt-8 overflow-hidden rounded-sm border border-hairline bg-warm-white">
        <div className="flex items-end justify-between gap-4 border-b border-hairline-soft px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Invoice history · last 12 months
            </p>
            <h3 className="mt-1 font-display text-xl tracking-tight text-ink md:text-[22px]">
              Every receipt you ever needed.
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-hairline-soft bg-bone/40">
              <tr>
                <Th>Invoice</Th>
                <Th>Period</Th>
                <Th>Issued</Th>
                <Th>Method</Th>
                <Th align="right">Amount</Th>
                <Th>Status</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {[...INVOICES].reverse().map((inv) => (
                <tr key={inv.id} className="border-b border-hairline-soft last:border-0 hover:bg-bone/30">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0 text-stone" strokeWidth={1.5} />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                          {inv.number}
                        </p>
                        <p className="truncate font-sans text-xs text-ink-soft">
                          {inv.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs tabular-nums text-ink-soft whitespace-nowrap">
                    {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs tabular-nums text-stone whitespace-nowrap">
                    {formatDate(inv.issuedAt)}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft whitespace-nowrap">
                    {inv.method.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-sm tabular-nums text-ink">
                    {formatMoney(inv.amountCents)}
                  </td>
                  <td className="px-3 py-3">
                    <InvoiceStatusPill status={inv.status} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(`Downloaded ${inv.number}.pdf (demo).`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-warm-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:border-ink hover:text-ink"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

function InvoiceStatusPill({ status }: { status: string }) {
  const meta: Record<string, { label: string; cls: string; dot: string }> = {
    paid: { label: "Paid", cls: "bg-forest/10 text-forest", dot: "#1F3A2F" },
    open: { label: "Open", cls: "bg-butter/40 text-ink", dot: "#C9A24C" },
    void: { label: "Void", cls: "bg-stone/20 text-ink-soft", dot: "#8F8B80" },
    refunded: { label: "Refunded", cls: "bg-clay/15 text-clay", dot: "#C85A3F" },
  };
  const m = meta[status] ?? meta.void;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        m.cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}
