"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/formatters";
import { sendEmail } from "@/lib/resend";

const orderSchema = z.object({
  productSlug: z.string().min(1),
  buyerName: z.string().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email"),
  cardNumber: z.string().min(12).max(24),
  cardExp: z.string().min(4).max(7),
  cardCvc: z.string().min(3).max(4),
});

export type OrderState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  orderId?: string;
  message?: string;
};

export async function submitOrder(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const parsed = orderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, parsed.data.productSlug))
    .limit(1);
  if (!product[0]) {
    return { message: "Product not found" };
  }

  const orderNumber = generateOrderNumber();
  const [order] = await db
    .insert(orders)
    .values({
      productId: product[0].id,
      email: parsed.data.email.toLowerCase().trim(),
      buyerName: parsed.data.buyerName.trim(),
      amountCents: product[0].priceCents,
      status: "demo_mode",
      orderNumber,
    })
    .returning();

  try {
    await sendEmail({
      to: parsed.data.email,
      subject: `Your Startoor order ${orderNumber}`,
      html: orderEmail({
        buyerName: parsed.data.buyerName,
        productTitle: product[0].title,
        productSlug: product[0].slug,
        orderNumber,
        amountCents: product[0].priceCents,
      }),
    });
  } catch (err) {
    console.warn("Order email failed:", err);
  }

  redirect(`/checkout/confirmation/${order.id}`);
}

function orderEmail({
  buyerName,
  productTitle,
  orderNumber,
  amountCents,
}: {
  buyerName: string;
  productTitle: string;
  productSlug: string;
  orderNumber: string;
  amountCents: number;
}) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
  return `
  <div style="font-family: ui-serif, Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1C1C1A;">
    <div style="border-bottom: 1px solid rgba(28,28,26,0.12); padding-bottom: 16px;">
      <p style="font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; color: #8F8B80;">Startoor — order received</p>
      <h1 style="font-size: 32px; letter-spacing: -0.01em; margin: 12px 0 0;">Hi ${buyerName}, thanks.</h1>
    </div>
    <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">
      We've received your order for <strong>${productTitle}</strong>.
    </p>
    <div style="border: 1px solid rgba(28,28,26,0.12); background: #FAF6ED; padding: 20px; margin: 24px 0;">
      <p style="font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #8F8B80; margin: 0;">Order</p>
      <p style="font-size: 22px; letter-spacing: -0.01em; margin: 6px 0 0;">${orderNumber}</p>
      <p style="font-size: 16px; color: #2E2E2B; margin: 12px 0 0;">${productTitle} · ${formatted}</p>
    </div>
    <p style="font-family: ui-monospace, monospace; font-size: 11px; color: #C85A3F; text-transform: uppercase; letter-spacing: 0.2em;">Demo mode</p>
    <p style="font-size: 14px; line-height: 1.65; color: #2E2E2B;">
      Startoor is in preview — this order was recorded but no payment was captured. We'll be in touch when real checkout opens. Thanks for being early.
    </p>
    <p style="margin-top: 32px; font-size: 14px; color: #8F8B80;">— The Startoor team</p>
  </div>
  `;
}
