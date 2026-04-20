"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Menu, X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  STORAGE_KEY,
  buildSeedState,
  makeEmptyCollection,
  makeEmptyEnvironment,
  makeEmptyRequest,
  type PlaygroundState,
  type SavedRequest,
  type KVRow,
  type Environment,
  type HistoryEntry,
} from "@/lib/data/api-playground-seeds";
import { Sidebar } from "./sidebar";
import { RequestEditor } from "./request-editor";
import { ResponsePane, type ResponseSnapshot, type ResponseTab } from "./response-pane";

type RequestTab = "params" | "headers" | "body" | "auth" | "tests";

export function PlaygroundApp() {
  const [state, setState] = useState<PlaygroundState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [response, setResponse] = useState<ResponseSnapshot | null>(null);
  const [sending, setSending] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [envEditorOpen, setEnvEditorOpen] = useState(false);

  // --- hydrate ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlaygroundState;
        if (parsed.version === 1) {
          setState(parsed);
          setHydrated(true);
          return;
        }
      }
    } catch {}
    setState(buildSeedState());
    setHydrated(true);
  }, []);

  // --- persist ---
  useEffect(() => {
    if (!hydrated || !state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("failed to persist playground state", err);
    }
  }, [state, hydrated]);

  const activeRequest: SavedRequest | null = useMemo(() => {
    if (!state?.activeRequestId) return null;
    return state.requests[state.activeRequestId] || null;
  }, [state]);

  const activeEnv: Environment | null = useMemo(() => {
    if (!state?.activeEnvId) return null;
    return state.environments.find((e) => e.id === state.activeEnvId) || null;
  }, [state]);

  // --- actions ---

  const updateActiveRequest = useCallback(
    (patch: Partial<SavedRequest>) => {
      setState((prev) => {
        if (!prev || !prev.activeRequestId) return prev;
        const current = prev.requests[prev.activeRequestId];
        if (!current) return prev;
        return {
          ...prev,
          requests: {
            ...prev.requests,
            [prev.activeRequestId]: { ...current, ...patch },
          },
        };
      });
    },
    []
  );

  const setUi = useCallback((patch: Partial<PlaygroundState["ui"]>) => {
    setState((prev) => (prev ? { ...prev, ui: { ...prev.ui, ...patch } } : prev));
  }, []);

  const selectRequest = useCallback((id: string) => {
    setState((prev) => (prev ? { ...prev, activeRequestId: id } : prev));
    setResponse(null);
    setMobileSidebarOpen(false);
  }, []);

  const newCollection = useCallback(() => {
    const c = makeEmptyCollection(`Collection ${((state?.collections.length || 0) + 1).toString().padStart(2, "0")}`);
    setState((prev) =>
      prev ? { ...prev, collections: [...prev.collections, c] } : prev
    );
    toast.success(`Created "${c.name}"`);
  }, [state?.collections.length]);

  const newRequest = useCallback((collectionId: string) => {
    const r = makeEmptyRequest({ name: "New request" });
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        requests: { ...prev.requests, [r.id]: r },
        collections: prev.collections.map((c) =>
          c.id === collectionId
            ? { ...c, requestIds: [...c.requestIds, r.id] }
            : c
        ),
        activeRequestId: r.id,
      };
    });
    setResponse(null);
  }, []);

  const renameCollection = useCallback((id: string, name: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            collections: prev.collections.map((c) =>
              c.id === id ? { ...c, name } : c
            ),
          }
        : prev
    );
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const collection = prev.collections.find((c) => c.id === id);
      if (!collection) return prev;
      const nextRequests = { ...prev.requests };
      for (const rid of collection.requestIds) delete nextRequests[rid];
      return {
        ...prev,
        collections: prev.collections.filter((c) => c.id !== id),
        requests: nextRequests,
        activeRequestId:
          prev.activeRequestId && collection.requestIds.includes(prev.activeRequestId)
            ? null
            : prev.activeRequestId,
      };
    });
  }, []);

  const renameRequest = useCallback((id: string, name: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const r = prev.requests[id];
      if (!r) return prev;
      return {
        ...prev,
        requests: { ...prev.requests, [id]: { ...r, name } },
      };
    });
  }, []);

  const duplicateRequest = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const r = prev.requests[id];
      if (!r) return prev;
      const clone: SavedRequest = {
        ...r,
        id: `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name: `${r.name} · copy`,
      };
      return {
        ...prev,
        requests: { ...prev.requests, [clone.id]: clone },
        collections: prev.collections.map((c) =>
          c.requestIds.includes(id)
            ? { ...c, requestIds: [...c.requestIds, clone.id] }
            : c
        ),
      };
    });
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const nextRequests = { ...prev.requests };
      delete nextRequests[id];
      return {
        ...prev,
        requests: nextRequests,
        collections: prev.collections.map((c) => ({
          ...c,
          requestIds: c.requestIds.filter((r) => r !== id),
        })),
        activeRequestId: prev.activeRequestId === id ? null : prev.activeRequestId,
      };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setState((prev) => (prev ? { ...prev, history: [] } : prev));
    toast.success("History cleared");
  }, []);

  const selectHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      // Restore the snapshot into a scratch request so the user can tweak & re-send
      const scratchId = `scratch_${Date.now().toString(36)}`;
      const snapshot: SavedRequest = {
        ...entry.snapshot,
        id: scratchId,
        name: `${entry.snapshot.name} · replay`,
      };
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          requests: { ...prev.requests, [scratchId]: snapshot },
          activeRequestId: scratchId,
        };
      });
      setResponse(null);
      toast.info("Loaded from history — save to keep it.");
    },
    []
  );

  const newEnvironment = useCallback(() => {
    const e = makeEmptyEnvironment(
      `Env ${((state?.environments.length || 0) + 1).toString().padStart(2, "0")}`
    );
    setState((prev) =>
      prev ? { ...prev, environments: [...prev.environments, e], activeEnvId: e.id } : prev
    );
    setEnvEditorOpen(true);
  }, [state?.environments.length]);

  const selectEnvironment = useCallback((id: string | null) => {
    setState((prev) => (prev ? { ...prev, activeEnvId: id } : prev));
  }, []);

  const renameEnvironment = useCallback((id: string, name: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            environments: prev.environments.map((e) =>
              e.id === id ? { ...e, name } : e
            ),
          }
        : prev
    );
  }, []);

  const deleteEnvironment = useCallback((id: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            environments: prev.environments.filter((e) => e.id !== id),
            activeEnvId: prev.activeEnvId === id ? null : prev.activeEnvId,
          }
        : prev
    );
  }, []);

  const updateEnvironment = useCallback(
    (id: string, patch: Partial<Environment>) => {
      setState((prev) =>
        prev
          ? {
              ...prev,
              environments: prev.environments.map((e) =>
                e.id === id ? { ...e, ...patch } : e
              ),
            }
          : prev
      );
    },
    []
  );

  // --- save current request (explicit Save button — fire toast) ---
  const saveActive = useCallback(() => {
    if (!activeRequest || !state) {
      toast.error("No request to save.");
      return;
    }
    // If this request isn't in any collection (scratch / history replay), prompt to add it.
    const inCollection = state.collections.some((c) =>
      c.requestIds.includes(activeRequest.id)
    );
    if (inCollection) {
      toast.success(`Saved "${activeRequest.name}"`);
      return;
    }
    if (state.collections.length === 0) {
      const c = makeEmptyCollection("My Collection");
      setState((prev) =>
        prev
          ? {
              ...prev,
              collections: [...prev.collections, { ...c, requestIds: [activeRequest.id] }],
            }
          : prev
      );
      toast.success(`Saved to new "${c.name}"`);
      return;
    }
    // Add to the first collection
    const first = state.collections[0];
    setState((prev) =>
      prev
        ? {
            ...prev,
            collections: prev.collections.map((c) =>
              c.id === first.id
                ? { ...c, requestIds: [...c.requestIds, activeRequest.id] }
                : c
            ),
          }
        : prev
    );
    toast.success(`Saved to "${first.name}"`);
  }, [activeRequest, state]);

  // --- send ---
  const sendActive = useCallback(async () => {
    if (!activeRequest || !state) return;
    if (!activeRequest.url.trim()) {
      toast.error("Add a URL first.");
      return;
    }
    setSending(true);
    setResponse(null);

    const started = Date.now();
    try {
      const { url, init } = buildFetchInit(activeRequest, activeEnv);

      // Validate URL construction
      try {
        // eslint-disable-next-line no-new
        new URL(url);
      } catch {
        throw new Error(`Invalid URL: ${url}`);
      }

      const resp = await fetch(url, init);
      const finished = Date.now();
      const headers: Record<string, string> = {};
      resp.headers.forEach((v, k) => {
        headers[k] = v;
      });
      const text = await resp.text();
      const snapshot: ResponseSnapshot = {
        status: resp.status,
        statusText: resp.statusText,
        headers,
        body: text,
        contentType: resp.headers.get("content-type") || "",
        sizeBytes: new Blob([text]).size,
        startedAt: started,
        finishedAt: finished,
        durationMs: finished - started,
      };
      setResponse(snapshot);

      // Append to history
      const histEntry: HistoryEntry = {
        id: `hist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        method: activeRequest.method,
        url,
        status: snapshot.status,
        statusText: snapshot.statusText,
        durationMs: snapshot.durationMs,
        at: started,
        snapshot: { ...activeRequest },
      };
      setState((prev) =>
        prev
          ? { ...prev, history: [histEntry, ...prev.history].slice(0, 50) }
          : prev
      );
    } catch (err) {
      const finished = Date.now();
      const message = err instanceof Error ? err.message : String(err);
      const isCors =
        /fail|network|cors|typeerror/i.test(message) && !/invalid url/i.test(message);
      const snapshot: ResponseSnapshot = {
        status: null,
        statusText: "network error",
        headers: {},
        body: "",
        contentType: "",
        sizeBytes: 0,
        startedAt: started,
        finishedAt: finished,
        durationMs: finished - started,
        error: message,
        isCorsLikely: isCors,
      };
      setResponse(snapshot);

      const histEntry: HistoryEntry = {
        id: `hist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        method: activeRequest.method,
        url: activeRequest.url,
        status: null,
        statusText: "ERR",
        durationMs: finished - started,
        at: started,
        snapshot: { ...activeRequest },
      };
      setState((prev) =>
        prev
          ? { ...prev, history: [histEntry, ...prev.history].slice(0, 50) }
          : prev
      );
    } finally {
      setSending(false);
    }
  }, [activeRequest, activeEnv, state]);

  const copyCurl = useCallback(() => {
    if (!activeRequest) return;
    const curl = buildCurl(activeRequest, activeEnv);
    navigator.clipboard.writeText(curl);
    toast.success("cURL copied");
  }, [activeRequest, activeEnv]);

  const copyFetch = useCallback(() => {
    if (!activeRequest) return;
    const snippet = buildFetchSnippet(activeRequest, activeEnv);
    navigator.clipboard.writeText(snippet);
    toast.success("fetch() snippet copied");
  }, [activeRequest, activeEnv]);

  // --- import / export ---
  const exportJson = useCallback(() => {
    if (!state) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      collections: state.collections,
      requests: state.requests,
      environments: state.environments,
    };
    const json = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(json).then(
      () => toast.success("Export JSON copied to clipboard"),
      () => toast.info("Export ready (clipboard blocked). Open devtools.")
    );

    // Also offer a file download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `startoor-api-playground-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJson = useCallback(() => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed || typeof parsed !== "object") throw new Error("not an object");
      const collections = Array.isArray(parsed.collections) ? parsed.collections : [];
      const requests = parsed.requests && typeof parsed.requests === "object" ? parsed.requests : {};
      const environments = Array.isArray(parsed.environments) ? parsed.environments : [];
      setState((prev) =>
        prev
          ? {
              ...prev,
              collections: [...prev.collections, ...collections],
              requests: { ...prev.requests, ...requests },
              environments: [...prev.environments, ...environments],
            }
          : prev
      );
      toast.success(
        `Imported ${collections.length} collection(s), ${Object.keys(requests).length} request(s)`
      );
      setImportOpen(false);
      setImportText("");
    } catch (err) {
      toast.error(`Import failed: ${err instanceof Error ? err.message : "bad JSON"}`);
    }
  }, [importText]);

  // --- keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendActive();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveActive();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sendActive, saveActive]);

  if (!hydrated || !state) {
    return (
      <div className="mx-auto flex max-w-[1600px] items-center justify-center px-6 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          Loading workbench...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 md:px-6 md:py-6 lg:px-10">
      <div className="relative flex h-[calc(100vh-180px)] min-h-[720px] overflow-hidden rounded-none border-hairline bg-bone md:rounded md:border md:shadow-warm-sm">
        {/* Sidebar — desktop */}
        <aside className="hidden h-full w-[300px] flex-shrink-0 border-r border-hairline lg:block">
          <Sidebar
            collections={state.collections}
            requests={state.requests}
            history={state.history}
            environments={state.environments}
            activeRequestId={state.activeRequestId}
            activeEnvId={state.activeEnvId}
            onSelectRequest={selectRequest}
            onNewCollection={newCollection}
            onNewRequest={newRequest}
            onRenameCollection={renameCollection}
            onDeleteCollection={deleteCollection}
            onRenameRequest={renameRequest}
            onDuplicateRequest={duplicateRequest}
            onDeleteRequest={deleteRequest}
            onSelectHistoryEntry={selectHistoryEntry}
            onClearHistory={clearHistory}
            onNewEnvironment={newEnvironment}
            onSelectEnvironment={selectEnvironment}
            onRenameEnvironment={renameEnvironment}
            onDeleteEnvironment={deleteEnvironment}
            onExport={exportJson}
            onImport={() => setImportOpen(true)}
          />
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] shadow-warm-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                collections={state.collections}
                requests={state.requests}
                history={state.history}
                environments={state.environments}
                activeRequestId={state.activeRequestId}
                activeEnvId={state.activeEnvId}
                onSelectRequest={selectRequest}
                onNewCollection={newCollection}
                onNewRequest={newRequest}
                onRenameCollection={renameCollection}
                onDeleteCollection={deleteCollection}
                onRenameRequest={renameRequest}
                onDuplicateRequest={duplicateRequest}
                onDeleteRequest={deleteRequest}
                onSelectHistoryEntry={selectHistoryEntry}
                onClearHistory={clearHistory}
                onNewEnvironment={newEnvironment}
                onSelectEnvironment={selectEnvironment}
                onRenameEnvironment={renameEnvironment}
                onDeleteEnvironment={deleteEnvironment}
                onExport={exportJson}
                onImport={() => setImportOpen(true)}
                onClose={() => setMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-hairline bg-bone px-4 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Menu className="h-3 w-3" />
              Workbench
            </button>
            {activeEnv && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                <span className="h-1 w-1 rounded-full bg-butter" />
                {activeEnv.name}
              </span>
            )}
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
            {/* Request editor */}
            <div className="min-h-0 border-b border-hairline md:border-b-0 md:border-r">
              {activeRequest ? (
                <RequestEditor
                  request={activeRequest}
                  onChange={updateActiveRequest}
                  onSend={sendActive}
                  onSave={saveActive}
                  sending={sending}
                  activeTab={state.ui.requestTab}
                  onTabChange={(t: RequestTab) => setUi({ requestTab: t })}
                  activeEnvName={activeEnv?.name || null}
                  onCurlCopy={copyCurl}
                  onFetchCopy={copyFetch}
                />
              ) : (
                <NoRequestSelected onNew={() => {
                  if (state.collections.length === 0) {
                    newCollection();
                    // Wait a tick for state
                    setTimeout(() => {
                      setState((prev) => {
                        if (!prev) return prev;
                        const lastCol = prev.collections[prev.collections.length - 1];
                        if (!lastCol) return prev;
                        const r = makeEmptyRequest({ name: "New request" });
                        return {
                          ...prev,
                          requests: { ...prev.requests, [r.id]: r },
                          collections: prev.collections.map((c) =>
                            c.id === lastCol.id
                              ? { ...c, requestIds: [...c.requestIds, r.id] }
                              : c
                          ),
                          activeRequestId: r.id,
                        };
                      });
                    }, 0);
                  } else {
                    newRequest(state.collections[0].id);
                  }
                }} />
              )}
            </div>

            {/* Response */}
            <div className="min-h-0">
              <ResponsePane
                response={response}
                activeTab={state.ui.responseTab}
                onTabChange={(t: ResponseTab) => setUi({ responseTab: t })}
                sending={sending}
              />
            </div>
          </div>
        </div>

        {/* Env editor floating panel */}
        {envEditorOpen && activeEnv && (
          <EnvEditorModal
            env={activeEnv}
            onChange={(patch) => updateEnvironment(activeEnv.id, patch)}
            onClose={() => setEnvEditorOpen(false)}
          />
        )}

        {/* Env quick-access button when env is active */}
        {activeEnv && !envEditorOpen && (
          <button
            type="button"
            onClick={() => setEnvEditorOpen(true)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft shadow-warm-sm transition-colors hover:border-ink hover:text-ink"
          >
            <span className="h-1 w-1 rounded-full bg-butter" />
            Edit env · {activeEnv.name}
          </button>
        )}
      </div>

      {/* Import modal */}
      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => setImportOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded border border-hairline bg-bone shadow-warm-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <span className="font-display text-lg tracking-tight text-ink">
                Import JSON
              </span>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded text-stone transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="font-sans text-sm text-ink-soft">
                Paste an export from this playground. Collections, requests, and
                environments are merged into your existing workbench.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={12}
                placeholder={`{\n  "collections": [...],\n  "requests": {...},\n  "environments": [...]\n}`}
                className="mt-4 w-full resize-none rounded border border-hairline bg-paper p-3 font-mono text-xs text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                spellCheck={false}
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  className="rounded-full border border-hairline bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={importJson}
                  disabled={!importText.trim()}
                  className="rounded-full bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-bone transition-colors hover:bg-forest disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- helpers ----------

function substitute(str: string, env: Environment | null): string {
  if (!env || !str) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    const row = env.variables.find((v) => v.enabled && v.key === k);
    return row ? row.value : `{{${k}}}`;
  });
}

