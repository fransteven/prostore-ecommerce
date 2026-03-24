# ProStore E-Commerce

Este es un proyecto de comercio electrónico moderno construido con **Next.js**, **Prisma**, **PostgreSQL** y **Tailwind CSS**.

## Stack Tecnológico

- **Framework:** Next.js 16+ (App Router)
- **Base de Datos:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Estilos:** Tailwind CSS v4 + Shadcn/UI
- **Validación:** Zod
- **Lenguaje:** TypeScript

## Estructura del Proyecto

- `app/`: Contiene las rutas, layouts y páginas de la aplicación (Next.js App Router).
- `components/`: Componentes reutilizables de la interfaz de usuario.
    - `shared/`: Componentes compartidos como Header, Footer, etc.
    - `ui/`: Componentes base (Shadcn/UI).
    - `product/`: Componentes específicos para productos.
- `db/`: Configuración de Prisma y scripts de sembrado (seed).
- `lib/`: Lógica de negocio, acciones de servidor, constantes y utilidades.
    - `actions/`: Server Actions para interactuar con la base de datos.
    - `validators.ts`: Esquemas de validación de Zod.
- `prisma/`: Definición del esquema de la base de datos.
- `public/`: Archivos estáticos como imágenes y logos.
- `types/`: Definiciones de tipos TypeScript personalizados.

## Guía de Desarrollo

### Comandos Principales

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Genera la versión de producción.
- `npx prisma generate`: Genera el cliente de Prisma.
- `npx prisma db seed`: Ejecuta el script de sembrado de datos (definido en `db/seed.ts`).

### Estilo de Código y Convenciones

- Usar **Server Actions** para todas las mutaciones de datos (ubicadas en `lib/actions/`).
- Validar siempre los datos de entrada con **Zod** (esquemas en `lib/validators.ts`).
- Seguir las convenciones de componentes de **Shadcn/UI**.
- Mantener la lógica de negocio fuera de los componentes siempre que sea posible, prefiriendo las acciones de servidor o utilidades en `lib/`.

## Base de Datos

El esquema principal se encuentra en `prisma/schema.prisma`. El modelo actual incluye:
- `Product`: Representa los productos de la tienda.
