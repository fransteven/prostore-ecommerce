# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build production bundle
npm run lint       # Run ESLint
npx prisma migrate dev    # Run database migrations
npx prisma studio         # Open Prisma database GUI
npx tsx db/seed.ts        # Seed database with sample data
```

## Architecture

**ProStore** is a full-stack e-commerce app built with Next.js App Router, PostgreSQL (Neon serverless), and Prisma ORM.

### Key patterns

- **Server Actions** handle all data fetching and mutations — located in `lib/actions/`, always marked with `"use server"`. No API routes.
- **Prisma client** is a singleton in `db/prisma.ts` using the Neon serverless adapter with WebSocket support. It includes result transformers that convert `Decimal` fields to strings for JSON serialization.
- **Data serialization**: Prisma results must be passed through `convertToPlainObject()` (`lib/utils.ts`) before being passed from Server Components to Client Components.
- **Validation**: Zod schemas in `lib/validators.ts` are used for all data validation.
- **UI components**: Shadcn/UI (New York style) in `components/ui/`. Add new components via `npx shadcn@latest add <component>`.

### Route structure

```
app/
  layout.tsx          # Root layout: ThemeProvider (next-themes, class-based dark mode)
  (root)/
    layout.tsx        # Adds Header + Footer
    page.tsx          # Home page — async RSC, calls getProducts()
```

### Environment variables

```
NEXT_PUBLIC_APP_NAME=Prostore
NEXT_PUBLIC_APP_DESCRIPTION=...
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
DATABASE_URL=postgresql://...   # Neon serverless connection string
```

### Database

Single `Product` model with UUID primary key, `Decimal` fields for `price` and `rating`, and a `String[]` for `images`. Schema is at `prisma/schema.prisma`; Prisma client generates to `lib/generated/prisma`.

Seeding: `db/seed.ts` uses `PrismaPg` (not the Neon adapter) for direct connection during seeding. Sample data is in `db/sample-data.ts`.
