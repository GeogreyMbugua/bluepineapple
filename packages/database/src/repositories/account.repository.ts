import { prisma } from "../client";
import {
  Account,
  AccountType,
  Prisma,
} from "@prisma/client";

export class AccountRepository {
  async findById(id: string) {
    return prisma.account.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.account.findUnique({ where: { accountCode: code } });
  }

  async findByType(type: AccountType) {
    return prisma.account.findMany({
      where: { accountType: type },
      orderBy: { accountCode: "asc" },
    });
  }

  async findActive() {
    return prisma.account.findMany({
      where: { isActive: true },
      orderBy: { accountCode: "asc" },
    });
  }

  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return prisma.account.create({ data });
  }

  async update(
    id: string,
    data: Prisma.AccountUpdateInput
  ): Promise<Account> {
    return prisma.account.update({ where: { id }, data });
  }
}

export const accountRepository = new AccountRepository();
