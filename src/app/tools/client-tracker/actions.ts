"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientEntries, clientTouchpoints } from "@/lib/schema";

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

export async function getAllTouchpointsForOwner() {
  const email = await requireEmail();
  if (!email) return [];
  return await db
    .select()
    .from(clientTouchpoints)
    .where(eq(clientTouchpoints.ownerEmail, email))
    .orderBy(desc(clientTouchpoints.occurredAt));
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  email: z.string().max(200).optional().or(z.literal("")),
  nextAction: z.string().max(300).optional().or(z.literal("")),
  dueDate: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["active", "dormant", "closed", "not-yet"]).default("active"),
  valueCents: z.string().optional().or(z.literal("")),
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
    valueCents: parsed.data.valueCents ? parseInt(parsed.data.valueCents, 10) || 0 : 0,
    notes: parsed.data.notes || null,
    lastTouchedAt: new Date(),
  });
  revalidatePath("/tools/client-tracker");
}

const updateSchema = z.object({
  id: z.string().min(1),
  field: z.enum([
    "name",
    "company",
    "email",
    "nextAction",
    "dueDate",
    "status",
    "notes",
    "valueCents",
  ]),
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

  let valueToStore: string | number | null = parsed.data.value.trim();
  if (valueToStore === "") valueToStore = null;
  if (parsed.data.field === "valueCents") {
    const cleaned = String(valueToStore ?? "").replace(/[^0-9.]/g, "");
    valueToStore = cleaned ? Math.round(parseFloat(cleaned) * 100) : 0;
  }

  const fieldMap: Record<string, keyof typeof clientEntries.$inferInsert> = {
    name: "name",
    company: "company",
    email: "email",
    nextAction: "nextAction",
    dueDate: "dueDate",
    status: "status",
    notes: "notes",
    valueCents: "valueCents",
  };
  const dbField = fieldMap[parsed.data.field];

  await db
    .update(clientEntries)
    .set({
      [dbField]: valueToStore,
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

// --- Touchpoints ---

const touchpointSchema = z.object({
  clientId: z.string().min(1),
  note: z.string().min(1).max(300),
  kind: z.enum(["note", "email", "call", "meeting", "shipped"]).default("note"),
});

export async function addTouchpoint(formData: FormData) {
  const email = await requireEmail();
  if (!email) throw new Error("Not authenticated");

  const parsed = touchpointSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid touchpoint");

  const clientRows = await db
    .select()
    .from(clientEntries)
    .where(and(eq(clientEntries.id, parsed.data.clientId), eq(clientEntries.ownerEmail, email)))
    .limit(1);
  if (!clientRows[0]) throw new Error("Client not found");

  const now = new Date();
  await db.insert(clientTouchpoints).values({
    clientId: parsed.data.clientId,
    ownerEmail: email,
    note: parsed.data.note.trim(),
    kind: parsed.data.kind,
    occurredAt: now,
  });

  await db
    .update(clientEntries)
    .set({ lastTouchedAt: now, updatedAt: now })
    .where(eq(clientEntries.id, parsed.data.clientId));

  revalidatePath("/tools/client-tracker");
}

export async function deleteTouchpoint(formData: FormData) {
  const email = await requireEmail();
  if (!email) throw new Error("Not authenticated");
  const id = String(formData.get("id"));
  await db
    .delete(clientTouchpoints)
    .where(and(eq(clientTouchpoints.id, id), eq(clientTouchpoints.ownerEmail, email)));
  revalidatePath("/tools/client-tracker");
}

// --- Sample seed ---

export async function seedSampleClients() {
  const email = await requireEmail();
  if (!email) return;
  const existing = await db
    .select()
    .from(clientEntries)
    .where(eq(clientEntries.ownerEmail, email))
    .limit(1);
  if (existing.length > 0) return;

  const now = Date.now();
  const days = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  const sample: (typeof clientEntries.$inferInsert)[] = [
    {
      ownerEmail: email,
      name: "Ayaan Burke",
      company: "Burke Studio",
      email: "ayaan@burke.studio",
      nextAction: "Send Q2 scope deck",
      dueDate: "Apr 19",
      status: "active",
      valueCents: 1200000,
      lastTouchedAt: days(2),
    },
    {
      ownerEmail: email,
      name: "Nora Callahan",
      company: "Meridian Craft Co.",
      email: "nora@meridian.co",
      nextAction: "Approve brand guidelines revision",
      dueDate: "Apr 22",
      status: "active",
      valueCents: 850000,
      lastTouchedAt: days(4),
    },
    {
      ownerEmail: email,
      name: "Reiko Saito",
      company: "Saito & Co.",
      email: "reiko@saito.co",
      nextAction: "Waiting on legal — ping Monday",
      dueDate: "Apr 28",
      status: "active",
      valueCents: 2400000,
      lastTouchedAt: days(18),
    },
    {
      ownerEmail: email,
      name: "Javier Mendoza",
      company: "Mendoza Clinics",
      nextAction: "Kickoff scheduled",
      dueDate: "May 06",
      status: "not-yet",
      valueCents: 600000,
      lastTouchedAt: days(1),
    },
    {
      ownerEmail: email,
      name: "Poppy Grant",
      company: "Field Notes Collective",
      email: "hello@fieldnotes.co",
      nextAction: "Final invoice sent — paid",
      status: "closed",
      valueCents: 450000,
      lastTouchedAt: days(45),
    },
    {
      ownerEmail: email,
      name: "Owen Drake",
      company: "Drake & Partners",
      email: "owen@drakepartners.com",
      nextAction: "Cold — re-engage after Q2",
      status: "dormant",
      valueCents: 1500000,
      lastTouchedAt: days(62),
    },
  ];
  const inserted = await db.insert(clientEntries).values(sample).returning();

  // Sample touchpoints for the first three clients
  const ayaan = inserted[0];
  const nora = inserted[1];
  const reiko = inserted[2];
  const touchpointSeed: (typeof clientTouchpoints.$inferInsert)[] = [
    {
      clientId: ayaan.id,
      ownerEmail: email,
      note: "Emailed: sent Q2 scope draft v1 for review",
      kind: "email",
      occurredAt: days(2),
    },
    {
      clientId: ayaan.id,
      ownerEmail: email,
      note: "Call — clarified budget range and rollout timing",
      kind: "call",
      occurredAt: days(5),
    },
    {
      clientId: ayaan.id,
      ownerEmail: email,
      note: "Initial intro via Sasha. Warm lead.",
      kind: "note",
      occurredAt: days(9),
    },
    {
      clientId: nora.id,
      ownerEmail: email,
      note: "Sent brand guidelines v2. Waiting on sign-off.",
      kind: "shipped",
      occurredAt: days(4),
    },
    {
      clientId: nora.id,
      ownerEmail: email,
      note: "Review call went well, two small revisions requested.",
      kind: "meeting",
      occurredAt: days(7),
    },
    {
      clientId: reiko.id,
      ownerEmail: email,
      note: "Emailed follow-up — no reply yet",
      kind: "email",
      occurredAt: days(18),
    },
  ];
  await db.insert(clientTouchpoints).values(touchpointSeed);

  revalidatePath("/tools/client-tracker");
}
