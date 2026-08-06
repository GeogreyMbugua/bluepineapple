import { PrismaClient } from '@prisma/client';

export type { Prisma } from '@prisma/client';
export { BookingStatus, VesselType } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const connectionLimit = isProduction ? 5 : 10;

const getDatabaseUrlWithLimit = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes('connection_limit=')) return undefined;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=${connectionLimit}`;
};

const prismaClientSingleton = () => {
  const dbUrl = getDatabaseUrlWithLimit();
  if (dbUrl) {
    return new PrismaClient({
      log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
      datasources: { db: { url: dbUrl } },
    });
  }
  return new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });
};

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
