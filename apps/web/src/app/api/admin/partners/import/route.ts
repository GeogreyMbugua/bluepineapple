import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import * as XLSX from 'xlsx';
import { prisma } from '@blue-pineapple/database';
import { createClerkClient } from '@clerk/backend';

interface ImportResult {
  row: number;
  partnerCode: string;
  status: 'success' | 'error';
  message: string;
  userId?: string;
  partnerId?: string;
}

function cleanPhone(phone: unknown): string | null {
  if (!phone) return null;
  const str = String(phone).replace(/[^0-9+]/g, '');
  if (!str) return null;
  if (str.startsWith('+')) return str;
  if (str.startsWith('254')) return '+' + str;
  if (str.length === 9 && str.startsWith('0')) return '+254' + str.substring(1);
  return str;
}

function cleanEmail(email: unknown): string | null {
  if (!email) return null;
  const str = String(email).trim();
  if (!str) return null;
  const match = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

const CONCURRENCY = 10;

type ParsedRow = {
  rowNumber: number;
  partnerCode: string;
  name: string;
  contactName: string;
  phone: string | null;
  email: string | null;
  area: string;
};

function getClerkClient() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  return createClerkClient({ secretKey });
}

async function createClerkUser(
  email: string,
  firstName: string,
  lastName: string
): Promise<string | null> {
  const clerk = getClerkClient();
  if (!clerk) return null;

  try {
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      skipPasswordRequirement: true,
      skipLegalChecks: true,
    });
    return clerkUser.id;
  } catch {
    return null;
  }
}

