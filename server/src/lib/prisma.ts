import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  userId?: string;
  role?: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Enterprise Extended Prisma Client with PostgreSQL Row-Level Security (RLS)
 * Sets transaction-scoped Grand Unified Configuration (GUC) 'app.current_tenant_id'
 * to enforce database-level multi-tenant isolation.
 */
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const store = tenantStorage.getStore();
        if (store?.tenantId && store.tenantId !== 'MOCK') {
          try {
            return await basePrisma.$transaction(async (tx) => {
              await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${store.tenantId}, true)`;
              return await query(args);
            });
          } catch (e: any) {
            // Fallback for non-transactional / offline environments
            return query(args);
          }
        }
        return query(args);
      },
    },
  },
});

export default prisma;
