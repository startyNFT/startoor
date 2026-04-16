// Content ideas — 400 specific, real-feel prompts for the Content Calendar Kit.
// Even platform distribution; all pillars represented; varied formats + difficulty.
// Slot tokens: {metric}, {competitor}, {n}, {role}, {niche}, {tool}, {result}, {timeframe}

export type Platform =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "newsletter"
  | "blog";

export type Pillar =
  | "teach"
  | "story"
  | "opinion"
  | "behind-the-scenes"
  | "case-study"
  | "community"
  | "product"
  | "curate";

export type Format =
  | "text"
  | "thread"
  | "carousel"
  | "short-video"
  | "long-video"
  | "long-form"
  | "reel"
  | "live";

export type Difficulty = "quick" | "medium" | "deep";

export type ContentIdea = {
  id: string;
  title: string;
  platform: Platform;
  pillar: Pillar;
  format: Format;
  difficulty: Difficulty;
  hook_idea?: string;
  cta_idea?: string;
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  newsletter: "Newsletter",
  blog: "Blog",
};

export const PILLAR_LABELS: Record<Pillar, string> = {
  teach: "Teach",
  story: "Story",
  opinion: "Opinion",
  "behind-the-scenes": "Behind the scenes",
  "case-study": "Case study",
  community: "Community",
  product: "Product",
  curate: "Curate",
};

export const FORMAT_LABELS: Record<Format, string> = {
  text: "Text post",
  thread: "Thread",
  carousel: "Carousel",
  "short-video": "Short video",
  "long-video": "Long video",
  "long-form": "Long-form",
  reel: "Reel",
  live: "Live",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  quick: "Quick (15 min)",
  medium: "Medium (1 hr)",
  deep: "Deep (half day+)",
};

// 8 distinct muted hues for pillar coloring — all from the warm editorial family.
export const PILLAR_COLORS: Record<Pillar, string> = {
  teach: "#1F3A2F",               // forest
  story: "#C85A3F",               // clay
  opinion: "#9D7B4F",             // oak (clay/butter blend)
  "behind-the-scenes": "#8F8B80", // stone
  "case-study": "#3B5D7E",        // indigo
  community: "#9DB89F",           // sage
  product: "#E8C77F",             // butter
  curate: "#6D5A7E",              // dusk (desaturated plum)
};

// ---------------------------------------------------------------------------
// Idea construction — one block per platform (57 each, 399 total) + 1 bonus.
// ---------------------------------------------------------------------------

let _seq = 0;
const mk = (
  title: string,
  platform: Platform,
  pillar: Pillar,
  format: Format,
  difficulty: Difficulty,
  hook_idea?: string,
  cta_idea?: string,
): ContentIdea => ({
  id: `ci_${(++_seq).toString().padStart(3, "0")}`,
  title,
  platform,
  pillar,
  format,
  difficulty,
  hook_idea,
  cta_idea,
});

// =========================== TWITTER (57) ===========================
const TWITTER: ContentIdea[] = [
  mk("The {metric} dashboard I check every Monday morning", "twitter", "teach", "thread", "medium", "Most {role}s track the wrong number. I track these five.", "Link to the template in replies."),
  mk("I charged a client 3x more than last year — here's what changed in my pitch", "twitter", "story", "thread", "medium", "Same deliverable. Same hours. Triple the invoice.", "What part surprised you?"),
  mk("Why the {niche} playbook everyone uses stopped working in 2026", "twitter", "opinion", "thread", "deep", "The thing worked. Then it stopped. Nobody noticed.", "Disagree? Drop a reply with your counter."),
  mk("Screenshot of my first-ever invoice vs. last week's invoice", "twitter", "behind-the-scenes", "text", "quick", "Eight years apart. Same first name.", "Follow for more ugly starts."),
  mk("How I shipped {result} in a {timeframe} sprint — the whole scorecard", "twitter", "case-study", "thread", "deep", "Three weeks. One dashboard. Real numbers.", "Reply with your current sprint and I'll send notes."),
  mk("What would you tell someone on day one of {niche}?", "twitter", "community", "text", "quick", "I'm stealing the best replies for a guide.", "Drop yours below."),
  mk("Five features we shipped this month in {tool} — ranked by how quiet they are", "twitter", "product", "thread", "medium", "The smallest one is the best one.", "Try the one you missed: {link}"),
  mk("Ten tweets I saved this week (thread)", "twitter", "curate", "thread", "quick", "Week after week, my bookmarks do the reading for me.", "Which one would you save?"),
  mk("The one question I ask every discovery call that kills bad deals early", "twitter", "teach", "text", "quick", "Saves me two weeks on average.", "Want the follow-up list? Comment 'SEND'."),
  mk("I almost quit in month 9. Here's the spreadsheet that made me stay.", "twitter", "story", "thread", "medium", "It wasn't revenue. It was retention.", "Tell me your month-9 moment."),
  mk("Unpopular: most {niche} advice is written by people who no longer do the work", "twitter", "opinion", "text", "quick", "If it sounds universal, it's probably stale.", "Who still works in-market and you trust?"),
  mk("My actual desk, the messy corner, and the one object I won't move", "twitter", "behind-the-scenes", "text", "quick", "The tape is load-bearing.", "Show me yours."),
  mk("How I retained a churning customer with a {n}-line email", "twitter", "case-study", "thread", "medium", "No discount. No comp. Just honesty.", "I'll send the template if you reply."),
  mk("What does your {niche} toolkit look like in 2026?", "twitter", "community", "text", "quick", "Mine changed twice this year.", "Reply with yours."),
  mk("What's new in {tool} this week — a {n}-tweet walkthrough", "twitter", "product", "thread", "medium", "Three things most users missed.", "Full release notes in the link."),
  mk("Seven newsletters worth the inbox space in 2026", "twitter", "curate", "thread", "quick", "No swaps. No sponsorships. Just good.", "Tag one I should add."),
  mk("The briefing template I send before every kickoff", "twitter", "teach", "text", "quick", "One page. Four questions. Zero scope creep.", "Reply and I'll DM it."),
  mk("I lost a client last week. Here's what I learned reading the post-mortem.", "twitter", "story", "thread", "medium", "The break happened three months before the call.", "Have you ever lost one you deserved to keep?"),
  mk("Hot take: hiring a {role} before your pipeline is built is cosplay", "twitter", "opinion", "text", "quick", "Do the thing first. Hire the thing second.", "Agree? RT. Disagree? Reply."),
  mk("The three tabs open during every launch day", "twitter", "behind-the-scenes", "text", "quick", "One is always a spreadsheet.", "Guess which tool the other two are."),
  mk("How we took a ${n}k project from pitch to handoff in {timeframe}", "twitter", "case-study", "thread", "deep", "Twelve check-ins. Zero scope creep.", "Want the full timeline? Reply 'MAP'."),
  mk("Poll: which {niche} metric do you pretend to understand but don't?", "twitter", "community", "text", "quick", "Mine used to be CAC payback.", "Vote honestly."),
  mk("Four things you can do in {tool} today that you couldn't last month", "twitter", "product", "thread", "medium", "Release notes, translated.", "Try one and tell me which."),
  mk("The {n} best writing tools I pay for — and two I finally dropped", "twitter", "curate", "thread", "medium", "My stack got lighter this year.", "What did you drop?"),
  mk("A simple frame for pricing creative work without a spreadsheet", "twitter", "teach", "thread", "medium", "I use this in every proposal.", "Want the worksheet? Comment."),
  mk("The first client email that made me feel like this job was real", "twitter", "story", "text", "quick", "It was eleven lines. I still have it.", "What's the one you saved?"),
  mk("{competitor}'s latest release is a polite way of admitting they were wrong", "twitter", "opinion", "text", "quick", "I'm not mad. I'm just paying attention.", "What did you read between the lines?"),
  mk("How I actually book a 'deep work' day on the calendar (not the Instagram version)", "twitter", "behind-the-scenes", "thread", "medium", "One word blocks. A coffee ritual. A print-off.", "Steal the block template in replies."),
  mk("A 14-day audit I ran on a dying funnel — the three fixes that mattered", "twitter", "case-study", "thread", "deep", "I expected ten problems. Found three.", "Reply and I'll send you the checklist."),
  mk("What's the weirdest place you landed a client?", "twitter", "community", "text", "quick", "Mine: a PTA meeting.", "Go."),
  mk("What the new {tool} export actually does (and doesn't)", "twitter", "product", "thread", "medium", "Tested it against three workflows.", "Open the link if you export weekly."),
  mk("The {n} Substacks doing the best {niche} writing right now", "twitter", "curate", "thread", "medium", "I read them the week they ship.", "Add your favorite."),
  mk("A tiny framework for killing meetings without being rude", "twitter", "teach", "thread", "quick", "Three questions. One follow-up.", "I'll send the script to anyone who replies."),
  mk("The day I realized I'd outgrown my agency — told in three invoices", "twitter", "story", "thread", "medium", "The third one broke the old ceiling.", "When did you see the ceiling?"),
  mk("Stop putting 'expert' in your bio", "twitter", "opinion", "text", "quick", "It's the word people who aren't use most.", "What would you put instead?"),
  mk("What a slow Tuesday looks like when you own the business", "twitter", "behind-the-scenes", "text", "quick", "Spoiler: a lot of it is laundry.", "Normalize the slow Tuesday."),
  mk("How one annotation cut our sales cycle by {n} days", "twitter", "case-study", "thread", "medium", "We added it as a tooltip. That's it.", "Reply for a screenshot."),
  mk("What's the best piece of advice your first mentor gave you?", "twitter", "community", "text", "quick", "Mine's still taped next to my monitor.", "Tag them if they're here."),
  mk("A walkthrough of my {tool} dashboard after one year of use", "twitter", "product", "thread", "medium", "The default layout was the problem.", "Try it and tell me your first change."),
  mk("Six podcasts I keep in heavy rotation for {niche}", "twitter", "curate", "thread", "quick", "Only two of them are new.", "Which of these is in yours?"),
  mk("The briefing doc I now require before I take a creative project", "twitter", "teach", "text", "medium", "Cuts revisions roughly in half.", "Comment 'BRIEF' for the template."),
  mk("I raised my rate mid-project once. Here's the email I sent.", "twitter", "story", "text", "quick", "I was terrified. It worked.", "Reply and I'll share the full language."),
  mk("Portfolio sites are mostly resumes pretending to be websites", "twitter", "opinion", "text", "quick", "Build the page that makes someone reach out.", "What's the best one you've ever seen?"),
  mk("The paper journal I use for client work — and how I actually index it", "twitter", "behind-the-scenes", "thread", "medium", "Tabs. Stickers. A numbering system.", "I'll share the page template if you reply."),
  mk("A migration from {competitor} that took us nine days and saved $42k/yr", "twitter", "case-study", "thread", "deep", "We didn't rush. We switched.", "Reply 'PLAN' for our migration playbook."),
  mk("Best career advice for a {role} in their first year?", "twitter", "community", "text", "quick", "I'm compiling the best ones.", "Drop your line."),
  mk("What's actually new in {tool} v4 — and what's marketing-speak", "twitter", "product", "thread", "medium", "Three real wins. Two shrug-worthy.", "Read the full breakdown."),
  mk("Ten YouTube channels that teach {niche} better than most courses", "twitter", "curate", "thread", "medium", "All free. All evergreen.", "Tag one I missed."),
  mk("A two-line prompt I use to brief a freelance designer", "twitter", "teach", "text", "quick", "Replaces three paragraphs of vibes.", "Reply 'PROMPT' for the full set."),
  mk("The story of my most expensive client mistake — and what it taught me about contracts", "twitter", "story", "thread", "deep", "Five figures. Zero signed paper.", "Tell me your expensive lesson."),
  mk("I'm tired of {niche} 'frameworks'. Here's what actually ships work.", "twitter", "opinion", "thread", "medium", "Constraints. Rituals. Deadlines.", "What actually ships your work?"),
  mk("The three tabs I never close during a launch week", "twitter", "behind-the-scenes", "text", "quick", "One of them is embarrassing.", "Guess which."),
  mk("The micro-launch that quietly did ${n}k in seven days", "twitter", "case-study", "thread", "medium", "No ads. One email. A friend network.", "Reply for the exact sequence."),
  mk("What's a tool you pay for and everyone else sleeps on?", "twitter", "community", "text", "quick", "I'll add the best answers to a shortlist.", "Share yours."),
  mk("How we set up workspace defaults in {tool} for a new hire's first day", "twitter", "product", "thread", "medium", "Cut onboarding from a week to a morning.", "Snag the checklist."),
  mk("The {n} books every {role} should read before they hire", "twitter", "curate", "thread", "medium", "Two of these aren't business books.", "Add a title."),
  mk("The one contract clause I add to every project now", "twitter", "teach", "text", "quick", "Earned it the hard way.", "Reply 'CLAUSE' for the exact wording."),
];

