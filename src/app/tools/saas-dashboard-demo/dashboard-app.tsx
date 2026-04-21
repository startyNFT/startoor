"use client";

// ---------------------------------------------------------------------------
// SaaS Dashboard Starter — preview app shell.
//
// Renders the sidebar, top app bar, and whichever view is active. All "edits"
// mock-persist to localStorage under a single key. Nothing hits the network.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Command,
  LogOut,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  NOTIFICATIONS,
  WORKSPACES,
  type NotificationItem,
  type Workspace,
} from "@/lib/data/saas-dashboard-mock";
import { Sidebar } from "./sidebar";
import { OverviewView } from "./view-overview";
import { UsersView } from "./view-users";
import { BillingView } from "./view-billing";
import { AnalyticsView } from "./view-analytics";
import { SettingsView } from "./view-settings";

export type DashboardView = "overview" | "users" | "billing" | "analytics" | "settings";

const STORAGE_KEY = "startoor_saas_dashboard_demo_v1";

type PersistedState = {
  workspaceId: string;
  collapsed: boolean;
  // Settings sub-state:
  workspaceName?: string;
  timezone?: string;
  currentPlanId?: string;
  apiKeysRevealed?: Record<string, boolean>;
  webhookActive?: Record<string, boolean>;
  dismissedNotifications?: string[];
  readNotifications?: string[];
};

const DEFAULT_STATE: PersistedState = {
  workspaceId: WORKSPACES[0].id,
  collapsed: false,
  workspaceName: WORKSPACES[0].name,
  timezone: "America/Los_Angeles",
  currentPlanId: "growth",
  apiKeysRevealed: {},
  webhookActive: {},
  dismissedNotifications: [],
  readNotifications: [],
};

// ---------------------------------------------------------------------------

