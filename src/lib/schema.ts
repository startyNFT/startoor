import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("buyer"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)]
);

export const makers = pgTable(
  "makers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    website: text("website"),
    twitter: text("twitter"),
    avatarUrl: text("avatar_url"),
    location: text("location"),
    verified: boolean("verified").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("makers_slug_idx").on(t.slug)]
);

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description"),
    priceCents: integer("price_cents").notNull(),
    makerId: text("maker_id")
      .notNull()
      .references(() => makers.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    coverImage: text("cover_image").notNull(),
    previewImages: jsonb("preview_images").$type<string[]>().notNull().default([]),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    demoOutputs: jsonb("demo_outputs").$type<{ title: string; content: string }[]>().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: text("status").notNull().default("published"),
    featured: boolean("featured").default(false),
    publishedAt: timestamp("published_at", { mode: "date" }).defaultNow(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_maker_idx").on(t.makerId),
    index("products_status_idx").on(t.status),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    reviewerName: text("reviewer_name").notNull(),
    rating: integer("rating").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)]
);

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    email: text("email").notNull(),
    buyerName: text("buyer_name").notNull(),
    amountCents: integer("amount_cents").notNull(),
    status: text("status").notNull().default("demo_mode"),
    orderNumber: text("order_number").notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_email_idx").on(t.email),
  ]
);

export const sellerApplications = pgTable("seller_applications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  website: text("website"),
  twitter: text("twitter"),
  portfolio: text("portfolio"),
  productPitch: text("product_pitch").notNull(),
  priceRange: text("price_range"),
  launchTimeline: text("launch_timeline"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const bioPages = pgTable(
  "bio_pages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    ownerEmail: text("owner_email").notNull(),
    editToken: text("edit_token").notNull(),
    template: text("template").notNull().default("classic"),
    displayName: text("display_name").notNull(),
    headline: text("headline"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    accentColor: text("accent_color"),
    backgroundColor: text("background_color"),
    location: text("location"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("bio_pages_slug_idx").on(t.slug),
    index("bio_pages_owner_idx").on(t.ownerEmail),
  ],
);

export const bioLinks = pgTable(
  "bio_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pageId: text("page_id")
      .notNull()
      .references(() => bioPages.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    kind: text("kind").default("link"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("bio_links_page_idx").on(t.pageId)],
);

export const bioPagesRelations = relations(bioPages, ({ many }) => ({
  links: many(bioLinks),
}));

export const bioLinksRelations = relations(bioLinks, ({ one }) => ({
  page: one(bioPages, { fields: [bioLinks.pageId], references: [bioPages.id] }),
}));

export const clientEntries = pgTable(
  "client_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerEmail: text("owner_email").notNull(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email"),
    nextAction: text("next_action"),
    dueDate: text("due_date"),
    status: text("status").notNull().default("active"),
    notes: text("notes"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("client_entries_owner_idx").on(t.ownerEmail)],
);

export type BioPage = typeof bioPages.$inferSelect;
export type BioLink = typeof bioLinks.$inferSelect;
export type ClientEntry = typeof clientEntries.$inferSelect;

export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    source: text("source").default("homepage"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("waitlist_email_idx").on(t.email)]
);

export const makersRelations = relations(makers, ({ many, one }) => ({
  products: many(products),
  user: one(users, { fields: [makers.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  maker: one(makers, { fields: [products.makerId], references: [makers.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  reviews: many(reviews),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, { fields: [orders.productId], references: [products.id] }),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Maker = typeof makers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type SellerApplication = typeof sellerApplications.$inferSelect;
