import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  DARAJA_CALLBACK_IPS,
  mpesaStkService,
  stkCallbackPayloadSchema,
} from '@blue-pineapple/finance';

function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return req.headers.get('x-real-ip');
}

/**
 * Daraja STK Push result callback.
 * Validate → durable ingest → ACK immediately → apply via after().
 */
export async function POST(req: NextRequest) {
  const enforceIp = process.env.DARAJA_ENFORCE_CALLBACK_IP === 'true';
  if (enforceIp) {
    const ip = clientIp(req);
    if (!ip || !(DARAJA_CALLBACK_IPS as readonly string[]).includes(ip)) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Unauthorized source' },
        { status: 403 },
      );
    }
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const validated = stkCallbackPayloadSchema.safeParse(raw);
  if (!validated.success) {
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: 'Invalid STK callback payload' },
      { status: 400 },
    );
  }

  try {
    const ingested = await mpesaStkService.ingestCallback(validated.data);

    if (!ingested.alreadyFinal) {
      const eventId = ingested.eventId;
      after(async () => {
        try {
          await mpesaStkService.processWebhookEvent(eventId);
        } catch (error) {
          console.error('[mpesa/callback] deferred processing failed', {
            eventId,
            error,
          });
        }
      });
    }
  } catch (error) {
    console.error('[mpesa/callback] ingest failed', error);
    // ACK anyway so Safaricom does not amplify DB outages into retry storms.
    // Failed ingest leaves no durable row — reconcile / ops can recover from Daraja.
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
