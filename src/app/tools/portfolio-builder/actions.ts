"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioPages, portfolioProjects } from "@/lib/schema";

const ACCOUNT_COOKIE = "startoor_account_email";
const EDIT_COOKIE = "startoor_portfolio_edit";

const slugSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(40, "Keep it under 40")
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only");

const socialsSchema = z
  .object({
    twitter: z.string().max(120).optional(),
    linkedin: z.string().max(120).optional(),
    github: z.string().max(120).optional(),
    dribbble: z.string().max(120).optional(),
    instagram: z.string().max(120).optional(),
  })
  .optional();

const pageSchema = z.object({
  slug: slugSchema,
  template: z.enum(["grid", "story", "editorial"]),
  displayName: z.string().min(1, "Add a name").max(80),
  role: z.string().max(80).optional(),
  tagline: z.string().max(140).optional(),
  about: z.string().max(600).optional(),
  avatarUrl: z.url().optional().or(z.literal("")),
  accentColor: z.string().max(20).optional(),
  backgroundColor: z.string().max(200).optional(),
  location: z.string().max(80).optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  website: z.url().optional().or(z.literal("")),
});

const projectSchema = z.object({
  title: z.string().min(1, "Add a title").max(120),
  role: z.string().max(80).optional(),
  client: z.string().max(80).optional(),
  year: z.string().max(20).optional(),
  coverImage: z.url().optional().or(z.literal("")),
  problem: z.string().max(600).optional(),
  approach: z.string().max(1200).optional(),
  outcome: z.string().max(600).optional(),
});

export type FormState = {
  errors?: Record<string, string[]>;
  globalError?: string;
};

export async function getCurrentEmail() {
  const store = await cookies();
  return store.get(ACCOUNT_COOKIE)?.value ?? null;
}

