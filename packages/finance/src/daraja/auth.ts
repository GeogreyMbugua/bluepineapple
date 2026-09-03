import type { DarajaConfig } from './types';
import { DarajaError } from './types';
import { getDarajaBaseUrl } from './helpers';

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
}

/**
 * OAuth client for Daraja (`/oauth/v1/generate`).
 * Tokens last ~3600s; we refresh 60s early and on 401.
 */
export class DarajaAuthClient {
  private cache: CachedToken | null = null;

  constructor(private readonly config: DarajaConfig) {}

  clearCache(): void {
    this.cache = null;
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (!forceRefresh && this.cache && this.cache.expiresAtMs > now + 60_000) {
      return this.cache.accessToken;
    }

    const base = getDarajaBaseUrl(this.config.env);
    const credentials = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`,
      'utf8',
    ).toString('base64');

    const res = await fetch(
      `${base}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
      },
    );

    const body = (await res.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: string | number;
      errorCode?: string;
      errorMessage?: string;
    } | null;

    if (!res.ok || !body?.access_token) {
      throw new DarajaError(
        body?.errorMessage ?? `Daraja OAuth failed (${res.status})`,
        body?.errorCode ?? 'OAUTH_FAILED',
        res.status,
        body,
      );
    }

    const expiresInSec = Number(body.expires_in ?? 3599);
    this.cache = {
      accessToken: body.access_token,
      expiresAtMs: now + expiresInSec * 1000,
    };

    return body.access_token;
  }
}
