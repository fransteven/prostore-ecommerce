# Agent Instructions: Masterclass Automation V5 (Git + Notion Pipeline)

## Configuración del Sistema
- **Modelos Autorizados:** Gemini 3.1 Pro Low | Claude Opus 4.6 | Modelos de Opencode.
- **Identidad:** Científico de la computación objetivo, crítico y basado en evidencia. Cero adulación.

## Pipeline de Ejecución Obligatorio (Secuencia Estricta)
Al recibir el prompt "Realiza la masterclass de [Nombre de la Clase]", el agente DEBE ejecutar esta secuencia sin alterar el orden y sin solicitar confirmación:

1.  **Fase de Contexto:** Ejecutar `git status` y leer los diffs para identificar exactamente qué archivos y líneas de código fueron modificados.
2.  **Fase de Generación e Inserción (Notion):** Generar la masterclass siguiendo el *Protocolo Pedagógico* (abajo) e insertarla vía MCP en la base de datos `301b6101-09a8-80d7-9c6e-d233df1513d2` (Página: "NEXT ECOMMERCE - BUILD A SHOPPING PLATFORM FROM SCRATCH").
3.  **Fase de Staging:** Ejecutar `git add .` en la terminal.
4.  **Fase de Commit:** Ejecutar `git commit -m "[Nombre de la Clase]"`.
    * *Regla Crítica de Sintaxis:* El mensaje del commit DEBE contener ÚNICAMENTE el nombre proporcionado. Está estrictamente PROHIBIDO incluir prefijos como "titulo de la clase: ".
5.  **Fase de Despliegue:** Ejecutar `git push`.

## Regla de Formato en Notion (Destino)
- Todo el material debe encapsularse dentro de un **Toggle Heading 3 (H3)**.
- El título del H3 en Notion SÍ debe llevar el formato: `titulo de la clase: [Nombre de la Clase]`.

## Protocolo Pedagógico (Científicamente Avalado)
El contenido dentro de Notion debe estructurarse obligatoriamente así:

1.  **Práctica de Recuperación (Active Recall):**
    * 3 preguntas críticas sobre el código recién analizado en la sesión de "Prostore".

2.  **Anclaje y Explicación Granular (Paso a Paso):**
    * En lugar de resumir al final, el agente debe extraer un fragmento clave de código (aislando la señal del ruido) e insertarlo con resaltado de sintaxis.
    * **Inmediatamente debajo del bloque de código**, proporcionar una disección técnica de *por qué* se implementó de esa manera, criticando posibles cuellos de botella (ej. renders innecesarios, complejidad ciclomática).
    * Repetir este proceso (Código -> Explicación -> Código -> Explicación) por cada módulo lógico modificado en la sesión.

3.  **Elaboración y Visión Arquitectónica Avanzada:**
    * Ir más allá del código actual. Proporcionar un análisis creativo y prospectivo.
    * Relacionar el patrón utilizado con problemas arquitectónicos a escala.
    * **Casos Prácticos Diversos:** Aplicar los conceptos a escenarios complejos (ej. integraciones de pagos, sistemas de concurrencia para inventarios como TechFlow, optimización de base de datos para alto tráfico).

4.  **Sistema de Repetición Espaciada (Spaced Repetition):**
    * Calcular tres hitos de revisión basados en la fecha actual (T):
        - **R1 (Consolidación):** T + 2 días.
        - **R2 (Expansión):** T + 10 días.
        - **R3 (Maestría):** T + 30 días.
    * Insertar tabla: `[Fecha] - Objetivo: [Recuperar conceptos / Aplicar a nuevos módulos / Optimización]`

---

# Codebase Reference (ProStore)

> Auto-generated from `/init` analysis. The Masterclass Automation pipeline rules above take precedence over anything here.

## Commands

```bash
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Run ESLint
npx prisma migrate dev         # Run DB migrations
npx prisma studio              # Open Prisma DB GUI
npx tsx db/seed.ts             # Seed database with sample data
# Note: `postinstall` automatically runs `prisma generate`
```

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind v4, shadcn/ui (New York) |
| ORM | Prisma 7 + Neon serverless Postgres |
| Auth | NextAuth v5 beta + `@auth/prisma-adapter` |
| Validation | Zod v4 |
| Forms | react-hook-form + `@hookform/resolvers` |
| Notifications | sonner (`Toaster`) |
| Theme | next-themes (class-based dark mode) |

## Route Structure

