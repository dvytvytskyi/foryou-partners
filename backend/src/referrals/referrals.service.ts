import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { AppException } from '../common/errors/app-exception';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReferralsDashboard(user: AuthenticatedUser) {
    const partnerId = user.partnerId || user.id;

    // Get all referred partners (admin sees all, partner sees their own)
    const referredPartnersWhere = user.role === 'admin' ? {} : { referredById: partnerId };
    const referredPartners = await this.prisma.partner.findMany({
      where: referredPartnersWhere,
      include: {
        leadSnapshots: {
          where: {
            status: { in: ['142', '8696950:142', '10651778:142', '10776450:142'] } // Common 'Success' status IDs
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all referral commissions
    const commissionsWhere: any = user.role === 'admin' ? { type: 'REFERRAL' } : { partnerId: partnerId, type: 'REFERRAL' };
    const referralCommissions = await this.prisma.commission.findMany({
      where: commissionsWhere,
      include: {
        partner: true // Assuming commission has relation to external lead or partner... wait, the commission is FOR the referrer. We might need to know which partner generated this commission.
        // For MVP, we can just return dummy or simple data if we don't have the full relation yet.
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarned = referralCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const activePartners = referredPartners.filter(p => p.isActive).length;
    const totalClosedDeals = referredPartners.reduce((sum, p) => sum + p.leadSnapshots.length, 0);

    const partnersList = referredPartners.map(p => ({
      name: p.name,
      joined: p.createdAt.toISOString(),
      deals: p.leadSnapshots.length,
      status: p.isActive ? 'Активен' : 'На верификации',
    }));

    // Mock recent deals for now since we don't have direct linkage between Commission and who generated it yet
    const recentDeals = referralCommissions.map(c => ({
      partner: c.description ? c.description.replace('Referral bonus from ', '') : 'Партнер',
      status: c.status === 'PAID' ? 'Закрыта' : 'Переговоры',
      date: c.createdAt.toISOString(),
      amount: `+ ${Number(c.amount)} ${c.currency}`,
      statusType: c.status === 'PAID' ? 'green' : 'blue',
    }));

    return {
      stats: {
        totalEarned,
        activePartners,
        totalClosedDeals,
      },
      partners: partnersList,
      deals: recentDeals,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${partnerId}`
    };
  }
}
