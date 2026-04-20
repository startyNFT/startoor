// Seed data for the API Playground tool.
// Permissive public endpoints that will actually respond in-browser without CORS pain.

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type BodyMode = "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw";

export type AuthMode = "none" | "bearer" | "basic" | "api-key" | "custom-header";

export type KVRow = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type AuthConfig = {
  mode: AuthMode;
  bearerToken?: string;
  basicUser?: string;
  basicPass?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: "header" | "query";
  customHeaderName?: string;
  customHeaderValue?: string;
};

export type SavedRequest = {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KVRow[];
  headers: KVRow[];
  bodyMode: BodyMode;
  bodyJson: string;
  bodyFormData: KVRow[];
  bodyUrlEncoded: KVRow[];
  bodyRaw: string;
  bodyRawType: string; // content-type for raw body, e.g. text/plain
  auth: AuthConfig;
  testNotes: string;
  expectedStatus: string;
};

export type Collection = {
  id: string;
  name: string;
  requestIds: string[];
  createdAt: number;
};

export type Environment = {
  id: string;
  name: string;
  variables: KVRow[];
};

export type HistoryEntry = {
  id: string;
  method: HttpMethod;
  url: string;
  status: number | null; // null = failed to reach (CORS/network)
  statusText: string;
  durationMs: number;
  at: number;
  // snapshot to restore
  snapshot: SavedRequest;
};

export type PlaygroundState = {
  version: 1;
  collections: Collection[];
  requests: Record<string, SavedRequest>;
  history: HistoryEntry[];
  environments: Environment[];
  activeEnvId: string | null;
  activeRequestId: string | null;
  ui: {
    sidebarOpen: boolean;
    responseTab: "body" | "headers" | "preview" | "timeline";
    requestTab: "params" | "headers" | "body" | "auth" | "tests";
  };
};

export const STORAGE_KEY = "startoor_api_playground_v1";

export const METHOD_COLORS: Record<HttpMethod, { dot: string; label: string; pill: string }> = {
  GET: { dot: "#1F3A2F", label: "text-forest", pill: "bg-forest/10 text-forest border-forest/20" },
  POST: { dot: "#E8C77F", label: "text-[#8a6a1f]", pill: "bg-butter/25 text-[#7a5d18] border-butter/40" },
  PUT: { dot: "#C85A3F", label: "text-clay", pill: "bg-clay/10 text-clay border-clay/25" },
  PATCH: { dot: "#9DB89F", label: "text-[#4a6b51]", pill: "bg-sage/20 text-[#3f5c47] border-sage/40" },
  DELETE: { dot: "#7a1e1e", label: "text-[#7a1e1e]", pill: "bg-[#7a1e1e]/10 text-[#7a1e1e] border-[#7a1e1e]/25" },
  HEAD: { dot: "#8F8B80", label: "text-stone", pill: "bg-stone/15 text-stone border-stone/30" },
  OPTIONS: { dot: "#8F8B80", label: "text-stone", pill: "bg-stone/15 text-stone border-stone/30" },
};

