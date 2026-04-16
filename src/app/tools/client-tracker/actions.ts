"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientEntries } from "@/lib/schema";

const COOKIE = "startoor_account_email";

async function requireEmail() {
  const store = await cookies();
  const email = store.get(COOKIE)?.value;
  return email ?? null;
}

export async function getCurrentEmail() {
  return await requireEmail();
}

export async function setAccountEmailForTracker(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = z.email().safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email" };
  }
  const store = await cookies();
  store.set(COOKIE, parsed.data.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 60,
  });
  redirect("/tools/client-tracker");
}

export async function getClients() {
  const email = await requireEmail();
  if (!email) return [];
  return await db
    .select()
    .from(clientEntries)
    .where(eq(clientEntries.ownerEmail, email))
    .orderBy(desc(clientEntries.updatedAt));
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  email: z.string().max(200).optional().or(z.literal("")),
  nextAction: z.string().max(300).optional().or(z.literal("")),
  dueDate: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["active", "dormant", "closed", "not-yet"]).default("active"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function createClient(formData: FormData) {
  const email = await requireEmail();
  if (!email) redirect("/tools/client-tracker");

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Invalid client data");
  }
  await db.insert(clientEntries).values({
    ownerEmail: email,
    name: parsed.data.name.trim(),
    company: parsed.data.company || null,
    email: parsed.data.email || null,
    nextAction: parsed.data.nextAction || null,
    dueDate: parsed.data.dueDate || null,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
  });
  revalidatePath("/tools/client-tracker");
}

const updateSchema = z.object({
  id: z.string().min(1),
  field: z.enum(["name", "company", "email", "nextAction", "dueDate", "status", "notes"]),
  value: z.string().max(1000),
});

export async function updateClientField(formData: FormData) {
  const email = await requireEmail();
  if (!email) throw new Error("Not authenticated");

  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid update");

  const rows = await db
    .select()
    .from(clientEntries)
    .where(and(eq(clientEntries.id, parsed.data.id), eq(clientEntries.ownerEmail, email)))
    .limit(1);
  if (!rows[0]) throw new Error("Not found");

  const fieldMap: Record<string, keyof typeof clientEntries.$inferInsert> = {
    name: "name",
    company: "company",
    email: "email",
    nextAction: "nextAction",
    dueDate: "dueDate",
    status: "status",
    notes: "notes",
  };
  const dbField = fieldMap[parsed.data.field];
  const value = parsed.data.value.trim();

  await db
    .update(clientEntries)
    .set({
      [dbField]: value === "" ? null : value,
      updatedAt: new Date(),
    })
    .where(eq(clientEntries.id, parsed.data.id));
  revalidatePath("/tools/client-tracker");
}

export async function deleteClient(formData: FormData) {
  const email = await requireEmail();
  if (!email) throw new Error("Not authenticated");
  const id = String(formData.get("id"));
  await db
    .delete(clientEntries)
    .where(and(eq(clientEntries.id, id), eq(clientEntries.ownerEmail, email)));
  revalidatePath("/tools/client-tracker");
}

export async function seedSampleClients() {
  const email = await requireEmail();
  if (!email) return;
  const existing = await db
    .select()
    .from(clientEntries)
    .where(eq(clientEntries.ownerEmail, email))
    .limit(1);
  if (existing.length > 0) return;
  const sample: (typeof clientEntries.$inferInsert)[] = [
    {
      ownerEmail: email,
      name: "Ayaan Burke",
      company: "Burke Studio",
      email: "ayaan@burke.studio",
      nextAction: "Send Q2 scope deck",
      dueDate: "Apr 19",
      status: "active",
    },
    {
      ownerEmail: email,
      name: "Nora Callahan",
      company: "Meridian Craft Co.",
      email: "nora@meridian.co",
      nextAction: "Approve brand guidelines revision",
      dueDate: "Apr 22",
      status: "active",
    },
    {
      ownerEmail: email,
      name: "Reiko Saito",
      company: "Saito & Co.",
      email: "reiko@saito.co",
      nextAction: "Waiting on legal — ping Monday",
      dueDate: "Apr 28",
      status: "dormant",
    },
    {
      ownerEmail: email,
      name: "Javier Mendoza",
      company: "Mendoza Clinics",
      nextAction: "Kickoff scheduled",
      dueDate: "May 06",
      status: "not-yet",
    },
    {
      ownerEmail: email,
      name: "Poppy Grant",
      company: "Field Notes Collective",
      email: "hello@fieldnotes.co",
      nextAction: "Final invoice sent — paid",
      status: "closed",
    },
  ];
  await db.insert(clientEntries).values(sample);
  revalidatePath("/tools/client-tracker");
}
