import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistSignups } from "@/lib/schema";

const schema = z.object({
  email: z.email(),
  source: z.string().max(64).optional(),
});

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown>;

  if (contentType.includes("application/json")) {
    payload = await request.json();
  } else {
    const form = await request.formData();
    payload = Object.fromEntries(form.entries());
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400 }
    );
  }

  await db.insert(waitlistSignups).values({
    email: parsed.data.email.toLowerCase().trim(),
    source: parsed.data.source ?? "homepage",
  });

  if (contentType.includes("application/json")) {
    return NextResponse.json({ success: true });
  }

  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.redirect(
    new URL("/?waitlist=ok", request.url),
    303
  );
}
