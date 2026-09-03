import type {
  PartnerImportFieldSources,
  PartnerImportParseIssue,
  PartnerImportPreviewResult,
  PartnerImportPreviewSummary,
  PartnerImportReviewStatus,
  PartnerImportRow,
  PartnerImportWarning,
} from "./partner-import.types";

const HEADER_MARKERS = ["unique code", "uniquecode", "partner code", "code"];

const COMPANY_COLUMNS = ["NAME", "name", "Name", "Company", "company"];
const CONTACT_COLUMNS = ["Main contact", "main contact", "Contact", "contact", "2nd contact", "Secondary contact"];
const EMAIL_COLUMNS = ["Email address", "email address", "Email", "email", "Email address_1", "Secondary Email", "secondary email", "Email address (2)"];
const PHONE_COLUMNS = ["WhatsApp no", "whatsapp no", "Phone", "phone", "WhatsApp no_1", "Secondary WhatsApp", "secondary whatsapp", "WhatsApp no (2)"];
const AREA_COLUMNS = ["Area", "area", "Location", "location"];
const NOTES_COLUMNS = ["Points of Note", "points of note", "Notes", "notes"];
const CODE_COLUMNS = ["Unique code", "unique code", "Partner code", "partner code", "code", "Code"];

type CellKind = "empty" | "email" | "phone" | "text";

interface ParsedCell {
  column: string;
  text: string;
  kind: CellKind;
  email: string | null;
  phone: string | null;
}

export function cleanPhone(phone: unknown): string | null {
  if (phone === undefined || phone === null || phone === "") return null;
  const str = String(phone).replace(/[^0-9+]/g, "");
  if (!str) return null;
  if (str.startsWith("+")) return str;
  if (str.startsWith("254")) return `+${str}`;
  if (str.length === 10 && str.startsWith("0")) return `+254${str.slice(1)}`;
  if (str.length === 9) return `+254${str}`;
  if (str.length >= 9 && str.length <= 15) return str.startsWith("254") ? `+${str}` : str;
  return null;
}