// =========================== LINKEDIN (57) ===========================
const LINKEDIN: ContentIdea[] = [
  mk("The CFO question that changed how I budget for {niche}", "linkedin", "teach", "text", "medium", "Not 'what does it cost?' — something quieter.", "What's a finance question that reframed your team?"),
  mk("A decade in, here's the skill I wish I'd learned first", "linkedin", "story", "text", "medium", "It wasn't strategy. It wasn't sales.", "What would you tell year-one you?"),
  mk("Stop asking candidates 'what's your weakness' — here's what works", "linkedin", "opinion", "text", "quick", "Three questions that tell you more in ten minutes.", "What's your favorite interview question?"),
  mk("What our leadership off-site actually looked like (no Instagram version)", "linkedin", "behind-the-scenes", "carousel", "medium", "Post-its, bad coffee, one real fight.", "Comment and I'll share the agenda."),
  mk("How we doubled {metric} in one quarter by removing a single step", "linkedin", "case-study", "text", "medium", "Not a tool. Not a hire. A removal.", "Reply and I'll send the before/after."),
  mk("What's the piece of career advice that aged the worst for you?", "linkedin", "community", "text", "quick", "Mine involved a five-year plan.", "Drop yours in the comments."),
  mk("A walkthrough of the dashboard our exec team looks at every Monday", "linkedin", "product", "carousel", "medium", "Three charts. One color. Zero vanity metrics.", "Comment 'TEMPLATE' for a Figma copy."),
  mk("Eight leadership newsletters I've read every week for a year", "linkedin", "curate", "text", "quick", "The ones I didn't unsubscribe from.", "Which would you add?"),
  mk("How to write a one-page strategy memo your board will actually read", "linkedin", "teach", "carousel", "deep", "Not a deck. Not a plan. A memo.", "Comment and I'll send the template."),
  mk("The call I took on a Friday at 5pm that changed our hiring policy", "linkedin", "story", "text", "medium", "It was a candidate who didn't get the job.", "Has feedback ever changed your process?"),
  mk("Hot take: remote-first isn't a perk, it's a discipline", "linkedin", "opinion", "text", "quick", "Companies who said it out loud are the ones still doing it.", "Where do you stand?"),
  mk("A peek at our company handbook — the three pages we never skip in onboarding", "linkedin", "behind-the-scenes", "carousel", "medium", "One is about meetings. Two are about trust.", "Want a template? Comment 'BOOK'."),
  mk("How a {role} team cut their reporting cycle from {n} days to {timeframe}", "linkedin", "case-study", "carousel", "deep", "Not with AI. With a shared definition.", "Reply for the SOP."),
  mk("What did your best manager do that you now do yourself?", "linkedin", "community", "text", "quick", "Mine taught me how to end a meeting early.", "Share yours."),
  mk("What's new in {tool} for team leads — a walkthrough", "linkedin", "product", "carousel", "medium", "The three features nobody demoed at launch.", "Try them and let me know."),
  mk("Ten LinkedIn voices I trust on {niche} — and why", "linkedin", "curate", "carousel", "medium", "No gurus. Just people who actually do the work.", "Tag one I'm missing."),
  mk("A playbook for running a weekly one-on-one without it feeling like a status meeting", "linkedin", "teach", "carousel", "medium", "Three questions. One ritual. A shared doc.", "Comment 'ONE' for the doc."),
  mk("Why I turned down the promotion I thought I wanted", "linkedin", "story", "text", "medium", "A smaller role. A bigger lever.", "Have you ever said no to a title?"),
  mk("The 'best practice' in {niche} that became a bad habit", "linkedin", "opinion", "text", "medium", "We forgot why we started doing it.", "What 'best practice' would you retire?"),
  mk("Our first all-hands format change — here's what actually shifted", "linkedin", "behind-the-scenes", "text", "medium", "Cut the updates. Kept the questions.", "How's yours run?"),
  mk("How one customer-success process change reduced churn by {n}%", "linkedin", "case-study", "carousel", "medium", "A single field on a ticket.", "Comment 'PROCESS' for the before/after."),
  mk("What's the best feedback you've ever received from a peer?", "linkedin", "community", "text", "quick", "Mine was about a habit, not a hard skill.", "Share one if it still echoes."),
  mk("The {tool} integration that quietly replaced three Zapier flows", "linkedin", "product", "text", "medium", "Zero maintenance since January.", "Try the walkthrough in the link."),
  mk("Seven reports worth the inbox subscription if you lead {niche} teams", "linkedin", "curate", "carousel", "quick", "All paid. All worth it.", "What would you add?"),
  mk("A simple framework for deciding who to hire next on a ten-person team", "linkedin", "teach", "carousel", "deep", "A map. A gap. A budget.", "Comment and I'll share the canvas."),
  mk("The first time I fired a friend — and what I'd do differently", "linkedin", "story", "text", "deep", "The conversation was easier than the week after.", "Have you had the same moment?"),
  mk("Most 'culture' posts are marketing in a hoodie", "linkedin", "opinion", "text", "quick", "Culture is what you tolerate on a Tuesday.", "What do you actually tolerate?"),
  mk("Inside our quarterly planning week — the actual agenda", "linkedin", "behind-the-scenes", "carousel", "medium", "Day one: last quarter's truths.", "Comment for the full run-of-show."),
  mk("How a {role} team turned a customer advisory board into a product pipeline", "linkedin", "case-study", "carousel", "deep", "Six customers. Eight shipped features.", "Comment 'CAB' for the playbook."),
  mk("What's a boring process that quietly unlocked your team this year?", "linkedin", "community", "text", "quick", "Ours was document naming.", "Share yours."),
  mk("A tour of {tool}'s new workspace permissions (for the people who actually use them)", "linkedin", "product", "carousel", "medium", "Admins, this one's for you.", "Comment 'PERMS' for our config."),
  mk("The six books every new manager on our team reads in month one", "linkedin", "curate", "carousel", "quick", "Three are under 200 pages.", "Add yours."),
  mk("How to write a performance review without the generic phrases", "linkedin", "teach", "carousel", "medium", "Start with verbs, not adjectives.", "Comment for our review template."),
  mk("The conversation that made me reconsider our remote policy", "linkedin", "story", "text", "medium", "Not with a CEO. With a parent.", "Has someone's story changed your mind lately?"),
  mk("The LinkedIn 'best in class' trap", "linkedin", "opinion", "text", "quick", "You don't need a playbook. You need a problem.", "Tell me the last 'best in class' post you ignored."),
  mk("How our leadership team reads the same book every quarter (and why it works)", "linkedin", "behind-the-scenes", "carousel", "medium", "The ritual is more than the reading.", "Comment for the list."),
  mk("The talent pipeline we rebuilt in {n} months — here's the dashboard", "linkedin", "case-study", "carousel", "deep", "From referrals only to a proper funnel.", "Reply 'PIPE' for the template."),
  mk("What's a ritual your team stole from another company and made your own?", "linkedin", "community", "text", "quick", "We stole 'Friday memo' and never looked back.", "Share your ritual."),
  mk("Three features in {tool} for managing cross-team dependencies", "linkedin", "product", "carousel", "medium", "The third is hidden in a settings menu.", "Comment 'DEP' and I'll send the walkthrough."),
  mk("The {n} podcasts that shaped how I run our weekly leadership sync", "linkedin", "curate", "carousel", "quick", "All under an hour.", "Add yours."),
  mk("A practical guide to saying 'no' without sounding difficult", "linkedin", "teach", "carousel", "medium", "Three phrases. Zero resentment.", "Comment if you'd like the one-pager."),
  mk("The project I killed on day 47 — and what I learned about sunk cost", "linkedin", "story", "text", "deep", "My team wanted to keep going. I didn't.", "Have you killed one too soon — or too late?"),
  mk("Culture decks are underrated. Here's how to read one as a candidate.", "linkedin", "opinion", "carousel", "medium", "Four things most candidates miss.", "What did you wish you'd caught earlier?"),
  mk("How our execs actually prep for board meetings — not the polished version", "linkedin", "behind-the-scenes", "text", "medium", "One deck, two rehearsals, zero surprises.", "Comment for the prep checklist."),
  mk("A {role}-led pricing change that grew ARPU by {n}% without raising prices", "linkedin", "case-study", "carousel", "deep", "We moved the floor. Nobody noticed.", "Reply 'PRICE' for our worksheet."),
  mk("Poll: what's the first hire you'd make at a ten-person {niche} company?", "linkedin", "community", "text", "quick", "I have a strong opinion.", "Vote and I'll share mine."),
  mk("What's new in {tool}'s reporting — and why your CFO will care", "linkedin", "product", "carousel", "medium", "Two numbers that weren't there last quarter.", "Comment for a quick demo."),
  mk("Eight conferences that paid for themselves this year", "linkedin", "curate", "carousel", "medium", "Two are local. One's online.", "Add yours."),
  mk("A framework for introducing OKRs without killing momentum", "linkedin", "teach", "carousel", "deep", "Three meetings. One dashboard. A buffer month.", "Comment 'OKR' for our doc."),
  mk("The day I stopped running status meetings — and what replaced them", "linkedin", "story", "text", "medium", "A weekly one-pager. That's it.", "How did you change yours?"),
  mk("If you say 'we're hiring' more than 'we're working' on LinkedIn, something's off", "linkedin", "opinion", "text", "quick", "Show the work. Hiring follows.", "Disagree?"),
  mk("A week in the life of our COO — in ten photos", "linkedin", "behind-the-scenes", "carousel", "medium", "Zero glamour. A lot of calendars.", "Want the time-tracking doc?"),
  mk("How a boring documentation sprint closed {n} open tickets", "linkedin", "case-study", "text", "medium", "Two writers. One week. A rubric.", "Comment 'DOCS' for our rubric."),
  mk("What's a 'rule' in your industry that you quietly ignore?", "linkedin", "community", "text", "quick", "Mine's about Friday launches.", "Share yours."),
  mk("Six ways to use {tool}'s new API that aren't in the docs yet", "linkedin", "product", "carousel", "deep", "I've been writing about it for a month.", "Comment 'API' for the full list."),
  mk("The {n} best annual reports from {niche} companies in 2025", "linkedin", "curate", "carousel", "medium", "Design and substance.", "Which did you read cover to cover?"),
  mk("A practical template for the first 30 days of a new leader", "linkedin", "teach", "carousel", "deep", "Five questions. Four meetings. One letter.", "Comment '30' for the Notion template."),
];

