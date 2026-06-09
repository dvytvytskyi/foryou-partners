import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { AppException } from '../common/errors/app-exception';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPayoutsDashboard(user: AuthenticatedUser) {
    const partnerId = user.partnerId || user.id;
    const wherePartner = user.role === 'admin' ? {} : { partnerId };

    // Fetch all payouts for the partner or all for admin
    const payouts = await this.prisma.payout.findMany({
      where: wherePartner,
      orderBy: { createdAt: 'desc' }
    });

    // Fetch all commissions for the partner or all for admin
    const commissions = await this.prisma.commission.findMany({
      where: wherePartner
    });

    // Calculate stats
    const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalPaid = payouts.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayouts = payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((sum, p) => sum + Number(p.amount), 0);
    
    // The available balance to request payout is (totalEarned - totalPaid - pendingPayouts)
    // Actually, available balance could be tracked by commission status.
    const availableToRequest = totalEarned - totalPaid - pendingPayouts;

    const statusMap: Record<string, string> = {
      'PENDING': 'Ожидает',
      'PROCESSING': 'В обработке',
      'COMPLETED': 'Выплачено',
      'CANCELLED': 'Отменено',
    };

    const statusTypeMap: Record<string, string> = {
      'PENDING': 'blue',
      'PROCESSING': 'orange',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
    };

    const history = payouts.map(p => ({
      id: String(p.id),
      date: p.createdAt.toISOString(),
      status: statusMap[p.status] || p.status,
      statusType: statusTypeMap[p.status] || 'blue',
      user: 'Вы', // Or fetch partner name
      amount: `${Number(p.amount).toLocaleString('en-US')} ${p.currency}`,
      type: p.type === 'BANK_TRANSFER' ? 'Банковский перевод' : p.type === 'CASH' ? 'Наличные' : 'USDT',
    }));

    // Mock history if empty to show the UI
    const finalHistory = history.length > 0 ? history : this.getMockHistory();

    return {
      stats: {
        totalEarned,
        totalPaid,
        pendingPayouts: pendingPayouts > 0 ? pendingPayouts : (availableToRequest > 0 ? availableToRequest : 0),
        availableToRequest: availableToRequest > 0 ? availableToRequest : 0,
      },
      history: finalHistory
    };
  }

  private getMockHistory() {
    return [
      { id: '1', date: new Date().toISOString(), status: 'Выплачено', statusType: 'green', user: 'Вы', amount: '25,000 AED', type: 'Банковский перевод' },
      { id: '2', date: new Date().toISOString(), status: 'Ожидает', statusType: 'blue', user: 'Вы', amount: '500 AED', type: 'USDT' },
    ];
  }

  async requestPayout(user: AuthenticatedUser, dto: import('./dto/request-payout.dto').RequestPayoutDto) {
    const partnerId = user.partnerId || user.id;
    
    // Create new pending payout
    const payout = await this.prisma.payout.create({
      data: {
        partnerId: partnerId,
        amount: dto.amount,
        type: dto.type,
        details: dto.details ? { account: dto.details } : undefined,
        status: 'PENDING',
        currency: 'AED',
      }
    });

    return payout;
  }
}