export function DashboardApp({ initialView }: { initialView: DashboardView }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted state.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const patchState = (p: Partial<PersistedState>) =>
    setState((s) => ({ ...s, ...p }));

  // Derive the current view from the URL (authoritative) so back/forward work.
  const urlView = (() => {
    const v = searchParams.get("view");
    if (v && ["overview", "users", "billing", "analytics", "settings"].includes(v)) {
      return v as DashboardView;
    }
    return initialView;
  })();

  const navigate = (v: DashboardView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "overview") {
      params.delete("view");
    } else {
      params.set("view", v);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const workspace =
    WORKSPACES.find((w) => w.id === state.workspaceId) ?? WORKSPACES[0];

  // ----- Notification state: some read/dismissed may be persisted. -----
  const notifications: NotificationItem[] = useMemo(() => {
    const dismissed = new Set(state.dismissedNotifications ?? []);
    const read = new Set(state.readNotifications ?? []);
    return NOTIFICATIONS.filter((n) => !dismissed.has(n.id)).map((n) => ({
      ...n,
      unread: n.unread && !read.has(n.id),
    }));
  }, [state.dismissedNotifications, state.readNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="bg-paper">
      <div className="mx-auto flex max-w-[1400px] gap-0 px-0 md:px-6 lg:px-10">
        <div className="hidden md:block">
          <div className="sticky top-[13.5rem] h-[calc(100vh-13.5rem)] py-4">
            <div className="h-full overflow-hidden rounded-sm border border-hairline bg-bone shadow-warm-xs">
              <div className="h-full overflow-y-auto">
                <Sidebar
                  view={urlView}
                  onNavigate={navigate}
                  collapsed={state.collapsed}
                  onToggleCollapsed={() => patchState({ collapsed: !state.collapsed })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 py-4 md:pl-4">
          <div className="overflow-hidden rounded-sm border border-hairline bg-warm-white shadow-warm-sm">
            <AppBar
              workspace={workspace}
              onSwitchWorkspace={(id) => {
                const ws = WORKSPACES.find((w) => w.id === id);
                if (!ws) return;
                patchState({ workspaceId: id, workspaceName: ws.name });
                toast.success(`Switched to ${ws.name}`);
              }}
              view={urlView}
              notifications={notifications}
              unreadCount={unreadCount}
              onNotificationAction={(id, action) => {
                if (action === "read") {
                  patchState({
                    readNotifications: Array.from(
                      new Set([...(state.readNotifications ?? []), id]),
                    ),
                  });
                } else if (action === "markAllRead") {
                  const allIds = notifications.map((n) => n.id);
                  patchState({ readNotifications: allIds });
                  toast.success("All notifications marked read.");
                } else if (action === "dismiss") {
                  patchState({
                    dismissedNotifications: Array.from(
                      new Set([...(state.dismissedNotifications ?? []), id]),
                    ),
                  });
                }
              }}
            />

            {/* Mobile sidebar tabs — shown on narrow screens instead of the rail */}
            <MobileTabs view={urlView} onNavigate={navigate} />

            {/* View slot */}
            <div className="relative border-t border-hairline">
              {urlView === "overview" && <OverviewView workspace={workspace} />}
              {urlView === "users" && <UsersView />}
              {urlView === "billing" && (
                <BillingView
                  currentPlanId={state.currentPlanId ?? "growth"}
                  onPlanChange={(id) => {
                    patchState({ currentPlanId: id });
                    toast.success(`Plan changed to ${id}.`);
                  }}
                />
              )}
              {urlView === "analytics" && <AnalyticsView />}
              {urlView === "settings" && (
                <SettingsView
                  workspaceName={state.workspaceName ?? workspace.name}
                  timezone={state.timezone ?? "America/Los_Angeles"}
                  apiKeysRevealed={state.apiKeysRevealed ?? {}}
                  webhookActive={state.webhookActive ?? {}}
                  onPatch={patchState}
                />
              )}
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top app bar — workspace picker, search, notifications, user menu.
// ---------------------------------------------------------------------------

function AppBar({
  workspace,
  onSwitchWorkspace,
  view,
  notifications,
  unreadCount,
  onNotificationAction,
}: {
  workspace: Workspace;
  onSwitchWorkspace: (id: string) => void;
  view: DashboardView;
  notifications: NotificationItem[];
  unreadCount: number;
  onNotificationAction: (id: string, action: "read" | "markAllRead" | "dismiss") => void;
}) {
  const [wsOpen, setWsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const wsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (wsRef.current && !wsRef.current.contains(t)) setWsOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const viewLabel: Record<DashboardView, string> = {
    overview: "Overview",
    users: "Users",
    billing: "Billing",
    analytics: "Analytics",
    settings: "Settings",
  };

  return (
    <div className="flex h-14 items-center gap-3 border-b border-hairline bg-bone px-4 md:px-6">
      {/* Workspace switcher */}
      <div ref={wsRef} className="relative">
        <button
          type="button"
          onClick={() => setWsOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-sm border border-hairline bg-warm-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-ink/40"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-forest text-[10px] font-semibold text-bone">
            {workspace.initials}
          </span>
          <span className="flex flex-col items-start text-left">
            <span className="max-w-[140px] truncate font-sans text-sm leading-tight text-ink">
              {workspace.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
              {workspace.plan} · {workspace.domain}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-stone" />
        </button>
        {wsOpen && (
          <div className="absolute left-0 top-full z-40 mt-2 w-[280px] overflow-hidden rounded-sm border border-hairline bg-warm-white shadow-warm-md">
            <div className="border-b border-hairline-soft px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
                Switch workspace
              </p>
            </div>
            <ul>
              {WORKSPACES.map((w) => {
                const active = w.id === workspace.id;
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchWorkspace(w.id);
                        setWsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-bone",
                        active && "bg-bone",
                      )}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-forest text-[10px] font-semibold text-bone">
                        {w.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{w.name}</span>
                        <span className="block truncate font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
                          {w.plan} · {w.domain}
                        </span>
                      </span>
                      {active && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-forest">
                          current
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-hairline-soft px-3 py-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("This is a demo — workspace creation is disabled.");
                  setWsOpen(false);
                }}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft hover:text-ink"
              >
                + New workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumb — desktop only, keeps the bar readable */}
      <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:flex">
        <span className="h-3 w-px bg-hairline" />
        <span>{workspace.name}</span>
        <span className="text-stone-light">/</span>
        <span className="text-ink">{viewLabel[view]}</span>
      </div>

      {/* Search */}
      <div
        className={cn(
          "ml-auto hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-sm border bg-warm-white px-3 py-1.5 transition-colors md:flex",
          searchFocused ? "border-ink/60" : "border-hairline",
        )}
      >
        <Search className="h-3.5 w-3.5 text-stone" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search users, invoices, events…"
          className="min-w-0 flex-1 bg-transparent font-sans text-sm text-ink placeholder:text-stone-light focus:outline-none"
        />
        <span className="hidden items-center gap-0.5 rounded border border-hairline bg-paper px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-stone md:inline-flex">
          <Command className="h-2.5 w-2.5" />K
        </span>
      </div>

      <div className="ml-auto md:ml-0" />

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => setNotifOpen((v) => !v)}
          className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-hairline bg-warm-white transition-colors hover:border-ink/40"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell className="h-[17px] w-[17px] text-ink-soft" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-clay px-1 font-mono text-[9px] font-semibold text-bone">
              {unreadCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-full z-40 mt-2 w-[360px] overflow-hidden rounded-sm border border-hairline bg-warm-white shadow-warm-md">
            <div className="flex items-center justify-between border-b border-hairline-soft px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-stone">
                Inbox · {notifications.length}
              </p>
              <button
                type="button"
                onClick={() => onNotificationAction("", "markAllRead")}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            </div>
            <ul className="max-h-[400px] divide-y divide-hairline-soft overflow-y-auto">
              {notifications.length === 0 && (
                <li className="px-4 py-8 text-center font-sans text-sm italic text-stone">
                  All caught up.
                </li>
              )}
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onNotificationAction(n.id, "read");
                    }}
                    className={cn(
                      "group relative flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-bone",
                      n.unread && "bg-bone/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full",
                        n.kind === "billing"
                          ? "bg-butter"
                          : n.kind === "security"
                            ? "bg-clay"
                            : n.kind === "team"
                              ? "bg-forest"
                              : "bg-stone",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-sans text-sm text-ink">{n.title}</p>
                        <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
                          {n.kind}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 font-sans text-xs leading-snug text-ink-soft">
                        {n.body}
                      </p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotificationAction(n.id, "dismiss");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onNotificationAction(n.id, "dismiss");
                        }
                      }}
                      className="invisible ml-1 flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-stone group-hover:visible hover:text-ink"
                    >
                      Dismiss
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* User menu */}
      <div ref={userRef} className="relative">
        <button
          type="button"
          onClick={() => setUserOpen((v) => !v)}
          className="flex items-center gap-2 rounded-sm border border-hairline bg-warm-white py-1 pl-1 pr-2.5 transition-colors hover:border-ink/40"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-ink text-[11px] font-semibold text-bone">
            AO
          </span>
          <ChevronDown className="h-3 w-3 text-stone" />
        </button>
        {userOpen && (
          <div className="absolute right-0 top-full z-40 mt-2 w-[240px] overflow-hidden rounded-sm border border-hairline bg-warm-white shadow-warm-md">
            <div className="border-b border-hairline-soft px-3 py-3">
              <p className="font-sans text-sm text-ink">Ada Okafor</p>
              <p className="font-mono text-[10px] text-stone">ada@oakbend.studio</p>
            </div>
            <ul className="py-1 text-sm">
              <MenuRow icon={UserRound} label="Account" />
              <MenuRow icon={SlidersHorizontal} label="Preferences" />
              <MenuRow icon={Sparkles} label="What's new" />
            </ul>
            <div className="border-t border-hairline-soft py-1">
              <MenuRow
                icon={LogOut}
                label="Sign out"
                onClick={() => toast.info("Demo — sign out disabled.")}
                tone="danger"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
  tone?: "danger";
}) {
  return (
    <li>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (onClick) {
            onClick();
          } else {
            toast.info(`Demo — ${label} disabled.`);
          }
        }}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-bone",
          tone === "danger" ? "text-clay" : "text-ink-soft hover:text-ink",
        )}
      >
        <Icon className="h-[16px] w-[16px]" strokeWidth={1.5} />
        <span>{label}</span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Mobile tabs — shown when the rail is hidden.
// ---------------------------------------------------------------------------

function MobileTabs({
  view,
  onNavigate,
}: {
  view: DashboardView;
  onNavigate: (v: DashboardView) => void;
}) {
  const tabs: { id: DashboardView; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "billing", label: "Billing" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-hairline-soft bg-bone/40 px-3 py-2 md:hidden">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onNavigate(t.id)}
          className={cn(
            "flex-shrink-0 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
            view === t.id
              ? "bg-ink text-bone"
              : "text-ink-soft hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft bg-bone/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:px-6">
      <p>All data in this preview is seeded · nothing here is real.</p>
      <p>
        v2.4.0 · <span className="text-ink">Starter kit</span>
      </p>
    </div>
  );
}