function substituteKV(rows: KVRow[], env: Environment | null): KVRow[] {
  return rows.map((r) => ({
    ...r,
    key: substitute(r.key, env),
    value: substitute(r.value, env),
  }));
}

function buildFetchInit(
  req: SavedRequest,
  env: Environment | null
): { url: string; init: RequestInit } {
  let url = substitute(req.url, env);

  const headers = new Headers();
  const resolvedHeaders = substituteKV(req.headers, env);
  for (const h of resolvedHeaders) {
    if (h.enabled && h.key) headers.set(h.key, h.value);
  }

  // auth
  const auth = req.auth;
  if (auth.mode === "bearer" && auth.bearerToken) {
    headers.set("Authorization", `Bearer ${substitute(auth.bearerToken, env)}`);
  } else if (auth.mode === "basic" && (auth.basicUser || auth.basicPass)) {
    const token = btoa(
      `${substitute(auth.basicUser || "", env)}:${substitute(auth.basicPass || "", env)}`
    );
    headers.set("Authorization", `Basic ${token}`);
  } else if (auth.mode === "api-key" && auth.apiKeyName && auth.apiKeyValue) {
    const name = substitute(auth.apiKeyName, env);
    const value = substitute(auth.apiKeyValue, env);
    if ((auth.apiKeyIn || "header") === "header") {
      headers.set(name, value);
    } else {
      const u = new URL(url);
      u.searchParams.set(name, value);
      url = u.toString();
    }
  } else if (
    auth.mode === "custom-header" &&
    auth.customHeaderName &&
    auth.customHeaderValue
  ) {
    headers.set(
      substitute(auth.customHeaderName, env),
      substitute(auth.customHeaderValue, env)
    );
  }

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.bodyMode !== "none") {
    if (req.bodyMode === "json") {
      body = substitute(req.bodyJson, env);
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    } else if (req.bodyMode === "form-data") {
      const fd = new FormData();
      for (const f of substituteKV(req.bodyFormData, env)) {
        if (f.enabled && f.key) fd.append(f.key, f.value);
      }
      body = fd;
      // Do NOT set Content-Type — browser sets with boundary
    } else if (req.bodyMode === "x-www-form-urlencoded") {
      const up = new URLSearchParams();
      for (const f of substituteKV(req.bodyUrlEncoded, env)) {
        if (f.enabled && f.key) up.append(f.key, f.value);
      }
      body = up.toString();
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/x-www-form-urlencoded");
    } else if (req.bodyMode === "raw") {
      body = substitute(req.bodyRaw, env);
      if (!headers.has("Content-Type") && req.bodyRawType)
        headers.set("Content-Type", req.bodyRawType);
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body,
    mode: "cors",
    redirect: "follow",
  };
  return { url, init };
}

