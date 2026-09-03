import * as XLSX from "xlsx";
import { detectPartnerImportHeaderRow } from "@blue-pineapple/iam";

export interface PartnerWorkbookSheet {
  sheetName: string;
  rows: Record<string, unknown>[];
  headerRowNumber: number;
}

export function readPartnerImportWorkbook(buffer: Buffer): PartnerWorkbookSheet[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets: PartnerWorkbookSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet["!ref"]) continue;

    const matrix = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];

    const headerRowIndex = detectPartnerImportHeaderRow(matrix);
    if (headerRowIndex < 0) continue;

    const range = XLSX.utils.decode_range(sheet["!ref"]);
    range.s.r = headerRowIndex;
    const encodedRange = XLSX.utils.encode_range(range);
    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      range: encodedRange,
    }) as Record<string, unknown>[];

    sheets.push({
      sheetName,
      rows,
      headerRowNumber: headerRowIndex + 1,
    });
  }

  return sheets;
}
