import { PrismaClient } from '@prisma/client';

export type { Prisma } from '@prisma/client';
export { BookingStatus, VesselType } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const appendParam = (url: string, key: string, value: string): string => {
  if (url.includes(`${key}=`)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${key}=${value}`;
};

const getDatabaseUrlWithLimit = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  const isNeon = url.includes('neon.tech');
  const isNeonPooler = isNeon && url.includes('-pooler');

  if (isNeon) {
    let enhanced = url;
    enhanced = appendParam(enhanced, 'connect_timeout', '15');
    enhanced = appendParam(enhanced, 'pool_timeout', '20');
    if (isNeonPooler) {
      enhanced = appendParam(enhanced, 'pgbouncer', 'true');
      enhanced = appendParam(enhanced, 'connection_limit', '1');
    }
    return enhanced === url ? undefined : enhanced;
  }

  if (!isProduction || url.includes('connection_limit=')) return undefined;
  return appendParam(url, 'connection_limit', '1');
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
