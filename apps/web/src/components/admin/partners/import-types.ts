export interface ImportResult {
  row: number;
  partnerCode: string;
  status: 'success' | 'error';
  message: string;
  userId?: string;
  partnerId?: string;
}

export interface ImportSummary {
  total: number;
  success: number;
  failed: number;
}

export interface ImportResponse {
  summary: ImportSummary;
  results: ImportResult[];
}

export type PartnerImportReviewStatus = 'ready' | 'review' | 'blocked';

export interface PartnerImportWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  column?: string;
}

export interface PartnerImportPreviewRow {
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
  fieldSources: Record<string, string>;
}

export interface PartnerImportPreviewSummary {
  total: number;
  ready: number;
  review: number;
  blocked: number;
}

export interface PartnerImportPreviewResponse {
  summary: PartnerImportPreviewSummary;
  rows: PartnerImportPreviewRow[];
  issues: { row: number; partnerCode: string; status: 'error'; message: string }[];
}
