"use client";

import Link from "next/link";
import {
  BarChart3,
  Cog,
  CreditCard,
  LayoutDashboard,
  Users,
  Command,
  Bookmark,
  Heart,
  LifeBuoy,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { DashboardView } from "./dashboard-app";

const PRIMARY_ITEMS: { view: DashboardView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { view: "overview", label: "Overview", icon: LayoutDashboard },
  { view: "users", label: "Users", icon: Users },
  { view: "billing", label: "Billing", icon: CreditCard },
  { view: "analytics", label: "Analytics", icon: BarChart3 },
  { view: "settings", label: "Settings", icon: Cog },
];

type Props = {
  view: DashboardView;
  onNavigate: (v: DashboardView) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({ view, onNavigate, collapsed, onToggleCollapsed }: Props) {
  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-hairline bg-bone transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      {/* Brand lockup */}
      <div className="flex items-center gap-2.5 border-b border-hairline px-5 py-5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-ink bg-forest text-bone">
          <span className="font-display text-sm leading-none">s</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm leading-tight text-ink">Startoor</p>
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.2em] text-stone">
              Admin · v2.4
            </p>
          </div>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4">
        {!collapsed && (
          <p className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
            Workspace
          </p>
        )}
        {PRIMARY_ITEMS.map((item) => {
          const active = view === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-sm px-2.5 py-2 text-left text-sm transition-colors",
                active
                  ? "bg-warm-white text-ink"
                  : "text-ink-soft hover:bg-warm-white/60 hover:text-ink",
                collapsed && "justify-center px-0",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-forest" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] flex-shrink-0",
                  active ? "text-forest" : "text-ink-soft group-hover:text-ink",
                )}
                strokeWidth={1.5}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.2em] text-forest">
                  ·
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Secondary section — saved + resources */}
      {!collapsed && (
        <div className="flex flex-col gap-0.5 border-t border-hairline-soft px-3 py-4">
          <p className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
            Resources
          </p>
          <SecondaryLink icon={Bookmark} label="Docs" href="#" />
          <SecondaryLink icon={Command} label="Keyboard shortcuts" href="#" kbd="⌘K" />
          <SecondaryLink icon={LifeBuoy} label="Support" href="#" />
          <SecondaryLink icon={Heart} label="Feedback" href="#" />
        </div>
      )}

      <div className="mt-auto border-t border-hairline-soft px-3 py-3">
        {!collapsed ? (
          <div className="flex flex-col gap-2 rounded-sm border border-hairline bg-warm-white p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-clay">
              Starter kit
            </p>
            <p className="font-sans text-xs leading-snug text-ink">
              Clone this whole admin panel — Next.js, Tailwind, full auth.
            </p>
            <Link
              href="/products/saas-dashboard-starter"
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-forest"
            >
              Get the code →
            </Link>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm border border-hairline bg-bone px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-ink hover:text-ink",
          )}
        >
          {collapsed ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

function SecondaryLink({
  icon: Icon,
  label,
  href,
  kbd,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href: string;
  kbd?: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-sm px-2.5 py-2 text-sm text-ink-soft transition-colors hover:bg-warm-white/60 hover:text-ink"
      onClick={(e) => e.preventDefault()}
    >
      <Icon className="h-[16px] w-[16px] flex-shrink-0 text-stone" strokeWidth={1.5} />
      <span className="flex-1 truncate">{label}</span>
      {kbd && (
        <span className="rounded border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-stone">
          {kbd}
        </span>
      )}
    </a>
  );
}
