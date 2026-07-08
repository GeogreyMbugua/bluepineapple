import {
  prisma,
  customerDocumentRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { DocumentPolicy, CustomerPolicy } from "../policies/crm.policies";

export class CustomerDocumentService {
  async upload(
    customerId: string,
    input: any,
    actorId?: string
  ) {
    DocumentPolicy.canUpload({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    const document = await customerDocumentRepository.create({
      customerId,
      type: input.type,
      documentNumber: input.documentNumber,
      issuingCountry: input.issuingCountry,
      issuingAuthority: input.issuingAuthority,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate,
      status: input.status,
      fileUrl: input.fileUrl,
      fileKey: input.fileKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      notes: input.notes,
      metadata: input.metadata,
    } as any);

    await customerTimelineRepository.create({
      customerId,
      eventType: "DOCUMENT_UPLOADED",
      description: `Document uploaded: ${input.type}${input.documentNumber ? ` (${input.documentNumber})` : ""}`,
      relatedEntityType: "CustomerDocument",
      relatedEntityId: document.id,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_DOCUMENT_UPLOADED",
      details: { documentId: document.id, type: input.type },
      actorId: actorId ?? undefined,
    });

    return document;
  }

  async findById(id: string) {
    return customerDocumentRepository.findById(id);
  }

  async findByCustomer(customerId: string) {
    return customerDocumentRepository.findByCustomer(customerId);
  }

  async findByType(customerId: string, type: any) {
    return customerDocumentRepository.findByType(customerId, type);
  }

  async verify(id: string, actorId?: string) {
    DocumentPolicy.canVerify({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const document = await customerDocumentRepository.findById(id);
    if (!document) {
      throw new Error("Document not found");
    }

    const updated = await customerDocumentRepository.update(id, {
      status: "VERIFIED",
      verifiedBy: actorId,
      verifiedAt: new Date(),
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: document.customerId,
      action: "CUSTOMER_DOCUMENT_VERIFIED",
      details: { documentId: id },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async update(
    id: string,
    input: any,
    actorId?: string
  ) {
    const document = await customerDocumentRepository.findById(id);
    if (!document) {
      throw new Error("Document not found");
    }

    const updated = await customerDocumentRepository.update(id, input as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: document.customerId,
      action: "CUSTOMER_DOCUMENT_UPDATED",
      details: { documentId: id },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async delete(id: string, actorId?: string) {
    DocumentPolicy.canDelete({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const document = await customerDocumentRepository.findById(id);
    if (!document) {
      throw new Error("Document not found");
    }

    await customerDocumentRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: document.customerId,
      action: "CUSTOMER_DOCUMENT_DELETED",
      details: { documentId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async findExpiring(daysAhead = 30) {
    return customerDocumentRepository.findExpiring(daysAhead);
  }
}

export const customerDocumentService = new CustomerDocumentService();