// =========================== INSTAGRAM (57) ===========================
const INSTAGRAM: ContentIdea[] = [
  mk("How we shoot a product flat-lay in 15 minutes (no studio)", "instagram", "teach", "reel", "quick", "A window. A napkin. One rule.", "Save this for your next shoot."),
  mk("My studio tour — the honest version, including the cables", "instagram", "behind-the-scenes", "reel", "medium", "Nothing staged. Just Tuesday.", "Show me yours in the replies."),
  mk("Color story for an imaginary café we'd open tomorrow", "instagram", "story", "carousel", "medium", "Clay. Bone. A stripe of forest.", "Swipe for the build-out."),
  mk("Why I stopped posting every day — and what changed", "instagram", "opinion", "reel", "quick", "Fewer posts. Better comments.", "Comment if you've done the same."),
  mk("A full rebrand project, in ten slides", "instagram", "case-study", "carousel", "deep", "Before, process, after.", "Save if you're thinking about a refresh."),
  mk("Drop your creative ritual — the oddest one wins", "instagram", "community", "text", "quick", "I alphabetize my pencils every morning.", "Tag a friend whose ritual is stranger."),
  mk("The {n} most-saved presets from our collection this month", "instagram", "product", "carousel", "medium", "Sorted by what photographers actually use.", "Link in bio for the pack."),
  mk("Ten design studios to follow in 2026", "instagram", "curate", "carousel", "quick", "No megalodons. Just good work.", "Tag one I should add."),
  mk("How to style your desk for a brand photo in under 30 seconds", "instagram", "teach", "reel", "quick", "One rule: take three things away.", "Save for the next session."),
  mk("A letter from my notebook, three years ago", "instagram", "story", "carousel", "medium", "I was wrong about some of it.", "What would you tell you?"),
  mk("Instagram Reels aren't short TikToks. Stop treating them like they are.", "instagram", "opinion", "text", "quick", "Different algorithm. Different instinct.", "Where do you feel it most?"),
  mk("The messy sketch that became our most-liked poster", "instagram", "behind-the-scenes", "carousel", "quick", "Napkin → screen → print.", "Which would you have picked?"),
  mk("A homepage redesign in before/after — with the scroll test", "instagram", "case-study", "reel", "medium", "Watch the fold shift.", "Save for your next redesign."),
  mk("What's in your camera bag today?", "instagram", "community", "text", "quick", "Mine's embarrassingly heavy.", "Post yours."),
  mk("Three new type pairings in our kit this month — used in real projects", "instagram", "product", "carousel", "medium", "Each with a case study.", "Link in bio to try."),
  mk("Seven Instagram accounts teaching craft over clout", "instagram", "curate", "carousel", "quick", "No reels. No reels. No reels.", "Add yours."),
  mk("A five-frame tutorial: how to blur a background in camera", "instagram", "teach", "carousel", "quick", "No plug-ins. Just aperture.", "Save for later."),
  mk("The photo that nearly didn't make the final cut — and why it did", "instagram", "story", "carousel", "medium", "Out of focus. Right moment.", "What's your 'nearly didn't' image?"),
  mk("You don't need a wider lens. You need to move closer.", "instagram", "opinion", "reel", "quick", "Feet over glass.", "Tag someone who needs this."),
  mk("Behind the scenes of our editorial shoot with {competitor}", "instagram", "behind-the-scenes", "reel", "medium", "Chaos. Sandwiches. A win.", "Save if you want the shot list."),
  mk("How a small tweak to our packaging lifted reorder rate by {n}%", "instagram", "case-study", "carousel", "medium", "Same product. Different sticker.", "Swipe for the details."),
  mk("Your favorite piece of studio advice — in one sentence", "instagram", "community", "text", "quick", "Keep it tight. I'm screenshotting.", "Drop yours."),
  mk("Four ways to use our latest texture pack in print", "instagram", "product", "carousel", "medium", "With specs for each.", "Link in bio."),
  mk("Ten independent magazines I'd pay rent for this year", "instagram", "curate", "carousel", "medium", "Half of them ship physical.", "Which makes your list?"),
  mk("How to stage a flat-lay so the eye has a route", "instagram", "teach", "carousel", "medium", "Start. Detour. Exit.", "Save for the next shoot."),
  mk("The portfolio rejection that changed how I edit", "instagram", "story", "carousel", "medium", "One note. A year of work.", "Ever had a useful rejection?"),
  mk("Most Reels are just vertical screenshots with music", "instagram", "opinion", "text", "quick", "Make the movement matter.", "What's a Reel that actually moves you?"),
  mk("A peek at our board for next season — ten pins and the why", "instagram", "behind-the-scenes", "carousel", "medium", "A color. A street. A meal.", "Comment and I'll share the full board."),
  mk("How we rebuilt a boutique's Instagram in {timeframe} — the metrics", "instagram", "case-study", "carousel", "deep", "Reach, saves, referrals.", "Save for your next rebuild."),
  mk("Tell me your favorite hidden coffee shop and I'll add it to a map", "instagram", "community", "text", "quick", "I'll print a zine with the best ones.", "Drop your pin."),
  mk("A walk-through of our new portfolio template — editable in Figma", "instagram", "product", "reel", "medium", "One template, three looks.", "Link in bio."),
  mk("Eleven Pinterest boards I live in", "instagram", "curate", "carousel", "quick", "Moodboard central.", "Tag yours."),
  mk("A masking trick that makes every product shot look expensive", "instagram", "teach", "reel", "quick", "One click. One mask. A brighter subject.", "Save for the next shoot."),
  mk("The rejection letter that I framed above my desk", "instagram", "story", "carousel", "medium", "Kept me honest for six years.", "What do you keep where you can see it?"),
  mk("You don't need a style. You need a story.", "instagram", "opinion", "reel", "quick", "Style follows.", "Comment if this landed."),
  mk("My camera roll last Friday night — unfiltered", "instagram", "behind-the-scenes", "carousel", "quick", "Two great photos. Eight blurry ones.", "Drop yours."),
  mk("The agency-side case study: a rebrand that came back to us twice", "instagram", "case-study", "carousel", "deep", "The third round is always the best.", "Swipe for the versions."),
  mk("Tag your favorite indie bookstore for a friend in {niche}", "instagram", "community", "text", "quick", "Building a map.", "Drop a pin."),
  mk("Four templates we use for client decks — in Figma", "instagram", "product", "carousel", "medium", "All under 12 slides.", "Link in bio."),
  mk("Nine small design shops that feel like studios, not offices", "instagram", "curate", "carousel", "medium", "Home rule: small team, big craft.", "Add yours."),
  mk("How to color-grade a phone photo to look like a brand shoot", "instagram", "teach", "reel", "quick", "Three sliders. One minute.", "Save for tonight."),
  mk("The one photo that opened three brand campaigns", "instagram", "story", "carousel", "medium", "Taken on a Tuesday. In my kitchen.", "Ever had a Tuesday photo go to market?"),
  mk("I hate the word 'aesthetic' — and I used to use it weekly", "instagram", "opinion", "text", "quick", "It's a costume, not a compass.", "What word did you drop?"),
  mk("Studio playlist: the songs we loop during late edits", "instagram", "behind-the-scenes", "text", "quick", "Twelve songs. One espresso.", "Drop your late-edit song."),
  mk("A brand launch timeline — how we shipped in {timeframe}", "instagram", "case-study", "carousel", "deep", "With dates, doubts, and deliverables.", "Save if you're launching soon."),
  mk("What's the one piece of gear you regret buying?", "instagram", "community", "text", "quick", "Mine's a gimbal.", "Share yours."),
  mk("Three new icon sets in our kit — and where they came from", "instagram", "product", "carousel", "medium", "A sketchbook. A lunch. A thousand iterations.", "Link in bio."),
  mk("Seven design books that taught me more than any course", "instagram", "curate", "carousel", "medium", "All under $40.", "Which's in your stack?"),
  mk("A one-minute tutorial: how to crop like a magazine editor", "instagram", "teach", "reel", "quick", "One rule. One mistake to avoid.", "Save for later."),
  mk("How a slow year made me a better designer", "instagram", "story", "carousel", "medium", "No launches. Lots of sketches.", "Have you had a slow season shape you?"),
  mk("Stop charging by the hour. You're not a babysitter.", "instagram", "opinion", "reel", "quick", "Charge by the decision.", "Tag a designer who needs this."),
  mk("Behind the scenes of our {n}-frame still life with {competitor}", "instagram", "behind-the-scenes", "reel", "medium", "A setup most people wouldn't photograph.", "Comment for the lighting diagram."),
  mk("How we rebuilt a museum's IG presence from the ground up", "instagram", "case-study", "carousel", "deep", "Archive photos. New voice.", "Save for your next rebuild."),
  mk("Your go-to natural-light window — describe it in three words", "instagram", "community", "text", "quick", "Mine: north-facing, dirty, tall.", "Drop yours."),
  mk("The three things we always include in a brand board", "instagram", "product", "carousel", "medium", "Color. Type. A piece of wood.", "Link in bio for the template."),
  mk("Ten newsletters that make design Sundays worth it", "instagram", "curate", "carousel", "quick", "No corporate drawings.", "Tag yours."),
  mk("A one-minute timelapse of a brand board, start to finish", "instagram", "behind-the-scenes", "reel", "quick", "From twelve tabs to one sheet.", "Save for inspiration."),
];