export async function getMyPortfolioPage() {
  const email = await getCurrentEmail();
  if (!email) return null;
  const rows = await db
    .select()
    .from(portfolioPages)
    .where(eq(portfolioPages.ownerEmail, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function setAccountEmailForPortfolio(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z.email().safeParse(formData.get("email"));
  if (!parsed.success) {
    return { errors: { email: ["Enter a valid email"] } };
  }
  const store = await cookies();
  store.set(ACCOUNT_COOKIE, parsed.data.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 60,
  });
  redirect("/tools/portfolio-builder");
}

type ParsedProject = {
  title: string;
  role: string | null;
  client: string | null;
  year: string | null;
  coverImage: string | null;
  mediaUrls: string[];
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  metrics: { label: string; value: string }[];
  links: { label: string; url: string }[];
};

function parseProjects(formData: FormData): ParsedProject[] {
  const raw = formData.get("projectsJson");
  if (typeof raw !== "string" || raw.length === 0) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((p) => {
      const obj = (p ?? {}) as Record<string, unknown>;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      if (!title) return null;
      const parsed = projectSchema.safeParse({
        title,
        role: typeof obj.role === "string" ? obj.role : "",
        client: typeof obj.client === "string" ? obj.client : "",
        year: typeof obj.year === "string" ? obj.year : "",
        coverImage: typeof obj.coverImage === "string" ? obj.coverImage : "",
        problem: typeof obj.problem === "string" ? obj.problem : "",
        approach: typeof obj.approach === "string" ? obj.approach : "",
        outcome: typeof obj.outcome === "string" ? obj.outcome : "",
      });
      if (!parsed.success) return null;
      const metricsRaw = Array.isArray(obj.metrics) ? obj.metrics : [];
      const metrics = metricsRaw
        .map((m) => {
          const mm = (m ?? {}) as Record<string, unknown>;
          const label = typeof mm.label === "string" ? mm.label.trim().slice(0, 40) : "";
          const value = typeof mm.value === "string" ? mm.value.trim().slice(0, 40) : "";
          if (!label || !value) return null;
          return { label, value };
        })
        .filter((m): m is { label: string; value: string } => Boolean(m))
        .slice(0, 3);
      const linksRaw = Array.isArray(obj.links) ? obj.links : [];
      const links = linksRaw
        .map((l) => {
          const ll = (l ?? {}) as Record<string, unknown>;
          const label = typeof ll.label === "string" ? ll.label.trim().slice(0, 60) : "";
          const url = typeof ll.url === "string" ? ll.url.trim() : "";
          if (!label || !url) return null;
          const u = z.url().safeParse(url);
          if (!u.success) return null;
          return { label, url };
        })
        .filter((l): l is { label: string; url: string } => Boolean(l))
        .slice(0, 5);
      const mediaRaw = Array.isArray(obj.mediaUrls) ? obj.mediaUrls : [];
      const mediaUrls = mediaRaw
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter((u) => {
          if (!u) return false;
          return z.url().safeParse(u).success;
        })
        .slice(0, 6);
      return {
        title: parsed.data.title,
        role: parsed.data.role || null,
        client: parsed.data.client || null,
        year: parsed.data.year || null,
        coverImage: parsed.data.coverImage || null,
        mediaUrls,
        problem: parsed.data.problem || null,
        approach: parsed.data.approach || null,
        outcome: parsed.data.outcome || null,
        metrics,
        links,
      };
    })
    .filter((p): p is ParsedProject => Boolean(p));
}

function parseSocials(formData: FormData) {
  const raw = formData.get("socialsJson");
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    const obj = JSON.parse(raw);
    const parsed = socialsSchema.safeParse(obj);
    if (!parsed.success) return undefined;
    const out = parsed.data;
    if (!out) return undefined;
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(out)) {
      if (typeof v === "string" && v.trim()) cleaned[k] = v.trim();
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export async function createPortfolioPage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = await getCurrentEmail();
  if (!email) {
    return { globalError: "Sign in with an email first." };
  }
  const raw = Object.fromEntries(formData);
  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const parsedProjects = parseProjects(formData);
  const parsedSocials = parseSocials(formData);

  const existingForEmail = await db
    .select()
    .from(portfolioPages)
    .where(eq(portfolioPages.ownerEmail, email))
    .limit(1);
  if (existingForEmail[0]) {
    return {
      globalError: "You already have a portfolio on this email. Edit it instead.",
    };
  }

  const existingForSlug = await db
    .select()
    .from(portfolioPages)
    .where(eq(portfolioPages.slug, parsed.data.slug))
    .limit(1);
  if (existingForSlug[0]) {
    return {
      errors: { slug: ["That handle is taken. Try another."] },
    };
  }

  // Build 24-char edit token via nanoid-style random string.
  const editToken = nano24();

  const [page] = await db
    .insert(portfolioPages)
    .values({
      slug: parsed.data.slug,
      ownerEmail: email,
      editToken,
      template: parsed.data.template,
      displayName: parsed.data.displayName.trim(),
      role: parsed.data.role || null,
      tagline: parsed.data.tagline || null,
      about: parsed.data.about || null,
      avatarUrl: parsed.data.avatarUrl || null,
      accentColor: parsed.data.accentColor || null,
      backgroundColor: parsed.data.backgroundColor || null,
      location: parsed.data.location || null,
      contactEmail: parsed.data.contactEmail || null,
      website: parsed.data.website || null,
      socials: parsedSocials ?? null,
    })
    .returning();

  if (parsedProjects.length > 0) {
    await db.insert(portfolioProjects).values(
      parsedProjects.map((p, idx) => ({
        pageId: page.id,
        title: p.title,
        role: p.role,
        client: p.client,
        year: p.year,
        coverImage: p.coverImage,
        mediaUrls: p.mediaUrls,
        problem: p.problem,
        approach: p.approach,
        outcome: p.outcome,
        metrics: p.metrics,
        links: p.links,
        sortOrder: idx,
      })),
    );
  }

  const store = await cookies();
  store.set(EDIT_COOKIE, `${page.slug}:${editToken}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect(`/tools/portfolio-builder/edit/${page.slug}`);
}

export async function updatePortfolioPage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const slug = String(formData.get("slug"));
  const email = await getCurrentEmail();
  if (!email) return { globalError: "Sign in again to continue editing." };

  const rows = await db
    .select()
    .from(portfolioPages)
    .where(and(eq(portfolioPages.slug, slug), eq(portfolioPages.ownerEmail, email)))
    .limit(1);
  const page = rows[0];
  if (!page) return { globalError: "Page not found." };

  const parsed = pageSchema.omit({ slug: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const parsedProjects = parseProjects(formData);
  const parsedSocials = parseSocials(formData);

  await db
    .update(portfolioPages)
    .set({
      template: parsed.data.template,
      displayName: parsed.data.displayName.trim(),
      role: parsed.data.role || null,
      tagline: parsed.data.tagline || null,
      about: parsed.data.about || null,
      avatarUrl: parsed.data.avatarUrl || null,
      accentColor: parsed.data.accentColor || null,
      backgroundColor: parsed.data.backgroundColor || null,
      location: parsed.data.location || null,
      contactEmail: parsed.data.contactEmail || null,
      website: parsed.data.website || null,
      socials: parsedSocials ?? null,
      updatedAt: new Date(),
    })
    .where(eq(portfolioPages.id, page.id));

  await db.delete(portfolioProjects).where(eq(portfolioProjects.pageId, page.id));
  if (parsedProjects.length > 0) {
    await db.insert(portfolioProjects).values(
      parsedProjects.map((p, idx) => ({
        pageId: page.id,
        title: p.title,
        role: p.role,
        client: p.client,
        year: p.year,
        coverImage: p.coverImage,
        mediaUrls: p.mediaUrls,
        problem: p.problem,
        approach: p.approach,
        outcome: p.outcome,
        metrics: p.metrics,
        links: p.links,
        sortOrder: idx,
      })),
    );
  }

  redirect(`/tools/portfolio-builder/edit/${page.slug}?saved=1`);
}

export async function deletePortfolioPage(formData: FormData) {
  const slug = String(formData.get("slug"));
  const email = await getCurrentEmail();
  if (!email) redirect("/tools/portfolio-builder");

  await db
    .delete(portfolioPages)
    .where(and(eq(portfolioPages.slug, slug), eq(portfolioPages.ownerEmail, email)));
  redirect("/tools/portfolio-builder");
}

export async function getPortfolioPageForEdit(slug: string) {
  const email = await getCurrentEmail();
  if (!email) return null;
  const rows = await db
    .select()
    .from(portfolioPages)
    .where(and(eq(portfolioPages.slug, slug), eq(portfolioPages.ownerEmail, email)))
    .limit(1);
  const page = rows[0];
  if (!page) return null;
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.pageId, page.id));
  projects.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { page, projects };
}

export async function getPublicPortfolioPage(slug: string) {
  const rows = await db
    .select()
    .from(portfolioPages)
    .where(eq(portfolioPages.slug, slug))
    .limit(1);
  const page = rows[0];
  if (!page) return null;
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.pageId, page.id));
  projects.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { page, projects };
}

// nanoid-style 24-char URL-safe random token, no external dep
function nano24(): string {
  const alphabet =
    "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 24; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