export const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const rid = (prefix: string, n: number) => `${prefix}_${n.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

function kv(key: string, value: string, enabled = true): KVRow {
  return { id: rid("kv", Math.floor(Math.random() * 1e6)), key, value, enabled };
}

function emptyAuth(): AuthConfig {
  return { mode: "none" };
}

export function makeEmptyRequest(over: Partial<SavedRequest> = {}): SavedRequest {
  return {
    id: rid("req", Date.now()),
    name: "Untitled request",
    method: "GET",
    url: "",
    params: [],
    headers: [],
    bodyMode: "none",
    bodyJson: "",
    bodyFormData: [],
    bodyUrlEncoded: [],
    bodyRaw: "",
    bodyRawType: "text/plain",
    auth: emptyAuth(),
    testNotes: "",
    expectedStatus: "",
    ...over,
  };
}

export function makeEmptyCollection(name = "New collection"): Collection {
  return {
    id: rid("col", Date.now()),
    name,
    requestIds: [],
    createdAt: Date.now(),
  };
}

export function makeEmptyEnvironment(name = "New environment"): Environment {
  return {
    id: rid("env", Date.now()),
    name,
    variables: [],
  };
}

// ---------- seed content ----------

function seedRequest(
  id: string,
  name: string,
  method: HttpMethod,
  url: string,
  over: Partial<SavedRequest> = {}
): SavedRequest {
  return {
    id,
    name,
    method,
    url,
    params: [],
    headers: [],
    bodyMode: "none",
    bodyJson: "",
    bodyFormData: [],
    bodyUrlEncoded: [],
    bodyRaw: "",
    bodyRawType: "text/plain",
    auth: emptyAuth(),
    testNotes: "",
    expectedStatus: "",
    ...over,
  };
}

export function buildSeedState(): PlaygroundState {
  const r1 = seedRequest(
    "seed_req_1",
    "GitHub · Zen",
    "GET",
    "https://api.github.com/zen",
    {
      testNotes:
        "Returns a plaintext zen quote. Great first ping — no auth, tiny payload, always 200.",
      expectedStatus: "200",
    }
  );

  const r2 = seedRequest(
    "seed_req_2",
    "JSONPlaceholder · List posts",
    "GET",
    "https://jsonplaceholder.typicode.com/posts",
    {
      params: [kv("_limit", "5")],
      testNotes: "Paginate with _limit / _page. Pretty JSON render should kick in.",
      expectedStatus: "200",
    }
  );

  const r3 = seedRequest(
    "seed_req_3",
    "JSONPlaceholder · Create post",
    "POST",
    "https://jsonplaceholder.typicode.com/posts",
    {
      bodyMode: "json",
      bodyJson: JSON.stringify(
        { title: "hello from startoor", body: "a warm editorial api playground", userId: 1 },
        null,
        2
      ),
      headers: [kv("Content-Type", "application/json")],
      testNotes: "Mock endpoint — echoes back the payload with a fake id of 101.",
      expectedStatus: "201",
    }
  );

  const r4 = seedRequest(
    "seed_req_4",
    "httpbin · Anything (echo)",
    "POST",
    "https://httpbin.org/anything",
    {
      bodyMode: "json",
      bodyJson: JSON.stringify({ hello: "{{name}}", when: "{{today}}" }, null, 2),
      headers: [kv("Content-Type", "application/json"), kv("X-Env", "{{env}}")],
      testNotes:
        "httpbin echoes everything you send. Try it with the Startoor Demo env to see {{vars}} substituted.",
      expectedStatus: "200",
    }
  );

  const r5 = seedRequest(
    "seed_req_5",
    "httpbin · Status 404",
    "GET",
    "https://httpbin.org/status/404",
    {
      testNotes: "Forces a 404 — useful for verifying the red status pill and error rendering.",
      expectedStatus: "404",
    }
  );

  const r6 = seedRequest(
    "seed_req_6",
    "Dog CEO · Random image",
    "GET",
    "https://dog.ceo/api/breeds/image/random",
    {
      testNotes:
        "Returns a JSON payload with a .message URL. Swap to the image URL in Preview tab.",
      expectedStatus: "200",
    }
  );

  const collection: Collection = {
    id: "seed_col_1",
    name: "Startoor Demo",
    requestIds: [r1.id, r2.id, r3.id, r4.id, r5.id, r6.id],
    createdAt: Date.now(),
  };

  const demoEnv: Environment = {
    id: "seed_env_1",
    name: "Startoor Demo",
    variables: [
      kv("name", "Caroline"),
      kv("today", new Date().toISOString().slice(0, 10)),
      kv("env", "local"),
      kv("base", "https://httpbin.org"),
    ],
  };

  return {
    version: 1,
    collections: [collection],
    requests: {
      [r1.id]: r1,
      [r2.id]: r2,
      [r3.id]: r3,
      [r4.id]: r4,
      [r5.id]: r5,
      [r6.id]: r6,
    },
    history: [],
    environments: [demoEnv],
    activeEnvId: demoEnv.id,
    activeRequestId: r1.id,
    ui: {
      sidebarOpen: true,
      responseTab: "body",
      requestTab: "params",
    },
  };
}
