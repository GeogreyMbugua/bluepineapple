import { prisma } from "@blue-pineapple/database";
import {
  parsePartnerImportSheetRows,
  summarizePartnerImportPreview,
  validatePartnerImportRow,
} from "./partner-import.parser";
import type {
  PartnerImportBatchResult,
  PartnerImportClerkAdapter,
  PartnerImportParseIssue,
  PartnerImportPreviewResult,
  PartnerImportResult,
  PartnerImportRow,
} from "./partner-import.types";

async function findExistingUsers(
  rows: PartnerImportRow[],
  partnerRoleId: string,
) {
  const emails = [...new Set(rows.map((row) => row.email).filter(Boolean) as string[])];
  const phones = [...new Set(rows.map((row) => row.phone).filter(Boolean) as string[])];

  const [existingByEmail, existingByPhone] = await Promise.all([
    emails.length > 0
      ? prisma.user.findMany({
          where: {
            OR: emails.map((email) => ({
              email: { equals: email, mode: "insensitive" as const },
            })),
          },
          select: { id: true, email: true, roles: { select: { roleId: true } } },
        })
      : Promise.resolve([]),
    phones.length > 0
      ? prisma.user.findMany({
          where: { phone: { in: phones } },
          select: { id: true, phone: true, roles: { select: { roleId: true } } },
        })
      : Promise.resolve([]),
  ]);

  const userByEmail = new Map<string, { id: string; hasPartnerRole: boolean }>();
  for (const user of existingByEmail) {
    if (user.email) {
      userByEmail.set(user.email.toLowerCase(), {
        id: user.id,
        hasPartnerRole: user.roles.some((role) => role.roleId === partnerRoleId),
      });
    }
  }

  const userByPhone = new Map<string, { id: string; hasPartnerRole: boolean }>();
  for (const user of existingByPhone) {
    if (user.phone) {
      userByPhone.set(user.phone, {
        id: user.id,
        hasPartnerRole: user.roles.some((role) => role.roleId === partnerRoleId),
      });
    }
  }

  const existingUserIds = new Set<string>();
  for (const user of existingByEmail) existingUserIds.add(user.id);
  for (const user of existingByPhone) existingUserIds.add(user.id);

  const hasProfile = new Set<string>();
  if (existingUserIds.size > 0) {
    const profiles = await prisma.partnerProfile.findMany({
      where: { userId: { in: [...existingUserIds] } },
      select: { userId: true },
    });
    for (const profile of profiles) {
      hasProfile.add(profile.userId);
    }
  }

  return { userByEmail, userByPhone, hasProfile };
}