// =========================== YOUTUBE (57) ===========================
const YOUTUBE: ContentIdea[] = [
  mk("How to build your first {niche} dashboard — a {n}-minute walkthrough", "youtube", "teach", "long-video", "deep", "From blank sheet to live chart.", "Timestamps in the description."),
  mk("I tried {tool} for 30 days — here's what actually happened", "youtube", "story", "long-video", "deep", "I wanted to love it. The truth was murkier.", "Drop a comment with what I should test next."),
  mk("Unpopular opinion: {niche} tools are too expensive for what they do", "youtube", "opinion", "long-video", "medium", "A breakdown of price vs. value.", "Tell me which tool you'd defend."),
  mk("The studio tour I've been putting off for two years", "youtube", "behind-the-scenes", "long-video", "medium", "All of it. Even the cables.", "What do you want to see closer?"),
  mk("The complete {timeframe} case study: how we helped {competitor}'s client", "youtube", "case-study", "long-video", "deep", "Real screens. Real revenue.", "Full docs in the description."),
  mk("Q&A with you — {n} audience questions, {n} honest answers", "youtube", "community", "long-video", "medium", "No ads. Just the questions.", "Drop the next round below."),
  mk("A deep demo of the new {tool} update", "youtube", "product", "long-video", "deep", "Feature by feature, with use cases.", "Download the test file from the description."),
  mk("The five YouTube channels every {role} should subscribe to", "youtube", "curate", "short-video", "quick", "Short intros, real recommendations.", "Tell me a sixth."),
  mk("How I plan a month of content in one afternoon", "youtube", "teach", "long-video", "medium", "Four templates. One calendar. Zero guilt.", "Full template in the description."),
  mk("The time I lost a {result} launch — and what it taught me", "youtube", "story", "long-video", "deep", "I thought we had the pricing right.", "What's the launch lesson that stuck with you?"),
  mk("Every {niche} YouTuber says the same thing. Here's why it's wrong.", "youtube", "opinion", "long-video", "deep", "One bad idea keeps getting recycled.", "Disagree? Record your response."),
  mk("A day in my studio (for real — with the boring parts)", "youtube", "behind-the-scenes", "long-video", "medium", "Includes a 40-minute gap where nothing happens.", "What else should I film?"),
  mk("How a freelancer used {tool} to land {n} clients in {timeframe}", "youtube", "case-study", "long-video", "deep", "The whole outreach sequence.", "Subscribe to get the swipe file."),
  mk("Ask me anything — picking the {n} juiciest questions", "youtube", "community", "long-video", "medium", "Live chat review.", "Drop yours for round two."),
  mk("Setting up {tool}: the workspace I'd build if I were starting today", "youtube", "product", "long-video", "deep", "Every default, explained.", "Template in the description."),
  mk("Seven {role} YouTube channels I actually watch", "youtube", "curate", "short-video", "quick", "Small channels. Big craft.", "Tag one I should check."),
  mk("A framework for writing your first ten {niche} YouTube scripts", "youtube", "teach", "long-video", "deep", "With the template I used for my first 100 videos.", "Download the scripts in the description."),
  mk("How I bombed my first talk — and rebuilt it from scratch", "youtube", "story", "long-video", "deep", "Video of the original. Yes, really.", "Comment your stage lesson."),
  mk("Stop optimizing your thumbnails. Optimize your first 10 seconds.", "youtube", "opinion", "long-video", "medium", "The retention graph tells the truth.", "What's your best cold open?"),
  mk("The channel setup I wish I'd used in year one", "youtube", "behind-the-scenes", "long-video", "medium", "Hardware, software, process.", "Full gear list in the description."),
  mk("A startup with $0 budget took their YouTube to {metric}% subscriber growth — here's how", "youtube", "case-study", "long-video", "deep", "No ads. Lots of honest videos.", "Read the case in the description."),
  mk("What's a YouTube niche you think is oversaturated — and I'll prove you wrong", "youtube", "community", "long-video", "medium", "I'm picking the best comments to reply on screen.", "Challenge me below."),
  mk("A walk-through of {tool}'s new batch editor for creators", "youtube", "product", "long-video", "deep", "Ten videos in one hour.", "Follow along."),
  mk("The six books that changed how I script", "youtube", "curate", "long-video", "medium", "Two aren't about video.", "Add yours."),
  mk("How to shoot a talking-head video that doesn't feel like a TED talk", "youtube", "teach", "long-video", "medium", "Room, eyes, pacing.", "Template shot list in the description."),
  mk("The year I posted {n} videos a week and nearly quit", "youtube", "story", "long-video", "deep", "What I'd do differently.", "Your version in the comments."),
  mk("Every 'become a YouTuber' course is really one tip in a trench coat", "youtube", "opinion", "long-video", "medium", "I bought three. Here's what they all share.", "Tell me the best one you've taken."),
  mk("Here's my editing timeline, in full — from bin to render", "youtube", "behind-the-scenes", "long-video", "deep", "No cuts. No tricks. The whole session.", "Ask questions and I'll annotate it."),
  mk("A long-form case study: our most-watched video and why it worked", "youtube", "case-study", "long-video", "deep", "Retention graph. Chat log. Edits.", "Download the script."),
  mk("Drop your channel in the comments — I'll react to the first {n}", "youtube", "community", "long-video", "medium", "Honest reactions. No roasts.", "Post yours."),
  mk("Three features in {tool} for creators with a team — hands-on", "youtube", "product", "long-video", "medium", "Assignments. Reviews. Publish queues.", "Try it in the link below."),
  mk("Nine documentary channels that make my work better", "youtube", "curate", "long-video", "medium", "I study them the way writers study novels.", "Add yours."),
  mk("How to write an opening that passes the 10-second test", "youtube", "teach", "long-video", "medium", "Four patterns. One script.", "Download the template."),
  mk("I watched {n} hours of {competitor} — here's what I learned", "youtube", "story", "long-video", "deep", "Took notes like a film student.", "What channel should I binge next?"),
  mk("The analytics tab lies. Use this one instead.", "youtube", "opinion", "long-video", "medium", "There's a better signal.", "What's your most-trusted signal?"),
  mk("The camera I used for the first year (and why I still have it)", "youtube", "behind-the-scenes", "short-video", "quick", "Less than $400.", "What's your starter camera?"),
  mk("How we grew {niche} to {n} subs without a single short", "youtube", "case-study", "long-video", "deep", "Only long-form. On purpose.", "Read the full breakdown."),
  mk("Community review: your ten-second pitches, ranked", "youtube", "community", "long-video", "medium", "Honest feedback.", "Pitch in the comments."),
  mk("A full workflow tour of {tool}'s new collaboration features", "youtube", "product", "long-video", "deep", "Three teams. One workspace.", "Template in the description."),
  mk("Ten channels {role}s should binge on their next flight", "youtube", "curate", "short-video", "quick", "Under 30 minutes each.", "Drop yours."),
  mk("How to prep for a YouTube interview so guests give you real answers", "youtube", "teach", "long-video", "deep", "Pre-call. Script. Pacing.", "Template in the description."),
  mk("The year my channel flattened — what I finally changed", "youtube", "story", "long-video", "deep", "Format. Frequency. Voice.", "Comment your flat-line year."),
  mk("Stop running ads on your YouTube videos if you sell a product", "youtube", "opinion", "short-video", "quick", "Math + a story.", "Disagree?"),
  mk("The spreadsheet I use to plan every video", "youtube", "behind-the-scenes", "long-video", "medium", "With the exact columns.", "Download it."),
  mk("A case study on a 3-minute video that drove ${n}k in sales", "youtube", "case-study", "long-video", "deep", "Short. Specific. Traceable.", "Watch the video in the link."),
  mk("Rapid-fire Q&A: your top questions about {niche}", "youtube", "community", "short-video", "medium", "Twenty questions, twenty answers.", "Submit yours below."),
  mk("How to use {tool} for scripting long-form videos", "youtube", "product", "long-video", "medium", "From outline to teleprompter.", "Download the template."),
  mk("Eight podcasts I put on while editing", "youtube", "curate", "short-video", "quick", "None are about YouTube.", "Add yours."),
  mk("A beginner-friendly shoot: how to light a talking head with one lamp", "youtube", "teach", "short-video", "quick", "One lamp. Two walls. Three tricks.", "Save for next Monday."),
  mk("The shoot I almost cancelled that became my most-shared video", "youtube", "story", "long-video", "medium", "I was tired. The crew wasn't.", "Share yours."),
  mk("Chase insight, not trends", "youtube", "opinion", "short-video", "quick", "A manifesto in 90 seconds.", "Comment what you're chasing."),
  mk("How I prep for a two-camera interview shoot", "youtube", "behind-the-scenes", "long-video", "medium", "Cables. Questions. A nap.", "Need the pre-shoot checklist?"),
  mk("Our 12-month retention experiment — and the three changes that worked", "youtube", "case-study", "long-video", "deep", "With retention graphs.", "Download the full report."),
  mk("What's a video topic you'd pay me to make?", "youtube", "community", "short-video", "quick", "I'm serious. Best comment wins.", "Drop yours."),
  mk("Three {tool} integrations every YouTube creator should try", "youtube", "product", "short-video", "medium", "With live demos.", "Try them in the link."),
  mk("Four YouTubers who teach storytelling better than writing teachers", "youtube", "curate", "short-video", "quick", "Under 100k subs, on purpose.", "Tag a fifth."),
  mk("A {timeframe} sprint to make my first documentary-style YouTube video", "youtube", "story", "long-video", "deep", "I told myself I couldn't. Then I did.", "Subscribe for the next one."),
];