async function processRow(
  row: ParsedRow,
  partnerRoleId: string,
  userByEmail: Map<string, { id: string; hasPartnerRole: boolean }>,
  userByPhone: Map<string, { id: string; hasPartnerRole: boolean }>,
  hasProfile: Set<string>
): Promise<ImportResult> {
  try {
    let userId: string;
    let needsPartnerRole = false;
    let isNewUser = false;

    if (row.email && userByEmail.has(row.email)) {
      const existing = userByEmail.get(row.email)!;
      userId = existing.id;
      needsPartnerRole = !existing.hasPartnerRole;
    } else if (row.phone && userByPhone.has(row.phone)) {
      const existing = userByPhone.get(row.phone)!;
      userId = existing.id;
      needsPartnerRole = !existing.hasPartnerRole;
    } else {
      const firstName = row.contactName || row.name || 'Partner';
      const lastName = row.area || 'Mombasa';

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: row.email,
          phone: row.phone,
          status: 'PENDING_VERIFICATION',
        },
        select: { id: true },
      });
      userId = user.id;
      isNewUser = true;

      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: partnerRoleId } },
        create: { userId: user.id, roleId: partnerRoleId },
        update: {},
      });
    }

    if (hasProfile.has(userId)) {
      return {
        row: row.rowNumber,
        partnerCode: row.partnerCode,
        status: 'error',
        message: 'Partner profile already exists for this user',
      };
    }

    if (!isNewUser && needsPartnerRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId, roleId: partnerRoleId } },
        create: { userId, roleId: partnerRoleId },
        update: {},
      });
    }

    const companyName = row.name || `Partner ${row.partnerCode}`;
    const partner = await prisma.partnerProfile.create({
      data: {
        userId,
        partnerCode: row.partnerCode,
        companyName,
        commissionRate: 10,
      },
      select: { id: true },
    });

    if (!isNewUser) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { clerkUserId: true },
      });

      if (existingUser?.clerkUserId) {
        return {
          row: row.rowNumber,
          partnerCode: row.partnerCode,
          status: 'success',
          message: 'Created successfully',
          userId,
          partnerId: partner.id,
        };
      }
    }

    const firstName = row.contactName || row.name || 'Partner';
    const lastName = row.area || 'Mombasa';
    const clerkUserId = row.email ? await createClerkUser(row.email, firstName, lastName) : null;

    if (clerkUserId) {
      await prisma.user.update({
        where: { id: userId },
        data: { clerkUserId, status: 'ACTIVE' },
      });
    }

    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: 'success',
      message: isNewUser
        ? clerkUserId
          ? 'Created successfully (role assigned, Clerk account linked)'
          : 'Created successfully (role assigned, Clerk account pending)'
        : clerkUserId
          ? 'Created successfully (Clerk account linked)'
          : 'Created successfully (Clerk account pending)',
      userId,
      partnerId: partner.id,
    };
  } catch (error) {
    return {
      row: row.rowNumber,
      partnerCode: row.partnerCode,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Excel file is required' } },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const partnerRole = await prisma.role.findUnique({
      where: { name: 'PARTNER' },
      select: { id: true },
    });

    if (!partnerRole) {
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message: 'PARTNER role not found' } },
        { status: 500 }
      );
    }

    const results: ImportResult[] = [];
    const processedCodes = new Set<string>();
    const processedEmails = new Set<string>();

    const rows: ParsedRow[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as Record<string, unknown>;
        const rowNumber = i + 2;

        const partnerCode = String(row['Unique code'] || row['unique code'] || row['code'] || '').trim();
        const name = String(row['NAME'] || row['name'] || row['Name'] || '').trim();
        const contactName = String(row['Main contact'] || row['main contact'] || row['Contact'] || '').trim();
        const rawPhone = row['WhatsApp no'] || row['whatsapp no'] || row['Phone'] || row['phone'] || '';
        const rawEmail = row['Email address'] || row['email address'] || row['Email'] || row['email'] || '';
        const area = String(row['Area'] || row['area'] || '').trim();

        if (!partnerCode && !name) continue;

        if (!partnerCode) {
          results.push({
            row: rowNumber,
            partnerCode: 'N/A',
            status: 'error',
            message: 'Missing partner code',
          });
          continue;
        }

        if (processedCodes.has(partnerCode)) {
          results.push({
            row: rowNumber,
            partnerCode,
            status: 'error',
            message: 'Duplicate partner code in file',
          });
          continue;
        }
        processedCodes.add(partnerCode);

        const email = cleanEmail(rawEmail);
        const phone = cleanPhone(rawPhone);

        if (!email && !phone) {
          try {
            const firstName = contactName || name || 'Partner';
            const lastName = area || 'Mombasa';

            const user = await prisma.user.create({
              data: {
                firstName,
                lastName,
                email: null,
                phone: null,
                status: 'PENDING_VERIFICATION',
              },
              select: { id: true },
            });

            const partner = await prisma.partnerProfile.create({
              data: {
                userId: user.id,
                partnerCode,
                companyName: name || `Partner ${partnerCode}`,
                commissionRate: 10,
                status: 'PENDING',
              },
              select: { id: true },
            });

            results.push({
              row: rowNumber,
              partnerCode,
              status: 'success',
              message: 'Created as pending (no contact info)',
              userId: user.id,
              partnerId: partner.id,
            });
          } catch (error) {
            results.push({
              row: rowNumber,
              partnerCode,
              status: 'error',
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
          continue;
        }

        if (email && processedEmails.has(email.toLowerCase())) {
          results.push({
            row: rowNumber,
            partnerCode,
            status: 'error',
            message: 'Duplicate email in file',
          });
          continue;
        }
        if (email) processedEmails.add(email.toLowerCase());

        rows.push({
          rowNumber,
          partnerCode,
          name,
          contactName,
          phone,
          email,
          area,
        });
      }
    }

    if (rows.length === 0) {
      const successCount = results.filter((r) => r.status === 'success').length;
      const errorCount = results.filter((r) => r.status === 'error').length;
      return Response.json({
        data: {
          summary: { total: results.length, success: successCount, failed: errorCount },
          results,
        },
        timestamp: new Date().toISOString(),
      });
    }

    const emailsToCheck = rows.filter((r) => r.email).map((r) => r.email!);
    const phonesToCheck = rows.filter((r) => r.phone).map((r) => r.phone!);

    const [existingByEmail, existingByPhone] = await Promise.all([
      prisma.user.findMany({
        where: { email: { in: emailsToCheck.length > 0 ? emailsToCheck : ['__none__'] } },
        select: { id: true, email: true, roles: { select: { roleId: true } } },
      }),
      prisma.user.findMany({
        where: { phone: { in: phonesToCheck.length > 0 ? phonesToCheck : ['__none__'] } },
        select: { id: true, phone: true, roles: { select: { roleId: true } } },
      }),
    ]);

    const userByEmail = new Map<string, { id: string; hasPartnerRole: boolean }>();
    for (const u of existingByEmail) {
      if (u.email) userByEmail.set(u.email, { id: u.id, hasPartnerRole: u.roles.some((r) => r.roleId === partnerRole.id) });
    }

    const userByPhone = new Map<string, { id: string; hasPartnerRole: boolean }>();
    for (const u of existingByPhone) {
      if (u.phone) userByPhone.set(u.phone, { id: u.id, hasPartnerRole: u.roles.some((r) => r.roleId === partnerRole.id) });
    }

    const existingUserIds = new Set<string>();
    for (const u of existingByEmail) existingUserIds.add(u.id);
    for (const u of existingByPhone) existingUserIds.add(u.id);

    let hasProfile = new Set<string>();
    if (existingUserIds.size > 0) {
      const existingProfiles = await prisma.partnerProfile.findMany({
        where: { userId: { in: Array.from(existingUserIds) } },
        select: { userId: true },
      });
      hasProfile = new Set(existingProfiles.map((p) => p.userId));
    }

    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const batch = rows.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((row) =>
          processRow(row, partnerRole.id, userByEmail, userByPhone, hasProfile)
        )
      );
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return Response.json({
      data: {
        summary: {
          total: results.length,
          success: successCount,
          failed: errorCount,
        },
        results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process Excel file' } },
      { status: 500 }
    );
  }
}
