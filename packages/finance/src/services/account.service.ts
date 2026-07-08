import { prisma } from "@blue-pineapple/database";
import { accountRepository, financeAuditLogRepository } from "@blue-pineapple/database";

export class AccountService {
  async createAccount(input: {
    accountCode: string;
    accountName: string;
    accountType: string;
    parentCode?: string;
    description?: string;
    currency?: string;
    isPosting?: boolean;
  }, actorId?: string): Promise<{ id: string }> {
    const account = await prisma.account.create({
      data: {
        accountCode: input.accountCode,
        accountName: input.accountName,
        accountType: input.accountType as any,
        parentCode: input.parentCode,
        description: input.description,
        currency: input.currency ?? "KES",
        isPosting: input.isPosting ?? true,
        isActive: true,
      } as any,
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "ACCOUNT_CREATED" as any,
      entityType: "Account",
      entityId: account.id,
      newValues: { accountCode: input.accountCode, accountName: input.accountName, accountType: input.accountType } as any,
    });

    return { id: account.id };
  }

  async seedDefaultAccounts(actorId?: string): Promise<void> {
    const count = await prisma.account.count();
    if (count > 0) return;

    const accounts = [
      { accountCode: "1000", accountName: "Bank", accountType: "ASSET" },
      { accountCode: "1010", accountName: "M-Pesa", accountType: "ASSET" },
      { accountCode: "1020", accountName: "Accounts Receivable", accountType: "ASSET" },
      { accountCode: "1030", accountName: "Inventory", accountType: "ASSET" },
      { accountCode: "1100", accountName: "Prepayments", accountType: "ASSET" },
      { accountCode: "2000", accountName: "Accounts Payable", accountType: "LIABILITY" },
      { accountCode: "2100", accountName: "Tax Payable", accountType: "LIABILITY" },
      { accountCode: "2200", accountName: "Deferred Revenue", accountType: "LIABILITY" },
      { accountCode: "3000", accountName: "Owner Capital", accountType: "EQUITY" },
      { accountCode: "4000", accountName: "Revenue:Tourism", accountType: "REVENUE" },
      { accountCode: "4100", accountName: "Revenue:Partner Fees", accountType: "REVENUE" },
      { accountCode: "4200", accountName: "Revenue:Property", accountType: "REVENUE" },
      { accountCode: "5000", accountName: "Cost of Sales", accountType: "EXPENSE" },
      { accountCode: "6000", accountName: "Expenses:Operations", accountType: "EXPENSE" },
      { accountCode: "6100", accountName: "Expenses:Marketing", accountType: "EXPENSE" },
      { accountCode: "6200", accountName: "Expenses:Commissions", accountType: "EXPENSE" },
      { accountCode: "6300", accountName: "Expenses:Tax", accountType: "EXPENSE" },
    ];

    await prisma.account.createMany({
      data: accounts.map(a => ({ ...a, currency: "KES", description: "", isActive: true, isPosting: true })) as any,
      skipDuplicates: true,
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "JOURNAL_ENTRY_CREATED" as any,
      entityType: "Account",
      entityId: "seed",
      newValues: { accountsSeeded: accounts.length } as any,
    });
  }

  async findByCode(code: string) {
    return accountRepository.findByCode(code);
  }

  async findByType(accountType: string, limit = 100) {
    const results = await accountRepository.findByType(accountType as any);
    return results.slice(0, limit);
  }

  async findActive(limit = 500) {
    const results = await accountRepository.findActive();
    return results.slice(0, limit);
  }
}

export const accountService = new AccountService();
