import { PrismaClient } from '@prisma/client';

export type { Prisma } from '@prisma/client';
export { BookingStatus, VesselType } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const prismaClientSingleton = () =>
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Always reuse the global instance in serverless environments (Vercel)
// to prevent connection pool exhaustion from creating a new PrismaClient
// on every cold start / request.
export const prisma = global.prisma ?? prismaClientSingleton();
global.prisma = prisma;

