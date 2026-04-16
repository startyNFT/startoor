"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { bioPages, bioLinks } from "@/lib/schema";
import type { BioTemplateKey } from "@/lib/bio-templates";

const ACCOUNT_COOKIE = "startoor_account_email";
const EDIT_COOKIE = "startoor_bio_edit";

const slugSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(40, "Keep it under 40")
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only");

const linkSchema = z.object({
  label: z.string().min(1, "Add a label").max(80),
  url: z.url("Needs to be a full URL (https://...)"),
});

const pageSchema = z.object({
  slug: slugSchema,
  template: z.enum(["classic", "night", "editorial", "sunset"]),
  displayName: z.string().min(1, "Add a name").max(80),
  headline: z.string().max(140).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.url().optional().or(z.literal("")),
  accentColor: z.string().max(20).optional(),
  backgroundColor: z.string().max(200).optional(),
  location: z.string().max(80).optional(),
});

function parseLinks(formData: FormData) {
  const labels = formData.getAll("linkLabel").map(String);
  const urls = formData.getAll("linkUrl").map(String);
  return labels
    .map((label, i) => ({ label: label.trim(), url: urls[i]?.trim() ?? "" }))
    .filter((l) => l.label && l.url);
}

export async function getCurrentEmail() {
  const store = await cookies();
  return store.get(ACCOUNT_COOKIE)?.value ?? null;
}

export async function getMyBioPage() {
  const email = await getCurrentEmail();
  if (!email) return null;
  const rows = await db
    .select()
    .from(bioPages)
    .where(eq(bioPages.ownerEmail, email))
    .limit(1);
  return rows[0] ?? null;
}

export type FormState = {
  errors?: Record<string, string[]>;
  globalError?: string;
};

export async function setAccountEmailForBio(
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
  redirect("/tools/link-in-bio");
}

export async function createBioPage(
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
  const parsedLinks = parseLinks(formData);

  const existingForEmail = await db
    .select()
    .from(bioPages)
    .where(eq(bioPages.ownerEmail, email))
    .limit(1);
  if (existingForEmail[0]) {
    return {
      globalError:
        "You already have a page on this email. Edit it instead.",
    };
  }

  const existingForSlug = await db
    .select()
    .from(bioPages)
    .where(eq(bioPages.slug, parsed.data.slug))
    .limit(1);
  if (existingForSlug[0]) {
    return {
      errors: { slug: ["That handle is taken. Try another."] },
    };
  }

  const editToken = crypto.randomUUID();
  const [page] = await db
    .insert(bioPages)
    .values({
      slug: parsed.data.slug,
      ownerEmail: email,
      editToken,
      template: parsed.data.template,
      displayName: parsed.data.displayName.trim(),
      headline: parsed.data.headline || null,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
      accentColor: parsed.data.accentColor || null,
      backgroundColor: parsed.data.backgroundColor || null,
      location: parsed.data.location || null,
    })
    .returning();

  if (parsedLinks.length > 0) {
    await db.insert(bioLinks).values(
      parsedLinks.map((link, idx) => ({
        pageId: page.id,
        label: link.label,
        url: link.url,
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

  redirect(`/tools/link-in-bio/edit/${page.slug}`);
}

export async function updateBioPage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const slug = String(formData.get("slug"));
  const email = await getCurrentEmail();
  if (!email) return { globalError: "Sign in again to continue editing." };

  const rows = await db
    .select()
    .from(bioPages)
    .where(and(eq(bioPages.slug, slug), eq(bioPages.ownerEmail, email)))
    .limit(1);
  const page = rows[0];
  if (!page) return { globalError: "Page not found." };

  const parsed = pageSchema.omit({ slug: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }
  const parsedLinks = parseLinks(formData);

  await db
    .update(bioPages)
    .set({
      template: parsed.data.template,
      displayName: parsed.data.displayName.trim(),
      headline: parsed.data.headline || null,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
      accentColor: parsed.data.accentColor || null,
      backgroundColor: parsed.data.backgroundColor || null,
      location: parsed.data.location || null,
      updatedAt: new Date(),
    })
    .where(eq(bioPages.id, page.id));

  await db.delete(bioLinks).where(eq(bioLinks.pageId, page.id));
  if (parsedLinks.length > 0) {
    await db.insert(bioLinks).values(
      parsedLinks.map((link, idx) => ({
        pageId: page.id,
        label: link.label,
        url: link.url,
        sortOrder: idx,
      })),
    );
  }

  redirect(`/tools/link-in-bio/edit/${page.slug}?saved=1`);
}

export async function deleteBioPage(formData: FormData) {
  const slug = String(formData.get("slug"));
  const email = await getCurrentEmail();
  if (!email) redirect("/tools/link-in-bio");

  await db
    .delete(bioPages)
    .where(and(eq(bioPages.slug, slug), eq(bioPages.ownerEmail, email)));
  redirect("/tools/link-in-bio");
}

export async function getBioPageForEdit(slug: string) {
  const email = await getCurrentEmail();
  if (!email) return null;
  const rows = await db
    .select()
    .from(bioPages)
    .where(and(eq(bioPages.slug, slug), eq(bioPages.ownerEmail, email)))
    .limit(1);
  const page = rows[0];
  if (!page) return null;
  const links = await db
    .select()
    .from(bioLinks)
    .where(eq(bioLinks.pageId, page.id));
  links.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { page, links };
}

export async function getPublicBioPage(slug: string) {
  const rows = await db
    .select()
    .from(bioPages)
    .where(eq(bioPages.slug, slug))
    .limit(1);
  const page = rows[0];
  if (!page) return null;
  const links = await db
    .select()
    .from(bioLinks)
    .where(eq(bioLinks.pageId, page.id));
  links.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { page, links };
}
