import { prisma } from "../client";
import type {
  CustomerAddress,
  Prisma,
} from "@prisma/client";

export class CustomerAddressRepository {
  async findById(id: string) {
    return prisma.customerAddress.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: { isPrimary: "desc" },
    });
  }

  async findPrimary(customerId: string) {
    return prisma.customerAddress.findFirst({
      where: { customerId, isPrimary: true },
    });
  }

  async create(data: Prisma.CustomerAddressCreateInput): Promise<CustomerAddress> {
    return prisma.customerAddress.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerAddressUpdateInput
  ): Promise<CustomerAddress> {
    return prisma.customerAddress.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerAddress.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerAddress.deleteMany({ where: { customerId } });
  }
}

export const customerAddressRepository = new CustomerAddressRepository();
