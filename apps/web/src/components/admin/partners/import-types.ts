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