function buildCurl(req: SavedRequest, env: Environment | null): string {
  const { url, init } = buildFetchInit(req, env);
  const parts: string[] = ["curl"];
  parts.push(`-X ${req.method}`);
  parts.push(shQuote(url));

  const headers = init.headers as Headers;
  headers.forEach((v, k) => {
    parts.push(`-H ${shQuote(`${k}: ${v}`)}`);
  });

  if (init.body) {
    if (typeof init.body === "string") {
      parts.push(`--data ${shQuote(init.body)}`);
    } else if (init.body instanceof URLSearchParams) {
      parts.push(`--data ${shQuote(init.body.toString())}`);
    } else if (init.body instanceof FormData) {
      init.body.forEach((v, k) => {
        parts.push(`-F ${shQuote(`${k}=${v}`)}`);
      });
    }
  }
  return parts.join(" \\\n  ");
}

function buildFetchSnippet(req: SavedRequest, env: Environment | null): string {
  const { url, init } = buildFetchInit(req, env);
  const headers = init.headers as Headers;
  const headerObj: Record<string, string> = {};
  headers.forEach((v, k) => {
    headerObj[k] = v;
  });

  const lines: string[] = [];
  lines.push(`const res = await fetch(${JSON.stringify(url)}, {`);
  lines.push(`  method: ${JSON.stringify(req.method)},`);
  if (Object.keys(headerObj).length) {
    lines.push(`  headers: ${JSON.stringify(headerObj, null, 2).replace(/\n/g, "\n  ")},`);
  }
  if (init.body) {
    if (typeof init.body === "string") {
      lines.push(`  body: ${JSON.stringify(init.body)},`);
    } else if (init.body instanceof URLSearchParams) {
      lines.push(`  body: new URLSearchParams(${JSON.stringify(init.body.toString())}),`);
    } else if (init.body instanceof FormData) {
      const fdObj: Record<string, string> = {};
      init.body.forEach((v, k) => {
        fdObj[k] = typeof v === "string" ? v : "(binary)";
      });
      lines.push(`  // FormData fields:`);
      lines.push(`  // ${JSON.stringify(fdObj)}`);
    }
  }
  lines.push(`});`);
  lines.push(`const data = await res.text();`);
  lines.push(`console.log(res.status, data);`);
  return lines.join("\n");
}

