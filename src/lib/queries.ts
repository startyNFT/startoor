import { asc, desc, eq, ilike, or, sql, and, inArray, SQL } from "drizzle-orm";
import { db } from "./db";
import {
  categories,
  makers,
  products,
  reviews,
} from "./schema";

export async function getAllCategories() {
  return await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      icon: categories.icon,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.status, "published")))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] || null;
}

export async function getFeaturedProducts(limit = 4) {
  return await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      tagline: products.tagline,
      priceCents: products.priceCents,
      coverImage: products.coverImage,
      tags: products.tags,
      featured: products.featured,
      category: {
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
      },
      maker: {
        id: makers.id,
        slug: makers.slug,
        displayName: makers.displayName,
        avatarUrl: makers.avatarUrl,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .where(and(eq(products.featured, true), eq(products.status, "published")))
    .orderBy(desc(products.publishedAt))
    .limit(limit);
}

export type ProductListItem = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

export interface BrowseFilters {
  search?: string;
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "featured";
  limit?: number;
  offset?: number;
}

export async function browseProducts(filters: BrowseFilters = {}) {
  const { search, category, sort = "featured", limit = 24, offset = 0 } = filters;
  const conditions: SQL[] = [eq(products.status, "published")];

  if (search) {
    const pattern = `%${search}%`;
    const searchOr = or(
      ilike(products.title, pattern),
      ilike(products.tagline, pattern),
      ilike(products.description, pattern)
    );
    if (searchOr) conditions.push(searchOr);
  }

  if (category) {
    const categoryIds = (
      await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, category))
    ).map((r) => r.id);
    if (categoryIds.length > 0) {
      conditions.push(inArray(products.categoryId, categoryIds));
    }
  }

  const orderClause =
    sort === "price-asc"
      ? asc(products.priceCents)
      : sort === "price-desc"
        ? desc(products.priceCents)
        : sort === "newest"
          ? desc(products.publishedAt)
          : sql`${products.featured} desc, ${products.publishedAt} desc`;

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      tagline: products.tagline,
      priceCents: products.priceCents,
      coverImage: products.coverImage,
      tags: products.tags,
      featured: products.featured,
      publishedAt: products.publishedAt,
      category: {
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
      },
      maker: {
        id: makers.id,
        slug: makers.slug,
        displayName: makers.displayName,
        avatarUrl: makers.avatarUrl,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .where(and(...conditions))
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  const totalRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(...conditions));

  return {
    products: rows,
    total: totalRows[0]?.count ?? 0,
  };
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      product: products,
      category: {
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
      },
      maker: {
        id: makers.id,
        slug: makers.slug,
        displayName: makers.displayName,
        bio: makers.bio,
        avatarUrl: makers.avatarUrl,
        website: makers.website,
        twitter: makers.twitter,
        location: makers.location,
        verified: makers.verified,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] || null;
}

export async function getProductReviews(productId: string) {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 3) {
  return await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      tagline: products.tagline,
      priceCents: products.priceCents,
      coverImage: products.coverImage,
      tags: products.tags,
      featured: products.featured,
      category: {
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
      },
      maker: {
        id: makers.id,
        slug: makers.slug,
        displayName: makers.displayName,
        avatarUrl: makers.avatarUrl,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .where(
      and(
        eq(products.categoryId, categoryId),
        sql`${products.id} != ${productId}`,
        eq(products.status, "published")
      )
    )
    .limit(limit);
}

export async function getMakerBySlug(slug: string) {
  const makerRows = await db
    .select()
    .from(makers)
    .where(eq(makers.slug, slug))
    .limit(1);
  const maker = makerRows[0];
  if (!maker) return null;

  const makerProducts = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      tagline: products.tagline,
      priceCents: products.priceCents,
      coverImage: products.coverImage,
      tags: products.tags,
      featured: products.featured,
      category: {
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
      },
      maker: {
        id: makers.id,
        slug: makers.slug,
        displayName: makers.displayName,
        avatarUrl: makers.avatarUrl,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(makers, eq(products.makerId, makers.id))
    .where(and(eq(products.makerId, maker.id), eq(products.status, "published")))
    .orderBy(desc(products.publishedAt));

  return { maker, products: makerProducts };
}

export async function getAllMakers() {
  return await db
    .select({
      id: makers.id,
      slug: makers.slug,
      displayName: makers.displayName,
      bio: makers.bio,
      avatarUrl: makers.avatarUrl,
      location: makers.location,
      verified: makers.verified,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(makers)
    .leftJoin(products, and(eq(products.makerId, makers.id), eq(products.status, "published")))
    .groupBy(makers.id);
}

export async function getProductStats() {
  const totalProducts = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.status, "published"));
  const totalMakers = await db.select({ count: sql<number>`count(*)::int` }).from(makers);
  const totalCategories = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categories);
  return {
    products: totalProducts[0]?.count ?? 0,
    makers: totalMakers[0]?.count ?? 0,
    categories: totalCategories[0]?.count ?? 0,
  };
}
