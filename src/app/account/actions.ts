"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const emailSchema = z.object({ email: z.email("Please enter a valid email") });

export async function setAccountEmail(_prev: { error?: string }, formData: FormData) {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: z.flattenError(parsed.error).fieldErrors.email?.[0] ?? "Invalid email" };
  }
  const store = await cookies();
  store.set("startoor_account_email", parsed.data.email.toLowerCase().trim(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/account");
}

export async function clearAccountEmail() {
  const store = await cookies();
  store.delete("startoor_account_email");
  redirect("/account");
}

export async function getAccountEmail() {
  const store = await cookies();
  return store.get("startoor_account_email")?.value ?? null;
}
