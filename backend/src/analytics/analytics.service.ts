import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';
import { startOfDay, subDays, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(userId: string, role: UserRole, partnerId?: string, dateFrom?: string, dateTo?: string) {
    const isPartner = role === UserRole.partner_user;
    
    // 1. KPI Stats & Date Filtering
    // Define valid pipelines that are actually displayed in the portal
    const validPipelines = isPartner 
      ? (partnerId === 'dcf2713e-22a9-464a-8bad-5a0c8c182562' ? [BigInt(10776450)] : [BigInt(8696950)])
      : [BigInt(10776450), BigInt(8696950)];

    const where: any = isPartner ? { partnerId } : {};
    where.pipelineId = { in: validPipelines };
    
    // Determine the date range
    let startDate = dateFrom ? new Date(dateFrom) : subDays(new Date(), 30);
    let endDate = dateTo ? new Date(dateTo) : new Date();
    
    // Adjust endDate to include the whole day
    endDate = new Date(endDate.setHours(23, 59, 59, 999));

    // Apply date filter for main stats
    const dateFilter = {
      updatedAtSource: {
        gte: startDate,
        lte: endDate,
      }
    };

    const combinedWhere = { ...where, ...dateFilter };

    const INITIAL_STATUSES = isPartner 
      ? (partnerId === 'dcf2713e-22a9-464a-8bad-5a0c8c182562' 
          ? ['10776450:84853590', '10776450:84853926'] 
          : ['8696950:74717798'])
      : ['10776450:84853590', '10776450:84853926', '8696950:74717798'];

    const [totalRevenue, wonDealsCount, activePartnersCount, totalLeads] = await Promise.all([
      this.prisma.leadSnapshot.aggregate({
        where: combinedWhere,
        _sum: { budget: true },
      }),
      this.prisma.leadSnapshot.count({
        where: {
          ...combinedWhere,
          status: { contains: '142' } // simplistic check for 'won' status ID
        }
      }),
      isPartner ? Promise.resolve(1) : this.prisma.partner.count({ where: { isActive: true } }),
      this.prisma.leadSnapshot.count({
        where: {
          ...where,
          createdAtSource: { gte: startDate, lte: endDate },
        }
      })
    ]);

    // Add Total Earned from Commissions
    const commissions = await this.prisma.commission.aggregate({
      where: isPartner ? { partnerId } : {},
      _sum: { amount: true }
    });
    const totalEarned = Number(commissions._sum.amount || 0);

    // 2. Bar Chart Data (Leads per day for the period, up to 30 days)
    const diffDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysToIterate = Math.min(diffDays, 30); // limit to 30 bars max

    const daysList = Array.from({ length: daysToIterate }).map((_, i) => {
      const date = subDays(endDate, daysToIterate - 1 - i);
      return {
        name: format(date, 'dd MMM'),
        dateStart: startOfDay(date),
        dateEnd: new Date(startOfDay(date).getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    });

    const barChartData = await Promise.all(
      daysList.map(async (day) => {
        const count = await this.prisma.leadSnapshot.count({
          where: {
            ...where,
            createdAtSource: {
              gte: day.dateStart,
              lte: day.dateEnd,
            },
          },
        });
        return { name: day.name, leads: count };
      }),
    );

    // 3. Area Chart Data (Won Revenue dynamic over time)
    const areaChartData = await Promise.all(
      daysList.map(async (day) => {
        const aggr = await this.prisma.leadSnapshot.aggregate({
          where: {
            ...where,
            status: { contains: '142' },
            updatedAtSource: {
              gte: day.dateStart,
              lte: day.dateEnd,
            },
          },
          _sum: { budget: true },
        });
        return { name: day.name, wonValue: Number(aggr._sum.budget || 0) };
      }),
    );

    // 4. Latest Events (Transforming from latest leads history for MVP)
    const latestLeads = await this.prisma.leadSnapshot.findMany({
      where: combinedWhere,
      orderBy: { updatedAtSource: 'desc' },
      take: 10,
      include: { partner: true },
    });

    const recentEvents = latestLeads.map((l, index) => {
      const isWon = l.status.includes('142');
      return {
        id: l.externalLeadId.toString(),
        date: l.updatedAtSource.toISOString(),
        user: { name: l.brokerName || 'Менеджер', avatar: null, isSystem: false },
        tag: { label: isWon ? 'Успешно' : 'Изменение', type: isWon ? 'greenText' : 'blue' },
        text: isWon ? 'Сделка закрыта успешно' : 'Сделка перешла в новый статус',
        target: l.contactName || 'Клиент',
        highlight: isWon
      };
    });

    return {
      stats: {
        totalLeads: totalLeads,
        wonDeals: wonDealsCount,
        revenue: totalRevenue._sum.budget || 0,
        activePartners: activePartnersCount,
        totalEarned: totalEarned
      },
      charts: {
        barChart: barChartData,
        areaChart: areaChartData,
      },
      latestLeads: latestLeads.map(l => ({
        id: l.id.toString(),
        clientName: l.contactName || 'No Name',
        date: l.updatedAtSource,
        price: l.budget,
        category: l.comment || 'General',
        product: l.title,
        city: l.city || 'Dubai',
        status: l.status.split(':')[1] || l.status,
      })),
      recentEvents
    };
  }
}
