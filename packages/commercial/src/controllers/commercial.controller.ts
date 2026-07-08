import {
  pricingService,
  priceListService,
  promotionService,
  quotationService,
  reservationHoldService,
  cancellationPolicyService,
  refundPolicyService,
  taxService,
  commissionService,
  commercialSummaryService,
  addOnService,
  seasonService,
} from "../services";
import { PricingPolicy, PromotionPolicy } from "../policies";

export class CommercialController {
  async calculatePrice(ctx: { body: any; actorId?: string }) {
    const { experienceId, pricingContext } = ctx.body;
    const result = await pricingService.calculatePrice(experienceId, pricingContext);
    return { success: true, data: result };
  }

  async createPriceList(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await priceListService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async updatePriceList(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await priceListService.update(ctx.params.id, input, ctx.actorId);
    return { success: true, data: result };
  }

  async getPriceList(ctx: { params: { id: string } }) {
    const result = await priceListService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Price list not found" };
    return { success: true, data: result };
  }

  async listPriceLists(ctx: { query: { status?: string } }) {
    const status = ctx.query?.status;
    const result = status
      ? await priceListService.findByStatus(status)
      : await priceListService.findAll();
    return { success: true, data: result };
  }

  async activatePriceList(ctx: { params: { id: string }; actorId?: string }) {
    const result = await priceListService.activate(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async createSeason(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await seasonService.create(input);
    return { success: true, data: result };
  }

  async getSeason(ctx: { params: { id: string } }) {
    const result = await seasonService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Season not found" };
    return { success: true, data: result };
  }

  async listSeasons() {
    const result = await seasonService.findAll();
    return { success: true, data: result };
  }

  async createPromotion(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    PromotionPolicy.assertValidType(input.type);
    const result = await promotionService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async updatePromotion(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await promotionService.update(ctx.params.id, input, ctx.actorId);
    return { success: true, data: result };
  }

  async getPromotion(ctx: { params: { id: string } }) {
    const result = await promotionService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Promotion not found" };
    return { success: true, data: result };
  }

  async validatePromotion(ctx: { body: any }) {
    const { code, bookingAmount, customerCategory, customerType, experienceId, userId, partnerId, guestId } = ctx.body;
    const result = await promotionService.validatePromotion(code, {
      bookingAmount,
      customerCategory,
      customerType,
      experienceId,
      userId,
      partnerId,
      guestId,
    });
    return { success: true, data: result };
  }

  async applyPromotion(ctx: { body: any; actorId?: string }) {
    const { code, bookingId, bookingAmount, customerCategory, customerType, experienceId, userId, partnerId, guestId } = ctx.body;
    const promotion = await promotionService.findByCode(code);
    if (!promotion) return { success: false, error: "Promotion not found" };
    PromotionPolicy.assertNotExhausted(promotion);
    PromotionPolicy.assertValidPeriod(promotion);
    PromotionPolicy.canApply(promotion, bookingAmount);
    const result = await promotionService.applyPromotion(
      code,
      bookingId,
      {
        bookingAmount,
        customerCategory,
        customerType,
        experienceId,
        userId,
        partnerId,
        guestId,
      },
      ctx.actorId
    );
    return { success: true, data: result };
  }

  async createQuote(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await quotationService.createQuote(input, ctx.actorId);
    return { success: true, data: result };
  }

  async getQuote(ctx: { params: { id: string } }) {
    const result = await quotationService.getQuote(ctx.params.id);
    if (!result) return { success: false, error: "Quote not found" };
    return { success: true, data: result };
  }

  async convertQuote(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const result = await quotationService.convertToBooking(ctx.params.id, ctx.body?.bookingData, ctx.actorId);
    return { success: true, data: result };
  }

  async createHold(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await reservationHoldService.createHold(input, ctx.actorId);
    return { success: true, data: result };
  }

  async getHold(ctx: { params: { id: string } }) {
    const result = await reservationHoldService.getHold(ctx.params.id);
    if (!result) return { success: false, error: "Hold not found" };
    return { success: true, data: result };
  }

  async releaseHold(ctx: { params: { id: string }; actorId?: string }) {
    await reservationHoldService.releaseHold(ctx.params.id, ctx.actorId);
    return { success: true };
  }

  async createCancellationPolicy(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await cancellationPolicyService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async evaluateCancellation(ctx: { body: any }) {
    const result = await cancellationPolicyService.evaluateCancellation(
      ctx.body?.bookingCreatedAt,
      ctx.body?.departureDateTime,
      ctx.body?.policyId
    );
    return { success: true, data: result };
  }

  async calculateRefund(ctx: { body: any; actorId?: string }) {
    const { bookingId, originalAmount, currency } = ctx.body;
    const policyResult = await cancellationPolicyService.evaluateCancellation(
      ctx.body?.bookingCreatedAt,
      ctx.body?.departureDateTime,
      ctx.body?.policyId
    );
    const result = await refundPolicyService.calculateRefund(bookingId, originalAmount, policyResult, currency, ctx.actorId);
    return { success: true, data: result };
  }

  async approveRefund(ctx: { params: { id: string }; actorId?: string }) {
    const result = await refundPolicyService.approveRefund(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async createTaxRule(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await taxService.createTaxRule(input, ctx.actorId);
    return { success: true, data: result };
  }

  async calculateTaxes(ctx: { body: any; actorId?: string }) {
    const result = await taxService.calculateTaxes(ctx.body?.taxableAmount, ctx.body?.context, ctx.actorId);
    return { success: true, data: result };
  }

  async createCommissionRule(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await commissionService.createCommissionRule(input, ctx.actorId);
    return { success: true, data: result };
  }

  async calculateCommission(ctx: { body: any; actorId?: string }) {
    const result = await commissionService.calculateCommission(
      ctx.body?.bookingId,
      ctx.body?.baseAmount,
      ctx.body?.partnerId,
      ctx.body?.type,
      ctx.actorId
    );
    return { success: true, data: result };
  }

  async createAddOn(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await addOnService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async getAddOn(ctx: { params: { id: string } }) {
    const result = await addOnService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Add-on not found" };
    return { success: true, data: result };
  }

  async listAddOns(ctx: { query: { experienceId?: string; category?: string } }) {
    const result = await addOnService.findActive({
      experienceId: ctx.query?.experienceId,
      category: ctx.query?.category,
    });
    return { success: true, data: result };
  }
}

export const commercialController = new CommercialController();