// =========================== TIKTOK (57) ===========================
const TIKTOK: ContentIdea[] = [
  mk("A 30-second walkthrough: how I send a client proposal", "tiktok", "teach", "short-video", "quick", "Calendar, contract, a link.", "Save the template in bio."),
  mk("The Tuesday I thought I'd quit freelancing", "tiktok", "story", "short-video", "quick", "The DM that made me stay.", "What's your Tuesday story?"),
  mk("Stop using hashtags like it's 2019", "tiktok", "opinion", "short-video", "quick", "TikTok isn't Instagram.", "Tell me your hashtag era."),
  mk("POV: my desk at 6pm on a launch day", "tiktok", "behind-the-scenes", "short-video", "quick", "Chaos, snack wrappers, one win.", "Tag yours."),
  mk("How {n} {role}s doubled their bookings with one change", "tiktok", "case-study", "short-video", "medium", "Same bio. Different pinned post.", "Swipe to the pinned."),
  mk("Drop your 2026 business goal in three words", "tiktok", "community", "short-video", "quick", "I'll stitch the best ones.", "Comment your three."),
  mk("The hidden {tool} feature I use every morning", "tiktok", "product", "short-video", "quick", "Three taps. Saves an hour.", "Follow the tutorial in bio."),
  mk("Seven TikToks you should steal for your {niche} feed", "tiktok", "curate", "short-video", "quick", "Not trend bait. Actual craft.", "Save the set."),
  mk("How I write a caption that actually gets saves", "tiktok", "teach", "short-video", "quick", "First line, last line, a tension.", "Save for your next post."),
  mk("My first-ever TikTok vs. my latest — the journey in 30 seconds", "tiktok", "story", "short-video", "quick", "I can't believe I posted that.", "Stitch yours."),
  mk("If you're niching down on TikTok, you're missing the point", "tiktok", "opinion", "short-video", "quick", "Platform rewards range.", "Disagree?"),
  mk("What's in my bag for a {niche} shoot in under a minute", "tiktok", "behind-the-scenes", "short-video", "quick", "Five items. One panic.", "Tag what's in yours."),
  mk("How a {role} went from {metric} views to {metric} followers in {timeframe}", "tiktok", "case-study", "short-video", "medium", "Three posts did the work.", "See the pinned."),
  mk("I'll stitch the best creator tip in my replies", "tiktok", "community", "short-video", "quick", "No gurus. Just working creators.", "Drop yours."),
  mk("A 15-second demo of the new {tool} shortcut", "tiktok", "product", "short-video", "quick", "You've been doing it the long way.", "Try it now."),
  mk("The four TikTok accounts I open first thing in the morning", "tiktok", "curate", "short-video", "quick", "All under 200k followers.", "Add one."),
  mk("Three caption hooks that work on TikTok", "tiktok", "teach", "short-video", "quick", "Specific numbers. Specific failures.", "Save for your next post."),
  mk("My first client in 2019 vs. my newest in 2026", "tiktok", "story", "short-video", "quick", "Same industry. Very different me.", "Share your before/after."),
  mk("Stop making {niche} tutorials. Make {niche} stories.", "tiktok", "opinion", "short-video", "quick", "Nobody finishes a tutorial.", "What do you agree with?"),
  mk("POV: editing the same video for the seventh time", "tiktok", "behind-the-scenes", "short-video", "quick", "This one's a lie if you don't show the seventh.", "Show me yours."),
  mk("How a {role} sold out a {timeframe} workshop with one TikTok", "tiktok", "case-study", "short-video", "medium", "The post is pinned.", "Steal the structure."),
  mk("Say your favorite tool and I'll recommend one you're missing", "tiktok", "community", "short-video", "quick", "I'll keep this one open all day.", "Drop the first."),
  mk("Three new features in {tool} for TikTok creators", "tiktok", "product", "short-video", "quick", "Captions. Auto-clips. Audio snap.", "Follow the demo in bio."),
  mk("Eight TikToks that will teach you to write better in a week", "tiktok", "curate", "short-video", "quick", "All under 60 seconds.", "Save the series."),
  mk("How to film a tutorial in portrait without feeling weird", "tiktok", "teach", "short-video", "quick", "Angle. Crop. Distance.", "Save the setup."),
  mk("The time I cried editing a client video", "tiktok", "story", "short-video", "quick", "It wasn't about the footage.", "Share your turning point."),
  mk("Short-form isn't short thinking", "tiktok", "opinion", "short-video", "quick", "15 seconds, 3 drafts.", "Show your proof."),
  mk("Run of show for a day I post five TikToks", "tiktok", "behind-the-scenes", "short-video", "quick", "Spoiler: one's pre-written.", "Want the doc?"),
  mk("We changed the first frame of a {niche} TikTok — views tripled", "tiktok", "case-study", "short-video", "medium", "Same video. New opening.", "Steal the frame."),
  mk("Your best TikTok caption gets a duet from me", "tiktok", "community", "short-video", "quick", "Go.", "Drop yours."),
  mk("A hidden shortcut in {tool} that cuts editing in half", "tiktok", "product", "short-video", "quick", "I've been sleeping on this.", "Try it now."),
  mk("Ten creators who make {niche} easier to understand", "tiktok", "curate", "short-video", "quick", "Half are under 20k followers.", "Tag one."),
  mk("A two-line script trick for product tutorials", "tiktok", "teach", "short-video", "quick", "State problem. State outcome.", "Save for today."),
  mk("The podcast I used to quit watching YouTube", "tiktok", "story", "short-video", "quick", "One episode. A habit broke.", "Your version?"),
  mk("If your TikTok opens with a greeting, you've lost us", "tiktok", "opinion", "short-video", "quick", "Cold open. Go.", "Tag someone who still says hi."),
  mk("Shooting outside in one minute — the messy version", "tiktok", "behind-the-scenes", "short-video", "quick", "Wind, sun, a dog, a cut.", "What's your outdoor disaster?"),
  mk("A 0-to-${n}k in {timeframe} breakdown in 45 seconds", "tiktok", "case-study", "short-video", "medium", "With the exact post that flipped it.", "Pinned post for proof."),
  mk("Say 'I work in {niche}' and I'll tell you a tool you're missing", "tiktok", "community", "short-video", "quick", "Roll the dice.", "Drop the niche."),
  mk("One feature of {tool} no creator uses but should", "tiktok", "product", "short-video", "quick", "Saves a full render.", "Demo in bio."),
  mk("Nine TikToks that taught me typography", "tiktok", "curate", "short-video", "quick", "Most under 30 seconds.", "Add your favorite."),
  mk("How to rehearse a TikTok that doesn't sound rehearsed", "tiktok", "teach", "short-video", "quick", "Two reads. Then throw the script.", "Save the method."),
  mk("The collab that blew up my account", "tiktok", "story", "short-video", "quick", "Not the one I planned.", "Your collab story?"),
  mk("TikTok isn't saturated. Your niche is just boring.", "tiktok", "opinion", "short-video", "quick", "Hot take.", "Tag someone who needs this."),
  mk("What my editing setup really looks like", "tiktok", "behind-the-scenes", "short-video", "quick", "No aesthetic, just a window.", "Show yours."),
  mk("How a {role} sold ${n}k in digital goods from one pinned TikTok", "tiktok", "case-study", "short-video", "medium", "I asked for the analytics.", "Steal the frame."),
  mk("Finish the sentence: 'the best TikTok I ever made was…'", "tiktok", "community", "short-video", "quick", "Stealing for a compilation.", "Drop yours."),
  mk("A thirty-second walkthrough of {tool}'s new draft mode", "tiktok", "product", "short-video", "quick", "Plan five videos at once.", "Follow the full tutorial."),
  mk("Five {niche} accounts that don't use trends (and still grow)", "tiktok", "curate", "short-video", "quick", "Craft > trend.", "Add yours."),
  mk("One caption change that doubled saves on this video", "tiktok", "teach", "short-video", "quick", "Added a line. Removed a line.", "Save the approach."),
  mk("The cold DM that changed my career", "tiktok", "story", "short-video", "quick", "I replied two weeks late.", "Your career-changing DM?"),
  mk("Stop using trending audio if it doesn't match your topic", "tiktok", "opinion", "short-video", "quick", "Sound shapes perception.", "Who gets this wrong?"),
  mk("An ugly workspace tour in portrait", "tiktok", "behind-the-scenes", "short-video", "quick", "Don't clean it. Film it.", "Show yours."),
  mk("A {n}-second case study: this post got pinned and is still working", "tiktok", "case-study", "short-video", "medium", "Nine months of passive reach.", "See the pinned."),
  mk("What's your TikTok goal this month — one line", "tiktok", "community", "short-video", "quick", "I'll stitch the best.", "Drop it."),
  mk("The feature inside {tool} that makes captions feel hand-written", "tiktok", "product", "short-video", "quick", "No more generic auto-captions.", "Try it."),
  mk("Three TikToks I rewatched this week", "tiktok", "curate", "short-video", "quick", "Good work, not trendy work.", "Add yours."),
  mk("How I script a 45-second TikTok without overthinking", "tiktok", "teach", "short-video", "quick", "Two Post-its. One coffee.", "Save the method."),
];

