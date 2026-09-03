import type { DarajaConfig, DarajaEnv, DarajaTransactionType } from './types';
import { DarajaError } from './types';

const BASE_URLS: Record<DarajaEnv, string> = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

/**
 * East Africa Time timestamp `YYYYMMDDHHmmss` (UTC+3, no DST).
 */
export function darajaTimestamp(now: Date = new Date()): string {
  const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    String(eat.getUTCFullYear()) +
    p(eat.getUTCMonth() + 1) +
    p(eat.getUTCDate()) +
    p(eat.getUTCHours()) +
    p(eat.getUTCMinutes()) +
    p(eat.getUTCSeconds())
  );
}

/**
 * Password = Base64(Shortcode + Passkey + Timestamp)
 */
export function buildStkPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`, 'utf8').toString('base64');
}

/**
 * Normalize Kenyan MSISDN to `2547XXXXXXXX` / `2541XXXXXXXX`.
 */
export function normalizeMsisdn(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('254')) return digits;
  if (digits.length === 10 && digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    return `254${digits}`;
  }
  throw new DarajaError(`Invalid Kenyan phone number: ${input}`, 'INVALID_PHONE');
}

/**
 * AccountReference is shown on the USSD prompt — max 12 alphanumeric chars.
 */
export function truncateAccountReference(ref: string): string {
  const cleaned = ref.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return (cleaned || 'BOOKING').slice(0, 12);
}

/**
 * TransactionDesc max 13 chars per Daraja docs.
 */
export function truncateTransactionDesc(desc: string): string {
  return desc.slice(0, 13);
}

export function getDarajaBaseUrl(env: DarajaEnv): string {
  return BASE_URLS[env];
}

export function loadDarajaConfig(env: NodeJS.ProcessEnv = process.env): DarajaConfig {
  const required = [
    'DARAJA_CONSUMER_KEY',
    'DARAJA_CONSUMER_SECRET',
    'DARAJA_SHORTCODE',
    'DARAJA_PASSKEY',
    'DARAJA_CALLBACK_URL',
  ] as const;

  for (const key of required) {
    if (!env[key]?.trim()) {
      throw new DarajaError(`Missing required env: ${key}`, 'MISSING_CONFIG');
    }
  }

  const darajaEnv = (env.DARAJA_ENV ?? 'sandbox').toLowerCase();
  if (darajaEnv !== 'sandbox' && darajaEnv !== 'production') {
    throw new DarajaError(`Invalid DARAJA_ENV: ${darajaEnv}`, 'INVALID_CONFIG');
  }

  const transactionType = (env.DARAJA_TRANSACTION_TYPE ??
    'CustomerBuyGoodsOnline') as DarajaTransactionType;
  if (
    transactionType !== 'CustomerPayBillOnline' &&
    transactionType !== 'CustomerBuyGoodsOnline'
  ) {
    throw new DarajaError(
      `Invalid DARAJA_TRANSACTION_TYPE: ${transactionType}`,
      'INVALID_CONFIG',
    );
  }

  const partyB = env.DARAJA_PARTY_B?.trim() || undefined;
  if (transactionType === 'CustomerBuyGoodsOnline' && !partyB) {
    throw new DarajaError(
      'DARAJA_PARTY_B (Till number) is required when using CustomerBuyGoodsOnline',
      'MISSING_CONFIG',
    );
  }

  return {
    env: darajaEnv,
    consumerKey: env.DARAJA_CONSUMER_KEY!,
    consumerSecret: env.DARAJA_CONSUMER_SECRET!,
    shortcode: env.DARAJA_SHORTCODE!,
    passkey: env.DARAJA_PASSKEY!,
    callbackUrl: env.DARAJA_CALLBACK_URL!,
    transactionType,
    partyB,
  };
}

/** Safaricom API gateway callback source IPs from gettingstarted.md */
export const DARAJA_CALLBACK_IPS = [
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.138',
  '196.201.212.129',
  '196.201.212.136',
  '196.201.212.74',
  '196.201.212.69',
] as const;
