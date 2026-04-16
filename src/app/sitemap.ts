import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products, makers, categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://startoor.vercel.app";
  const now = new Date();

  const [allProducts, allMakers, allCategories] = await Promise.all([
    db
      .select({ slug: products.slug, publishedAt: products.publishedAt })
      .from(products)
      .where(eq(products.status, "published")),
    db.select({ slug: makers.slug }).from(makers),
    db.select({ slug: categories.slug }).from(categories),
  ]);

  return [
    { url: `${baseUrl}/`, lastModified: now, priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: now, priority: 0.9 },
    { url: `${baseUrl}/sell`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/sell/apply`, lastModified: now, priority: 0.6 },
    ...allCategories.map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
    ...allMakers.map((m) => ({
      url: `${baseUrl}/makers/${m.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
    ...allProducts.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.publishedAt ?? now,
      priority: 0.8,
    })),
  ];
}
