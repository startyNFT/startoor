"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Smartphone,
  Monitor,
  Check,
  FileCode2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  SCRIPTS,
  TYPING_INDICATORS,
  type ChatScript,
  type TypingIndicator,
} from "@/lib/data/chatbot-scripts";
import {
  ChatHeader,
  ChatInput,
  THEMES,
  ThemeFrame,
  ThemeMessageList,
  TypingKeyframes,
  TypingRow,
  type AvatarStyle,
  type BubbleStyle,
  type ChatMessage,
  type Density,
  type ThemeConfig,
} from "./themes";
import { MessageGallery } from "./message-gallery";

const STORAGE_KEY = "startoor_chatbot_ui_v1";

const DENSITY_OPTIONS: { id: Density; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "normal", label: "Normal" },
  { id: "roomy", label: "Roomy" },
];
const BUBBLE_OPTIONS: { id: BubbleStyle; label: string }[] = [
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
  { id: "pill", label: "Pill" },
  { id: "none", label: "None" },
];
const AVATAR_OPTIONS: { id: AvatarStyle; label: string }[] = [
  { id: "initials", label: "Initials" },
  { id: "emoji", label: "Emoji" },
  { id: "geo", label: "Geo" },
  { id: "none", label: "None" },
];

const ACCENTS = [
  { value: "#C85A3F", label: "Clay" },
  { value: "#1F3A2F", label: "Forest" },
  { value: "#1C1C1A", label: "Ink" },
  { value: "#E8C77F", label: "Butter" },
  { value: "#8BC480", label: "Spring" },
  { value: "#3B5D7E", label: "Indigo" },
  { value: "#9D7B4F", label: "Oak" },
  { value: "#C86B9A", label: "Rose" },
];

const DEFAULTS: ThemeConfig = {
  theme: "editorial",
  accent: "#C85A3F",
  density: "normal",
  bubble: "rounded",
  avatar: "initials",
  typing: "dots",
  userName: "You",
  aiName: "Atlas",
};

type Speed = 0.5 | 1 | 2;

/* --------------------------- helper: stream cadence --------------------------- */

function splitStreamChunks(content: string): string[] {
  // Split by words but keep whitespace, then batch into ~1-3 word chunks for a natural stream.
  const tokens = content.match(/(\s+|[^\s]+)/g) ?? [content];
  const chunks: string[] = [];
  let buf = "";
  let wordsInBuf = 0;
  for (const t of tokens) {
    buf += t;
    if (/\S/.test(t)) wordsInBuf += 1;
    // flush on sentence/newline breaks or once we have a small group
    if (wordsInBuf >= 2 && (/[.!?,:;\n]$/.test(t) || wordsInBuf >= 3)) {
      chunks.push(buf);
      buf = "";
      wordsInBuf = 0;
    }
  }
  if (buf.length > 0) chunks.push(buf);
  return chunks;
}

/* --------------------------- export renderers --------------------------- */

