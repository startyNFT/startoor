"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sellerApplications } from "@/lib/schema";
import { sendEmail } from "@/lib/resend";

const applicationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  displayName: z.string().min(2).max(120),
  website: z.string().max(200).optional().or(z.literal("")),
  twitter: z.string().max(60).optional().or(z.literal("")),
  portfolio: z.string().max(300).optional().or(z.literal("")),
  productPitch: z.string().min(50, "Please give us at least a paragraph").max(2000),
  priceRange: z.string().max(40).optional().or(z.literal("")),
  launchTimeline: z.string().max(40).optional().or(z.literal("")),
});

export type ApplicationState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function submitApplication(
  _prev: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  const raw = Object.fromEntries(formData);
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  await db.insert(sellerApplications).values({
    name: parsed.data.name.trim(),
    email: parsed.data.email.toLowerCase().trim(),
    displayName: parsed.data.displayName.trim(),
    website: parsed.data.website || null,
    twitter: parsed.data.twitter || null,
    portfolio: parsed.data.portfolio || null,
    productPitch: parsed.data.productPitch.trim(),
    priceRange: parsed.data.priceRange || null,
    launchTimeline: parsed.data.launchTimeline || null,
    status: "pending",
  });

  try {
    await sendEmail({
      to: parsed.data.email,
      subject: "We got your Startoor application",
      html: `
      <div style="font-family: ui-serif, Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1C1C1A;">
        <p style="font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; color: #8F8B80;">Startoor — application received</p>
        <h1 style="font-size: 36px; letter-spacing: -0.01em; margin: 16px 0 0;">Hi ${parsed.data.name.split(" ")[0]}, we got it.</h1>
        <p style="font-size: 16px; line-height: 1.7; margin-top: 20px;">
          Thanks for wanting to ship on Startoor. We review every application by hand. Expect a response in 5 days — sometimes faster.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #2E2E2B;">
          While you wait, two things you can do:<br />
          1. Follow <a href="https://x.com/startoor" style="color: #1F3A2F;">@startoor</a> on X — we announce maker onboarding there first.<br />
          2. Line up a short video walkthrough of your product. It helps us review faster.
        </p>
        <p style="margin-top: 32px; font-size: 14px; color: #8F8B80;">— The Startoor team</p>
      </div>
      `,
    });
  } catch (err) {
    console.warn("Application email failed:", err);
  }

  redirect("/sell/apply/sent");
}
