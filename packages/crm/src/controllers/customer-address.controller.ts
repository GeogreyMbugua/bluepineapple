import {
  customerAddressService,
} from "../services";

export class CustomerAddressController {
  async addAddress(ctx: { body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerAddressService.add(input.customerId, input, ctx.actorId);
    return { success: true, data: result };
  }

  async getAddress(ctx: { params: { id: string } }) {
    const result = await customerAddressService.findById(ctx.params.id);
    if (!result) return { success: false, error: "Address not found" };
    return { success: true, data: result };
  }

  async getCustomerAddresses(ctx: { params: { customerId: string } }) {
    const result = await customerAddressService.findByCustomer(ctx.params.customerId);
    return { success: true, data: result };
  }

  async updateAddress(ctx: { params: { id: string }; body: any; actorId?: string }) {
    const input = ctx.body;
    const result = await customerAddressService.update(ctx.params.id, input, ctx.actorId);
    return { success: true, data: result };
  }

  async deleteAddress(ctx: { params: { id: string }; actorId?: string }) {
    const result = await customerAddressService.delete(ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }

  async setPrimaryAddress(ctx: { params: { customerId: string; id: string }; actorId?: string }) {
    const result = await customerAddressService.setPrimary(ctx.params.customerId, ctx.params.id, ctx.actorId);
    return { success: true, data: result };
  }
}

export const customerAddressController = new CustomerAddressController();