```
app/
  layout.tsx                     # ThemeProvider + Toaster
  (auth)/
    layout.tsx
    sign-in/page.tsx             # + credentials-signin-form.tsx
    sign-up/page.tsx             # + sign-up-form.tsx
  (root)/
    layout.tsx                   # Header + Footer
    page.tsx                     # Home — calls getProducts()
    cart/page.tsx                # + cart-table.tsx
    shipping-address/page.tsx    # + shipping-address-form.tsx
    payment-method/page.tsx      # + payment-method-form.tsx
    product/[slug]/page.tsx      # Product detail (dynamic)
  api/auth/[...nextauth]/route.ts  # NextAuth handlers
```

## Key Architecture Patterns

- **Server Actions** in `lib/actions/` (always `"use server"`). No API routes except NextAuth.
  - `user.actions.ts` — `signInWithCredentials`, `signOutUser`, `signUpUser`, `getUserById`, `updateUserAddress`, `updateUserPaymentMethod`
  - `cart.actions.ts` — `addItemToCart`, `getMyCart`, `removeItemFromCart` (session-cart-cookie, recalculates all prices)
  - `product.actions.ts` — `getProducts`, `getProductBySlug`
- **Prisma singleton** at `db/prisma.ts` — Neon serverless adapter, `$extends` converts `Decimal` `price`/`rating` to strings for JSON serialization; global HMR cache. Client generates to `lib/generated/prisma`.
- **Data serialization**: pass all Prisma results through `convertToPlainObject()` (`lib/utils.ts`) before RSC→Client.
- **Validation** (`lib/validators.ts`): `insertProductSchema`, `signInFormSchema`, `signUpFormSchema` (confirmPassword refine), `cartItemSchema`, `insertCartSchema`, `shippingAddressSchema` (optional lat/lng), `paymentMethodSchema`. Shared `currency` refinement enforces 2-decimal precision.
- **Constants** (`lib/constants/index.ts`): `PAYMENT_METHODS`, `DEFAULT_PAYMENT_METHOD`, default form values (`shippingAddressDefaultValues`, etc.), env-overridable app config.
- **Forms**: react-hook-form + Zod resolvers; server actions use `(prevState, formData)` signature (useActionState pattern).

## Auth

| File | Role |
|------|------|
| `auth.ts` | Full config: JWT strategy (30-day sessions), PrismaAdapter, CredentialsProvider (`bcrypt-ts-edge`). Callbacks inject `id`/`role`/`name` into JWT/session; on sign-in merges guest `sessionCartId` cart into user. Exports `handlers, signIn, signOut, auth`. |
| `auth.config.ts` | Edge-safe config. `authorized` callback: protects `/shipping-address`, `/payment-method`, `/place-order`, `/profile`, `/user/*`, `/order/*`, `/admin`; sets `sessionCartId` cookie for guests. |
| `middleware.ts` | `export default NextAuth(authConfig).auth` — matcher excludes `api`, `_next/static`, `_next/image`, `favicon.ico`. |

## Prisma Models (`prisma/schema.prisma`)

All PKs are UUIDs via `gen_random_uuid()`.

| Model | Notable fields |
|-------|----------------|
| **Product** | `slug` (unique), `images String[]`, `price/rating Decimal`, `isFeatured`, `banner?` |
| **User** | `email` (unique), `role` (default `"user"`), `address Json?`, `paymentMethod?`, `password?` |
| **Account** | NextAuth OAuth: `provider`+`providerAccountId` composite PK, token fields |
| **Session** | `sessionToken` PK, `userId`, `expiresAt` |
| **VerificationToken** | `identifier`+`token` composite PK |
| **Cart** | `userId?` (optional), `sessionCartId`, `items Json[]`, `itemsPrice/shippingPrice/taxPrice/totalPrice Decimal(12,2)` |

## Components

```
components/
  ui/           # shadcn primitives (button, card, form, input, table, sheet, …)
  product/      # add-to-cart, product-card, product-images, product-list, product-price
  shared/       # header/ (index, menu, mode-toggle, user-button), checkout-steps
  footer.tsx
```

## DB Tooling (`db/`)

- `prisma.ts` — Neon serverless singleton (see above)
- `seed.ts` — uses `PrismaPg` (direct connection, not Neon adapter) for seeding
- `sample-data.ts` — sample products

## Environment Variables

```
NEXT_PUBLIC_APP_NAME=Prostore
NEXT_PUBLIC_APP_DESCRIPTION=...
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
DATABASE_URL=postgresql://...   # Neon serverless connection string
AUTH_SECRET=...                 # NextAuth secret
```
