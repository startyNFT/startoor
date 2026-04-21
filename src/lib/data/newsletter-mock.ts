// Mock newsletter data for the Newsletter Starter preview demo.
// Populates the demo at /tools/newsletter-demo.
// Client-side only — bodies are markdown-ish and rendered by a simple renderer.

export type Tag = "writing" | "product" | "craft" | "interviews" | "notes";

export const TAG_LABELS: Record<Tag, string> = {
  writing: "Writing",
  product: "Product",
  craft: "Craft",
  interviews: "Interviews",
  notes: "Notes",
};

export const TAG_BLURBS: Record<Tag, string> = {
  writing: "Essays on the practice of writing through the week.",
  product: "Building small, shipping small, charging money for it.",
  craft: "On the shape of sentences, the shape of work.",
  interviews: "Conversations with people who keep a quiet rhythm.",
  notes: "Links, bookmarks, and a working writer's side notes.",
};

export type Issue = {
  id: string;
  number: number;
  date: string; // ISO yyyy-mm-dd
  title: string;
  deck: string; // subtitle / dek
  tag: Tag;
  readTimeMin: number;
  excerpt: string;
  body: string; // markdown-ish
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const PUBLICATION = {
  name: "Quiet Output",
  positioning: "A newsletter about shipping small, shipping weekly.",
  tagline: "Sundays, 7 a.m., a long email.",
  authorName: "Jules Marlowe",
  authorInitials: "JM",
  authorRole: "Writer, independent product maker",
  authorBio:
    "Jules has written Quiet Output every Sunday morning since the autumn of 2021. She lives in a rented apartment above a bookshop, keeps a garden she is losing to the squirrels, and ships a small product every eight to twelve weeks. This is where she works out what she thinks, usually in about 1,200 words.",
  authorManifesto:
    "I am interested in people who make a living out of their attention. Writers, product builders, the quiet operators of small shops. I think the internet has, for a long time, rewarded the wrong metabolism. This newsletter is an argument, week by week, for a slower one.",
  subscriberCount: 5832,
  openRate: 64,
  avgReadTimeMin: 9,
  foundedYear: 2021,
  issuesPerYear: 48,
  testimonials: [
    {
      name: "Anand Iyer",
      role: "editor, Hearth Quarterly",
      quote:
        "Jules writes the only newsletter I still print out. Everything else in my inbox is trying to sell me something; this is trying to teach me something.",
    },
    {
      name: "Priya Ramachandran",
      role: "founder, Small Room Labs",
      quote:
        "I have been reading Quiet Output since issue four. It is one of maybe three things on the internet that has ever changed how I run my company.",
    },
    {
      name: "Case Fernandez",
      role: "independent designer",
      quote:
        "Reads the way a good novella does — like someone sat down and thought, rather than typed. I keep a folder of bookmarked issues like a commonplace book.",
    },
    {
      name: "Liana Okafor",
      role: "writer, editor",
      quote:
        "You cannot fake this kind of consistency. Three and a half years of Sundays, and every single one has been worth the fifteen minutes.",
    },
    {
      name: "Miguel Reyes",
      role: "product lead, Pine & Shore",
      quote:
        "The voice is what hooks you — dry, warm, a little amused. But what keeps me here is the argument underneath. Slow work is not lazy work.",
    },
    {
      name: "Rebecca Hale",
      role: "reader since issue 37",
      quote:
        "I forward at least one issue a month to the group chat. My friends now open my emails with something like fond resignation. I regret nothing.",
    },
  ] satisfies Testimonial[],
};

// ---------------------------------------------------------------------------
// Issue bodies are written in a lightweight markdown dialect consumed by
// src/app/tools/newsletter-demo/markdown.tsx. Supported:
//
//   # H1       - top-level heading
//   ## H2      - section heading
//   ### H3     - subsection
//   > quote    - blockquote
//   - item     - bullet list item (contiguous lines become a list)
//   1. item    - ordered list item (contiguous)
//   ```        - code fence (plain preformatted text)
//   ---        - horizontal rule
//   *emph*     - italic
//   **bold**   - bold
//   `code`     - inline code
//   [text](url) - link
//
// Anything else is a paragraph.
// ---------------------------------------------------------------------------

export const ISSUES: Issue[] = [
  // -------------------------------------------------------------------------
  // 24 — The metabolism of small
  // -------------------------------------------------------------------------
  {
    id: "024-metabolism-of-small",
    number: 24,
    date: "2026-04-12",
    title: "The metabolism of small",
    deck: "On building a working life that runs on a slower clock.",
    tag: "writing",
    readTimeMin: 11,
    excerpt:
      "Every business has a metabolism. The mistake most of us make is borrowing someone else's and wondering why we're always tired.",
    body: `There is a particular way of being tired that I think of as *scale fatigue*. It is the feeling of running a pace that is not yours. You know it because a Sunday feels like a Tuesday feels like a Thursday, and the inbox is the weather.

I have been thinking for months about what an honest alternative looks like. Not a retreat from work, and not the smug pastoralism of people who have already made their money. Something more like a correction of metabolism.

## What metabolism means, for a small shop

Every business has a metabolism. I mean this almost literally. There is a pace at which you take in new information, a pace at which you turn that information into work, and a pace at which that work leaves the building as a product someone else can use.

The mistake most of us make, early on, is borrowing someone else's metabolism and wondering why we are always tired. We read about a founder who ships every day and we try to ship every day. We read about a company doing a daily email and we try to do a daily email. We borrow the cadence without borrowing the rest of the body, and then we wonder why the legs do not work.

> A small shop's metabolism is not a weakness. It is the only reason the shop can exist.

The cadence is not separable from the team size, the capital structure, the customer base, and — this is the thing nobody writes about — the writer's or maker's own nervous system. You cannot copy the output without copying the conditions. And most of the conditions are not on the public internet.

## A slower clock, specifically

For me, a slower clock looks like this:

- **One long thing a week.** A newsletter issue, a feature ship, an essay. Something someone can hold.
- **One small thing a day.** A fix, a reply, a sentence. Not a performance of busy-ness.
- **One thing per quarter that is mostly about repair.** A neglected corner, a debt paid, a tool sharpened.

That is it. That is the whole system. If I describe it at a party, it sounds boring. It sounds, frankly, like a well-run bakery. But a well-run bakery is in fact a spectacular achievement, and I would not mind being described as one.

## The part where I am wrong

I keep circling back to a worry that this is just the cope of someone with a specific privilege — the privilege of an audience that will keep reading no matter how strangely I run the shop. That may be true. I do not want to pretend it is not.

But the metabolism argument predates the audience. I was trying to run at this pace when I had eleven readers, most of whom were my mother. The cadence came first; the audience showed up because the cadence was honest.

I will keep testing this. I will keep being wrong about it. Sunday next, probably at 7 a.m.

— *Jules*`,
  },
  // -------------------------------------------------------------------------
  // 23 — Interview: Kofi Mensah on running a shop of one
  // -------------------------------------------------------------------------
  {
    id: "023-kofi-mensah-shop-of-one",
    number: 23,
    date: "2026-04-05",
    title: "Kofi Mensah on running a shop of one",
    deck: "A conversation about lonely afternoons, a well-priced product, and the quiet joy of a good invoice.",
    tag: "interviews",
    readTimeMin: 13,
    excerpt:
      "Kofi Mensah runs Hearthstone, a one-person software business with about four hundred paying customers. We talked for an hour about what that is like, day by day.",
    body: `Kofi Mensah runs *Hearthstone*, a one-person software business with about four hundred paying customers and, by his own description, "approximately zero ambition to grow larger than that." I met him through a reader. We talked for an hour on a Thursday morning.

What follows is condensed and lightly edited. Kofi is a quiet talker, and I have kept the pauses in where they felt like meaning.

---

**Jules:** Tell me what the morning looks like.

**Kofi:** It looks like coffee. And then about twenty minutes of email. And then the kind of work I would call *clearing the desk*. Things that are not the real work but have to be done before the real work can start.

**Jules:** And the real work?

**Kofi:** From about ten to two, I am building or fixing. Depending on the week. I have a rule that I do not look at numbers between ten and two. The numbers are the afternoon's job.

**Jules:** You are very disciplined about this.

**Kofi:** I am very *afraid* of what happens when I am not. I used to be at a large company. I was miserable in a particular way that is only available to people who have traded their attention for a salary. I will not do that again. The discipline is how I keep it from happening.

## On loneliness

**Jules:** Is it lonely?

**Kofi:** (laughs) Yes. Sometimes I go a full day without speaking out loud to another person. I have started talking to my plants. They are doing well, which is probably important data.

**Jules:** How do you handle it?

**Kofi:** I have a standing Wednesday lunch. I have a co-working afternoon every other Friday with two other one-person-shop people in the city. I write back to every customer email, even the short ones, because sometimes I just want to have a conversation. That is maybe a bad reason to write a long email to a customer, but I am being honest.

> I have started talking to my plants. They are doing well, which is probably important data.

## On pricing

**Jules:** Your product costs $240 a year. That is higher than most of the competition.

**Kofi:** It is. I used to price it at $96 a year. I had twelve hundred customers and I was exhausted. I raised it to $240, lost two thirds of the customers, and my revenue stayed roughly flat. That was maybe the single best day of my career. I do not recommend it to everyone — the math only works if the remaining customers are the right ones — but for me it was like someone opened a window.

**Jules:** What did you do with the time?

**Kofi:** Eventually, I built a second product. But first I slept. For about three weeks I just slept.

## On the future

**Jules:** Do you ever want to hire?

**Kofi:** No. I want to *contract* people I like, for specific pieces of work I do not love doing, and pay them well. I do not want a team. A team is a second product I would have to build, and I am not good at that product.

**Jules:** Last question. What do you wish someone had told you in year one?

**Kofi:** That a good invoice is one of the small joys of running a shop, and that sending one should feel like a little ceremony. I was embarrassed about money for a long time. I am no longer.

---

*Kofi's product, Hearthstone, is not sponsoring this issue. I just like what he is doing.*`,
  },
  // -------------------------------------------------------------------------
  // 22 — What I ship when I cannot write
  // -------------------------------------------------------------------------
  {
    id: "022-what-i-ship-when-i-cannot-write",
    number: 22,
    date: "2026-03-29",
    title: "What I ship when I cannot write",
    deck: "Notes on staying productive during the weeks the words refuse.",
    tag: "notes",
    readTimeMin: 7,
    excerpt:
      "The block is a data point. The question is what you build on the days the words do not come, because those days come and you cannot wait them out.",
    body: `Some weeks, the writing does not come.

I used to treat this as a moral failing. I now treat it as a data point. But the question remains practical: what do I do on the days the sentences are stuck? Because I have made a public commitment to ship something every Sunday, and I cannot just vanish.

Here is my list.

## 1. Re-read the last ten issues

Not to judge them. To remember what I sound like. Writing voice is a muscle that gets stiff in a day and loose again in an afternoon. The fastest way I know to loosen it is to read my own recent work back aloud.

## 2. Edit something that has been waiting

There is always a draft I have half-abandoned. A week of no-new-writing is the right week to resurrect it. The editing gear is different from the drafting gear. Editing is a kind of conversation with your past self; drafting is a kind of loneliness.

## 3. Write a letter to a specific reader

I keep a list of reader names and a one-line description of each: *Anjali — runs a plant shop in Oakland, reads on Sundays in the store*. When I am stuck, I write to Anjali. Or to Tomas. Or to Marianne. The letter-to-a-specific-reader turns into the draft about two thirds of the time.

> Writing-block is, most often, scale-block. You have made your readership abstract, and abstractions are hard to write to.

## 4. Do the business work

The ten thousand small things a small shop always needs. Update the about page. Chase an invoice. Set up a better backup. Reply to the three emails you have been ignoring. None of this is glamorous. All of it clears the cognitive attic, and sometimes a sentence falls out.

## 5. Go for a walk and do not bring the phone

This is the single most reliable technique I have. An hour of walking with no device in reach produces a sentence about 80% of the time. I have done the math across a year of journal entries. It is the cheapest creativity tool on the market, and it is always on sale.

## 6. Finally, if none of the above works

I publish a short *notes* issue — which is what you are reading — about the process itself. I admit the block. I describe the workaround. I send it.

I have found that readers do not mind the meta-issues. A small number of them write back to tell me they were struggling with their own version of the same thing this week. We have quietly built a little union of workers who are kind to themselves when the sentences do not come.

That, in the end, may be the only real trick.`,
  },
  // -------------------------------------------------------------------------
  // 21 — Against the roadmap
  // -------------------------------------------------------------------------
  {
    id: "021-against-the-roadmap",
    number: 21,
    date: "2026-03-22",
    title: "Against the roadmap",
    deck: "Why a small product is better off with a posture than a plan.",
    tag: "product",
    readTimeMin: 10,
    excerpt:
      "A roadmap is a promise, and a small shop should make as few promises as possible. What you need is a posture — a direction of the shoulders.",
    body: `I do not keep a roadmap. I have not kept one for three years. I am going to try, in this issue, to say why.

## What a roadmap is actually for

A roadmap is for coordination. It exists because people who are not in the same room need to know what is coming, so they can make their own plans against yours. At a company of eighty, a roadmap is the literal interface between engineering and sales and customer success and marketing. Without it, they would bump into each other all day.

At a company of one — or two, or three — a roadmap is none of these things. It is a piece of theater. We build it because it makes us look grown-up, and because a customer once asked for one, and because roadmaps are what software companies make.

## What happens when you keep one anyway

I kept one for about a year. Three interesting things happened.

**First**, the roadmap made me slower. Every time I had an idea, I had to decide where it fit. Was this Q2? Did it bump something? Did the bump need to be announced? The overhead of maintaining the artifact exceeded the usefulness of the information inside it.

**Second**, the roadmap made me dishonest. A roadmap is a promise, and some of my promises did not survive contact with reality. I learned to soften the language until the roadmap was essentially decorative — a mood board of intentions. At which point, why.

**Third**, the roadmap made my users nervous. Specifically: when I missed a date, even by a month, the smallest fraction of readers would take it personally. Not because the feature mattered. Because a schedule had been published. A missed schedule reads like a broken trust.

## What I use instead

A *posture*. A direction of the shoulders. Here is the posture I have had for about eighteen months:

> The product should feel like reading a novel, not like managing a database.

That is it. That is the entire "roadmap." Every decision I make is tested against it. Does this new feature make the product feel more like a novel or more like a database? If it is the latter, I do not ship it, however often users ask.

A posture is not a plan. It is a *preference*. It cannot be missed or hit. It can only be carried.

## What to tell customers

I tell them exactly this: *There is no roadmap. There is a posture, which is X. If you have ideas that extend the posture, I would love to hear them.*

Three things have happened since I started saying this out loud:

1. The feature-request inbox has gotten a lot more interesting. People send me ideas aligned with the posture, not laundry lists against every competitor.
2. Customer retention has improved. I think because the posture is legible, and legibility breeds trust.
3. I sleep better. Which is not a marketing claim. It is just true.

## The caveat

This only works because the product already has users. A new product needs a plan, not a posture, because nobody trusts the shoulders yet. You earn the posture over time. Year one, keep the roadmap. Year four, throw it out.

At least, that is what I did.`,
  },
  // -------------------------------------------------------------------------
  // 20 — The case for the ugly first draft
  // -------------------------------------------------------------------------
  {
    id: "020-ugly-first-draft",
    number: 20,
    date: "2026-03-15",
    title: "The case for the ugly first draft",
    deck: "A working writer's defense of writing badly on purpose.",
    tag: "craft",
    readTimeMin: 8,
    excerpt:
      "An ugly first draft is not a failure mode. It is a required phase. The mistake is believing good writing arrives already good.",
    body: `I write almost every first draft of every issue in the same way: badly, quickly, and without looking back at the previous paragraph.

I am going to describe the method, and then defend it.

## The method

I open a blank document. I give myself thirty-five minutes on the timer. I write in fragments, half-sentences, placeholder words in ALL CAPS where the real word has not arrived yet. I do not stop to re-read. I do not fix a typo. I do not even, really, write in paragraphs — I write in what a friend of mine calls *thought-lumps*.

At the end of thirty-five minutes I close the document for at least an hour. Often a day. Then I come back and I rewrite, line by line, from the top.

The first draft is never — not once, in six years of this — the draft anyone reads. The first draft is the *material*. The second and third drafts are the piece.

## Why this works

Writing, like most skilled work, has two gears that are almost opposites. *Generation* is the gear where you produce material. *Selection* is the gear where you decide which material is good. Most writing advice treats these as a single activity. They are not.

Generation rewards speed, looseness, and a lowering of standards. Selection rewards care, patience, and a raising of standards. If you try to generate and select at the same time, you will produce neither volume nor quality. You will produce the third thing: *a few good sentences that take five hours to find*.

The ugly first draft is not a failure mode. It is a required phase. It is the phase where you are *allowed to be wrong in public with yourself*.

> The enemy of the first draft is the belief that good writing arrives already good.

## The part writers find hard

Most of the writers I know — and I know a lot of writers — have the opposite habit. They write the first sentence, then the second, then they go back and fix the first, then the second again. They polish as they go. They produce, on average, about a tenth as much material as someone who drafts ugly.

And here is the thing that took me years to admit: their polished sentences are often *worse* than an ugly-drafter's third-pass sentences. Because polishing-as-you-go leaves you with only the sentences that fit your current shape. There is no room for the weird sentence that turns out to be the key to the whole piece. You killed it in month one, when it arrived wrong.

## A small practical trick

If you cannot bring yourself to draft ugly, try this: write the first draft in a medium you do not consider "real." A Notes app. A voice memo you later transcribe. A postcard. Anything where your perfectionism is not looking.

I still, some weeks, draft into Notes on my phone while walking. Those are often the best issues. Something about the thumb-typing keeps the internal editor asleep.

## What to do with the ugly draft

Keep it. All of it. You will not look at most of them again, but the day you do — the day you cannot make the current issue work, and you go back through the graveyard of first drafts — you will find a sentence written eighteen months ago that is exactly what you need now.

I have a folder on my desktop called *the quarry*. It is mostly dead drafts. I mine it about once a month.

That is the method. It is not elegant. It is mine.`,
  },
  // -------------------------------------------------------------------------
  // 19 — Pricing the second product
  // -------------------------------------------------------------------------
  {
    id: "019-pricing-the-second-product",
    number: 19,
    date: "2026-03-08",
    title: "Pricing the second product",
    deck: "What I learned by pricing the same thing three different ways in one quarter.",
    tag: "product",
    readTimeMin: 9,
    excerpt:
      "I priced the same product at $19, $49, and $129 in a single quarter. The right number was not the one I guessed.",
    body: `This is a short dispatch about pricing, because I promised a paying reader I would share what I learned.

I shipped a second product in the fall. A small utility, useful to a specific kind of writer. Over the course of one quarter I priced it three ways and watched what happened.

## The experiment

**Weeks 1–4: $19.** I thought this would be the impulse-buy price. A writer sees the product, nods, pays for it without thinking.

**Weeks 5–8: $49.** I thought this would be the serious-tool price. A writer sees it, considers it, decides it is worth a small meal out.

**Weeks 9–12: $129.** I thought this would be the too-much price. A writer sees it, balks, moves on. I was going to use this window to gather "this is too expensive" emails and use them to justify the $49 I would settle on.

## What actually happened

At **$19**: I sold 41 units in four weeks. I received zero customer emails. I received zero testimonials. The product felt, to its owners, like one more tab in a browser.

At **$49**: I sold 38 units in four weeks. The money per unit was higher; revenue doubled. I received three customer emails, one of which was an offer to pay more because the product had saved them a day of work.

At **$129**: I sold 22 units in four weeks. Revenue tripled again. I received *fourteen* customer emails. Four were long, thoughtful product-feedback emails. Two were referrals. One person asked if I did custom consulting. The product, at $129, felt to its owners like a serious investment in their work. They treated it accordingly.

## The thing I did not expect

I thought I was running a pricing experiment. I was actually running a *customer experiment*. The price filtered for a specific kind of buyer. At $19, I got buyers who would not notice if I disappeared. At $129, I got buyers who treated the product like a small business expense and expected a small business in return.

> Price is not a knob on the product. It is a knob on who the product is for.

I am now charging $129. I am making more money and, weirdly, doing less support. The kind of buyer who pays $129 is the kind of buyer who reads the docs.

## What this suggests

I do not think there is a universal lesson here. Pricing is very specific to category, to channel, to your audience. But the meta-lesson — that the price selects the customer, not the other way around — has held up across every small product I have shipped since.

A low price is not a friendly price. It is just a low price. Sometimes the friendly thing is to charge enough that the buyer and the seller are in the same conversation.

Anyway — that is what I learned. The next product is being priced at $199 from the start. I will let you know.`,
  },
  // -------------------------------------------------------------------------
  // 18 — Links for a slow week
  // -------------------------------------------------------------------------
  {
    id: "018-links-for-a-slow-week",
    number: 18,
    date: "2026-03-01",
    title: "Links for a slow week",
    deck: "A small roundup of things I have read and thought about this month.",
    tag: "notes",
    readTimeMin: 6,
    excerpt:
      "Eight things from the month: an essay on parks, a software tool I finally learned, a bakery I keep recommending, and more.",
    body: `A links issue. I do these about once a quarter. Consider it a cross-section of what has been in my head for the last thirty days.

## Reading

**[Parks are infrastructure, not amenity](#)** — I came to this essay two years late, but it has reorganised how I look at the small green square near my apartment. The argument is almost aggressively boring: parks work because they are *ordinary*, not because they are *nice*. It has stuck with me.

**[The year I read nothing new](#)** — A writer I like spent a calendar year re-reading her favourite twelve books instead of buying new ones. Her report is lovely and a little melancholy. I am not going to try this myself, but I am going to *think* about trying it, which is the same thing at a lower cost.

**[On the quiet honesty of invoices](#)** — A short piece by another freelancer I follow. A paragraph of this turned up, paraphrased, in an issue I wrote last fall. Crediting it now, belatedly.

## A software tool

**Obsidian's built-in *Canvas* view.** I have had Obsidian installed for four years without ever learning the Canvas view, which is a kind of infinite scratchpad. It has replaced about three other tools I was using. If you use Obsidian and have been avoiding Canvas, spend the hour.

## A bakery

**Bonterre**, in my neighborhood. Sourdough on Wednesdays and Saturdays only. They run out by noon. I have started organising my walks around them. The bread is terrific; the pastry case is *superb*. If you are ever in town I will take you.

## Something I keep thinking about

> A small thing done well is better than a large thing done anxiously.

That is a note I wrote to myself three weeks ago and keep failing to live up to. I am putting it here so at least someone else has read it.

## Housekeeping

- **Paid readers** — the quarterly bonus essay is coming. Tentatively scheduled for the last weekend of the month.
- **A reader meetup** — we are going to try a small in-person gathering this summer in the city. Details to follow if twenty or more people say yes.
- **An issue I will not write** — I drafted a long piece about a productivity app and killed it on Saturday night. It was bad. I am glad it is dead.

Back to long-form next Sunday. A piece on customer emails has been writing itself in my head all week.`,
  },
  // -------------------------------------------------------------------------
  // 17 — The customer email is the product
  // -------------------------------------------------------------------------
  {
    id: "017-customer-email-is-the-product",
    number: 17,
    date: "2026-02-22",
    title: "The customer email is the product",
    deck: "Why how you reply to support mail is the clearest statement of what you are actually building.",
    tag: "product",
    readTimeMin: 10,
    excerpt:
      "Your product has two interfaces. The one with pixels and buttons is the famous one. The other one is how you reply when someone writes to you. Same product. Both count.",
    body: `There is a principle I have come around to, slowly, over the last three years:

*Your product has two interfaces. The one with pixels and buttons is the famous one. The other one is how you reply when someone writes to you.*

Same product. Both count. Most founders pour most of their craft into the first one and treat the second one as a chore. I think that is wrong — practically, ethically, and as a matter of taste. I am going to try to explain why.

## What a support email actually communicates

When a customer writes to you, they are almost never writing just about the thing they say they are writing about. They are writing about how safe it feels to be a customer here. Did the thing I bought come from a serious shop? Will I be treated with respect? If I run into a problem, will it be my problem — or will it, for a little while, become someone else's?

Every reply you write answers this question. The answer is in the words you choose, but it is also in the speed, the formatting, the signature, and the presence or absence of a link to a help center that nobody wanted to visit.

I have received support replies that read like:

> "Thanks for reaching out! Our team has logged your issue (ticket #ABCD-1234). A member of our customer success organization will reach out within 24–48 business hours."

And I have received support replies that read like:

> "Ah — this is my fault, I changed a thing yesterday and broke exactly what you are describing. Fixing it now. Will email again in an hour when it is back."

These are the same interface. They are not, by any measure I care about, the same product.

## What I try to do, specifically

A few practical rules, earned from doing this wrong for a long time:

1. **Reply in my own voice.** Not the product's voice, not a template, not a macro. My voice. If the reader has been reading the newsletter, the reply should feel continuous with it.

2. **Acknowledge the feeling, then the fact.** "That is frustrating, I am sorry — here is what happened." Not "Per our records, the issue has been escalated."

3. **Say when I do not know.** "I do not know yet. Give me until Thursday." A known unknown is worth more than a confident lie.

4. **Close the loop publicly when I can.** If the problem was a shared one, I write a short note in the next issue. Credits the original reporter, shows the rest of the readership that I am paying attention.

5. **No ticket numbers.** I will die on this hill. My shop is not the DMV.

## The objection, and the rebuttal

"This does not scale." Correct. It does not. It does not scale because nothing personal does — that is almost the definition of personal.

But the number of customers a one-person or small shop can actually *have* is smaller than you think. Four hundred, maybe six hundred, maybe twelve hundred if you are disciplined about asynchronous reply windows. All of them can get a hand-written email. I have, at various points, known the names and contexts of over four hundred paying readers. It is not impossible. It just does not look like software.

## What you learn when you do this

You learn the product. You learn what the error messages *should* have said. You learn the three sentences of docs you forgot to write. You learn which feature is silently loved and which is silently unused.

But you also learn the thing that is hardest to learn any other way: *who is actually paying you, and why.* And you cannot build a small product for a long time without knowing that.

The support inbox is not the product's annoying cousin. It is its nervous system. The product with the well-tended inbox is the one that lasts.`,
  },
  // -------------------------------------------------------------------------
  // 16 — The sentence as a unit of work
  // -------------------------------------------------------------------------
  {
    id: "016-sentence-as-unit-of-work",
    number: 16,
    date: "2026-02-15",
    title: "The sentence as a unit of work",
    deck: "On measuring a writing day by how many good sentences you left behind, not by words.",
    tag: "craft",
    readTimeMin: 8,
    excerpt:
      "A wordcount target is a mill target. It makes you good at producing words. A sentence target makes you good at producing the thing you actually wanted.",
    body: `I want to make a small argument about how writers measure their days.

The standard unit, if you read enough writing advice, is the word. "I wrote 2,000 words today." "My daily wordcount target is 1,500." This is such a common shorthand that it feels like the only option.

It is not. And I would like to propose an alternative that has, for me, produced better work and a happier life.

## The sentence as the unit

I no longer count words. I count *good sentences*.

A good sentence, for me, is one that I would read out loud to a friend at dinner without apologising for it. One that does the thing it is trying to do without clumsy footwork. One that I could defend, line by line, against a skeptical editor.

On a good day, I write between three and eight of these. On a bad day, zero or one. Over the course of a year, the total number of good sentences I produce is in the low four digits. Not a lot. More than enough to run a newsletter on.

## Why this matters

A wordcount target is a *mill* target. It rewards volume. You will hit it most days, because it is almost impossible not to, and the feedback loop will train you to produce the kind of paragraph that reaches the target with the least cognitive friction. That paragraph is, usually, not great.

A sentence target — specifically, a *good-sentence* target — is a *craft* target. It rewards precision. It is harder to fake. And it aligns your reward loop with the thing you actually want to have produced at the end of the day.

> A wordcount target makes you good at producing words. A sentence target makes you good at producing the thing you actually wanted.

## The practical method

Here is what I do. It is low-tech.

- I keep a plain text file, one per quarter, called \`sentences.txt\`.
- Every time I write a sentence I am genuinely pleased with, I paste it into the file.
- I do not annotate. I do not date. I just paste.
- At the end of the quarter I read the file.

That is the whole system. It has replaced the wordcount spreadsheet I used to keep.

## What you discover

A few months in, you notice things. You notice that the sentences you are proudest of tend to share a shape — maybe they are shorter than your normal sentences, or longer, or they use a particular rhythm. You notice that some weeks the file gets a lot of entries and some weeks it gets one. You notice, over time, which subjects produce your best work.

More importantly, you start writing *for the file*. You start trying, in small ways, to produce one more sentence each day worth pasting in. This is a much more useful ambition than producing 500 more words.

## The risk

There is one. The method can become precious. You can start writing sentences that are too pleased with themselves — the kind of writing that shows off rather than says a thing. I fight this by never publishing a sentence I added to \`sentences.txt\` the same week. Cool-off period. If it still looks good in a month, fine.

## Try it for a month

Do not throw out your wordcount tracker. Just add one more file. See what you put in it, and what you don't.

You will learn something about what you are actually trying to do, which is more than most productivity tools can honestly claim.`,
  },
  // -------------------------------------------------------------------------
  // 15 — Interview: Marisol Abadi on editing for a living
  // -------------------------------------------------------------------------
  {
    id: "015-marisol-abadi-editing",
    number: 15,
    date: "2026-02-08",
    title: "Marisol Abadi on editing for a living",
    deck: "A conversation with a working book editor about how to cut a sentence, and why most people cut the wrong one.",
    tag: "interviews",
    readTimeMin: 11,
    excerpt:
      "Marisol Abadi has been editing books for seventeen years. I cornered her at a bar and asked her how to cut a sentence.",
    body: `Marisol Abadi has been editing books for seventeen years. She works mostly on literary fiction and what she calls *essayistic non-fiction* — the kind of book I personally admire most. I cornered her at a small wine bar in her neighborhood and asked her how to cut a sentence. What follows is the transcript, lightly shaped.

---

**Jules:** Start with the basic thing. When you are editing, what are you looking for?

**Marisol:** Two questions, always. Is this sentence doing its job? And — is this sentence doing *somebody else's* job?

**Jules:** Say more about the second one.

**Marisol:** Half of editing is catching a sentence that is trying to do the work of the paragraph around it. A sentence that is explaining what you have already shown. Or a sentence that is previewing what you are about to show. Those sentences are the reason a good draft feels *padded*. The words are doing work, but the work has already been done.

## On cutting

**Jules:** How do you cut?

**Marisol:** I cut the end first. Not the beginning. Most writers flinch at cutting the beginning of anything — you lose the setup. The end is easier. Take a paragraph, chop the last sentence off, read it. Eight times out of ten, it is better. The last sentence of a paragraph is the sentence a writer uses to tell you they are done with the paragraph. A good reader does not need to be told.

**Jules:** And the beginning?

**Marisol:** Cut the first *clause*, not the first sentence. Writers warm up. The first clause of a first sentence is the sound of an engine turning over. The reader does not need to hear that. They need the car moving.

> The last sentence of a paragraph is the sentence a writer uses to tell you they are done with the paragraph. A good reader does not need to be told.

**Jules:** What about entire sections?

**Marisol:** Ask yourself: if I remove this section, does the reader lose anything *the reader would notice*? If not, lose it. Writers keep sections they love. Readers keep sections that serve them.

## On the writer-editor relationship

**Jules:** You work with a lot of first-book authors. What do they get wrong?

**Marisol:** They treat edits as criticism, and they argue. They argue even when they know I am right. Arguing is free, so they spend it. The writers who grow are the ones who realise that an edit is *data*. Not an opinion. Data. My job is to tell them what I noticed; their job is to decide what it means.

**Jules:** And the good ones?

**Marisol:** The good ones take an edit home. They sleep on it. They come back Monday with a version that is not the edit I suggested — it is something better, that solves the problem I identified in a way I did not imagine. That is the dance. That is what I am actually there for.

## On being edited yourself

**Jules:** Do you get edited?

**Marisol:** (laughs) I write a column once a month, and the editor of that column is ruthless with me. It is very humbling. I have caught myself, many times, using the same excuses my writers use. "But I wanted the reader to know." "But this sentence is doing something important." I now listen to my own editor's responses and understand them as a mirror.

**Jules:** What do those responses tend to be?

**Marisol:** "The reader already knows." Or: "It is not doing that important thing. It is doing a different, less important thing." Every writer discovers their own version of these two sentences. Both of mine are embarrassing to hear. They are also, almost always, correct.

---

*Marisol does not take new clients through public channels. But if you run into her at a bar, you should ask her about cutting. She is very good at it.*`,
  },
  // -------------------------------------------------------------------------
  // 14 — Three mistakes I made with the landing page
  // -------------------------------------------------------------------------
  {
    id: "014-landing-page-mistakes",
    number: 14,
    date: "2026-02-01",
    title: "Three mistakes I made with the landing page",
    deck: "A post-mortem on the first version of my product site, which converted at 0.4%.",
    tag: "product",
    readTimeMin: 9,
    excerpt:
      "The first version of my landing page converted at 0.4%. The third version converts at 6.1%. Here are the three mistakes I fixed, in order of pain.",
    body: `I rewrote the landing page for my product three times in the last year. The first version converted at 0.4%. The third version, which has been up for about two months, converts at 6.1%. I want to describe the three mistakes I had to fix, in order of pain.

## Mistake 1: writing about the product, not the reader

The first version of the page was an inventory. It said, at length, what the product could do. It had a feature grid. It had a specifications table. It had three screenshots of the interface with labels.

What it did not say, anywhere above the fold, was *what the product did for the reader*. A landing page is not a product brochure. It is an argument. The argument has a specific shape: *you, dear reader, have a problem; this product makes the problem smaller; here is evidence.*

The revised page opened with a single sentence about the reader's morning. The screenshots moved to the bottom. The feature grid vanished.

Conversion: 0.4% → 1.9%.

## Mistake 2: no one on the page

The second version, the one that got to 1.9%, had the right argument but the wrong rhetoric. It read like it had been written by nobody in particular. The voice was corporate-adjacent, competent, and bloodless.

This is the default for software landing pages, because most of them are written by a marketer who has never met the founder. Mine had no excuse. I wrote it and I was pretending to be someone else.

The revision: I put myself on the page. A short paragraph, in my voice, about why I had built the thing. A photograph, not flattering. A line at the bottom — *built by me, in my apartment, with too many opinions about commas.* The page suddenly sounded like the newsletter.

> A landing page is not a product brochure. It is an argument.

Conversion: 1.9% → 3.8%.

## Mistake 3: a fuzzy call to action

The third version, which got to 3.8%, had the right argument and the right voice but the wrong *ask*. The button said "Get started." This is possibly the most common CTA in software, and it is terrible. "Get started" is an instruction with no object. Started doing what? How? For how much?

I replaced it with a button that read "Buy it — $129/year." Two things happened. First, the click-through rate went *down* by about a third — because people who were never going to buy it now self-selected out. Second, the conversion rate of the people who did click went up by a factor of four, because they were now pre-committed. Net effect: 3.8% → 6.1%.

## The meta-lesson

None of these three fixes involved design polish. None of them involved A/B testing. None of them required a new framework or a new tool. They involved reading the page out loud, asking "what is this doing?", and being honest about the answer.

I think this is true for most small-product landing pages. The gap between 0.4% and 6% is not closed by cleverness. It is closed by three separate decisions to tell the truth more clearly.

The current page is fine. The next version will be better. I will probably do a post-mortem on *that* one in about a year.`,
  },
  // -------------------------------------------------------------------------
  // 13 — The quiet software movement
  // -------------------------------------------------------------------------
  {
    id: "013-quiet-software-movement",
    number: 13,
    date: "2026-01-25",
    title: "The quiet software movement",
    deck: "On a group of builders who are deliberately not trying to be anything.",
    tag: "writing",
    readTimeMin: 12,
    excerpt:
      "There is a movement in software that nobody calls a movement. Its members do not tweet. Its leaders do not give talks. Its revenue, collectively, is embarrassing.",
    body: `There is a movement in software that nobody calls a movement. I have been meaning to write about it for a year. This is a first attempt.

The movement's members do not tweet. Its leaders do not give talks. Its revenue, collectively, is embarrassing next to the mid-market SaaS world it quietly peels customers away from. It has no manifesto. It has no conference. It probably will not survive in a recognisable form for more than another decade. I think it is one of the more interesting things happening in computing right now.

## What the movement looks like

You have seen these products. You may be reading this letter in a tool built by one of them. I will not name names because the movement is, by its nature, allergic to being named — but you know the shape.

- A single person, or a pair, usually.
- A product that does one thing, deeply, for a specific kind of person.
- Priced somewhere between $30 and $300 a year. Sometimes one-time.
- A newsletter, an annual retrospective post, a slightly-dated website.
- No VC. Sometimes a small angel check from a peer. More often, a first year of cash from savings.
- Revenue: $40k to $800k a year, with a fat middle around $150k.
- Growth: slow, deliberate, and uninteresting to most commentators.

I know about thirty of these shops personally. I know of maybe two hundred more. The long tail, I assume, is very long indeed.

## What they believe, which they will not say out loud

The movement is united not by a belief but by a series of *allergies*. You can recognise a member by what they do not do.

They do not raise money. They do not scale. They do not hire more than one or two people. They do not go multi-product, except very slowly. They do not chase the viral loop. They do not pivot. They do not treat the customer as a user and they do not treat the user as an addressable-market unit.

> A member of this movement will never write you an onboarding email. They will write you a *letter*.

What they do do: they ship. They reply to every email. They pick up the phone. They raise prices slowly. They compound for a long time at a small rate.

## Why this keeps working

The big-software world has an assumption baked into its strategy: that a product must grow, or be acquired, or die. This is true for companies with investors, and it is a reasonable simplification for companies with more than twenty employees, and it is wrong for companies of one.

A one-person shop does not have to grow. It does not have to be acquired. It can just *exist*. It can collect a small amount of recurring revenue from a small number of people for a long time, and the founder can live a life on it.

For a long time this was not economically viable, because distribution was too expensive. You could not find your four hundred specific customers. The internet has, somewhat accidentally, made it trivial to find them. You find them through a newsletter, or a podcast, or a Discord, or a well-timed post. Once found, they are stable. Software is a subscription; the unit economics of a small loyal base are extraordinary.

## The movement's problem

The problem is that it cannot teach itself effectively. Because the members do not talk about themselves, and because the movement does not have conferences or tags, each new builder finds it as if for the first time. There are maybe five or six writers — I am trying, in my small way, to be one of them — who describe this way of working at all. The writing is scattered, anecdotal, and usually under-read.

I think about this a lot. The movement's secrecy is, partly, the reason it stays small. If everyone started doing this, the product categories would saturate and the economics would get harder.

But also: many people who would thrive here do not know it is a possibility. They are sitting in a job, or at a large company, or at the wrong startup, imagining their only options are (a) go bigger or (b) quit to do nothing.

## What I want, in my small way

I would like to write more clearly about this. I would like the people who might join the movement to see it. I would like the movement itself to stay weird, small, and allergic to its own brand.

I have not figured out how to do both. Possibly you can't.

For now: if you are inside this movement and reading this letter, hello. I see you. If you are standing outside wondering if you can fit: probably you can. The members are not mysteriously gifted. They are just stubborn about what they will not do.

The rest, it turns out, is time.`,
  },
  // -------------------------------------------------------------------------
  // 12 — A year of shipping slowly
  // -------------------------------------------------------------------------
  {
    id: "012-year-of-shipping-slowly",
    number: 12,
    date: "2026-01-18",
    title: "A year of shipping slowly",
    deck: "An annual report from a one-person shop that tried to go slower on purpose.",
    tag: "notes",
    readTimeMin: 10,
    excerpt:
      "At the start of 2025 I decided to try to ship less, on purpose. Here is what happened: revenue, readership, mood, and the things I got wrong.",
    body: `A year-in-review issue. I do one of these every January. This one is longer than usual because I want to actually look at the numbers.

At the start of 2025 I decided to try to ship less, on purpose. I was coming off an eighteen-month stretch of what I now recognise as low-grade panic. I was pushing a feature a week. I was answering email inside an hour. I was, without admitting it, performing competence for an imagined audience of investors who did not exist, because I do not have any.

The experiment: deliberately slow down. See what happens.

## The rules I set

- **One feature ship per month, at most.** Not per week.
- **One long email on Sunday, as usual.** Because the cadence is the muscle.
- **One customer call per week.** Not per day.
- **One marketing thing per quarter.** A guest essay, a podcast, a crossposted piece. Not an endless drip.
- **Two weeks off, at least.** Actually off. Email autoresponder, no laptop.

## The results, measured honestly

**Revenue:** up 18%. Smallest percentage growth in three years. Second-largest absolute growth. I am fine with this.

**Newsletter subscribers:** up from 4,210 to 5,832. Growth rate: 38%. Unchanged from 2024. The newsletter grew exactly as it has grown every year, regardless of how many features I shipped.

**Churn (annual):** 11%. Same as last year. I had expected, naively, that shipping fewer features would make customers churn more. Evidently not. Customers churn for reasons mostly unrelated to release velocity.

**Customer emails received:** up 22%. This one surprised me. I think shipping less gave customers more space to write, and my own replies were more thoughtful, which produced more replies in turn. A virtuous loop I did not anticipate.

**Issues of this newsletter I missed:** zero. Four years in.

**Weeks I felt like I was going to quit:** two. Down from about twelve the prior year.

## The things I got wrong

Not everything about the slow year worked.

**I underbuilt a feature that needed to exist.** There was a specific piece of functionality — a small thing, really, a CSV export — that customers had been asking for for six months. Because I was in "slow" mode, I kept pushing it. I finally shipped it in August. I should have shipped it in March. The month of "I will get to it" was more expensive than building it would have been.

**I overcommunicated the slowdown.** I mentioned it in about four issues and felt self-indulgent about all of them. You, reader, do not need a running commentary on my scheduling decisions. Shipping slowly should be *done*, not *announced*.

**I let marketing atrophy.** One marketing thing per quarter is probably too few for where I am. Next year I will aim for one per month, and treat it as a craft skill rather than an embarrassment.

## The feeling

This is the part I find hardest to write about, because it sounds like self-help. But I think it is the honest bottom line.

I felt, for the first time since I started the shop, like I was running it rather than being run by it. The slowdown did not produce worse work. It produced, in fact, *better* work, with a calmer maker behind it. I wrote better issues. I wrote better replies to customer emails. I shipped fewer features but the features I shipped were, on average, more important.

> Slowness is not laziness. It is a specific discipline of refusing to fill the available time.

I am going to keep the experiment running through 2026 with adjustments:

- One feature per month → one every three weeks. Still slow, but not artificially slow.
- Newsletter cadence: unchanged. Sundays, 7 a.m., a long email.
- More marketing, deliberately. One essay-exchange per month, one podcast per quarter, one in-person event per year.
- Same two weeks off. Non-negotiable.

## Thank you

If you are still reading at the end of a three-thousand-word year-in-review, you are, statistically, one of the people who keeps this newsletter going. I am aware of that, and I do not take it lightly.

There are 5,832 of you as I write this. I know the names of about six hundred. I would like to know more of them. Please write back if you are reading this. Tell me what you are shipping slowly.

I will reply. It is the whole point.`,
  },
  // -------------------------------------------------------------------------
  // 11 — The em dash is a shape
  // -------------------------------------------------------------------------
  {
    id: "011-em-dash-is-a-shape",
    number: 11,
    date: "2026-01-11",
    title: "The em dash is a shape",
    deck: "A short, slightly unhinged defense of my favorite piece of punctuation.",
    tag: "craft",
    readTimeMin: 5,
    excerpt:
      "The em dash is not a punctuation mark. It is a shape in the sentence — the moment the mind changes direction.",
    body: `A short one this week. I have been told — by my editor, who is correct about most things — that I overuse the em dash. This is my defense.

## The em dash is not punctuation

Or at least, not only punctuation. It is a *shape*. It is the moment the mind changes direction. The comma is a breath; the semicolon is a pivot; the em dash is a gesture — the hand, raised, asking you to wait a moment while a second thought arrives.

You can write without the em dash. Most English-language writers do. You can write without gesturing, too; it is just that your writing becomes smaller.

## What the em dash is good at

Three things, mostly.

**Parenthetical insertion, without the coldness of parentheses.** Parentheses feel like a footnote. An em-dashed clause feels like a whispered aside — a thing the reader and writer are sharing, briefly, while the main sentence continues.

**Sudden redirection.** A sentence begins going in one direction and has to swerve. A comma cannot do this. A period resets too hard. The em dash swerves.

**The final beat of a paragraph.** A short clause, set off by an em dash at the end, is a writer's last breath before a paragraph ends. It is, often, the funniest or the saddest word in the piece.

> The comma is a breath; the semicolon is a pivot; the em dash is a gesture.

## What the em dash is bad at

Everything else. In particular, it is a disaster when used to break up a sentence that did not need breaking up. If the clause you are setting off with em dashes could just as well be a comma-clause or a parenthetical, use those. Save the em dashes for when the sentence actually needs to gesture.

## My rule

Two em dashes per paragraph, maximum. More than that and the writing starts to feel like a string of asides with no throughline. My editor's rule is *zero* em dashes per paragraph. She has not won this one. She has won several others.

This has been, by a wide margin, the least consequential issue I have written this year. I apologise for nothing.`,
  },
  // -------------------------------------------------------------------------
  // 10 — What I use, a working writer's stack
  // -------------------------------------------------------------------------
  {
    id: "010-what-i-use",
    number: 10,
    date: "2026-01-04",
    title: "What I use — a working writer's stack",
    deck: "The ten or twelve tools I run the shop with, and why.",
    tag: "notes",
    readTimeMin: 9,
    excerpt:
      "I get asked about the tooling maybe once a month. This is the honest list. No affiliate links. One or two things will surprise you.",
    body: `I get asked about my tooling maybe once a month. This is the honest, up-to-date list. There are no affiliate links. One or two things will surprise you.

## Writing

**Drafting:** iA Writer on macOS. I have tried most of them. This one stays out of the way. I keep the file list visible because I like to see the graveyard of past drafts.

**Editing:** A print-out. Yes, really. I print every issue on Saturday morning, read it aloud at the kitchen table with a cup of coffee, mark it up with a felt-tip pen, then type the corrections back in. The print-out catches things the screen does not. I am not sure why. Possibly my eyes are broken. Regardless: I keep a box of paper for this.

**Version control:** A folder called \`drafts\`, organised by year. No Git. I am not building software with my essays.

## Newsletter sending

**The newsletter tool:** I am not going to name it. Not because it is secret, but because I would rather you not take my choice as an endorsement. Pick the one your friends already use. They are more similar than the marketing suggests. Mine has a good archive page and does not spam me with feature ads. That is the whole rubric.

**Landing page:** A single HTML file on a domain I have owned for fifteen years. I edit it about twice a year. It converts fine.

## Product

**Backend:** Elixir. I like it. You do not need to care. The language you build in is almost entirely a taste question at this scale.

**Database:** Postgres. It is the only answer.

**Hosting:** A single $20/month VPS. It handles the load. I will graduate to something bigger when I need to; I do not need to yet.

**Deployment:** A shell script called \`ship.sh\` that runs \`git push\` and restarts the process. If this sounds primitive, that is because it is. It has never failed me in three years.

## Money

**Invoicing:** A custom little tool I built for myself. It produces PDFs I am proud of. I use it for one or two client invoices a quarter. The same tool, but nicer, would probably be a product; I keep thinking about whether to ship it.

**Bookkeeping:** A spreadsheet. An accountant who is extremely kind about the spreadsheet. Taxes once a year.

**Subscriptions:** A text file with prices and renewal dates. I audit it quarterly. I have killed three things this year that I was paying for out of habit.

## The stuff that is not software

**A paper notebook.** Field Notes, Dot-Graph, one every four months or so. I carry it everywhere. The entries are mostly bad but the act of keeping one is the thing.

**Two pens.** A Uni-ball Vision Elite and a cheap Pilot G2. The Uni-ball bleeds through paper, which is a feature if you are using both sides of the book as a palimpsest and a bug otherwise.

**A desk.** An old oak schoolteacher's desk I bought at a yard sale in 2019 for forty dollars. There is a drawer for the paper. There is another drawer for the pens. There is no drawer for the phone, because the phone does not get to be at the desk.

> The tool that matters most is the one that keeps your attention where you want it.

## What I do not use

- Social media, for the shop. (I have a quiet personal account. I do not post from it.)
- An analytics dashboard of any kind. I look at the sub count monthly.
- A calendar app, other than the one on the phone. My week has four or five obligations, total.
- Any AI writing tool, except for the occasional fact-check. This is a taste call, not an ideology. You may taste differently.
- An office. The apartment is fine. The kitchen table, usually.

## What I will change next year, probably

- The hosting is creaking. A second VPS, with automated failover, is on the list.
- The newsletter tool has gotten worse over time. I may migrate.
- The desk is beginning to sag. I will sand and re-oil it. This is not software news.

That is the honest list. It is not impressive. It has been, more or less, enough.`,
  },
  // -------------------------------------------------------------------------
  // 9 — On rejecting a feature request
  // -------------------------------------------------------------------------
  {
    id: "009-rejecting-feature-request",
    number: 9,
    date: "2025-12-21",
    title: "On rejecting a feature request, kindly",
    deck: "How to say no to a customer in a way that leaves them feeling respected.",
    tag: "product",
    readTimeMin: 8,
    excerpt:
      "Saying no is the most underpracticed skill in product. Most shops either don't say no or say it badly. Here is how I try to do it.",
    body: `A tactical issue this week. A working writer's guide to saying no, specifically to a feature request from a paying customer.

I say no a lot. I have made this a policy. A one-person shop cannot build everything, and the shops that try usually collapse into an unusable pile of half-done features. But saying no badly is worse than saying yes badly. A poorly refused request can break a customer relationship in a way that a poorly built feature cannot.

Here is my practice, such as it is.

## Step 1: Actually read the request

Most feature requests arrive in a form that is not the real request. "Can you add bulk delete?" is a surface; the real request is usually something like "I have a lot of old records cluttering my view and I feel embarrassed about it."

Read the email twice. Ask yourself: *what is the feeling underneath this request?* Then respond to the feeling first.

## Step 2: Acknowledge the request in their terms

Before you explain anything, show the customer that you have understood them. In their words, not yours.

> "Thanks for writing. What you're describing — cleaning up months of old records that you don't need anymore — is a real problem, and I can see exactly why you'd want a bulk operation for it."

This is not a manipulation technique. It is how adults talk to each other.

## Step 3: Say no, specifically

Not "we'll consider it" if you won't. Not "it's on the roadmap" if it isn't. Say the actual answer, in the actual words.

> "I'm not going to build bulk delete, though. Let me tell you why."

This sentence, in my experience, produces an immediate softening on the other side. The customer was bracing for a deflection. Hearing a clear no — gently phrased — relaxes them into a conversation instead of a negotiation.

## Step 4: Give a reason that is a real reason

Not "our product philosophy" or "that doesn't fit our current priorities." A specific reason.

> "Bulk delete is a feature that is almost always loved until the moment someone uses it incorrectly. I've watched three other products in this space ship it, and every one of them spent the next year handling 'I deleted everything by accident' support tickets. I'd rather make single-record delete faster than add a feature that will, statistically, hurt someone within the first month."

A customer who gets a real reason is rarely upset. They may still wish you were doing it; they will not resent you for the choice.

## Step 5: Offer the adjacent thing, if there is one

Sometimes there is. Sometimes there is a smaller, less dangerous version of the request that solves the underlying problem.

> "What I can do — and I'm going to add this to the list for next month — is add an 'archive' state. Records in archive hide from your main view but are recoverable in a click. That gets you the clean list without the sharp edges. Would that solve it for you?"

An archive is not bulk delete. But it is, often, the actual thing the customer wanted and did not know how to ask for.

## Step 6: Thank them and mean it

> "Seriously, thanks for writing. This is exactly the kind of email that keeps me building a careful product instead of a sloppy one. I hope you'll tell me again the next time something's bothering you."

A paying customer who has been respected will write you a better email next time. A paying customer who has been stonewalled will just churn silently.

## A brief caveat

This entire process takes me about ten to fifteen minutes per reply. It is not scalable in the industry sense. It is scalable at my shop's size, which is the size I care about.

If you have ten thousand customers, you cannot do this for every one. If you have six hundred, you can. That is one of the quiet arguments for staying small.

> A poorly refused request can break a customer relationship in a way that a poorly built feature cannot.

I would rather do this well for six hundred people than badly for sixty thousand. That is the whole thesis, once again.`,
  },
  // -------------------------------------------------------------------------
  // 8 — Writing for an audience of one
  // -------------------------------------------------------------------------
  {
    id: "008-audience-of-one",
    number: 8,
    date: "2025-12-14",
    title: "Writing for an audience of one",
    deck: "A technique for bringing your newsletter back to life when it starts to feel generic.",
    tag: "writing",
    readTimeMin: 7,
    excerpt:
      "If your newsletter has gone flat, you probably stopped writing to a specific person. Here is how to find them again.",
    body: `A technique this week. A short one.

If your newsletter has gone flat — and they all do, periodically — you have probably stopped writing to a specific person. The technique is: pick a single reader, by name, and write to them.

Not a persona. Not a segment. A person. Someone you could, in principle, call on the phone.

## How this works in practice

I keep a list. It is on index cards, because I am a particular kind of difficult. Each card has a first name, a one-line description, and a note about the last time they wrote to me.

> **Ishaan** — software engineer in Bangalore, reads on his morning commute, last wrote to ask about pricing psychology, responded to the ugly-first-draft issue with a two-paragraph email about his own method.

Before I draft an issue, I pull a card. I pick the card that feels most relevant to the topic. Then I write the draft as if it were an email to that person. Greeting included, often. A lot of times the greeting gets cut before publication; sometimes it stays.

## Why this works

Because generic writing is written to nobody. It has the voice of corporate helpdesk, because corporate helpdesk is what you get when you try to address a crowd without offending any individual. Generic writing offends nobody and moves nobody. It is the default mode of a newsletter that is slowly dying.

Specific writing is different. Specific writing sometimes misses. Some readers will not identify with Ishaan. They will skim. But the readers who *do* identify will read every word.

The net effect — I have watched this happen over years of engagement data — is that specific writing has a *lower* open rate and a *much higher* forwarding rate. Which is exactly the trade I want.

> Generic writing is written to nobody. That is why nobody reads it.

## A common objection

"But what if the person I'm writing to isn't representative?"

They never are. That is the point. You do not want to write for the average reader. The average reader does not exist — they are a statistical artifact of aggregating real readers together and smoothing out the interesting parts.

If you write for Ishaan specifically, your writing will be interesting to the 20% of your readers who are like Ishaan, and clear to the 60% who aren't. The alternative — writing for the average — produces writing that is moderate and forgettable to 100% of everyone.

## How to start

Keep a list of readers. Keep it sparingly — a name and a line is enough. Every time someone writes to you, make a card or an entry. Before your next draft, pick one. Write to them.

If you cannot think of a reader: write to a friend. If you cannot think of a friend: write to your past self, from three years before. Any specific person will do. The important thing is that it is not nobody.

Try it once. See what happens to the sentences.`,
  },
  // -------------------------------------------------------------------------
  // 7 — On working in public, quietly
  // -------------------------------------------------------------------------
  {
    id: "007-working-in-public-quietly",
    number: 7,
    date: "2025-12-07",
    title: "On working in public, quietly",
    deck: "Why I share the work but not the process, and how I drew the line.",
    tag: "writing",
    readTimeMin: 8,
    excerpt:
      "Building in public is two separate things people keep bundling together. I do one of them and not the other, on purpose.",
    body: `There is a phrase — *building in public* — that means two separate things I keep seeing bundled together. I want to split them.

## Two things that look the same

The first thing is: *sharing the work*. You are making something, and you show it to people as you go. You post screenshots. You open-source the code. You let customers see features before they are ready. You tell the story of the thing being made.

The second thing is: *sharing the process*. You post your revenue numbers. You post your marketing metrics. You narrate your founder emotions. You make the making of the thing into content in its own right.

These are related but not the same. A lot of people do both. A lot of people do neither. I do the first and not the second, deliberately. Let me try to say why.

## Why I share the work

Because the work is made better by being seen. This is more or less an axiom for me. A writer writing for an empty room writes worse than a writer writing for a specific reader. The act of shipping something where people can see it sharpens it — even if most of them are not paying close attention, the fact that attention is *possible* does the work.

Every issue of this newsletter is an example of this. Most of them are read carefully by a small minority of readers. But I write every one as if the whole 5,832-person list is going to scrutinise it, because that is what makes them as good as they are.

> Work gets better when seen. The maker does not necessarily get better when seen.

## Why I do not share the process

Because the process is made worse by being seen. Also more or less an axiom for me.

Here is what I observe about people who share their process heavily. They publish their revenue, their churn, their emotional state, their Monday-morning spreadsheets. They are extremely legible to their audience. And they spend an enormous amount of time *managing* that legibility. Every decision becomes a story. Every setback becomes a narrative arc. Every week, the process-performance itself becomes a second job.

I do not have the stamina for the second job. Or — more honestly — I have seen what happens to the work when I try it. The work becomes secondary to the narrative about the work. This is a well-known pathology in journalism (writing about writing) and it is a well-known pathology in software (building a tool whose main feature is a public build log).

So I draw the line at: *I will show you what I have made. I will not show you, in any systematic way, how I made it.*

## The exception

There are exceptions, because life is a compromise. I do, rarely, write an issue like this one — about the shape of the work. I draft an annual retrospective with honest numbers in it. I answer direct questions in customer emails without much varnish. I tell the truth on a podcast when someone asks.

But these are occasional artifacts. They are not the mode. The mode is: ship the thing, reply to the readers, move on.

## What this means in practice

I have no "dashboard" page on my site. No public MRR counter. No Twitter account that announces my weekly progress. No real-time log of what I am working on.

I have a newsletter. I have a product. I have a quiet support inbox. That is, roughly, it.

This is not moral. It is temperamental. I have friends who share their process heavily and produce excellent work and seem happy. I am not them. I am this.

If you are starting out and wondering which of the two things to do — share the work, share the process — you do not, in fact, have to do both. You can do one. You can even do neither, if you build something genuinely useful in a category where demand finds you.

The internet talks about *building in public* as if it were a single strategy. It isn't. It is a shelf of strategies, and you are allowed to pick one item off the shelf.

I pick the work. I keep the process, mostly, for myself.`,
  },
  // -------------------------------------------------------------------------
  // 6 — Interview: Nell Oduya on running a print magazine in 2025
  // -------------------------------------------------------------------------
  {
    id: "006-nell-oduya-print-magazine",
    number: 6,
    date: "2025-11-30",
    title: "Nell Oduya on running a print magazine in 2025",
    deck: "A conversation with the founding editor of Hearth Quarterly about why anyone prints paper anymore.",
    tag: "interviews",
    readTimeMin: 12,
    excerpt:
      "Nell Oduya has been running Hearth Quarterly — a print magazine — for six years. We talked for an hour about why anyone prints anything anymore.",
    body: `Nell Oduya is the founding editor of *Hearth Quarterly*, a print magazine about design, craft, and what she calls "things that sit still." Circulation: about 4,800 paid annual subscribers. Price: $68 a year for four issues. They have been running for six years. We spoke for an hour on a Monday afternoon in her office, which is a converted first-floor living room in a rowhouse with terrible wifi.

---

**Jules:** The question everyone probably asks you first.

**Nell:** Why print.

**Jules:** Right.

**Nell:** The short answer is that people will pay more for a thing than for a feeling. A print magazine is a thing. It arrives. It sits on your coffee table. It weighs something. A website is a feeling that goes away when you close the tab. You cannot, really, charge $68 a year for a feeling, unless the feeling is very specific and very well-marketed.

**Jules:** But people clearly do charge $68 a year for digital subscriptions.

**Nell:** They do. And most of them are miserable, because the churn is brutal. Digital subscriptions bleed at about 30% a year. Ours bleed at about 7%. Paper, it turns out, is a magnificent retention tool. Once someone has three issues on their shelf, the fourth one almost subscribes itself.

## On the economics

**Jules:** The economics surely make it hard.

**Nell:** The economics make it *different*. A digital publication has effectively zero marginal cost per reader. A print publication has a marginal cost of, in our case, about $7 per copy per issue — that's paper, printing, fulfillment, the lot. So we cannot get to a million subscribers. We can get to five thousand, or ten thousand, which is the ceiling for our category.

**Jules:** Does that bother you?

**Nell:** It clarifies things. I am not trying to build the biggest magazine in the world. I am trying to build one that a specific audience adores. The unit economics force me to stay focused on that. In a perverse way, the paper is a *guardrail*.

> Paper is a magnificent retention tool. Once someone has three issues on their shelf, the fourth one almost subscribes itself.

## On the production schedule

**Jules:** Four issues a year. That's a demanding cadence.

**Nell:** (laughs) It is the maximum demanding cadence. When I was designing the publication I asked around — to editors at old-school print magazines — about what a two-person shop could realistically put out. The answer was always four. Monthly kills you. Bi-monthly is a compromise nobody likes. Quarterly is the sweet spot. You have ten weeks to build a thing, then two weeks to ship it, then you start again.

**Jules:** What about slower? Annual?

**Nell:** Annual is a book. A book is a different product. A magazine's charm is the rhythm — the sense that something is coming, reliably, on a pace. Annual breaks the rhythm. You become a book publisher who releases one book a year.

## On the internet

**Jules:** Do you have a website?

**Nell:** We have a *page*. It has the archive, a subscribe form, and a short manifesto. It is six years old and I have edited it maybe four times. We do not blog. We do not do social. We do not produce a single piece of free content on the internet other than the landing page itself.

**Jules:** Isn't that heretical?

**Nell:** Heretical to whom? To people trying to grow a different kind of business. We get our subscribers from two sources: word of mouth from existing readers, and three or four annual collaborations with other publications in adjacent corners. That is enough. We grow about 6% a year, and 6% compounds.

## On the future

**Jules:** Do you ever think about digital?

**Nell:** We think about it the way a bakery thinks about delivery. It is a totally different business. We would probably be bad at it. We are very good at making a quarterly magazine. I would rather be excellent at one thing than mediocre at two.

**Jules:** A last question. If a reader of mine wanted to start something like *Hearth Quarterly* tomorrow — what would you tell them?

**Nell:** Pick a subject you could write about for ten years. Build the first issue before you announce the subscription. Charge money from day one; never have a free period. Learn about paper; it matters more than you think. And be patient. Print is slow. So are the rewards. The reward, for what it is worth, is that you build something that sits on a person's coffee table for years, and they think about you every time they walk past it. That is a kind of relationship you cannot buy.

---

*Hearth Quarterly is at hearthquarterly.example. (Not a sponsor. I just send my friends their gift subscriptions every Christmas.)*`,
  },
  // -------------------------------------------------------------------------
  // 5 — The two kinds of customer feedback
  // -------------------------------------------------------------------------
  {
    id: "005-two-kinds-of-feedback",
    number: 5,
    date: "2025-11-23",
    title: "The two kinds of customer feedback",
    deck: "How to tell the feedback that makes your product better from the feedback that makes it worse.",
    tag: "product",
    readTimeMin: 8,
    excerpt:
      "Not all customer feedback is useful. The dangerous thing is that the two kinds feel identical when they arrive in your inbox.",
    body: `Two letters arrived in my customer inbox on the same Monday morning. I have been thinking about them, together, for a month.

They are both critical of the product. They are both from paying customers of long standing. They are both written in a serious tone. If I showed you the two emails side by side, you could not pick out, from the text alone, which one would make the product better if I acted on it and which one would make the product worse.

This is the central problem of running a customer-led product. Not all feedback is useful. The dangerous thing is that the useful and the useless kinds *feel identical* when they arrive.

## The useful letter

I'll paraphrase for privacy. Letter A was from a writer who uses my product as part of her weekly newsletter workflow. She said:

> "I noticed that when I import a long draft, the tool chokes for about twenty seconds before showing it. I've started dreading the import. I find myself working around it by pasting smaller chunks. I thought you should know."

This is useful feedback, and I will tell you why in a second.

## The dangerous letter

Letter B was from a product manager at a mid-sized company who had recently subscribed. He said:

> "The tool is good but missing a few enterprise features: SSO, audit logs, a collaborative multi-user mode, a way to export to PowerPoint, and an admin panel for managing users."

This is dangerous feedback. It also reads, to a new or anxious founder, exactly like the kind of feedback you should be delighted to receive. It is a list. It is specific. It is from a paying customer. It sounds like growth.

## How to tell them apart

There are three tests I run, now, against every piece of critical feedback.

**Test 1: Is this a description of a behavior, or a list of features?**

A description of behavior — "I've started dreading the import" — is almost always useful. It tells you about a real moment in a real user's life. A list of features is almost always feedback about a category the user imagines the product should be in, not about the product itself. Lists of features are the customer's imagination, not the customer's experience.

**Test 2: Does the user want the product you are building, or a different product?**

Letter A wants the product I'm building, but faster. Letter B wants a completely different product that has almost nothing to do with mine. This is the single biggest source of product drift in early-stage software: a founder mistakes *"make it more useful to me"* for *"change it into a tool for a different kind of buyer."* They are different requests.

**Test 3: Who else has said this?**

If a specific issue shows up in three separate letters from three separate users over three separate weeks, it is real. If it is one letter, it might be one person's wish, not the market's.

## What I did

I fixed the import performance. Took me about four hours. It was a real bug with a real cause — I had been serialising a tree when I could have been streaming it.

I did not build SSO, audit logs, or multi-user collaboration. I wrote Letter B back with a kind message, explaining that my product is for individuals and small teams, and that I thought the features he was describing would be better served by one of three other products I named. He wrote back two weeks later to thank me and to say he had actually gone with one of the three. He also, to my surprise, kept his subscription.

> The useful feedback sounds like a story. The dangerous feedback sounds like a procurement checklist.

## The caveat

Sometimes the checklist-style feedback is *right*. Sometimes your product needs SSO. But the checklist version arrives first; the evidence that it is right arrives only after you have seen the same checklist from ten different customers. Wait for the ten. Do not build for the one.

## The meta-lesson

A founder's nervous system is tuned, by default, to respond to the loudest voice. The loudest voice is usually the one with the checklist. You have to train yourself, deliberately, to hear the quieter voices — the ones describing a moment in their working week — over the louder ones. Those are the voices that will build a better product.

Letters like the writer's come in rarely. When they do, drop what you are doing and read them three times.`,
  },
  // -------------------------------------------------------------------------
  // 4 — The first year was a mess
  // -------------------------------------------------------------------------
  {
    id: "004-first-year-was-a-mess",
    number: 4,
    date: "2025-11-16",
    title: "The first year was a mess",
    deck: "An honest retrospective on the year I nearly quit.",
    tag: "notes",
    readTimeMin: 10,
    excerpt:
      "The first year was not a gentle launch arc. It was a year of being wrong about almost everything, almost all the time.",
    body: `I want to tell the honest version of a story I've told sanitised for a while.

The first year of this shop was not a gentle launch arc. It was not a steady climb. It was a year of being wrong about almost everything, almost all the time, with a thin layer of public confidence painted over the top. I thought it would be useful, now that enough time has passed, to walk through the actual shape of it.

## Month 1

I had a product idea and a pile of notes. I spent the month building a landing page for a product that did not yet exist, because I had read an essay saying you should sell before you build. I launched the landing page on the last day of the month. Seventeen people signed up for a waitlist. I was thrilled.

## Month 2

I built nothing. I read essays about what I should be building. I argued with myself, at length, about whether the product should be a web app or a desktop app or a command-line tool. I made no progress.

## Month 3

I panicked and built the wrong version. I built the version that had the most features. Because I had convinced myself that the waitlist would want a *serious* product. I did not talk to anyone on the waitlist. They were just a number.

## Month 4

I launched it. Seventeen waitlist emails went out with a "buy now" button. Four people bought it. The other thirteen ignored the email. Four customers at $29/month was $116/month. I did the math. I was going to die.

## Month 5

I started writing the newsletter. Not as a marketing channel — I did not think of it that way. I started it because the product work was grinding me down and I needed somewhere to think out loud. The first issue had 44 readers, most of whom were friends-of-friends.

## Month 6

I stopped working on the product for two weeks. I just wrote. The newsletter grew from 44 to 110 readers. I did not understand this. It felt like cheating, because it was less work and it was working better.

## Month 7

I started taking the newsletter seriously. I started writing it the way I would write a literary essay, not a marketing email. The readership jumped again. Some of the new readers tried the product. Some of them bought it. I had 11 customers.

## Month 8

I raised the price. From $29/month to $49/month. I lost four of the eleven customers and panicked. Two weeks later I realised I was making more money from 7 customers at $49 than I had been from 11 at $29. I understood, for the first time, what pricing actually was.

## Month 9

The first reader asked to sponsor the newsletter. I said yes and took $200 for a three-line mention in an issue. It was the easiest money I had ever made. I felt slightly dirty about it, which I now think was the correct response.

## Month 10

I nearly quit. I had a bad week, and then two bad weeks, and then a bad month. The numbers were fine — growing slowly — but my internal weather was a disaster. I had been doing this for nearly a year and I was exhausted and lonely and unsure whether any of it would work. I called a friend who had been running her own shop for five years. She talked me down. I slept for a weekend.

## Month 11

I shipped a minor feature that a customer had asked for three months prior. Nothing about my numbers changed. But something happened in the customer's reply email — a small *thank you*, written warmly — that stuck with me. I printed it out. I still have it.

## Month 12

I wrote a year-end issue that was a little too honest. Readers replied. Customers replied. A few of them signed up for additional products I had not yet built, because they wanted to support the shop. The year ended with 18 customers paying $49/month, a newsletter of 950 readers, and the total certainty that I was going to keep doing this.

## The lesson, such as it is

I did not have a plan. I did not have a strategy. I had an accidental discovery: that the newsletter was a better product than my product was.

Specifically: the newsletter was a product that readers wanted. The product, in its first version, was a thing I wanted to have built. Those are different things. I spent eighteen months, give or take, pivoting the product to become something that resembled what the newsletter readers actually needed. The moment it clicked, the whole shop came alive.

> The newsletter was a product readers wanted. The product, in its first version, was a thing I wanted to have built. Those are different things.

I tell new founders this, when they ask. Do not try to launch a perfect first product. Start a newsletter. Write into it, honestly, for a year. Let the newsletter teach you what the audience is actually hungry for. *Then* build the product. The newsletter is a research tool dressed as a publication.

That is, in hindsight, what the messy year was doing. I just didn't know it at the time.`,
  },
  // -------------------------------------------------------------------------
  // 3 — The shape of a working day
  // -------------------------------------------------------------------------
  {
    id: "003-shape-of-a-working-day",
    number: 3,
    date: "2025-11-09",
    title: "The shape of a working day",
    deck: "A literal hour-by-hour account of a good Tuesday.",
    tag: "writing",
    readTimeMin: 6,
    excerpt:
      "I am going to walk you through a good working day in ninety-minute blocks, because I have noticed that most people who describe their routines are lying.",
    body: `People ask about my routine. I am going to walk you through a good working day in ninety-minute blocks, because I have noticed that most people who describe their routines are gently lying — describing the routine they wish they had, or the routine they had during the best week of a specific year.

This is a real Tuesday from two weeks ago. Tuesdays are typical.

## 5:45 a.m. — up, not yet useful

Alarm. A glass of water on the kitchen counter, set out the night before. Fifteen minutes of sitting at the window, not reading anything. I do not check my phone until after this sitting.

## 6:00 a.m. — coffee, light reading

A cup of coffee. Twenty minutes of reading a book that is *not* about my work. Right now: a novel, about three hundred pages in. If I read anything about software or writing at this hour, the day gets hijacked.

## 6:30 a.m. — walk

A forty-minute walk. No phone. I have a small pocket notebook for things that demand to be captured, and I use it maybe once a week.

## 7:15 a.m. — desk, block one

First block of focused work. Today, ninety minutes on the draft of this very issue. I write in plain text with the wifi off. I do not check email. I do not look at my numbers. I do not look at my chat.

The wifi stays off from 7:15 to 12:00. This is, by a large margin, the single most important part of the routine.

## 8:45 a.m. — break, breakfast

A real breakfast. Eggs, usually. Something I have to cook. The cooking is part of the break — it is not a productivity input, but it also is not nothing. Twenty minutes. Then ten minutes of stretching, which I am bad at.

## 9:15 a.m. — desk, block two

Second block. Ninety minutes on product work. Today: a small feature, the CSV export I was putting off for months. Still no wifi. (I have the local dev environment on a separate machine for this reason. I know. It is absurd. It works.)

## 10:45 a.m. — break, tea

Tea. Another twenty-minute break. I read three pages of a book. Not the same book as the morning. Something slower — a book of essays, usually.

## 11:00 a.m. — desk, block three

Third block. Another ninety minutes. Either more product work or a second pass on the writing. Today: a second pass on this issue, cutting maybe 15% of the draft.

## 12:30 p.m. — wifi on, lunch

The day breaks in half at 12:30. The wifi comes on. I make lunch and eat it slowly — never at the desk. Twenty-five minutes.

## 1:00 p.m. — inbox

Inbox, deliberately, in one sitting. I read everything, answer what I can, batch the rest into a "later today" list. About an hour.

## 2:00 p.m. — customer calls or the support queue

Tuesdays usually have one customer call. Today it was a writer I have talked to before, thirty-five minutes, about a small product she is launching. She wanted advice; I wanted to hear how her thing was going.

After the call: forty minutes of support replies. Slow, hand-written, one at a time.

## 3:30 p.m. — desk, block four

Fourth block. This is a short one — sixty minutes. By now I am too tired for deep work, so this block is for the second-tier tasks. Invoicing. Filing. Writing a short note to a peer. Reviewing analytics (rarely, but today yes).

## 4:30 p.m. — walk two

Another forty-minute walk. Phone in pocket but on airplane mode. This is the walk where the next issue usually begins composing itself.

## 5:15 p.m. — closing the shop

Fifteen minutes of closing down. I write three bullets in my notebook: what I did today, what I am leaving for tomorrow, what I am grateful for. Yes, really, the gratitude thing. I used to be embarrassed about it. I have outgrown the embarrassment.

## 5:30 p.m. — off

Off. Done. Nothing work-related until tomorrow morning. Dinner with a friend tonight, or a book at home, or a film, or a show.

## What this works out to

Total deep-work time: about five hours. Total inbox / support / admin time: about two and a half hours. Total walking: an hour and a half. Total reading (non-work): thirty to fifty minutes, scattered.

It is not a lot of deep-work time, by the standards of the internet. It is, in my experience, a completely sufficient amount. More than five hours of deep work in a day produces diminishing returns. Often negative ones.

> More than five hours of deep work in a day produces diminishing returns. Often negative ones.

## What the day is missing

Social media. An open chat client. An open email app between 7:15 and 12:30. Meetings other than the one customer call. Long planning sessions. Prep for anything that isn't tomorrow.

I do not recommend this exact shape to anyone. The specifics are idiosyncratic. I am recommending the *principle* — that a working day for a solo shop is small, structured, and mostly quiet. The rest will find its own shape.`,
  },
  // -------------------------------------------------------------------------
  // 2 — Why I do not have a manifesto
  // -------------------------------------------------------------------------
  {
    id: "002-no-manifesto",
    number: 2,
    date: "2025-11-02",
    title: "Why I do not have a manifesto",
    deck: "A short argument against having a big idea.",
    tag: "writing",
    readTimeMin: 5,
    excerpt:
      "People keep writing to ask for my manifesto. I have declined for three years now, and I want to explain why.",
    body: `People keep writing to ask for my manifesto. They mean well. They want, I think, a compressed statement of what this newsletter is about — a pull-quote they can send to a friend, or pin to the top of their own notes, as shorthand.

I have declined for three years. I want to explain why, because I think the reason is interesting, at least to me.

## What a manifesto is for

A manifesto is a compression. It takes a large body of thought and distils it into a small number of declarative sentences that can fit on a poster.

Compression is useful for many things. It is useful for brands. It is useful for political movements. It is useful for writing the one-sentence pitch of a product.

It is not useful, in my opinion, for a living practice.

## What a living practice is

A living practice is something you are doing *now*. The thoughts that would fit on a poster are the crystallised, dead version of the thoughts you had about it a year ago. They are not the thoughts you are having about it this week. They do not accommodate the new thing you noticed on Tuesday.

A manifesto, once committed to paper, begins to pressure you. You start making small decisions to be more consistent with the manifesto, rather than more consistent with the actual texture of the work. The manifesto starts to govern the practice. This is backwards. The practice should govern the manifesto, if there is to be one.

> A manifesto freezes a practice at the worst possible time: the moment someone asks you what it is.

## What I have instead

I have a *running argument*. It unfolds, week by week, in this newsletter. Some weeks the argument is about small shops. Some weeks it is about writing. Some weeks it is about pricing. Some weeks the argument is *with myself*, about a prior issue.

If you read enough issues, you will start to notice a shape. It is not a shape I have written down. It is a shape I am doing. It is, in fact, a completely different shape now than it was in issue 4, because I was wrong about a few things in issue 4. If I had written a manifesto in issue 4 I would either be lying now or be stuck pretending.

## The pull-quote request

When people ask for a manifesto, they usually want a pull-quote. I have started, on occasion, to give them one. But the pull-quote I give is always about the method, not the content. Something like:

> "Ship a small thing every week, read it a month later, notice what you were wrong about, keep going."

That is the manifesto, if there has to be one. It is less a statement of belief than a description of how the practice renews itself.

But I would rather you read eight issues than this paragraph. The paragraph is a decoration. The issues are the work.

## A small meta-claim

Most of the practices I admire do not have manifestos. They have long bodies of work, and they have readers who compress those bodies of work in various ways, sometimes correctly.

The practices I admire least are usually the ones with the most quotable manifestos. The quotability is a symptom. It is a sign that someone cared more about fitting on the poster than about doing the work.

I would rather be a practice that is hard to quote.

So: no manifesto. Just the issues. Thanks for reading.`,
  },
  // -------------------------------------------------------------------------
  // 1 — How this newsletter works, and why
  // -------------------------------------------------------------------------
  {
    id: "001-how-this-newsletter-works",
    number: 1,
    date: "2025-10-26",
    title: "How this newsletter works, and why",
    deck: "A short manual to the thing you are reading.",
    tag: "writing",
    readTimeMin: 4,
    excerpt:
      "You have probably subscribed without really knowing what you signed up for. This is a short manual to the thing.",
    body: `You have probably subscribed without really knowing what you signed up for. A friend forwarded you an issue, or you found a link on someone else's website, or you read something of mine elsewhere and clicked through. Here is the short manual to the thing you are now reading.

## What arrives, and when

A single email every Sunday, at 7 a.m. in my time zone. About 1,200 to 2,500 words. Sometimes less. Occasionally more. You will never get more than one email a week, and I will not send you anything else.

## What it is about

It is, loosely, about making a small creative business that you can run for years without it destroying you. I have been doing this since 2021. Some weeks I write about writing. Some weeks I write about product. Some weeks it is a conversation with someone else who runs something small. Some weeks it is a roundup of things I've been thinking about. The running thread is a specific *disposition* — slow, attentive, suspicious of the things that get fashionable quickly.

## What it is not

It is not a productivity newsletter. It is not a marketing newsletter. It is not a how-to-scale newsletter. If any of those is what you were looking for, there are excellent ones and you should subscribe to them instead. I will not be offended if you unsubscribe now.

## Who writes it

Me. Just me. A writer and independent product maker who has been running a shop for several years. I do not use AI to write the issues. I do not have a ghostwriter. If something reads oddly, that is because I am an odd writer, not because an automated system has made a poor guess.

## What it will cost you

Nothing. The newsletter is free, and will stay free.

I make a living from a small product and, occasionally, from paid subscribers who get one additional essay per month. If you want to support the shop, the best thing you can do is forward a favourite issue to a specific friend. Better than money, in most weeks.

## How to reply

Hit reply to any issue. The email comes from a real address I read. I answer almost every email I get. If I don't answer yours, it is because I am behind, not because I don't care.

I will sometimes ask, at the bottom of an issue, for a specific kind of feedback. If you have it, send it. That back-and-forth is half of why I write the thing.

## What you should do if you hate it

Unsubscribe. There is a one-click link at the bottom of every issue. I would rather you read one issue and leave than read twenty and silently resent them. Your attention is worth too much for that.

## The deal, in one line

I will write you one long, careful email on Sunday mornings, for as long as I can keep it up. You read what you feel like reading. The rest, you delete.

That is the whole arrangement. Thanks for being here.

— *Jules*`,
  },
];

// Convenience aggregates

export const ISSUE_COUNT_BY_TAG: Record<Tag, number> = ISSUES.reduce(
  (acc, issue) => {
    acc[issue.tag] = (acc[issue.tag] ?? 0) + 1;
    return acc;
  },
  { writing: 0, product: 0, craft: 0, interviews: 0, notes: 0 } as Record<Tag, number>,
);

export const TAGS_IN_ORDER: Tag[] = ["writing", "product", "craft", "interviews", "notes"];

export function getIssueById(id: string): Issue | undefined {
  return ISSUES.find((i) => i.id === id);
}

export function getAdjacentIssues(id: string): { prev?: Issue; next?: Issue } {
  // Sorted by number descending in ISSUES. "prev" = older issue (lower number),
  // "next" = newer issue (higher number).
  const sortedAsc = [...ISSUES].sort((a, b) => a.number - b.number);
  const idx = sortedAsc.findIndex((i) => i.id === id);
  if (idx === -1) return {};
  return {
    prev: sortedAsc[idx - 1],
    next: sortedAsc[idx + 1],
  };
}

export function getRelatedIssues(id: string, limit = 3): Issue[] {
  const current = getIssueById(id);
  if (!current) return [];
  // Same tag first, then chronological proximity.
  return ISSUES.filter((i) => i.id !== id && i.tag === current.tag)
    .concat(ISSUES.filter((i) => i.id !== id && i.tag !== current.tag))
    .slice(0, limit);
}