// =========================== NEWSLETTER (57) ===========================
const NEWSLETTER: ContentIdea[] = [
  mk("The quiet discipline of writing in public — and why it outperforms 'content'", "newsletter", "teach", "long-form", "deep", "Publish weekly. Read weekly. Compound.", "Reply with your cadence."),
  mk("Issue #{n}: a year in, here's what the newsletter actually taught me", "newsletter", "story", "long-form", "deep", "About readers. About me. About attention.", "Reply if you've been here since issue one."),
  mk("Stop writing for 'subscribers'. Write for the one reply you want this week.", "newsletter", "opinion", "long-form", "medium", "It changed how I opened every issue.", "Who's the one you're writing for?"),
  mk("How I draft an issue — the messy, un-aesthetic process", "newsletter", "behind-the-scenes", "long-form", "medium", "Four docs. Two voice memos. A walk.", "Want the template? Reply 'DRAFT'."),
  mk("The {timeframe} audit I ran on my own newsletter — three things I changed", "newsletter", "case-study", "long-form", "deep", "Frequency. Format. First lines.", "Reply for the audit worksheet."),
  mk("A reader wrote in with a great question about {niche}. Here's the long answer.", "newsletter", "community", "long-form", "medium", "Better than my planned issue.", "Reply with yours next."),
  mk("A full tour of my {tool} workspace — how this newsletter ships each week", "newsletter", "product", "long-form", "medium", "Templates, recipes, review gates.", "Reply 'SETUP' and I'll send screenshots."),
  mk("Seven newsletters I read every Sunday — and why each earns the ritual", "newsletter", "curate", "long-form", "medium", "Not roundups. Not affiliate links.", "Hit reply with yours."),
  mk("A practical guide to writing the first 100 words of a newsletter", "newsletter", "teach", "long-form", "deep", "Most people bury the lede. Here's how to dig it out.", "Send me your opening paragraph for feedback."),
  mk("The email that broke my inbox — and what it taught me about reply rate", "newsletter", "story", "long-form", "medium", "One question. Four thousand answers.", "What would you ask?"),
  mk("Most newsletter growth advice is for newsletters that aren't good yet", "newsletter", "opinion", "long-form", "medium", "Good first. Growth second.", "Where are you on the curve?"),
  mk("A behind-the-scenes of last week's issue — with edits, cuts, and second drafts", "newsletter", "behind-the-scenes", "long-form", "deep", "You'll see why the first draft didn't ship.", "Want to see the cuts? Reply."),
  mk("How a two-person team used a newsletter to close {n} enterprise deals", "newsletter", "case-study", "long-form", "deep", "One cadence. One shared doc. One bet.", "Reply for the playbook."),
  mk("What's the issue of mine you remember most? I want to understand.", "newsletter", "community", "long-form", "quick", "I'll reply to every reply.", "Tell me."),
  mk("A walkthrough of how {tool} replaced my old email platform", "newsletter", "product", "long-form", "medium", "Migration notes, gotchas, wins.", "Reply for the SOP."),
  mk("Ten essays I've forwarded at least three times this year", "newsletter", "curate", "long-form", "medium", "With short notes on each.", "Reply and I'll send the links."),
  mk("A practical template for the 'sorry I missed last week' issue", "newsletter", "teach", "long-form", "quick", "Without the guilt and with real craft.", "Reply 'SORRY' for the template."),
  mk("The subscriber I tried (and failed) to unsubscribe", "newsletter", "story", "long-form", "medium", "They're still here. I'm still writing.", "Have you met yours?"),
  mk("The subscriber count is a distraction. Here's what I actually track.", "newsletter", "opinion", "long-form", "medium", "Three real numbers.", "What do you track?"),
  mk("A Sunday night as I hit 'send' — the actual run of show", "newsletter", "behind-the-scenes", "long-form", "medium", "Tea. Preview email. A nervous scroll.", "What's your send ritual?"),
  mk("A reader case study: how one subscriber turned their list into a consulting practice", "newsletter", "case-study", "long-form", "deep", "I asked for numbers.", "Reply 'PRACTICE' for the interview."),
  mk("I opened the floor to reader questions. Here are the ten I want to answer.", "newsletter", "community", "long-form", "medium", "Post the others next week.", "Send yours."),
  mk("How to A/B test a newsletter subject line without a corporate tool", "newsletter", "product", "long-form", "medium", "Three issues. A spreadsheet. Common sense.", "Reply for the spreadsheet."),
  mk("Six writing tools that don't call themselves writing tools", "newsletter", "curate", "long-form", "medium", "A kitchen timer is on the list.", "Send me yours."),
  mk("A step-by-step on writing your first paid issue", "newsletter", "teach", "long-form", "deep", "From why to format to pitch.", "Reply for the launch checklist."),
  mk("The day a paid subscriber wrote in demanding a refund — and the long answer I gave", "newsletter", "story", "long-form", "medium", "I kept the reply.", "What would you do?"),
  mk("'Post every day' is a marketing campaign, not a craft", "newsletter", "opinion", "long-form", "medium", "Volume is easy. Substance is rarer.", "What's your cadence?"),
  mk("A tour of my reading pile — what's shaping the next season of essays", "newsletter", "behind-the-scenes", "long-form", "medium", "Three books. Five PDFs. A zine.", "Reply with yours."),
  mk("How a {role} used paid newsletter tiers to fund a year-long research project", "newsletter", "case-study", "long-form", "deep", "The tier structure, the launch email, the churn.", "Reply for the deck."),
  mk("Reader of the week: the reply that became an entire issue", "newsletter", "community", "long-form", "medium", "Anonymous but whole.", "Send yours to be next."),
  mk("The {tool} recipe I use to build each week's issue — with screenshots", "newsletter", "product", "long-form", "medium", "Templates, slash commands, review.", "Reply for the export."),
  mk("Eight essays that changed how I edit myself", "newsletter", "curate", "long-form", "medium", "With annotations on each.", "Reply with yours."),
  mk("How to write a cold pitch email that doesn't feel like a cold pitch", "newsletter", "teach", "long-form", "deep", "Three rules. A template.", "Reply for the template."),
  mk("A near-miss story: the issue I almost shipped that would have hurt someone", "newsletter", "story", "long-form", "deep", "I caught it at 11pm.", "Have you had a 'nearly' week?"),
  mk("Paywalls aren't the enemy. Sloppy writing is.", "newsletter", "opinion", "long-form", "medium", "You can charge. You just have to earn it.", "Where are you on this?"),
  mk("A week of readings behind this issue — my margin notes in full", "newsletter", "behind-the-scenes", "long-form", "deep", "Nine sources. Three cuts.", "Want the full notes?"),
  mk("An independent writer grew to 10,000 engaged subscribers — with 39 issues", "newsletter", "case-study", "long-form", "deep", "I asked her how.", "Reply for the interview transcript."),
  mk("What's an issue you'd pay $20 for me to write — even roughly?", "newsletter", "community", "long-form", "quick", "I'm serious.", "Reply with the title."),
  mk("A feature by feature walkthrough of {tool}'s new archive experience", "newsletter", "product", "long-form", "medium", "Why it matters for indie writers.", "Reply for screenshots."),
  mk("Nine Substacks I pay for with my own money", "newsletter", "curate", "long-form", "medium", "All under $10/mo.", "Reply with yours."),
  mk("A writing drill: how to rewrite your last 10 openings in 30 minutes", "newsletter", "teach", "long-form", "medium", "Repeatable. Painful. Useful.", "Reply when you've done it."),
  mk("The email that landed me my biggest paid client — broken down", "newsletter", "story", "long-form", "deep", "Not a template. A conversation.", "Reply with your biggest 'got it'."),
  mk("Stop chasing 'virality'. Write one issue a reader will forward to one friend.", "newsletter", "opinion", "long-form", "medium", "Forwarded wins beat open rates.", "Who's the one you'd forward to?"),
  mk("The weekly ritual that keeps me writing when I don't want to", "newsletter", "behind-the-scenes", "long-form", "medium", "Coffee, notebook, eight minutes.", "What's yours?"),
  mk("A reader-led case study: how the advice from issue #{n} shaped their quarter", "newsletter", "case-study", "long-form", "medium", "In their own words.", "Reply if yours should be next."),
  mk("An open office hours: your questions, one call, next week", "newsletter", "community", "long-form", "medium", "Come with a specific problem.", "Reply to sign up."),
  mk("Three underused {tool} features for writers who ship on a schedule", "newsletter", "product", "long-form", "medium", "Templates. Variables. Scheduled sends.", "Reply for my recipes."),
  mk("Ten writers under 10,000 subscribers who deserve more eyes", "newsletter", "curate", "long-form", "medium", "I asked each one for a favorite issue.", "Reply for the links."),
  mk("A practical guide to the 'second issue' — the one most writers skip", "newsletter", "teach", "long-form", "medium", "Why it's the hardest. Three frames.", "Reply for the worksheet."),
  mk("The issue that cost me three subscribers — and taught me a boundary", "newsletter", "story", "long-form", "medium", "I'd write it again.", "What's your costly issue?"),
  mk("The newsletter industry is obsessed with templates. Templates are a crutch.", "newsletter", "opinion", "long-form", "medium", "Start messy. Shape later.", "Where do you land?"),
  mk("A fly-on-the-wall look at my edit session for this week's issue", "newsletter", "behind-the-scenes", "long-form", "medium", "Two passes. Read aloud. Kill three paragraphs.", "Want the cuts?"),
  mk("How a solo writer turned an issue into a three-figure-MRR course", "newsletter", "case-study", "long-form", "deep", "One issue. Ten months. A waitlist.", "Reply for the launch plan."),
  mk("Your favorite issue of this newsletter — and why it stuck", "newsletter", "community", "long-form", "quick", "I'm compiling a 'greatest hits' issue.", "Reply with yours."),
  mk("Three underrated {tool} shortcuts for writers", "newsletter", "product", "long-form", "quick", "Two make commenting better.", "Try them."),
  mk("Eight zines worth the shelf space", "newsletter", "curate", "long-form", "medium", "Physical, imperfect, printed on paper.", "Reply with yours."),
  mk("How to write a newsletter essay in 90 minutes — without dropping quality", "newsletter", "teach", "long-form", "deep", "Three steps. One timer. A prewrite.", "Reply for the checklist."),
];