function escapeTemplate(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildJsxSnippet(cfg: ThemeConfig): string {
  return `// Drop-in: one-file React component, Tailwind only, no deps.
// Theme: ${cfg.theme} · accent ${cfg.accent} · density ${cfg.density} · bubbles ${cfg.bubble}
import { useState } from "react";

export function Chatbot() {
  const [messages, setMessages] = useState([
    { id: "1", role: "assistant", content: "Hi — I'm ${escapeTemplate(cfg.aiName)}. What can I help with?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: input }]);
    setInput("");
    // TODO: call your provider (OpenAI, Anthropic, local) here
  };

  return (
    <div className="flex h-[640px] w-full flex-col overflow-hidden rounded-xl border border-black/10 ${cfg.theme === "terminal" ? "bg-[#0C0D0B]" : "bg-[#FAF6ED]"}">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <div className="font-medium ${cfg.theme === "terminal" ? "text-[#E9E7DD]" : "text-[#1C1C1A]"}">${escapeTemplate(cfg.aiName)}</div>
        <span className="h-2 w-2 rounded-full" style={{ background: "${cfg.accent}" }} />
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        {messages.map((m) => (
          <div key={m.id} className={\`flex items-end gap-2 \${m.role === "user" ? "flex-row-reverse" : ""}\`}>
            <div
              className="max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed ${cfg.bubble === "rounded" ? "rounded-2xl" : cfg.bubble === "pill" ? "rounded-full" : ""}"
              style={
                m.role === "user"
                  ? { background: "${cfg.accent}", color: "#faf6ed" }
                  : { background: "${cfg.theme === "terminal" ? "#1a1b17" : "#ffffff"}", color: "${cfg.theme === "terminal" ? "#E9E7DD" : "#1C1C1A"}", border: "1px solid rgba(0,0,0,0.08)" }
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-black/10 px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message"
          className="min-w-0 flex-1 border-0 bg-transparent text-[14px] focus:outline-none"
        />
        <button onClick={send} className="rounded-full px-4 py-1.5 text-sm text-white" style={{ background: "${cfg.accent}" }}>
          Send
        </button>
      </div>
    </div>
  );
}
`;
}

function buildHtmlSnippet(cfg: ThemeConfig): string {
  const bg = cfg.theme === "terminal" ? "#0C0D0B" : "#FAF6ED";
  const ink = cfg.theme === "terminal" ? "#E9E7DD" : "#1C1C1A";
  const aiBg = cfg.theme === "terminal" ? "#1a1b17" : "#ffffff";
  const radius =
    cfg.bubble === "pill" ? "9999px" : cfg.bubble === "rounded" ? "16px" : "0";

  return `<!-- Chatbot UI Kit · ${cfg.theme} -->
<div style="display:flex;flex-direction:column;height:640px;max-width:420px;overflow:hidden;border-radius:12px;border:1px solid rgba(0,0,0,0.1);background:${bg};font-family:ui-sans-serif,system-ui,sans-serif;">
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,0.1);padding:12px 16px;">
    <div style="font-weight:500;color:${ink};">${cfg.aiName}</div>
    <span style="height:8px;width:8px;border-radius:9999px;background:${cfg.accent};"></span>
  </div>
  <div id="cbui-log" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;">
    <div style="display:flex;justify-content:flex-start;">
      <div style="max-width:75%;padding:10px 16px;border-radius:${radius};background:${aiBg};color:${ink};border:1px solid rgba(0,0,0,0.08);font-size:15px;line-height:1.6;">
        Hi — I'm ${cfg.aiName}. What can I help with?
      </div>
    </div>
  </div>
  <form id="cbui-form" style="display:flex;align-items:center;gap:8px;border-top:1px solid rgba(0,0,0,0.1);padding:12px 16px;">
    <input id="cbui-input" placeholder="Type a message"
      style="flex:1;border:0;background:transparent;font-size:14px;color:${ink};outline:none;" />
    <button type="submit"
      style="border:0;border-radius:9999px;padding:6px 16px;color:#faf6ed;background:${cfg.accent};cursor:pointer;">
      Send
    </button>
  </form>
</div>
<script>
(function(){
  var log = document.getElementById("cbui-log");
  var form = document.getElementById("cbui-form");
  var input = document.getElementById("cbui-input");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var text = input.value.trim();
    if(!text) return;
    var row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:flex-end;";
    row.innerHTML = '<div style="max-width:75%;padding:10px 16px;border-radius:${radius};background:${cfg.accent};color:#faf6ed;font-size:15px;line-height:1.6;">' + text + '</div>';
    log.appendChild(row);
    input.value = "";
    log.scrollTop = log.scrollHeight;
  });
})();
</script>`;
}

/* --------------------------- main component --------------------------- */

export function ChatbotApp() {
  const [cfg, setCfg] = useState<ThemeConfig>(DEFAULTS);
  const [scriptId, setScriptId] = useState<string>(SCRIPTS[0]!.id);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(1);
  const [turnIndex, setTurnIndex] = useState(0);
  const [streamedContent, setStreamedContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [phoneFrame, setPhoneFrame] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [exportMode, setExportMode] = useState<"jsx" | "html">("jsx");
  const [copied, setCopied] = useState(false);

  const timers = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const script = useMemo<ChatScript>(
    () => SCRIPTS.find((s) => s.id === scriptId) ?? SCRIPTS[0]!,
    [scriptId],
  );

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ThemeConfig & { scriptId: string }>;
        setCfg((c) => ({ ...c, ...parsed }));
        if (parsed.scriptId && SCRIPTS.some((s) => s.id === parsed.scriptId)) {
          setScriptId(parsed.scriptId);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cfg, scriptId }));
    } catch {}
  }, [cfg, scriptId, hydrated]);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const restart = useCallback(() => {
    clearTimers();
    setTurnIndex(0);
    setStreamedContent("");
    setIsTyping(false);
  }, [clearTimers]);

  // Reset on script change
  useEffect(() => {
    restart();
  }, [scriptId, restart]);

  // Playback engine — drives through the script turn by turn.
  useEffect(() => {
    if (!playing) return;
    if (turnIndex >= script.turns.length) return;

    const turn = script.turns[turnIndex]!;
    const delay = (turn.delayMs ?? 700) / speed;

    if (turn.role === "user") {
      const id = window.setTimeout(() => {
        setTurnIndex((i) => i + 1);
      }, delay);
      timers.current.push(id);
      return () => {
        window.clearTimeout(id);
      };
    }

    // assistant — show typing indicator, then stream chunks.
    const chunks = splitStreamChunks(turn.content);
    const chunkDelay = (turn.chunkMs ?? 22) / speed;
    const typingId = window.setTimeout(() => {
      setIsTyping(true);
      const postTypingId = window.setTimeout(() => {
        setIsTyping(false);
        setStreamedContent("");
        chunks.forEach((_, i) => {
          const tid = window.setTimeout(
            () => {
              setStreamedContent(chunks.slice(0, i + 1).join(""));
              if (i === chunks.length - 1) {
                const finalize = window.setTimeout(() => {
                  setStreamedContent("");
                  setTurnIndex((x) => x + 1);
                }, 300 / speed);
                timers.current.push(finalize);
              }
            },
            i * chunkDelay + 60,
          );
          timers.current.push(tid);
        });
      }, Math.max(400, delay * 0.6));
      timers.current.push(postTypingId);
    }, delay * 0.3);
    timers.current.push(typingId);

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, turnIndex, script, speed]);

  // Auto-scroll preview to bottom on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [turnIndex, streamedContent, isTyping, cfg.theme, cfg.density]);

  // Build message list for preview
  const messages = useMemo<ChatMessage[]>(() => {
    const list: ChatMessage[] = [];
    for (let i = 0; i < Math.min(turnIndex, script.turns.length); i++) {
      const t = script.turns[i]!;
      list.push({ id: `t${i}`, role: t.role, content: t.content });
    }
    if (turnIndex < script.turns.length) {
      const cur = script.turns[turnIndex]!;
      if (cur.role === "assistant" && streamedContent) {
        list.push({
          id: `t${turnIndex}-stream`,
          role: "assistant",
          content: streamedContent,
          streaming: true,
        });
      }
    }
    return list;
  }, [turnIndex, streamedContent, script]);

  const showTyping =
    playing &&
    turnIndex < script.turns.length &&
    script.turns[turnIndex]!.role === "assistant" &&
    isTyping;

  const onScrub = (pct: number) => {
    clearTimers();
    const idx = Math.round(pct * script.turns.length);
    setPlaying(false);
    setStreamedContent("");
    setIsTyping(false);
    setTurnIndex(Math.min(idx, script.turns.length));
  };

  const atEnd = turnIndex >= script.turns.length;

  const copyExport = async () => {
    const snippet = exportMode === "jsx" ? buildJsxSnippet(cfg) : buildHtmlSnippet(cfg);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success(`${exportMode.toUpperCase()} snippet copied — paste it wherever.`);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy to clipboard.");
    }
  };

  /* ----------------------------- render ----------------------------- */

  return (
    <div className="relative">
      <TypingKeyframes />
      {/* Intro header */}
      <header className="relative border-b border-hairline bg-paper">
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-12 md:px-10 md:pt-20 md:pb-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                Try it · Chatbot UI Kit
              </span>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-[5rem]">
                Five chats,
                <br />
                <span className="italic text-forest">one kit.</span>
                <br />
                Bring your own model.
              </h1>
              <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
                Pick a theme, tune the density, swap the accent — see your chat
                render with a real streaming conversation. Copy the snippet,
                wire it to whichever provider you want. No lock-in, no SDK.
              </p>
            </div>
            <aside className="hidden max-w-sm lg:block">
              <div className="space-y-5 border-t border-hairline pt-6 font-sans text-sm leading-relaxed text-ink-soft">
                <p>
                  Every theme is a separate visual world — Editorial, Terminal,
                  Soft, Classic, Minimalist. Same mocked transcript, five very
                  different moods.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Part of ·{" "}
                  <Link
                    href="/products/chatbot-ui-kit"
                    className="text-ink hover:text-clay"
                  >
                    Startoor · Chatbot UI Kit
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
        <div className="paper-grain pointer-events-none absolute inset-0" />
      </header>

      {/* Builder */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-12">
          {/* Controls column */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="space-y-8">
              <ControlBlock index="01" title="Theme">
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCfg({ ...cfg, theme: t.id })}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        cfg.theme === t.id
                          ? "border-ink bg-bone"
                          : "border-hairline hover:border-ink",
                      )}
                    >
                      <div
                        className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md"
                        style={{ background: t.swatch.base }}
                      >
                        <div className="flex gap-0.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: t.swatch.ink }} />
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: t.swatch.accent }}
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-sans text-sm font-medium text-ink">{t.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                          {t.tagline}
                        </div>
                      </div>
                      {cfg.theme === t.id && <Check className="h-3.5 w-3.5 text-forest" />}
                    </button>
                  ))}
                </div>
              </ControlBlock>

              <ControlBlock index="02" title="Accent">
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setCfg({ ...cfg, accent: a.value })}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform hover:scale-105",
                        cfg.accent === a.value ? "border-ink" : "border-transparent",
                      )}
                      style={{ background: a.value }}
                      aria-label={a.label}
                      title={a.label}
                    />
                  ))}
                </div>
              </ControlBlock>

              <ControlBlock index="03" title="Layout">
                <SegmentedRow
                  label="Density"
                  value={cfg.density}
                  options={DENSITY_OPTIONS}
                  onChange={(v) => setCfg({ ...cfg, density: v })}
                />
                <div className="mt-4">
                  <SegmentedRow
                    label="Bubble"
                    value={cfg.bubble}
                    options={BUBBLE_OPTIONS}
                    onChange={(v) => setCfg({ ...cfg, bubble: v })}
                  />
                </div>
                <div className="mt-4">
                  <SegmentedRow
                    label="Avatar"
                    value={cfg.avatar}
                    options={AVATAR_OPTIONS}
                    onChange={(v) => setCfg({ ...cfg, avatar: v })}
                  />
                </div>
              </ControlBlock>

              <ControlBlock index="04" title="Identity">
                <div className="grid gap-3">
                  <LabeledInput
                    label="User name"
                    value={cfg.userName}
                    onChange={(v) => setCfg({ ...cfg, userName: v })}
                  />
                  <LabeledInput
                    label="AI name"
                    value={cfg.aiName}
                    onChange={(v) => setCfg({ ...cfg, aiName: v })}
                  />
                  <div>
                    <Label>Typing indicator</Label>
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {TYPING_INDICATORS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setCfg({ ...cfg, typing: t.id as TypingIndicator })}
                          className={cn(
                            "rounded-md border px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                            cfg.typing === t.id
                              ? "border-ink bg-bone text-ink"
                              : "border-hairline text-stone hover:border-ink hover:text-ink",
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ControlBlock>

              <ControlBlock index="05" title="Conversation">
                <div className="space-y-1.5">
                  {SCRIPTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setScriptId(s.id)}
                      className={cn(
                        "block w-full rounded-md border px-3 py-2 text-left transition-colors",
                        scriptId === s.id
                          ? "border-ink bg-bone"
                          : "border-hairline hover:border-ink",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-sans text-[13px] font-medium text-ink">
                          {s.title}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone">
                          {s.turns.length} turns
                        </span>
                      </div>
                      <div className="mt-0.5 truncate font-sans text-[12px] text-stone">
                        {s.description}
                      </div>
                    </button>
                  ))}
                </div>
              </ControlBlock>
            </div>
          </aside>

          {/* Preview column */}
          <section className="min-w-0">
            {/* Toolbar above the preview */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                  Live preview
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-stone md:inline">
                  · mocked stream · BYO provider
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-hairline bg-bone p-0.5">
                <ToolbarToggle
                  active={!phoneFrame}
                  onClick={() => setPhoneFrame(false)}
                  title="Desktop"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </ToolbarToggle>
                <ToolbarToggle
                  active={phoneFrame}
                  onClick={() => setPhoneFrame(true)}
                  title="Phone"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </ToolbarToggle>
              </div>
            </div>

            {/* The frame */}
            <div
              className={cn(
                "relative rounded-2xl border border-hairline bg-paper p-6 md:p-10",
                phoneFrame && "paper-grain",
              )}
            >
              <ThemeFrame theme={cfg.theme} phoneFrame={phoneFrame}>
                <ChatHeader theme={cfg.theme} aiName={cfg.aiName} accent={cfg.accent} />
                <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                  <ThemeMessageList messages={messages} cfg={cfg} />
                  {showTyping && (
                    <div className="pb-4">
                      <TypingRow cfg={cfg} />
                    </div>
                  )}
                  {atEnd && (
                    <div className="px-6 py-4 text-center">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
                        end of transcript
                      </span>
                    </div>
                  )}
                </div>
                <ChatInput theme={cfg.theme} accent={cfg.accent} disabled />
              </ThemeFrame>
            </div>

            {/* Playback controls */}
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-hairline bg-bone px-4 py-3">
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => {
                    if (atEnd) restart();
                    setPlaying((p) => !p);
                  }}
                  label={playing && !atEnd ? "Pause" : "Play"}
                >
                  {playing && !atEnd ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </IconButton>
                <IconButton onClick={restart} label="Restart">
                  <RotateCcw className="h-3.5 w-3.5" />
                </IconButton>
              </div>

              <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  {String(Math.min(turnIndex, script.turns.length)).padStart(2, "0")}/
                  {String(script.turns.length).padStart(2, "0")}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round((turnIndex / script.turns.length) * 100)}
                  onChange={(e) => onScrub(Number(e.target.value) / 100)}
                  className="flex-1 accent-ink"
                />
              </div>

              <div className="flex items-center gap-1 rounded-full border border-hairline bg-paper p-0.5">
                {([0.5, 1, 2] as Speed[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                      speed === s
                        ? "bg-ink text-bone"
                        : "text-stone hover:text-ink",
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="mt-8 rounded-xl border border-hairline bg-warm-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-clay">
                    Export
                  </span>
                  <div className="flex items-center gap-1 rounded-full border border-hairline bg-bone p-0.5">
                    <ToolbarToggle
                      active={exportMode === "jsx"}
                      onClick={() => setExportMode("jsx")}
                      title="JSX"
                    >
                      <FileCode2 className="h-3 w-3" />
                      <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                        JSX
                      </span>
                    </ToolbarToggle>
                    <ToolbarToggle
                      active={exportMode === "html"}
                      onClick={() => setExportMode("html")}
                      title="HTML"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                        HTML
                      </span>
                    </ToolbarToggle>
                  </div>
                </div>
                <button
                  onClick={copyExport}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-sans text-[13px] transition-colors",
                    copied
                      ? "bg-forest text-bone"
                      : "bg-ink text-bone hover:bg-forest",
                  )}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="max-h-72 overflow-auto px-4 py-4 font-mono text-[12px] leading-relaxed text-ink-soft">
                <code>
                  {exportMode === "jsx" ? buildJsxSnippet(cfg) : buildHtmlSnippet(cfg)}
                </code>
              </pre>
            </div>

            {/* Static component gallery */}
            <MessageGallery />
          </section>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- control primitives ----------------------------- */

function ControlBlock({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-display text-2xl leading-none tracking-tight text-clay">
          {index}
        </span>
        <span className="font-display text-base leading-none tracking-tight text-ink">
          {title}
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
      {children}
    </span>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-hairline bg-transparent py-1.5 font-sans text-sm text-ink focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function SegmentedRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              value === o.id
                ? "border-ink bg-bone text-ink"
                : "border-hairline text-stone hover:border-ink hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-paper text-ink transition-colors hover:bg-ink hover:text-bone"
    >
      {children}
    </button>
  );
}

function ToolbarToggle({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 transition-colors",
        active ? "bg-ink text-bone" : "text-stone hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