export function cleanEmail(email: unknown): string | null {
  if (email === undefined || email === null || email === "") return null;
  const str = String(email).trim();
  if (!str) return null;
  const match = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

export function normalizePartnerCode(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function pickField(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function columnRank(column: string, preferredColumns: string[]): number {
  const index = preferredColumns.indexOf(column);
  return index === -1 ? preferredColumns.length + 1 : index;
}

function classifyCell(column: string, raw: unknown): ParsedCell {
  const text = String(raw ?? "").trim();
  if (!text) {
    return { column, text: "", kind: "empty", email: null, phone: null };
  }

  const email = cleanEmail(text);
  if (email) {
    return { column, text, kind: "email", email, phone: null };
  }

  const phone = cleanPhone(text);
  if (phone) {
    return { column, text, kind: "phone", email: null, phone };
  }

  return { column, text, kind: "text", email: null, phone: null };
}

function iterParsedCells(row: Record<string, unknown>): ParsedCell[] {
  return Object.entries(row)
    .filter(([column]) => !column.startsWith("__EMPTY"))
    .map(([column, raw]) => classifyCell(column, raw))
    .filter((cell) => cell.kind !== "empty");
}

function pickPreferredContact<T extends { column: string; value: string }>(
  candidates: T[],
  preferredColumns: string[],
  contactType: "email" | "phone",
): { selected: T | null; warning: PartnerImportWarning | null } {
  if (candidates.length === 0) {
    return { selected: null, warning: null };
  }

  const sorted = [...candidates].sort(
    (left, right) => columnRank(left.column, preferredColumns) - columnRank(right.column, preferredColumns),
  );
  const selected = sorted[0] ?? null;
  if (!selected) {
    return { selected: null, warning: null };
  }

  if (!preferredColumns.includes(selected.column)) {
    return {
      selected,
      warning: {
        code: contactType === "email" ? "EMAIL_RELOCATED" : "PHONE_RELOCATED",
        message:
          contactType === "email"
            ? `Email detected in "${selected.column}" instead of an email column`
            : `Phone number detected in "${selected.column}" instead of a WhatsApp column`,
        severity: "warning",
        column: selected.column,
      },
    };
  }

  return { selected, warning: null };
}

function pickTextFromColumns(cells: ParsedCell[], preferredColumns: string[]): { value: string; column?: string } {
  const match = cells
    .filter((cell) => cell.kind === "text")
    .sort((left, right) => columnRank(left.column, preferredColumns) - columnRank(right.column, preferredColumns))
    .find((cell) => preferredColumns.includes(cell.column));

  if (match) {
    return { value: match.text, column: match.column };
  }

  return { value: "", column: undefined };
}

function isSectionHeaderRow(partnerCode: string, companyName: string, cells: ParsedCell[]): boolean {
  if (partnerCode) return false;
  if (!companyName) return false;

  const hasContact = cells.some((cell) => cell.kind === "email" || cell.kind === "phone");
  const hasArea = cells.some((cell) => AREA_COLUMNS.includes(cell.column) && cell.kind === "text");
  const hasContactName = cells.some(
    (cell) => CONTACT_COLUMNS.includes(cell.column) && cell.kind === "text",
  );

  if (hasContact || hasArea || hasContactName) {
    return false;
  }

  return true;
}

function deriveReviewStatus(
  warnings: PartnerImportWarning[],
  row: Pick<PartnerImportRow, "partnerCode" | "name" | "email" | "phone">,
): PartnerImportReviewStatus {
  if (warnings.some((warning) => warning.code === "SECTION_HEADER" || warning.code === "MISSING_PARTNER_CODE")) {
    return "blocked";
  }

  const needsReview =
    !row.name ||
    (!row.email && !row.phone) ||
    warnings.some((warning) => warning.severity === "warning");

  return needsReview ? "review" : "ready";
}

export function detectPartnerImportHeaderRow(rows: unknown[][]): number {
  for (let index = 0; index < Math.min(rows.length, 20); index += 1) {
    const row = rows[index];
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      const normalized = String(cell ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (HEADER_MARKERS.includes(normalized)) {
        return index;
      }
    }
  }
  return -1;
}

export function analyzePartnerImportRecord(
  row: Record<string, unknown>,
  rowNumber: number,
): PartnerImportRow | PartnerImportParseIssue | null {
  const cells = iterParsedCells(row);
  const partnerCode = normalizePartnerCode(pickField(row, CODE_COLUMNS));
  const company = pickTextFromColumns(cells, COMPANY_COLUMNS);
  const contact = pickTextFromColumns(
    cells.filter((cell) => CONTACT_COLUMNS.includes(cell.column)),
    CONTACT_COLUMNS,
  );
  const area = pickTextFromColumns(cells, AREA_COLUMNS);
  const notes = pickTextFromColumns(cells, NOTES_COLUMNS);

  if (!partnerCode && !company.value && cells.length === 0) {
    return null;
  }

  if (isSectionHeaderRow(partnerCode, company.value, cells)) {
    return {
      rowNumber,
      partnerCode: "N/A",
      name: company.value,
      contactName: "",
      phone: null,
      email: null,
      area: "",
      notes: "",
      reviewStatus: "blocked",
      warnings: [
        {
          code: "SECTION_HEADER",
          message: "Section heading row — not a partner record",
          severity: "error",
          column: "NAME",
        },
      ],
      fieldSources: {},
    };
  }

  if (!partnerCode) {
    return {
      row: rowNumber,
      partnerCode: "N/A",
      status: "error",
      message: "Missing partner code",
    };
  }

  const emailCandidates = cells
    .filter((cell) => cell.kind === "email" && cell.email)
    .map((cell) => ({ column: cell.column, value: cell.email! }));
  const phoneCandidates = cells
    .filter((cell) => cell.kind === "phone" && cell.phone)
    .map((cell) => ({ column: cell.column, value: cell.phone! }));

  const emailPick = pickPreferredContact(emailCandidates, EMAIL_COLUMNS, "email");
  const phonePick = pickPreferredContact(phoneCandidates, PHONE_COLUMNS, "phone");

  const warnings: PartnerImportWarning[] = [];
  if (emailPick.warning) warnings.push(emailPick.warning);
  if (phonePick.warning) warnings.push(phonePick.warning);

  if (!company.value) {
    warnings.push({
      code: "MISSING_COMPANY_NAME",
      message: "Missing company or property name",
      severity: "warning",
      column: "NAME",
    });
  }

  if (!emailPick.selected && !phonePick.selected) {
    warnings.push({
      code: "MISSING_CONTACT",
      message: "No valid email or phone number found in this row",
      severity: "warning",
    });
  }

  if (!contact.value && !company.value) {
    warnings.push({
      code: "MISSING_CONTACT_NAME",
      message: "No contact person name found",
      severity: "info",
    });
  }

  const fieldSources: PartnerImportFieldSources = {
    ...(company.column ? { companyName: company.column } : {}),
    ...(contact.column ? { contactName: contact.column } : {}),
    ...(area.column ? { area: area.column } : {}),
    ...(notes.column ? { notes: notes.column } : {}),
    ...(emailPick.selected ? { email: emailPick.selected.column } : {}),
    ...(phonePick.selected ? { phone: phonePick.selected.column } : {}),
  };

  const parsedRow: PartnerImportRow = {
    rowNumber,
    partnerCode,
    name: company.value,
    contactName: contact.value || company.value,
    phone: phonePick.selected?.value ?? null,
    email: emailPick.selected?.value ?? null,
    area: area.value,
    notes: notes.value,
    warnings,
    fieldSources,
    reviewStatus: "ready",
  };

  parsedRow.reviewStatus = deriveReviewStatus(warnings, parsedRow);
  return parsedRow;
}

/** @deprecated Use analyzePartnerImportRecord */
export function parsePartnerImportRecord(
  row: Record<string, unknown>,
  rowNumber: number,
): PartnerImportRow | PartnerImportParseIssue | null {
  return analyzePartnerImportRecord(row, rowNumber);
}

export interface PartnerImportValidationContext {
  processedCodes: Set<string>;
  processedEmails: Set<string>;
  existingPartnerCodes: Set<string>;
}

export function validatePartnerImportRow(
  row: PartnerImportRow,
  context: PartnerImportValidationContext,
): PartnerImportParseIssue | null {
  if (row.reviewStatus === "blocked") {
    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: "error",
      message: row.warnings[0]?.message ?? "Row is blocked from import",
    };
  }

  if (context.processedCodes.has(row.partnerCode)) {
    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: "error",
      message: "Duplicate partner code in file",
    };
  }
  context.processedCodes.add(row.partnerCode);

  if (context.existingPartnerCodes.has(row.partnerCode)) {
    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: "error",
      message: "Partner code already exists in database",
    };
  }

  if (row.email) {
    const normalizedEmail = row.email.toLowerCase();
    if (context.processedEmails.has(normalizedEmail)) {
      return {
        row: row.rowNumber,
        partnerCode: row.partnerCode,
        status: "error",
        message: "Duplicate email in file",
      };
    }
    context.processedEmails.add(normalizedEmail);
  }

  return null;
}

