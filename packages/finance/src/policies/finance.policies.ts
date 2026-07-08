import type { PaymentProviderType, PaymentMethod, IntentStatus } from "../domain/finance.types";

export class PaymentPolicy {
  static isValidProviderType(type: string): type is PaymentProviderType {
    return ["MPESA", "STRIPE", "FLUTTERWAVE", "PESAPAL", "CASH", "BANK_TRANSFER"].includes(type);
  }

  static assertValidProviderType(type: string): void {
    if (!this.isValidProviderType(type)) {
      throw new Error(`Invalid payment provider type: ${type}`);
    }
  }

  static isValidMethod(method: string): method is PaymentMethod {
    return ["CARD", "MPESA", "BANK_TRANSFER", "CASH", "WALLET", "CORPORATE_CREDIT", "GIFT_CARD"].includes(method);
  }

  static assertValidMethod(method: string): void {
    if (!this.isValidMethod(method)) {
      throw new Error(`Invalid payment method: ${method}`);
    }
  }

  static canAuthorize(intent: any): boolean {
    return !!intent && intent.status === "PENDING";
  }

  static assertCanAuthorize(intent: any): void {
    if (!this.canAuthorize(intent)) {
      throw new Error(`Cannot authorize payment intent with status: ${intent?.status}`);
    }
  }

  static canCapture(payment: any): boolean {
    return !!payment && payment.status === "AUTHORIZED";
  }

  static assertCanCapture(payment: any): void {
    if (!this.canCapture(payment)) {
      throw new Error(`Cannot capture payment with status: ${payment?.status}`);
    }
  }

  static canRefund(payment: any): boolean {
    return !!payment && (payment.status === "CAPTURED" || payment.status === "PARTIALLY_REFUNDED");
  }

  static assertCanRefund(payment: any): void {
    if (!this.canRefund(payment)) {
      throw new Error(`Cannot refund payment with status: ${payment?.status}`);
    }
  }

  static isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 100000000;
  }

  static assertValidAmount(amount: number, field = "amount"): void {
    if (!this.isValidAmount(amount)) {
      throw new Error(`Invalid ${field}: must be between 0 and 100,000,000`);
    }
  }

  static canCancel(intent: any): boolean {
    return !!intent && (intent.status === "PENDING" || intent.status === "AUTHORIZED");
  }

  static assertCanCancel(intent: any): void {
    if (!this.canCancel(intent)) {
      throw new Error(`Cannot cancel payment intent with status: ${intent?.status}`);
    }
  }
}

export class IntentPolicy {
  static canCreate(bookingId?: string, commercialSummaryId?: string): boolean {
    return !!bookingId || !!commercialSummaryId;
  }

  static assertCanCreate(bookingId?: string, commercialSummaryId?: string): void {
    if (!this.canCreate(bookingId, commercialSummaryId)) {
      throw new Error("Cannot create payment intent: bookingId or commercialSummaryId is required");
    }
  }

  static isValidTransition(from: IntentStatus, to: IntentStatus): boolean {
    const transitions: Record<IntentStatus, IntentStatus[]> = {
      PENDING: ["AUTHORIZED", "CANCELLED", "EXPIRED", "FAILED"],
      AUTHORIZED: ["CAPTURED", "CANCELLED", "EXPIRED", "FAILED"],
      CAPTURED: ["CANCELLED", "FAILED"],
      FAILED: [],
      CANCELLED: [],
      EXPIRED: [],
    };
    return transitions[from]?.includes(to) ?? false;
  }

  static assertValidTransition(from: IntentStatus, to: IntentStatus): void {
    if (!this.isValidTransition(from, to)) {
      throw new Error(`Invalid payment intent transition: ${from} -> ${to}`);
    }
  }
}

export class LedgerPolicy {
  static isValidEntryType(type: string): type is "DEBIT" | "CREDIT" {
    return type === "DEBIT" || type === "CREDIT";
  }

  static canPost(entry: any): boolean {
    return !!entry && typeof entry.debitAmount === "number" && typeof entry.creditAmount === "number";
  }

