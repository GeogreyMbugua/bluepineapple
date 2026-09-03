import { z } from 'zod';

const metadataItemSchema = z.object({
  Name: z.string(),
  Value: z.union([z.string(), z.number()]).optional(),
});

export const stkCallbackPayloadSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string().min(1),
      CheckoutRequestID: z.string().min(1),
      ResultCode: z.union([z.number(), z.string()]),
      ResultDesc: z.string(),
      CallbackMetadata: z
        .object({
          Item: z.array(metadataItemSchema).optional(),
        })
        .optional(),
    }),
  }),
});

export type StkCallbackPayload = z.infer<typeof stkCallbackPayloadSchema>;

export function buildStkEventKey(checkoutRequestId: string, resultCode: number | string): string {
  return `mpesa:${checkoutRequestId}:${resultCode}`;
}

/** Safaricom result codes we treat as explicit user cancel / timeout style outcomes. */
export const STK_CANCEL_RESULT_CODES = new Set([1032, 1037]);