export function parsePartnerImportSheetRows(
  rows: Record<string, unknown>[],
  startRowNumber = 2,
): { rows: PartnerImportRow[]; issues: PartnerImportParseIssue[] } {
  const parsedRows: PartnerImportRow[] = [];
  const issues: PartnerImportParseIssue[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const parsed = analyzePartnerImportRecord(rows[index]!, startRowNumber + index);
    if (!parsed) continue;
    if ("status" in parsed) {
      issues.push(parsed);
      continue;
    }
    parsedRows.push(parsed);
  }

  return { rows: parsedRows, issues };
}

export function summarizePartnerImportPreview(
  rows: PartnerImportRow[],
  issues: PartnerImportParseIssue[] = [],
): PartnerImportPreviewSummary {
  return {
    total: rows.length + issues.length,
    ready: rows.filter((row) => row.reviewStatus === "ready").length,
    review: rows.filter((row) => row.reviewStatus === "review").length,
    blocked: rows.filter((row) => row.reviewStatus === "blocked").length,
  };
}

export function previewPartnerImportSheetRows(
  rows: Record<string, unknown>[],
  startRowNumber = 2,
): PartnerImportPreviewResult {
  const { rows: parsedRows, issues } = parsePartnerImportSheetRows(rows, startRowNumber);
  return {
    rows: parsedRows,
    issues,
    summary: summarizePartnerImportPreview(parsedRows, issues),
  };
}
