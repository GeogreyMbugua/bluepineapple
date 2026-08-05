import { identityProvider } from '@blue-pineapple/iam';
import { getAccessToken, clearAuthCookies, ok } from '@/lib/api/route-helpers';

export async function POST() {
  const token = await getAccessToken();
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3 && parts[1]) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.sub && payload.sid) {
          await identityProvider.logout(payload.sub, payload.sid);
        }
      }
    } catch {
      // best-effort logout
    }
  }

  await clearAuthCookies();
  return ok(null, 200);
}
