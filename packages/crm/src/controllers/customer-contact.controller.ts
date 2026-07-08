import {
  customerContactService,
} from "../services";

export class CustomerContactController {
  async addContact(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerContactService.add(input.customerId, input, ctx.actorId);
    return { success: true, data: result };
  }

  async getContact(ctx: { params: { id: string } }) {
    const result = await customerContactService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Contact not found" };
    return { success: true, data: result };
  }

  async getCustomerContacts(ctx: { params: { customerId: string } }) {
    const result = await customerContactService.findByCustomer(ctx.params.customerId);
    return { success: true, data: result };
  }

  async updateContact(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerContactService.update(ctx.params.id, input, ctx.actorId);
    return { success: true, data: result };
  }

  async deleteContact(ctx: { params: { id: string }; actorId?: string }) {
    const result = await customerContactService.delete(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async setPrimaryContact(ctx: { params: { customerId: string; id: string }; actorId?: string }) {
    const result = await customerContactService.setPrimary(ctx.params.customerId, ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }
}

export const customerContactController = new CustomerContactController();
