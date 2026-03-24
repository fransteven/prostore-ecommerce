import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/lib/generated/prisma/client';
import ws from 'ws';

// Requerido para que Neon funcione en entornos Node.js (no Edge Runtime)
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida en el entorno (.env)');
  }

  // En v7.5+, PrismaNeon recibe PoolConfig directamente (no una instancia Pool)
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
    },
  });
};

// Declara el tipo para el singleton en el ámbito global para evitar múltiples instancias en desarrollo
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// Exporta la instancia de prisma (nueva o existente en globalThis)
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// En entornos que no sean de producción, guarda la instancia en globalThis para que se reutilice tras un Hot Reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
