import { describe, expect, it } from "vitest";
import {
  analyzePartnerImportRecord,
  cleanEmail,
  cleanPhone,
  detectPartnerImportHeaderRow,
  normalizePartnerCode,
  parsePartnerImportSheetRows,
  summarizePartnerImportPreview,
  validatePartnerImportRow,
} from "../src/partners/partner-import.parser";

describe("partner import parser", () => {
  it("normalizes Kenyan phone numbers", () => {
    expect(cleanPhone("254793809997")).toBe("+254793809997");
    expect(cleanPhone("0793809997")).toBe("+254793809997");
    expect(cleanPhone("+254 793 809 997")).toBe("+254793809997");
  });

  it("extracts and lowercases emails", () => {
    expect(cleanEmail("  Siraj.ABDULKAYUM@citybluehotels.com ")).toBe(
      "siraj.abdulkayum@citybluehotels.com",
    );
    expect(cleanEmail("invalid")).toBeNull();
  });

  it("detects the header row below title rows", () => {
    const rows = [
      ["", "Hotel and apartment block Partners/Agents"],
      ["", ""],
      ["Unique code", "NAME", "Main contact"],
      [2610, "Mombasa Continental", "", "", "", "Shanzu"],
    ];

    expect(detectPartnerImportHeaderRow(rows)).toBe(2);
  });

  it("parses clean rows as ready", () => {
    const parsed = analyzePartnerImportRecord(
      {
        "Unique code": 2611,
        NAME: "Kilua residences",
        "Main contact": "Siraj ABDULKAYUM",
        "WhatsApp no": 254793809997,
        "Email address": "siraj.abdulkayum@citybluehotels.com",
        Area: "Shanzu",
        "Points of Note": "VIP",
      },
      4,
    );

    expect(parsed).toMatchObject({
      rowNumber: 4,
      partnerCode: "2611",
      name: "Kilua residences",
      contactName: "Siraj ABDULKAYUM",
      phone: "+254793809997",
      email: "siraj.abdulkayum@citybluehotels.com",
      area: "Shanzu",
      notes: "VIP",
      reviewStatus: "ready",
      warnings: [],
    });
  });

  it("relocates emails found in WhatsApp columns", () => {
    const parsed = analyzePartnerImportRecord(
      {
        "Unique code": 2614,
        NAME: "Royal Shanzu suites",
        "WhatsApp no": "",
        "Email address": "",
        "WhatsApp no_1": "shazabeachhotel@gmail.com",
        Area: "Shanzu",
      },
      9,
    );

    expect(parsed).toMatchObject({
      partnerCode: "2614",
      email: "shazabeachhotel@gmail.com",
      reviewStatus: "review",
      fieldSources: { email: "WhatsApp no_1" },
    });
    expect(parsed && "warnings" in parsed ? parsed.warnings.some((w) => w.code === "EMAIL_RELOCATED") : false).toBe(true);
  });

  it("marks section headings as blocked", () => {
    const parsed = analyzePartnerImportRecord(
      {
        "Unique code": "",
        NAME: "Reastaurants and Bars",
      },
      20,
    );

    expect(parsed).toMatchObject({
      reviewStatus: "blocked",
      warnings: [{ code: "SECTION_HEADER" }],
    });
  });

  it("marks code-only placeholder rows for review", () => {
    const parsed = analyzePartnerImportRecord(
      {
        "Unique code": 2620,
        NAME: "",
      },
      15,
    );

    expect(parsed).toMatchObject({
      partnerCode: "2620",
      reviewStatus: "review",
    });
    expect(parsed && "warnings" in parsed ? parsed.warnings.map((w) => w.code) : []).toEqual(
      expect.arrayContaining(["MISSING_COMPANY_NAME", "MISSING_CONTACT"]),
    );
  });

  it("skips blank rows and reports missing partner codes", () => {
    const { rows, issues } = parsePartnerImportSheetRows([
      { NAME: "No code hotel", Area: "Shanzu" },
      { "Unique code": 2610, NAME: "Valid Hotel", Area: "Shanzu", "Email address": "hotel@example.com" },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.partnerCode).toBe("2610");
    expect(issues[0]?.message).toBe("Missing partner code");
  });

  it("summarizes preview counts by review status", () => {
    const summary = summarizePartnerImportPreview([
      {
        rowNumber: 1,
        partnerCode: "1",
        name: "A",
        contactName: "A",
        phone: "+254700000001",
        email: "a@example.com",
        area: "",
        notes: "",
        reviewStatus: "ready",
        warnings: [],
        fieldSources: {},
      },
      {
        rowNumber: 2,
        partnerCode: "2",
        name: "",
        contactName: "",
        phone: null,
        email: null,
        area: "",
        notes: "",
        reviewStatus: "review",
        warnings: [{ code: "MISSING_CONTACT", message: "x", severity: "warning" }],
        fieldSources: {},
      },
    ]);

    expect(summary).toEqual({ total: 2, ready: 1, review: 1, blocked: 0 });
  });

  it("flags duplicate codes and emails during validation", () => {
    const context = {
      processedCodes: new Set<string>(),
      processedEmails: new Set<string>(),
      existingPartnerCodes: new Set(["2610"]),
    };

    expect(
      validatePartnerImportRow(
        {
          rowNumber: 3,
          partnerCode: "2610",
          name: "Existing",
          contactName: "",
          phone: null,
          email: "a@example.com",
          area: "",
          notes: "",
          reviewStatus: "ready",
          warnings: [],
          fieldSources: {},
        },
        context,
      )?.message,
    ).toBe("Partner code already exists in database");
  });

  it("stringifies numeric partner codes from Excel", () => {
    expect(normalizePartnerCode(2610)).toBe("2610");
  });
});