async function processImportRow(
  row: PartnerImportRow,
  partnerRoleId: string,
  actorId: string,
  clerk: PartnerImportClerkAdapter | null,
  userByEmail: Map<string, { id: string; hasPartnerRole: boolean }>,
  userByPhone: Map<string, { id: string; hasPartnerRole: boolean }>,
  hasProfile: Set<string>,
): Promise<PartnerImportResult> {
  try {
    let userId: string;
    let needsPartnerRole = false;
    let isNewUser = false;

    const normalizedEmail = row.email?.toLowerCase() ?? null;

    if (normalizedEmail && userByEmail.has(normalizedEmail)) {
      const existing = userByEmail.get(normalizedEmail)!;
      userId = existing.id;
      needsPartnerRole = !existing.hasPartnerRole;
    } else if (row.phone && userByPhone.has(row.phone)) {
      const existing = userByPhone.get(row.phone)!;
      userId = existing.id;
      needsPartnerRole = !existing.hasPartnerRole;
    } else {
      const firstName = row.contactName || row.name || "Partner";
      const lastName = row.area || "Mombasa";

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: row.email,
          phone: row.phone,
          status: "ACTIVE",
        },
        select: { id: true, email: true, phone: true },
      });
      userId = user.id;
      isNewUser = true;

      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: partnerRoleId } },
        create: { userId: user.id, roleId: partnerRoleId },
        update: {},
      });

      if (user.email) {
        userByEmail.set(user.email.toLowerCase(), { id: user.id, hasPartnerRole: true });
      }
      if (user.phone) {
        userByPhone.set(user.phone, { id: user.id, hasPartnerRole: true });
      }
    }

    if (hasProfile.has(userId)) {
      return {
        row: row.rowNumber,
        partnerCode: row.partnerCode,
        status: "error",
        message: "Partner profile already exists for this user",
      };
    }

    if (!isNewUser && needsPartnerRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId, roleId: partnerRoleId } },
        create: { userId, roleId: partnerRoleId },
        update: {},
      });
      if (normalizedEmail) {
        userByEmail.set(normalizedEmail, { id: userId, hasPartnerRole: true });
      }
      if (row.phone) {
        userByPhone.set(row.phone, { id: userId, hasPartnerRole: true });
      }
    }

    const companyName = row.name || `Partner ${row.partnerCode}`;
    const partner = await prisma.partnerProfile.create({
      data: {
        userId,
        partnerCode: row.partnerCode,
        companyName,
        commissionRate: 10,
        status: row.email || row.phone ? "ACTIVE" : "PENDING",
      },
      select: { id: true },
    });
    hasProfile.add(userId);

    const historyReason = row.notes
      ? `Imported partner — ${row.notes}`
      : row.email || row.phone
        ? "Imported partner"
        : "Imported partner (no contact info)";

    await prisma.partnerStatusHistory.create({
      data: {
        partnerId: partner.id,
        oldStatus: null,
        newStatus: row.email || row.phone ? "ACTIVE" : "PENDING",
        reason: historyReason,
        changedByUserId: actorId,
      },
    });

    if (!isNewUser) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { clerkUserId: true },
      });

      if (existingUser?.clerkUserId && clerk) {
        const metadataSynced = await clerk.syncPartnerMetadata(existingUser.clerkUserId);
        return {
          row: row.rowNumber,
          partnerCode: row.partnerCode,
          status: metadataSynced ? "success" : "error",
          message: metadataSynced
            ? "Created successfully (Clerk account linked)"
            : "Created successfully, but Clerk role metadata could not be synchronized",
          userId,
          partnerId: partner.id,
        };
      }
    }

    const firstName = row.contactName || row.name || "Partner";
    const lastName = row.area || "Mombasa";
    const clerkUserId =
      row.email && clerk ? await clerk.createUser(row.email, firstName, lastName) : null;

    if (clerkUserId) {
      const alreadyLinked = await prisma.user.findFirst({
        where: { clerkUserId, NOT: { id: userId } },
        select: { id: true },
      });
      if (alreadyLinked) {
        throw new Error("Clerk account is already linked to another database user");
      }
      const linked = await prisma.user.updateMany({
        where: { id: userId, clerkUserId: null },
        data: { clerkUserId, status: "ACTIVE" },
      });
      if (linked.count !== 1) {
        throw new Error("User was linked by another import attempt");
      }
    }

    const metadataSynced = clerkUserId && clerk
      ? await clerk.syncPartnerMetadata(clerkUserId)
      : true;

    const pendingMessage = row.email || row.phone
      ? "Created successfully (Clerk account pending)"
      : "Created as pending (no contact info)";

    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: metadataSynced ? "success" : "error",
      message: isNewUser
        ? clerkUserId
          ? metadataSynced
            ? "Created successfully (role assigned, Clerk account linked)"
            : "Created successfully, but Clerk role metadata could not be synchronized"
          : pendingMessage
        : clerkUserId
          ? metadataSynced
            ? "Created successfully (Clerk account linked)"
            : "Created successfully, but Clerk role metadata could not be synchronized"
          : pendingMessage,
      userId,
      partnerId: partner.id,
    };
  } catch (error) {
    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function importPartnersFromSheetRows(
  sheetRows: Record<string, unknown>[],
  options: {
    actorId: string;
    startRowNumber?: number;
    clerk?: PartnerImportClerkAdapter | null;
    approvedRowNumbers?: number[];
  },
): Promise<PartnerImportBatchResult> {
  const startRowNumber = options.startRowNumber ?? 2;
  const { rows, issues } = parsePartnerImportSheetRows(sheetRows, startRowNumber);
  return importParsedPartnerRows(rows, {
    actorId: options.actorId,
    clerk: options.clerk ?? null,
    initialIssues: issues,
    approvedRowNumbers: options.approvedRowNumbers,
  });
}

export async function previewPartnersFromWorkbookSheets(
  sheets: Array<{ rows: Record<string, unknown>[]; headerRowNumber: number }>,
): Promise<PartnerImportPreviewResult> {
  const parsedRows: PartnerImportRow[] = [];
  const issues: PartnerImportParseIssue[] = [];

  for (const sheet of sheets) {
    const parsed = parsePartnerImportSheetRows(sheet.rows, sheet.headerRowNumber + 1);
    parsedRows.push(...parsed.rows);
    issues.push(...parsed.issues);
  }

  const partnerCodes = parsedRows
    .map((row) => row.partnerCode)
    .filter((code) => code && code !== "N/A");
  const existingCodes = partnerCodes.length
    ? await prisma.partnerProfile.findMany({
        where: { partnerCode: { in: partnerCodes } },
        select: { partnerCode: true },
      })
    : [];
  const existingPartnerCodes = new Set(existingCodes.map((entry) => entry.partnerCode));

  for (const row of parsedRows) {
    if (existingPartnerCodes.has(row.partnerCode)) {
      row.warnings.push({
        code: "EXISTS_IN_DATABASE",
        message: "Partner code already exists in database",
        severity: "error",
      });
      row.reviewStatus = "blocked";
    }
  }

  return {
    rows: parsedRows,
    issues,
    summary: summarizePartnerImportPreview(parsedRows, issues),
  };
}

export async function importParsedPartnerRows(
  parsedRows: PartnerImportRow[],
  options: {
    actorId: string;
    clerk?: PartnerImportClerkAdapter | null;
    initialIssues?: PartnerImportParseIssue[];
    approvedRowNumbers?: number[];
  },
): Promise<PartnerImportBatchResult> {
  const partnerRole = await prisma.role.findUnique({
    where: { name: "PARTNER" },
    select: { id: true },
  });

  if (!partnerRole) {
    throw new Error("PARTNER role not found");
  }

  const results: PartnerImportResult[] = (options.initialIssues ?? []).map((issue) => ({
    row: issue.row,
    partnerCode: issue.partnerCode,
    status: "error",
    message: issue.message,
  }));

  const approvedRows = options.approvedRowNumbers
    ? parsedRows.filter((row) => options.approvedRowNumbers!.includes(row.rowNumber))
    : parsedRows.filter((row) => row.reviewStatus === "ready");

  if (options.approvedRowNumbers && approvedRows.length === 0) {
    throw new Error("No approved rows selected for import");
  }

  for (const row of parsedRows) {
    if (options.approvedRowNumbers && !options.approvedRowNumbers.includes(row.rowNumber)) {
      continue;
    }
    if (!options.approvedRowNumbers && row.reviewStatus !== "ready") {
      results.push({
        row: row.rowNumber,
        partnerCode: row.partnerCode,
        status: "error",
        message: "Row requires review before import",
      });
    }
  }

  const existingCodes = approvedRows.length
    ? await prisma.partnerProfile.findMany({
        where: { partnerCode: { in: approvedRows.map((row) => row.partnerCode) } },
        select: { partnerCode: true },
      })
    : [];
  const existingPartnerCodes = new Set(existingCodes.map((entry) => entry.partnerCode));

  const validationContext = {
    processedCodes: new Set<string>(),
    processedEmails: new Set<string>(),
    existingPartnerCodes,
  };

  const rowsToImport: PartnerImportRow[] = [];
  for (const row of approvedRows) {
    const validationIssue = validatePartnerImportRow(row, validationContext);
    if (validationIssue) {
      results.push({
        row: validationIssue.row,
        partnerCode: validationIssue.partnerCode,
        status: "error",
        message: validationIssue.message,
      });
      continue;
    }
    rowsToImport.push(row);
  }

  if (rowsToImport.length === 0) {
    return summarizeImportResults(results);
  }

  const { userByEmail, userByPhone, hasProfile } = await findExistingUsers(
    rowsToImport,
    partnerRole.id,
  );

  for (const row of rowsToImport) {
    const result = await processImportRow(
      row,
      partnerRole.id,
      options.actorId,
      options.clerk ?? null,
      userByEmail,
      userByPhone,
      hasProfile,
    );
    results.push(result);
  }

  return summarizeImportResults(results);
}

export async function importPartnersFromWorkbookSheets(
  sheets: Array<{ rows: Record<string, unknown>[]; headerRowNumber: number }>,
  options: {
    actorId: string;
    clerk?: PartnerImportClerkAdapter | null;
    approvedRowNumbers: number[];
  },
): Promise<PartnerImportBatchResult> {
  const parsedRows: PartnerImportRow[] = [];
  const initialIssues: PartnerImportParseIssue[] = [];

  for (const sheet of sheets) {
    const { rows, issues } = parsePartnerImportSheetRows(
      sheet.rows,
      sheet.headerRowNumber + 1,
    );
    parsedRows.push(...rows);
    initialIssues.push(...issues);
  }

  return importParsedPartnerRows(parsedRows, {
    actorId: options.actorId,
    clerk: options.clerk ?? null,
    initialIssues,
    approvedRowNumbers: options.approvedRowNumbers,
  });
}

function summarizeImportResults(results: PartnerImportResult[]): PartnerImportBatchResult {
  const success = results.filter((result) => result.status === "success").length;
  const failed = results.filter((result) => result.status === "error").length;

  return {
    summary: {
      total: results.length,
      success,
      failed,
    },
    results: results.sort((a, b) => a.row - b.row),
  };
}

export type { PartnerImportParseIssue };
