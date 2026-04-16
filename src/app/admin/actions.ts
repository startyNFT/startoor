"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sellerApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";

const ADMIN_COOKIE = "startoor_admin";

export async function checkAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return token === process.env.ADMIN_PASSWORD;
}

export async function login(_prev: { error?: string }, formData: FormData) {
  const password = String(formData.get("password") || "");
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Wrong password" };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });
  redirect("/admin/applications");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function setApplicationStatus(applicationId: string, status: "approved" | "rejected") {
  if (!(await checkAdmin())) {
    throw new Error("Not authorized");
  }
  await db
    .update(sellerApplications)
    .set({ status })
    .where(eq(sellerApplications.id, applicationId));
}

export async function updateApplicationStatusAction(formData: FormData) {
  "use server";
  const id = String(formData.get("applicationId"));
  const status = String(formData.get("status")) as "approved" | "rejected";
  await setApplicationStatus(id, status);
  redirect("/admin/applications");
}