  static isBalanced(debits: number, credits: number): boolean {
    return Math.abs(debits - credits) < 0.01;
  }

  static assertBalanced(debits: number, credits: number): void {
    if (!this.isBalanced(debits, credits)) {
      throw new Error(`Ledger is not balanced: debits=${debits}, credits=${credits}`);
    }
  }

  static canReverse(entry: any): boolean {
    return !!entry && !!entry.postedAt && !entry.reversedAt;
  }

  static assertCanReverse(entry: any): void {
    if (!this.canReverse(entry)) {
      throw new Error("Cannot reverse ledger entry: already reversed or not posted");
    }
  }
}

export class WalletPolicy {
  static canCredit(wallet: any): boolean {
    return !!wallet && wallet.status === "ACTIVE";
  }

  static assertCanCredit(wallet: any): void {
    if (!this.canCredit(wallet)) {
      throw new Error(`Cannot credit wallet with status: ${wallet?.status}`);
    }
  }

  static canDebit(wallet: any): boolean {
    return !!wallet && wallet.status === "ACTIVE" && wallet.availableBalance > 0;
  }

  static assertCanDebit(wallet: any): void {
    if (!this.canDebit(wallet)) {
      throw new Error(`Cannot debit wallet with status: ${wallet?.status}`);
    }
  }

  static canFreeze(wallet: any): boolean {
    return !!wallet && wallet.status === "ACTIVE";
  }

  static assertCanFreeze(wallet: any): void {
    if (!this.canFreeze(wallet)) {
      throw new Error(`Cannot freeze wallet with status: ${wallet?.status}`);
    }
  }

  static canClose(wallet: any): boolean {
    return !!wallet && wallet.status !== "CLOSED" && Number(wallet.balance) === 0;
  }

  static assertCanClose(wallet: any): void {
    if (!this.canClose(wallet)) {
      throw new Error("Cannot close wallet: balance must be zero and not already closed");
    }
  }
}

export class InvoicePolicy {
  static canIssue(invoice: any): boolean {
    return !!invoice && invoice.status === "DRAFT";
  }

  static assertCanIssue(invoice: any): void {
    if (!this.canIssue(invoice)) {
      throw new Error(`Cannot issue invoice with status: ${invoice?.status}`);
    }
  }

  static canCancel(invoice: any): boolean {
    return !!invoice && (invoice.status === "ISSUED" || invoice.status === "OVERDUE");
  }

  static assertCanCancel(invoice: any): void {
    if (!this.canCancel(invoice)) {
      throw new Error(`Cannot cancel invoice with status: ${invoice?.status}`);
    }
  }

  static canApplyCredit(invoice: any): boolean {
    return !!invoice && (invoice.status === "ISSUED" || invoice.status === "OVERDUE");
  }

  static assertCanApplyCredit(invoice: any): void {
    if (!this.canApplyCredit(invoice)) {
      throw new Error(`Cannot apply credit to invoice with status: ${invoice?.status}`);
    }
  }
}

export class RefundPolicy {
  static canApprove(refund: any): boolean {
    return !!refund && refund.status === "PENDING";
  }

  static assertCanApprove(refund: any): void {
    if (!this.canApprove(refund)) {
      throw new Error(`Cannot approve refund with status: ${refund?.status}`);
    }
  }

  static canReject(refund: any): boolean {
    return !!refund && refund.status === "PENDING";
  }

  static assertCanReject(refund: any): void {
    if (!this.canReject(refund)) {
      throw new Error(`Cannot reject refund with status: ${refund?.status}`);
    }
  }

  static isValidAmount(amount: number, maxAmount: number): boolean {
    return amount > 0 && amount <= maxAmount;
  }

  static assertValidAmount(amount: number, maxAmount: number): void {
    if (!this.isValidAmount(amount, maxAmount)) {
      throw new Error(`Invalid refund amount: must be between 0 and ${maxAmount}`);
    }
  }

