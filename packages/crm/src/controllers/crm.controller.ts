import {
  customerService,
  customerTagService,
  customerSegmentService,
  customerTimelineService,
  customerRelationshipService,
} from "../services";
import { CustomerPolicy, SegmentPolicy } from "../policies";

export class CRMController {
  async createCustomer(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerService.create(input, ctx.actorId);
    return { success: true, data: result };
  }

  async updateCustomer(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerService.update(ctx.params.id, input, ctx.actorId);
    return { success: true, data: result };
  }

  async getCustomer(ctx: { params: { id: string } }) {
    const result = await customerService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Customer not found" };
    return { success: true, data: result };
  }

  async getCustomerByNumber(ctx: { params: { customerNumber: string } }) {
    const result = await customerService.findByCustomerNumber(ctx.params.customerNumber);
    if (!result) return { success: false, error: "Customer not found" };
    return { success: true, data: result };
  }

  async searchCustomers(ctx: { query: { q: string; limit?: string } }) {
    const result = await customerService.search(ctx.query.q, parseInt(ctx.query.limit ?? "20"));
    return { success: true, data: result };
  }

  async listCustomers(ctx: { query: { status?: string; limit?: string; offset?: string } }) {
    const result = await customerService.list(
      parseInt(ctx.query.limit ?? "50"),
      parseInt(ctx.query.offset ?? "0"),
      ctx.query.status as any
    );
    return { success: true, data: result };
  }

  async deleteCustomer(ctx: { params: { id: string }; actorId?: string }) {
    const result = await customerService.delete(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async addCustomerTag(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const { tag, color, metadata } = ctx.body;
    const result = await customerTagService.add(ctx.params.id, tag, ctx.actorId, color, metadata);
    return { success: true, data: result };
  }

  async removeCustomerTag(ctx: { params: { id: string; tag: string }; actorId?: string }) {
    const result = await customerTagService.remove(ctx.params.id, ctx.params.tag, ctx.actorId);
    return { success: true, data: result };
  }

  async getCustomerTags(ctx: { params: { id: string } }) {
    const result = await customerTagService.findByCustomer(ctx.params.id);
    return { success: true, data: result };
  }

  async assignSegment(ctx: { params: { id: string }; body: any; actorId?: string }) {
    SegmentPolicy.canCreate({ id: ctx.actorId ?? "", roles: [], permissions: [] } as any);
    const { segmentId, expiresAt } = ctx.body;
    const result = await customerSegmentService.assignCustomer(ctx.params.id, segmentId, ctx.actorId, expiresAt);
    return { success: true, data: result };
  }

  async unassignSegment(ctx: { params: { id: string; segmentId: string }; actorId?: string }) {
    SegmentPolicy.canDelete({ id: ctx.actorId ?? "", roles: [], permissions: [] } as any);
    const result = await customerSegmentService.unassignCustomer(ctx.params.id, ctx.params.segmentId, ctx.actorId);
    return { success: true, data: result };
  }

  async getCustomerSegments(ctx: { params: { id: string } }) {
    const result = await customerSegmentService.getCustomerSegments(ctx.params.id);
    return { success: true, data: result };
  }

  async getCustomerTimeline(ctx: { params: { id: string }; query: { limit?: string; offset?: string } }) {
    const result = await customerTimelineService.findByCustomer(
      ctx.params.id,
      parseInt(ctx.query.limit ?? "50"),
      parseInt(ctx.query.offset ?? "0")
    );
    return { success: true, data: result };
  }

  async addCustomerRelationship(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const { relatedCustomerId, type, isEmergency, isPrimary } = ctx.body;
    const result = await customerRelationshipService.create(
      ctx.params.id,
      relatedCustomerId,
      type,
      isEmergency,
      isPrimary,
      ctx.actorId
    );
    return { success: true, data: result };
  }

  async getCustomerRelationships(ctx: { params: { id: string } }) {
    const result = await customerRelationshipService.findByCustomer(ctx.params.id);
    return { success: true, data: result };
  }

  async getCustomerInsights(ctx: { params: { id: string } }) {
    const result = await customerService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Customer not found" };
    const insights = await (await import("../services/crm-intelligence.service")).crmIntelligenceService.getCustomerInsights(ctx.params.id);
    return { success: true, data: insights };
  }
}

export const crmController = new CRMController();
