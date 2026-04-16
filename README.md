# Startoor

A curated marketplace for AI-built apps, templates, and tools.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Neon Postgres + Drizzle ORM
- Auth.js v5 (Resend magic links)
- Resend for transactional email
- Motion for animations
- Deployed on Vercel

## Local development

```bash
npm install
cp .env.example .env.local  # fill in values
npm run db:push             # push schema to Neon
npm run db:seed             # populate catalog
npm run dev
```

## Environment

```
DATABASE_URL=""
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Startoor <onboarding@resend.dev>"
ADMIN_PASSWORD=""
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:push` | Push schema directly to DB |
| `npm run db:seed` | Populate marketplace catalog |
| `npm run db:studio` | Open Drizzle studio |

## Notes

- Stripe checkout is mocked for demo purposes — orders persist, payments do not.
- AI products in the catalog ship with pre-generated showcase output; the marketplace itself is fully functional.
