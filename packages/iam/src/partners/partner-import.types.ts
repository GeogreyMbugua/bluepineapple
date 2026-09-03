export type PartnerImportReviewStatus = "ready" | "review" | "blocked";

export interface PartnerImportWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  column?: string;
}

export interface PartnerImportFieldSources {
  email?: string;
  phone?: string;
  companyName?: string;
  contactName?: string;
  area?: string;
  notes?: string;
}

export interface PartnerImportRow {
  rowNumber: number;
  partnerCode: string;
  name: string;
  contactName: string;
  phone: string | null;
  email: string | null;
  area: string;
  notes: string;
  reviewStatus: PartnerImportReviewStatus;
  warnings: PartnerImportWarning[];
  fieldSources: PartnerImportFieldSources;
}

export interface PartnerImportParseIssue {
  row: number;
  partnerCode: string;
  status: "error";
  message: string;
}

export interface PartnerImportResult {
  row: number;
  partnerCode: string;
  status: "success" | "error";
  message: string;
  userId?: string;
  partnerId?: string;
}

export interface PartnerImportSummary {
  total: number;
  success: number;
  failed: number;
}

export interface PartnerImportPreviewSummary {
  total: number;
  ready: number;
  review: number;
  blocked: number;
}

export interface PartnerImportPreviewResult {
  summary: PartnerImportPreviewSummary;
  rows: PartnerImportRow[];
  issues: PartnerImportParseIssue[];
}

export interface PartnerImportBatchResult {
  summary: PartnerImportSummary;
  results: PartnerImportResult[];
}

export interface PartnerImportClerkAdapter {
  createUser: (
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<string | null>;
  syncPartnerMetadata: (clerkUserId: string) => Promise<boolean>;
}
