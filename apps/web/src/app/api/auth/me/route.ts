import { getServerSession } from '@/lib/auth';
import { ok } from '@/lib/api/route-helpers';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session.user) {
      return ok(null);
    }

    return ok({
      ...session.user,
      expiresAt: session.expiresAt,
    });
  } catch {
    return ok(null);
  }
}