// =========================== BLOG (57) ===========================
const BLOG: ContentIdea[] = [
  mk("A full playbook for {niche} {role}s in 2026", "blog", "teach", "long-form", "deep", "Written like a handbook, not a listicle.", "Jump to the section that matches your month."),
  mk("How I built and sold my first {niche} product — the full post-mortem", "blog", "story", "long-form", "deep", "Revenue, doubt, and a few regrets.", "Subscribe for the follow-up on what I'm building next."),
  mk("Five {niche} 'best practices' that should retire in 2026", "blog", "opinion", "long-form", "medium", "With the replacements I'd argue for.", "Tell me which one you disagree with."),
  mk("A tour of our internal handbook — what we share and what we don't", "blog", "behind-the-scenes", "long-form", "deep", "Three pages in full. Two summarized.", "Comment for a download link."),
  mk("From pilot to launch: the whole case study of {competitor}'s last six months", "blog", "case-study", "long-form", "deep", "Interviews. Emails. Dashboards.", "Read the references in the appendix."),
  mk("A reader-submitted Q&A issue — the ten best questions about {niche}", "blog", "community", "long-form", "medium", "Edited, not auto-tagged.", "Send your next question."),
  mk("A comprehensive review of {tool} vs. {competitor} — no sponsorship", "blog", "product", "long-form", "deep", "Side-by-side, feature by feature.", "Jump to the verdict."),
  mk("Fifteen essays that shaped my thinking on {niche}", "blog", "curate", "long-form", "medium", "With short summaries and pull quotes.", "Read the original links."),
  mk("How to write a product brief that actually gets built — with a real example", "blog", "teach", "long-form", "deep", "A template. A story. A worksheet.", "Download the worksheet."),
  mk("The client I almost lost — and the conversation that saved it", "blog", "story", "long-form", "medium", "A 40-minute call I never wanted to have.", "Subscribe for the follow-up on how we rebuilt the relationship."),
  mk("Why most {niche} calculators lie (and how to build an honest one)", "blog", "opinion", "long-form", "medium", "The math most tools hide.", "Use the honest calculator in this post."),
  mk("A peek at our roadmap doc — the version our team actually uses", "blog", "behind-the-scenes", "long-form", "medium", "With the messy comments.", "Comment for a template."),
  mk("A detailed case study: {metric} uplift after redesigning one page", "blog", "case-study", "long-form", "deep", "With heatmaps and sprint notes.", "Read the before/after."),
  mk("An open thread: what are you building this quarter?", "blog", "community", "long-form", "quick", "I'll feature the best replies.", "Drop your comment."),
  mk("How to integrate {tool} with {competitor} without paying for middleware", "blog", "product", "long-form", "deep", "With config snippets.", "Follow the tutorial."),
  mk("A reading list for {role}s changing careers mid-2026", "blog", "curate", "long-form", "medium", "Books, podcasts, one documentary.", "Comment your suggestion."),
  mk("The essentials of writing a sales page that doesn't feel like a sales page", "blog", "teach", "long-form", "deep", "Four rules. Three examples. A template.", "Download the page template."),
  mk("A year of experiments — the three I'd bet on again", "blog", "story", "long-form", "deep", "And the one I quietly buried.", "Subscribe for the next round."),
  mk("'Thought leadership' is an industry in denial", "blog", "opinion", "long-form", "deep", "A manifesto for fewer opinions, more useful ones.", "Where do you draw the line?"),
  mk("What our quarterly planning doc looks like — the real one", "blog", "behind-the-scenes", "long-form", "medium", "Ten screenshots. Messy. Honest.", "Comment for the template."),
  mk("A migration to {tool} that cut our costs by 60% — and didn't break a single workflow", "blog", "case-study", "long-form", "deep", "Timeline, contract notes, handoff.", "Read the migration notes."),
  mk("What's the {niche} tool that deserves more respect?", "blog", "community", "long-form", "quick", "I'll compile a list.", "Comment yours."),
  mk("A deep review of {tool}'s pricing change — and what it means for small teams", "blog", "product", "long-form", "medium", "Two spreadsheets included.", "Download the comparison."),
  mk("Ten long-reads that made my team better this quarter", "blog", "curate", "long-form", "medium", "With short team notes on each.", "Subscribe for the next curation."),
  mk("A detailed guide to setting up your first content calendar", "blog", "teach", "long-form", "deep", "From platforms to pillars to cadence.", "Try the template in the sidebar."),
  mk("The email I sent to fire my biggest client", "blog", "story", "long-form", "deep", "The exact words.", "Subscribe for the follow-up on what replaced that revenue."),
  mk("Stop buying 'courses'. Buy apprenticeships.", "blog", "opinion", "long-form", "medium", "A case for smaller, slower education.", "Disagree? Write the rebuttal."),
  mk("Our internal weekly review doc — an annotated walkthrough", "blog", "behind-the-scenes", "long-form", "medium", "With the questions we keep and kill.", "Comment for the template."),
  mk("A full lifecycle case study — from waitlist to {n}-year retention", "blog", "case-study", "long-form", "deep", "Retention graphs. Survey data.", "Read the survey transcript."),
  mk("A reader interview series: meet three {niche} builders", "blog", "community", "long-form", "deep", "They answered the same five questions.", "Reply to nominate the next."),
  mk("How to set up {tool} for a two-person team in under an hour", "blog", "product", "long-form", "medium", "With a starter template.", "Clone the template."),
  mk("Twelve essays on {niche} I reread every year", "blog", "curate", "long-form", "medium", "Some are older than the web.", "Read alongside me."),
  mk("A practical guide to writing a research memo for a non-technical audience", "blog", "teach", "long-form", "deep", "Four rules. One template.", "Download the memo template."),
  mk("The first ${n}k product I built — the Notion doc I started with", "blog", "story", "long-form", "deep", "Scroll through the actual drafts.", "Subscribe for the teardown."),
  mk("Everyone says 'niche down'. Here's when that advice backfires.", "blog", "opinion", "long-form", "medium", "Range is a moat for some businesses.", "Which are you building?"),
  mk("A tour through our feedback rubric — with redacted examples", "blog", "behind-the-scenes", "long-form", "medium", "The document everyone uses, nobody brags about.", "Comment for the rubric."),
  mk("A two-year case study: a content strategy that compounded past ads", "blog", "case-study", "long-form", "deep", "With the curve and the spend.", "Read the attribution notes."),
  mk("What's the piece of criticism that improved your work?", "blog", "community", "long-form", "medium", "I'll compile a reader greatest-hits.", "Comment yours."),
  mk("Three {tool} plays for {niche} teams in 2026", "blog", "product", "long-form", "deep", "With setup steps.", "Follow the recipes."),
  mk("A reading list on pricing — for {role}s who don't read pricing books", "blog", "curate", "long-form", "medium", "Most are under 150 pages.", "Add yours in the comments."),
  mk("How to write a {n}-page strategy document that reads like a letter", "blog", "teach", "long-form", "deep", "With an annotated example.", "Download the example."),
  mk("The meeting that taught me to say no — eight years later", "blog", "story", "long-form", "medium", "I still have the notes.", "Share your moment."),
  mk("Don't build a 'personal brand'. Build a public body of work.", "blog", "opinion", "long-form", "deep", "A practical difference, with examples.", "Where do you land?"),
  mk("Inside our review ritual: how we give feedback that actually lands", "blog", "behind-the-scenes", "long-form", "medium", "One doc. Two rules. Three phrases.", "Comment for the doc."),
  mk("A post-mortem on our biggest launch — the three hidden costs", "blog", "case-study", "long-form", "deep", "Revenue looked great. Operations didn't.", "Read the post-mortem."),
  mk("An AMA issue — you asked, I answered (ten honest ones)", "blog", "community", "long-form", "medium", "No softballs.", "Send more."),
  mk("The {n} most useful {tool} shortcuts for solo operators", "blog", "product", "long-form", "medium", "All under 30 seconds to learn.", "Try them."),
  mk("Seven unexpected sources I mine for {niche} ideas", "blog", "curate", "long-form", "medium", "Two are physical magazines.", "Tell me yours."),
  mk("A practical template for writing a pivot announcement", "blog", "teach", "long-form", "medium", "Without the corporate fog.", "Download the template."),
  mk("The single hire that transformed our output", "blog", "story", "long-form", "medium", "Not who you'd guess.", "Subscribe for the full story."),
  mk("Why I stopped reading {niche} newsletters — and what I read instead", "blog", "opinion", "long-form", "medium", "A diet swap.", "What's in your reading week?"),
  mk("A full audit of our onboarding — slides, emails, and the quiet gaps", "blog", "behind-the-scenes", "long-form", "deep", "Shared in full.", "Comment for the gap analysis."),
  mk("How one {role} used a pricing page change to lift ARPU {n}% in a quarter", "blog", "case-study", "long-form", "deep", "With before/after screenshots.", "Read the walkthrough."),
  mk("What's the best criticism you've ever given a teammate?", "blog", "community", "long-form", "quick", "Not the nicest — the most useful.", "Share the line."),
  mk("A deep dive into {tool}'s API changes and what they unlock", "blog", "product", "long-form", "deep", "With six copy-paste examples.", "Clone the repo."),
  mk("Sixteen essays a first-year {role} should read before anything else", "blog", "curate", "long-form", "medium", "With reading order and notes.", "Reply if your list is longer."),
  mk("How to write a business update that your team actually reads", "blog", "teach", "long-form", "medium", "One page. Two sections. A verb.", "Download the template."),
];

