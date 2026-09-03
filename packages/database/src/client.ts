import { Prisma, PrismaClient } from '@prisma/client';

export type { Prisma } from '@prisma/client';
export { BookingStatus, VesselType } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

const stripQuotes = (value: string): string =>
  value.trim().replace(/^['"]|['"]$/g, '');

const appendParam = (url: string, key: string, value: string): string => {
  if (url.includes(`${key}=`)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${key}=${value}`;
};

/**
 * Prefer the direct Neon endpoint for Prisma interactive transactions.
 * PgBouncer (pooler) can invalidate open transactions mid-flight, which
 * surfaces as "Transaction not found / Transaction ID is invalid".
 */
const resolveDatabaseUrl = (): string | undefined => {
  const pooledRaw = process.env.DATABASE_URL;
  const unpooledRaw = process.env.DATABASE_URL_UNPOOLED;
  const pooled = pooledRaw ? stripQuotes(pooledRaw) : undefined;
  const unpooled = unpooledRaw ? stripQuotes(unpooledRaw) : undefined;

  // Interactive $transaction is unreliable through Neon's pooler.
  // Prefer direct whenever available (dev + long-lived Node servers).
  const url = unpooled || pooled;
  if (!url) return undefined;

  const isNeon = url.includes('neon.tech');
  const isNeonPooler = isNeon && url.includes('-pooler');

  if (!isNeon) {
    if (!isProduction || url.includes('connection_limit=')) return url;
    return appendParam(url, 'connection_limit', '1');
  }

  let enhanced = url;
  enhanced = appendParam(enhanced, 'connect_timeout', '15');
  enhanced = appendParam(enhanced, 'pool_timeout', isProduction ? '20' : '30');

  if (isNeonPooler) {
    enhanced = appendParam(enhanced, 'pgbouncer', 'true');
    enhanced = appendParam(
      enhanced,
      'connection_limit',
      isProduction ? '1' : '5',
    );
  } else {
    // Direct Neon: keep a small pool for concurrent Next.js work.
    enhanced = appendParam(
      enhanced,
      'connection_limit',
      isProduction ? '5' : '10',
    );
  }

  return enhanced;
};

const prismaClientSingleton = () => {
  const dbUrl = resolveDatabaseUrl();
  if (dbUrl && !isProduction) {
    try {
      const host = new URL(dbUrl).hostname;
      console.info(`[database] prisma connecting via ${host}`);
    } catch {
      // ignore malformed URL logging
    }
  }

  if (dbUrl) {
    return new PrismaClient({
      log: isProduction ? ['error', 'warn'] : ['error', 'warn'],
      datasources: { db: { url: dbUrl } },
    });
  }
  return new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['error', 'warn'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? prismaClientSingleton();
global.prisma = prisma;

export type InteractiveTransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
};

const TRANSIENT_TX_MESSAGE =
  /Transaction not found|Transaction API error|Unable to start a transaction|Server has closed the connection|Connection reset|terminating connection/i;

export function isTransientPrismaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P1017: Server has closed the connection
    // P2024: Timed out fetching a new connection from the pool
    // P2028: Transaction API error
    return ['P1017', 'P2024', 'P2028'].includes(error.code);
  }
  if (error instanceof Prisma.PrismaClientRustPanicError) return true;
  if (error instanceof Error) return TRANSIENT_TX_MESSAGE.test(error.message);
  return false;
}

/**
 * Run an interactive transaction with Neon-friendly timeouts and one reconnect retry.
 */
export async function runInTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: InteractiveTransactionOptions = {},
): Promise<T> {
  const txOptions = {
    maxWait: options.maxWait ?? 10_000,
    timeout: options.timeout ?? 20_000,
    ...(options.isolationLevel
      ? { isolationLevel: options.isolationLevel }
      : {}),
  };

  const attempt = async (): Promise<T> => {
    // Wake Neon compute / validate the connection before opening a txn.
    await prisma.$queryRaw`SELECT 1`;
    return prisma.$transaction(fn, txOptions);
  };

  try {
    return await attempt();
  } catch (error) {
    if (!isTransientPrismaError(error)) throw error;

    console.warn(
      '[database] transient prisma transaction failure; reconnecting and retrying once',
      error instanceof Error ? error.message : error,
    );

    try {
      await prisma.$disconnect();
    } catch {
      // ignore disconnect errors on a dead pool
    }
    await prisma.$connect();
    return attempt();
  }
}
