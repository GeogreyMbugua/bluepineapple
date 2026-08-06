import { partnerService } from '@blue-pineapple/iam';
import type { PartnerRow } from '@/components/admin/types';

export async function getAdminPartners(status?: string): Promise<PartnerRow[]> {
  try {
    let partners;
    if (status && status !== 'ALL') {
      partners = await partnerService.listByStatus(status);
    } else {
      const active = await partnerService.listByStatus('ACTIVE');
      const pending = await partnerService.listByStatus('PENDING');
      const suspended = await partnerService.listByStatus('SUSPENDED');
      const terminated = await partnerService.listByStatus('TERMINATED');
      partners = [...active, ...pending, ...suspended, ...terminated];
    }

    return partners.map((p) => ({
      id: p.id,
      partnerCode: p.partnerCode,
      companyName: p.companyName ?? null,
      status: p.status,
      commissionRate: Number(p.commissionRate),
      joinedAt: p.joinedAt ? new Date(p.joinedAt).toISOString() : new Date().toISOString(),
      userId: p.userId,
    }));
  } catch (error) {
    console.error('[AdminPartnersService] getAdminPartners error:', error);
    return [];
  }
}