// ---------------------------------------------------------------------------
// Assemble + helpers.
// ---------------------------------------------------------------------------

export const IDEAS: ContentIdea[] = [
  ...TWITTER,
  ...LINKEDIN,
  ...INSTAGRAM,
  ...YOUTUBE,
  ...TIKTOK,
  ...NEWSLETTER,
  ...BLOG,
];

// Nudge to 400 total — add one more curated idea.
IDEAS.push(
  mk(
    "A year-end review template that works for a team of one",
    "newsletter",
    "teach",
    "long-form",
    "medium",
    "Five questions. One page. An honest look.",
    "Reply for the template.",
  ),
);

export const IDEA_COUNT_BY_PLATFORM: Record<Platform, number> = IDEAS.reduce(
  (acc, i) => {
    acc[i.platform] = (acc[i.platform] ?? 0) + 1;
    return acc;
  },
  {
    twitter: 0,
    linkedin: 0,
    instagram: 0,
    youtube: 0,
    tiktok: 0,
    newsletter: 0,
    blog: 0,
  } as Record<Platform, number>,
);

export const IDEA_COUNT_BY_PILLAR: Record<Pillar, number> = IDEAS.reduce(
  (acc, i) => {
    acc[i.pillar] = (acc[i.pillar] ?? 0) + 1;
    return acc;
  },
  {
    teach: 0,
    story: 0,
    opinion: 0,
    "behind-the-scenes": 0,
    "case-study": 0,
    community: 0,
    product: 0,
    curate: 0,
  } as Record<Pillar, number>,
);

export const PLATFORMS: Platform[] = [
  "twitter",
  "linkedin",
  "instagram",
  "youtube",
  "tiktok",
  "newsletter",
  "blog",
];

export const PILLARS: Pillar[] = [
  "teach",
  "story",
  "opinion",
  "behind-the-scenes",
  "case-study",
  "community",
  "product",
  "curate",
];

export const FORMATS: Format[] = [
  "text",
  "thread",
  "carousel",
  "short-video",
  "long-video",
  "long-form",
  "reel",
  "live",
];

export const DIFFICULTIES: Difficulty[] = ["quick", "medium", "deep"];
