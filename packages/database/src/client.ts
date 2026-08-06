import { PrismaClient } from '@prisma/client';

export type { Prisma } from '@prisma/client';
export { BookingStatus, VesselType } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const getPrismaConfig = () => {
  const baseConfig: Parameters<typeof PrismaClient<undefined>['constructor']>[0] = {
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  };

  const url = process.env.DATABASE_URL;
  if (url) {
    const hasConnectionLimit = url.includes('connection_limit=');
    if (!hasConnectionLimit) {
      const limit = isProduction ? 5 : 10;
      const separator = url.includes('?') ? '&' : '?';
      baseConfig.datasources = {
        db: { url: `${url}${separator}connection_limit=${limit}` },
      };
    }
  }

  return baseConfig;
};

const prismaClientSingleton = () => new PrismaClient(getPrismaConfig());

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Always reuse the global instance in serverless environments (Vercel)
// to prevent connection pool exhaustion from creating a new PrismaClient
// on every cold start / request. The connection_limit caps per-instance
// pool size to avoid overwhelming the database with concurrent serverless
// container allocations.
export const prisma = global.prisma ?? prismaClientSingleton();
global.prisma = prisma;