function shQuote(s: string): string {
  if (!/[^A-Za-z0-9@%+=:,./-]/.test(s)) return s;
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

// ---------- inner components ----------

function NoRequestSelected({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-paper p-8">
      <div className="max-w-md text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
          Empty canvas
        </span>
        <p className="mt-3 font-display text-[26px] leading-tight tracking-tight text-ink">
          Pick a request from the workbench, <span className="italic text-forest">or start a new one.</span>
        </p>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">
          The sidebar holds your collections, your last 50 sends, and any
          environments with <span className="font-mono text-ink">{"{{vars}}"}</span>.
        </p>
        <button
          type="button"
          onClick={onNew}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-bone transition-colors hover:bg-forest"
        >
          <Plus className="h-3 w-3" />
          New request
        </button>
      </div>
    </div>
  );
}

function EnvEditorModal({
  env,
  onChange,
  onClose,
}: {
  env: Environment;
  onChange: (patch: Partial<Environment>) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded border border-hairline bg-bone shadow-warm-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
              Environment
            </span>
            <input
              value={env.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="bg-transparent font-display text-lg tracking-tight text-ink focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-stone transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="font-sans text-sm text-ink-soft">
            Variables replace{" "}
            <span className="font-mono text-ink">{"{{name}}"}</span> tokens in
            the URL, headers, and body before the request fires.
          </p>

          <div className="mt-5 overflow-hidden rounded border border-hairline bg-paper">
            <div className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1.4fr)_32px] items-center border-b border-hairline bg-bone px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
              <span></span>
              <span>Variable</span>
              <span>Value</span>
              <span></span>
            </div>
            {env.variables.length === 0 && (
              <div className="px-4 py-5 text-center">
                <p className="font-mono text-[11px] italic text-stone">
                  No variables yet.
                </p>
              </div>
            )}
            {env.variables.map((v) => (
              <div
                key={v.id}
                className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1.4fr)_32px] items-center border-b border-hairline-soft px-3 py-1.5 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      variables: env.variables.map((x) =>
                        x.id === v.id ? { ...x, enabled: !x.enabled } : x
                      ),
                    })
                  }
                  className={cn(
                    "mx-auto flex h-4 w-4 items-center justify-center rounded border transition-colors",
                    v.enabled
                      ? "border-forest bg-forest text-bone"
                      : "border-hairline bg-paper text-transparent"
                  )}
                >
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                    <path
                      d="M2 6L5 9L10 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <input
                  value={v.key}
                  onChange={(e) =>
                    onChange({
                      variables: env.variables.map((x) =>
                        x.id === v.id ? { ...x, key: e.target.value } : x
                      ),
                    })
                  }
                  placeholder="name"
                  className="min-w-0 border-0 bg-transparent py-1 font-mono text-[12px] text-ink focus:outline-none"
                />
                <input
                  value={v.value}
                  onChange={(e) =>
                    onChange({
                      variables: env.variables.map((x) =>
                        x.id === v.id ? { ...x, value: e.target.value } : x
                      ),
                    })
                  }
                  placeholder="value"
                  className="min-w-0 border-0 border-l border-hairline-soft bg-transparent py-1 pl-3 font-mono text-[12px] text-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      variables: env.variables.filter((x) => x.id !== v.id),
                    })
                  }
                  className="mx-auto flex h-6 w-6 items-center justify-center rounded text-stone transition-colors hover:bg-clay/10 hover:text-clay"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onChange({
                variables: [
                  ...env.variables,
                  {
                    id: `v_${Math.random().toString(36).slice(2, 9)}`,
                    key: "",
                    value: "",
                    enabled: true,
                  },
                ],
              })
            }
            className="mt-3 inline-flex items-center gap-1.5 border-b border-hairline pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <Plus className="h-3 w-3" />
            Add variable
          </button>
        </div>
      </div>
    </div>
  );
}
