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

## Architecture & Codebase Reference

See @AGENTS.md — full codebase reference (stack, route structure, auth, Prisma models, server actions, components, env vars) lives there alongside the Masterclass pipeline rules.

> Quick tip: add shadcn components via `npx shadcn@latest add <component>`.
