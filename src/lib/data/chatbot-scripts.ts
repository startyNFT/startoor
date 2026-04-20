// Scripted mock conversations for the Chatbot UI Kit preview.
// These drive the fake "streaming" in the live preview — no real model calls.
// Each chunk roughly approximates how tokens land in a real stream.

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  /** Delay before this turn begins (ms). Defaults to 700ms. */
  delayMs?: number;
  /** How fast assistant chunks stream in (ms between chunks). Defaults to 22ms. */
  chunkMs?: number;
};

export type ChatScript = {
  id: string;
  title: string;
  description: string;
  tone: string;
  turns: ChatTurn[];
};

export const SCRIPTS: ChatScript[] = [
  {
    id: "support-refund",
    title: "Support · refund request",
    description: "A patient customer working through a broken charge.",
    tone: "calm · concierge",
    turns: [
      {
        role: "user",
        content:
          "Hey — I was charged twice for the same order (#48219). Can you help me sort it out?",
      },
      {
        role: "assistant",
        content:
          "Of course, I can see both charges on your account. Give me one second while I pull the order up.",
        delayMs: 900,
        chunkMs: 18,
      },
      {
        role: "assistant",
        content:
          "Got it — order **#48219** for $128.00 was authorized twice on April 9th, 11:42am. One is a duplicate that never captured, and it should drop off your statement within 3–5 business days on its own.",
        delayMs: 1400,
        chunkMs: 14,
      },
      {
        role: "user",
        content: "Is there any way to speed that up? It's a lot to have sitting there.",
      },
      {
        role: "assistant",
        content:
          "Completely fair. I can manually void the duplicate authorization right now so it clears tonight instead of later this week — want me to do that?",
        delayMs: 1100,
      },
      { role: "user", content: "Yes please." },
      {
        role: "assistant",
        content:
          "Done. Void confirmation is **VD-7731A**. You'll see the pending charge disappear within about 6 hours. Anything else on that order I should look at while I'm in here?",
        delayMs: 1300,
        chunkMs: 16,
      },
      {
        role: "user",
        content: "Actually, could you confirm the shipping address you have on file?",
      },
      {
        role: "assistant",
        content:
          "Sure — it's shipping to **412 Bleecker St, Apt 3R, New York, NY 10014**. That's the same address on file for your last three orders. Want me to change it?",
        delayMs: 1100,
      },
      { role: "user", content: "No that's right. Thanks for the quick help." },
      {
        role: "assistant",
        content:
          "Anytime. I've noted the void on your account in case you need a reference later. Have a good one.",
        delayMs: 900,
        chunkMs: 20,
      },
    ],
  },
  {
    id: "onboarding",
    title: "Onboarding · first workspace",
    description: "A new user spinning up their first project.",
    tone: "helpful · light",
    turns: [
      { role: "user", content: "Hi! Just signed up. Where do I start?" },
      {
        role: "assistant",
        content:
          "Welcome aboard. Quick question first — are you setting this up for yourself, or for a team?",
        delayMs: 800,
      },
      { role: "user", content: "Team. Probably 4 of us to start." },
      {
        role: "assistant",
        content:
          "Nice. Then I'd do these three things in order:\n\n1. Create your **workspace** — it takes about 30 seconds.\n2. Invite your teammates by email (they can accept later).\n3. Import or start a first **project** so there's something to look at.\n\nWant me to walk you through step one?",
        delayMs: 1300,
        chunkMs: 14,
      },
      { role: "user", content: "Yeah let's do it." },
      {
        role: "assistant",
        content:
          "Cool. What would you like to name your workspace? Most people use their company name — you can change it later.",
        delayMs: 900,
      },
      { role: "user", content: "Oakline Studio" },
      {
        role: "assistant",
        content:
          "Love it. I've created **Oakline Studio** and set you as the admin. Your team URL is `oakline.app` — that's where your teammates will log in.",
        delayMs: 1200,
        chunkMs: 16,
      },
      {
        role: "user",
        content: "Can I change the URL later?",
      },
      {
        role: "assistant",
        content:
          "Yes, from Settings → General. Everyone's bookmarks auto-redirect for 90 days, so it's low-risk. Want to send those teammate invites now or later?",
        delayMs: 1000,
      },
      { role: "user", content: "Later is fine." },
      {
        role: "assistant",
        content:
          "All good. I'll drop an invite template in your inbox so it's ready whenever you are.",
        delayMs: 900,
      },
    ],
  },
  {
    id: "coding-help",
    title: "Coding help · debug a race",
    description: "A developer chasing a flaky test.",
    tone: "technical · direct",
    turns: [
      {
        role: "user",
        content:
          "My jest test passes locally but fails in CI about 1 in 5 runs. Feels like a race condition. Any ideas?",
      },
      {
        role: "assistant",
        content:
          "Classic flake signature. Before we dig in — is the flaky test hitting the network, a timer, or a shared filesystem?",
        delayMs: 1100,
      },
      { role: "user", content: "Uses setTimeout inside the component to debounce a save." },
      {
        role: "assistant",
        content:
          "That's almost certainly it. Real timers + jest = nondeterministic in CI because the runner is often CPU-starved. Swap to fake timers:\n\n```ts\nbeforeEach(() => {\n  jest.useFakeTimers();\n});\n\nafterEach(() => {\n  jest.useRealTimers();\n});\n\nit('saves after debounce', async () => {\n  render(<Editor />);\n  fireEvent.change(screen.getByRole('textbox'), {\n    target: { value: 'hi' },\n  });\n  jest.advanceTimersByTime(500);\n  await waitFor(() => {\n    expect(saveMock).toHaveBeenCalled();\n  });\n});\n```\n\nThat makes time deterministic and your CI runs will stop flaking.",
        delayMs: 1400,
        chunkMs: 12,
      },
      { role: "user", content: "Do I need to wrap the state updates in act()?" },
      {
        role: "assistant",
        content:
          "Since React 18, `waitFor` wraps in `act` for you. You only need manual `act()` if you're calling state setters outside a Testing Library helper. In the snippet above, you're fine.",
        delayMs: 1200,
        chunkMs: 14,
      },
      { role: "user", content: "Makes sense. What about the CI timeout being lower?" },
      {
        role: "assistant",
        content:
          "Not the root cause here but worth tuning. With fake timers your test finishes in milliseconds, so the default 5s is plenty. If you were stuck with real timers, I'd raise it to 15s and use `testTimeout` in the jest config — but don't paper over a race with a longer timeout.",
        delayMs: 1500,
        chunkMs: 13,
      },
      { role: "user", content: "Perfect, will try. Thanks." },
      {
        role: "assistant",
        content: "Good luck — ping me if it still flakes and we'll look at the CI container.",
        delayMs: 900,
      },
    ],
  },
  {
    id: "sales-qualification",
    title: "Sales · qualification call",
    description: "A founder poking at whether this tool fits their team.",
    tone: "confident · warm",
    turns: [
      {
        role: "user",
        content: "Is this a good fit for a 12-person design team doing mostly brand work?",
      },
      {
        role: "assistant",
        content:
          "Short answer: probably yes, especially if you're juggling assets across brand systems. Can I ask — what's the workflow you're hoping to improve most?",
        delayMs: 1100,
      },
      {
        role: "user",
        content: "Handoff. Files get lost between Figma and engineering all the time.",
      },
      {
        role: "assistant",
        content:
          "That's our bread and butter. The main difference from other handoff tools: we version the *tokens* not just the screens, so when a designer nudges a color, engineering sees it in their codebase the next morning — no export step.",
        delayMs: 1300,
        chunkMs: 14,
      },
      { role: "user", content: "How much is it for 12 seats?" },
      {
        role: "assistant",
        content:
          "On our team plan, 12 seats comes out to **$348/month** billed annually, or $420 month-to-month. That includes unlimited projects and the Figma / GitHub integrations. Want me to pencil in a demo with our team so you can see it on your actual brand system?",
        delayMs: 1200,
        chunkMs: 16,
      },
      { role: "user", content: "Send me something async first — slides or a Loom." },
      {
        role: "assistant",
        content:
          "Smart. I'll send a 6-minute Loom that walks through the handoff flow end-to-end, plus a one-pager you can forward to engineering. What's your email?",
        delayMs: 1100,
      },
      { role: "user", content: "m.park@oakline.studio" },
      {
        role: "assistant",
        content:
          "Sent. Let me know what lands and what doesn't — happy to follow up with anything specific to brand work.",
        delayMs: 1000,
      },
    ],
  },
  {
    id: "travel-planning",
    title: "Travel · long weekend in Lisbon",
    description: "A relaxed planning back-and-forth.",
    tone: "friendly · curious",
    turns: [
      { role: "user", content: "I have a long weekend in Lisbon next month. Where should I stay?" },
      {
        role: "assistant",
        content:
          "Fun. Two quick questions so I can point you right: is this your first time, and do you care more about walkability or nightlife?",
        delayMs: 1000,
      },
      { role: "user", content: "First time. Walkability, definitely." },
      {
        role: "assistant",
        content:
          "Then I'd stay in **Príncipe Real** or **Chiado**. Both are central, quiet at night, and you can walk to Bairro Alto, Alfama, and the river in 15 minutes. Príncipe Real is slightly more local; Chiado is the pretty tourist heart.",
        delayMs: 1400,
        chunkMs: 14,
      },
      { role: "user", content: "What about food? Any one place I should book ahead?" },
      {
        role: "assistant",
        content:
          "Book **Taberna da Rua das Flores** the week before — tiny, no menu, astonishing. Otherwise Lisbon rewards walking in. Grab a *pastel de nata* at Manteigaria and a grilled sardine from a neighborhood *tasca* and you're doing it right.",
        delayMs: 1300,
        chunkMs: 16,
      },
      { role: "user", content: "Day trip ideas?" },
      {
        role: "assistant",
        content:
          "Three good ones, in order of effort:\n\n- **Sintra** — half day, train from Rossio, see Pena Palace early before crowds.\n- **Cascais** — easy beach town, 40 min train.\n- **Arrábida** — harder to reach without a car but the coastline is the best in the region.",
        delayMs: 1500,
        chunkMs: 13,
      },
      { role: "user", content: "Thanks — this is helpful." },
      {
        role: "assistant",
        content: "Have a great trip. Skip the tram 28 queue and walk it instead — much nicer.",
        delayMs: 900,
      },
    ],
  },
  {
    id: "creative-brief",
    title: "Creative · pitch a name",
    description: "Rapid-fire naming session.",
    tone: "playful · fast",
    turns: [
      {
        role: "user",
        content:
          "Help me name a small-batch olive oil brand. Portuguese roots, modern design, sold in US specialty shops.",
      },
      {
        role: "assistant",
        content:
          "Good brief. A few directions, then we can pull on the thread you like:\n\n- **Lúa** — \"moon\" in old Portuguese, tight and pretty on a bottle.\n- **Foral** — the royal charter given to villages; feels rooted, slightly regal.\n- **Mestra** — \"the master,\" implies craft.\n- **Serra e Sal** — \"hills and salt,\" more descriptive, good for a tagline.\n\nWhich tone is closest?",
        delayMs: 1400,
        chunkMs: 14,
      },
      { role: "user", content: "I like Foral. Feels confident." },
      {
        role: "assistant",
        content:
          "Agreed. It's a short word, it's pronounceable in English (*for-AHL*), and it's almost certainly available as a .com. Want me to riff on a tagline?",
        delayMs: 1100,
      },
      { role: "user", content: "Yeah give me three." },
      {
        role: "assistant",
        content:
          "Sure:\n\n1. **Foral · By charter, by hand.**\n2. **Foral · The oil your village kept for itself.**\n3. **Foral · Small groves, old rules.**\n\nI'd push for number two — it's the one a shop owner would actually repeat.",
        delayMs: 1300,
        chunkMs: 14,
      },
      { role: "user", content: "Love #2. Can you draft a label blurb in that voice?" },
      {
        role: "assistant",
        content:
          "Here's a first pass:\n\n> From a single grove outside Évora, pressed within four hours of picking, bottled in small numbers twice a year. The oil our grandparents didn't sell — now, quietly, for you.\n\n76 words shorter if you need it for a smaller bottle.",
        delayMs: 1500,
        chunkMs: 13,
      },
      { role: "user", content: "Perfect. That's the one." },
      {
        role: "assistant",
        content: "Happy naming. Send me a bottle when it ships.",
        delayMs: 800,
      },
    ],
  },
];

export const TYPING_INDICATORS = [
  { id: "dots", label: "Dots" },
  { id: "wave", label: "Wave" },
  { id: "pulse", label: "Pulse" },
  { id: "cursor", label: "Cursor" },
] as const;

export type TypingIndicator = (typeof TYPING_INDICATORS)[number]["id"];
