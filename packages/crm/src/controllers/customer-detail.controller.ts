import {
  customerPreferenceService,
  customerSegmentService,
  customerTagService,
  customerInteractionService,
  customerDocumentService,
  customerConsentService,
  customerRelationshipService,
  customerTimelineService,
  loyaltyService,
  crmIntelligenceService,
} from "../services";

export class CustomerDetailController {
  async getPreferences(ctx: { params: { customerId: string; category?: string } }) {
    const { customerId } = ctx.params;
    if (ctx.params.category) {
      const result = await customerPreferenceService.findByCategory(customerId, ctx.params.category);
      return { success: true, data: result };
    }
    const result = await customerPreferenceService.findByCustomer(customerId);
    return { success: true, data: result };
  }

  async createSegment(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerSegmentService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async getSegment(ctx: { params: { id: string } }) {
    const result = await customerSegmentService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Segment not found" };
    return { success: true, data: result };
  }

  async listSegments(ctx: { query: { active?: string } }) {
    const result = ctx.query.active === "true"
      ? await customerSegmentService.findActive()
      : await customerSegmentService.findAll();
    return { success: true, data: result };
  }

  async updateSegment(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerSegmentService.update(ctx.params.id, input, ctx.actorId);
    return { success: true, data: result };
  }

  async deleteSegment(ctx: { params: { id: string }; actorId?: string }) {
    const result = await customerSegmentService.delete(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async createInteraction(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerInteractionService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async getInteraction(ctx: { params: { id: string } }) {
    const result = await customerInteractionService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Interaction not found" };
    return { success: true, data: result };
  }

  async getCustomerInteractions(ctx: { params: { customerId: string }; query: { limit?: string; offset?: string } }) {
    const result = await customerInteractionService.findByCustomer(
      ctx.params.customerId,
      parseInt(ctx.query.limit ?? "50"),
      parseInt(ctx.query.offset ?? "0")
    );
    return { success: true, data: result };
  }

  async createConsent(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerConsentService.update(
      input.customerId,
      input.channel,
      input.consentType,
      input.isGranted,
      input.ipAddress,
      input.userAgent,
      input.consentVersion,
      ctx.actorId
    );
    return { success: true, data: result };
  }

  async getConsents(ctx: { params: { customerId: string } }) {
    const result = await customerConsentService.findByCustomer(ctx.params.customerId);
    return { success: true, data: result };
  }

  async getCustomerDocuments(ctx: { params: { customerId: string } }) {
    const result = await customerDocumentService.findByCustomer(ctx.params.customerId);
    return { success: true, data: result };
  }

  async uploadDocument(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerDocumentService.upload(input.customerId, input, ctx.actorId);
    return { success: true, data: result };
  }

  async verifyDocument(ctx: { params: { id: string }; actorId?: string }) {
    const result = await customerDocumentService.verify(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async getTiers(ctx: { query: { active?: string } }) {
    const result = ctx.query.active === "true"
      ? await loyaltyService.findActiveTiers()
      : await loyaltyService.findAllTiers();
    return { success: true, data: result };
  }

  async getLoyaltyAccount(ctx: { params: { customerId: string } }) {
    const result = await loyaltyService.findByCustomer(ctx.params.customerId);
    if (!result) return { success: false, error: "Loyalty account not found" };
    return { success: true, data: result };
  }

  async getIntelligence(ctx: { params: { customerId: string } }) {
    const result = await crmIntelligenceService.getCustomerInsights(ctx.params.customerId);
    if (!result) return { success: false, error: "Customer not found" };
    return { success: true, data: result };
  }

  async getTopCustomers(ctx: { query: { limit?: string } }) {
    const result = await crmIntelligenceService.getTopCustomers(parseInt(ctx.query.limit ?? "50"));
    return { success: true, data: result };
  }

  async getSegmentAnalytics() {
    const result = await crmIntelligenceService.getSegmentAnalytics();
    return { success: true, data: result };
  }

  async getLoyaltyAnalytics() {
    const result = await crmIntelligenceService.getLoyaltyAnalytics();
    return { success: true, data: result };
  }

  async getConsentAnalytics() {
    const result = await crmIntelligenceService.getConsentAnalytics();
    return { success: true, data: result };
  }
}

export const customerDetailController = new CustomerDetailController();