  static canProcess(refund: any): boolean {
    return !!refund && refund.status === "APPROVED";
  }

  static assertCanProcess(refund: any): void {
    if (!this.canProcess(refund)) {
      throw new Error(`Cannot process refund with status: ${refund?.status}`);
    }
  }
}

export class SettlementPolicy {
  static canApprove(settlement: any): boolean {
    return !!settlement && settlement.status === "CREATED";
  }

  static assertCanApprove(settlement: any): void {
    if (!this.canApprove(settlement)) {
      throw new Error(`Cannot approve settlement with status: ${settlement?.status}`);
    }
  }

  static canComplete(settlement: any): boolean {
    return !!settlement && settlement.status === "PROCESSING";
  }

  static assertCanComplete(settlement: any): void {
    if (!this.canComplete(settlement)) {
      throw new Error(`Cannot complete settlement with status: ${settlement?.status}`);
    }
  }
}

export class AccountingPolicy {
  static canPostJournal(entry: any): boolean {
    return !!entry && entry.status === "DRAFT";
  }

  static assertCanPostJournal(entry: any): void {
    if (!this.canPostJournal(entry)) {
      throw new Error(`Cannot post journal entry with status: ${entry?.status}`);
    }
  }

  static canReverse(entry: any): boolean {
    return !!entry && entry.status === "POSTED" && !entry.reversedAt;
  }

  static assertCanReverse(entry: any): void {
    if (!this.canReverse(entry)) {
      throw new Error("Cannot reverse journal entry: already reversed or not posted");
    }
  }

  static canClosePeriod(period: any): boolean {
    return !!period && !period.isClosed;
  }

  static assertCanClosePeriod(period: any): void {
    if (!this.canClosePeriod(period)) {
      throw new Error("Cannot close fiscal period: already closed or not found");
    }
  }
}

export class RevenueRecognitionPolicy {
  static canRecognize(recognition: any): boolean {
    return !!recognition && recognition.status === "PENDING" && Number(recognition.deferredRevenue) > 0;
  }

  static assertCanRecognize(recognition: any): void {
    if (!this.canRecognize(recognition)) {
      throw new Error(`Cannot recognize revenue with status: ${recognition?.status}`);
    }
  }

  static canDefer(recognition: any): boolean {
    return !!recognition && recognition.status === "PENDING";
  }

  static assertCanDefer(recognition: any): void {
    if (!this.canDefer(recognition)) {
      throw new Error(`Cannot defer revenue with status: ${recognition?.status}`);
    }
  }
}

export class TaxPolicy {
  static canPost(entry: any): boolean {
    return !!entry && typeof entry.taxAmount === "number" && entry.taxAmount > 0;
  }

  static assertCanPost(entry: any): void {
    if (!this.canPost(entry)) {
      throw new Error("Cannot post tax ledger entry: invalid amount");
    }
  }
}

export class ReconciliationPolicy {
  static canStart(batch: any): boolean {
    return !!batch && batch.status === "PENDING";
  }

  static assertCanStart(batch: any): void {
    if (!this.canStart(batch)) {
      throw new Error(`Cannot start reconciliation with status: ${batch?.status}`);
    }
  }

  static canResolve(item: any): boolean {
    return !!item && item.status === "DISCREPANCY";
  }

  static assertCanResolve(item: any): void {
    if (!this.canResolve(item)) {
      throw new Error(`Cannot resolve reconciliation item with status: ${item?.status}`);
    }
  }
}

export class PayoutPolicy {
  static canApprove(payout: any): boolean {
    return !!payout && payout.status === "PENDING";
  }

  static assertCanApprove(payout: any): void {
    if (!this.canApprove(payout)) {
      throw new Error(`Cannot approve payout with status: ${payout?.status}`);
    }
  }

  static canReverse(payout: any): boolean {
    return !!payout && payout.status === "COMPLETED";
  }

  static assertCanReverse(payout: any): void {
    if (!this.canReverse(payout)) {
      throw new Error(`Cannot reverse payout with status: ${payout?.status}`);
    }
  }
}
