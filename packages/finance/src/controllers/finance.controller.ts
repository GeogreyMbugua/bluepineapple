import {
  intentService,
  paymentService,
  walletService,
  invoiceService,
  refundService,
  settlementService,
  accountingService,
  payoutService,
} from "../services";

export class FinanceController {
  async createPaymentIntent(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await intentService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async authorizePaymentIntent(ctx: { params: { id: string }; actorId?: string }) {
    const result = await intentService.authorize(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async capturePaymentIntent(ctx: { params: { id: string }; actorId?: string }) {
    const result = await intentService.capture(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async failPaymentIntent(ctx: { params: { id: string }; body: { reason: string }; actorId?: string }) {
    await intentService.fail(ctx.params.id, ctx.body.reason, ctx.actorId);
    return { success: true };
  }

  async cancelPaymentIntent(ctx: { params: { id: string }; body: { reason?: string }; actorId?: string }) {
    await intentService.cancel(ctx.params.id, ctx.body.reason, ctx.actorId);
    return { success: true };
  }

  async getPaymentIntent(ctx: { params: { id: string } }) {
    const result = await intentService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Payment intent not found" };
    return { success: true, data: result };
  }

  async listPaymentIntents(ctx: { query: { status?: string } }) {
    const result = ctx.query?.status
      ? await intentService.findByStatus(ctx.query.status)
      : await intentService.findByStatus("PENDING");
    return { success: true, data: result };
  }

  async getPayment(ctx: { params: { id: string } }) {
    const result = await paymentService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Payment not found" };
    return { success: true, data: result };
  }

  async createWallet(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await walletService.createWallet(input, ctx.actorId);
    return { success: true, data: result };
  }

  async creditWallet(ctx: { params: { id: string }; body: { amount: number; description: string }; actorId?: string }) {
    const result = await walletService.credit(ctx.params.id, ctx.body.amount, ctx.body.description, ctx.actorId);
    return { success: true, data: result };
  }

  async debitWallet(ctx: { params: { id: string }; body: { amount: number; description: string }; actorId?: string }) {
    const result = await walletService.debit(ctx.params.id, ctx.body.amount, ctx.body.description, ctx.actorId);
    return { success: true, data: result };
  }

  async createInvoice(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await invoiceService.createFromCommercialSummary(input, ctx.actorId);
    return { success: true, data: result };
  }

  async issueInvoice(ctx: { params: { id: string }; actorId?: string }) {
    await invoiceService.issue(ctx.params.id, ctx.actorId);
    return { success: true };
  }

  async cancelInvoice(ctx: { params: { id: string }; body: { reason?: string }; actorId?: string }) {
    await invoiceService.cancel(ctx.params.id, ctx.body.reason, ctx.actorId);
    return { success: true };
  }

  async createRefundRequest(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await refundService.createRefundRequest(input, ctx.actorId);
    return { success: true, data: result };
  }

  async approveRefund(ctx: { params: { id: string }; actorId?: string }) {
    const result = await refundService.approveRefund(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async rejectRefund(ctx: { params: { id: string }; body: { reason: string }; actorId?: string }) {
    await refundService.rejectRefund(ctx.params.id, ctx.body.reason, ctx.actorId);
    return { success: true };
  }

  async createSettlement(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await settlementService.createSettlement(input, ctx.actorId);
    return { success: true, data: result };
  }

  async approveSettlement(ctx: { params: { id: string }; actorId?: string }) {
    await settlementService.approveSettlement(ctx.params.id, ctx.actorId);
    return { success: true };
  }

  async completeSettlement(ctx: { params: { id: string }; actorId?: string }) {
    await settlementService.completeSettlement(ctx.params.id, ctx.actorId);
    return { success: true };
  }

  async createJournalEntry(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await accountingService.createJournalEntry(input, ctx.actorId);
    return { success: true, data: result };
  }

  async postJournalEntry(ctx: { params: { id: string }; actorId?: string }) {
    await accountingService.postJournalEntry(ctx.params.id, ctx.actorId);
    return { success: true };
  }

  async createPayout(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await payoutService.createPayout(input, ctx.actorId);
    return { success: true, data: result };
  }

  async approvePayout(ctx: { params: { id: string }; actorId?: string }) {
    await payoutService.approvePayout(ctx.params.id, ctx.actorId);
    return { success: true };
  }

  async getTrialBalance(ctx: { query: { fiscalPeriodId?: string } }) {
    const result = await accountingService.getTrialBalance(ctx.query?.fiscalPeriodId);
    return { success: true, data: result };
  }
}

export const financeController = new FinanceController();
