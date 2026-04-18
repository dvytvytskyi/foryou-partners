import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { GetLeadsDto } from './dto/get-leads.dto';
import { AppException } from '../common/errors/app-exception';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeads(dto: GetLeadsDto, user: AuthenticatedUser) {
    const partnerId = this.resolvePartnerId(user, dto.partner_id);
    const visibilityFilter = await this.buildVisibilityFilter(partnerId);

    if (!visibilityFilter) {
      return {
        items: [],
        pagination: {
          page: dto.page ?? 1,
          page_size: dto.page_size ?? 20,
          total: 0,
        },
      };
    }

    const where: Prisma.LeadSnapshotWhereInput = {
      partnerId,
      AND: [visibilityFilter],
    };

    if (dto.status?.length) where.status = { in: dto.status };
    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search, mode: 'insensitive' } },
        { contactName: { contains: dto.search, mode: 'insensitive' } },
      ];
    }
    if (dto.date_from || dto.date_to) {
      where.updatedAtSource = {
        gte: dto.date_from ? new Date(dto.date_from) : undefined,
        lte: dto.date_to ? new Date(dto.date_to) : undefined,
      };
    }

    const page = dto.page ?? 1;
    const pageSize = dto.page_size ?? 20;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.leadSnapshot.count({ where }),
      this.prisma.leadSnapshot.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          updatedAtSource: dto.sort_dir ?? 'desc',
        },
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: String(row.externalLeadId),
        title: row.title,
        status: row.status,
        budget: row.budget ? Number(row.budget) : null,
        city: row.city,
        contact_name: row.contactName,
        contact_phone: row.contactPhone,
        broker_name: row.brokerName,
        updated_at: row.updatedAtSource.toISOString(),
      })),
      pagination: {
        page,
        page_size: pageSize,
        total,
      },
    };
  }

  async getLeadById(id: string, user: AuthenticatedUser, partnerIdQuery?: string) {
    const partnerId = this.resolvePartnerId(user, partnerIdQuery);
    const visibilityFilter = await this.buildVisibilityFilter(partnerId);

    const externalLeadId = this.parseLeadId(id);
    const lead = await this.prisma.leadSnapshot.findFirst({
      where: {
        externalLeadId,
        partnerId,
        ...(visibilityFilter ? visibilityFilter : {}),
      },
    });

    if (!lead) {
      throw new AppException('LEAD_NOT_FOUND', 'Lead not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: String(lead.externalLeadId),
      title: lead.title,
      status: lead.status,
      created_at: lead.syncedAt.toISOString(),
      updated_at: lead.updatedAtSource.toISOString(),
      budget: lead.budget ? Number(lead.budget) : null,
      city: lead.city,
      comment: lead.comment,
      contact: {
        name: lead.contactName,
        phone: lead.contactPhone,
        email: lead.contactEmail,
      },
      broker: {
        name: lead.brokerName,
        phone: lead.brokerPhone,
        email: lead.brokerEmail,
      },
      tags: lead.tagIds.map((t) => String(t)),
      source: lead.amocrmSource,
    };
  }

  async getLeadHistory(id: string, user: AuthenticatedUser, partnerIdQuery?: string) {
    const partnerId = this.resolvePartnerId(user, partnerIdQuery);
    const externalLeadId = this.parseLeadId(id);

    const history = await this.prisma.leadStatusHistory.findMany({
      where: { externalLeadId, partnerId },
      orderBy: { changedAt: 'desc' },
    });

    return {
      items: history.map((h) => ({
        from_status: h.fromStatus,
        to_status: h.toStatus,
        changed_at: h.changedAt.toISOString(),
        changed_by: h.changedBy,
      })),
    };
  }

  private resolvePartnerId(user: AuthenticatedUser, partnerIdQuery?: string): string {
    if (user.role === 'admin') {
      if (!partnerIdQuery) {
        throw new AppException('VALIDATION_ERROR', 'partner_id is required for admin', HttpStatus.BAD_REQUEST);
      }
      return partnerIdQuery;
    }

    if (!user.partnerId) {
      throw new AppException('ACCESS_DENIED_PARTNER_SCOPE', 'Partner scope missing', HttpStatus.FORBIDDEN);
    }

    return user.partnerId;
  }

  private parseLeadId(id: string): bigint {
    try {
      return BigInt(id);
    } catch {
      throw new AppException('VALIDATION_ERROR', 'Invalid lead id', HttpStatus.BAD_REQUEST);
    }
  }

  private async buildVisibilityFilter(partnerId: string): Promise<Prisma.LeadSnapshotWhereInput | null> {
    const [tags, sources] = await this.prisma.$transaction([
      this.prisma.partnerTag.findMany({
        where: { partnerId },
        select: { amocrmTagId: true },
      }),
      this.prisma.partnerSource.findMany({
        where: { partnerId },
        select: { amocrmSource: true },
      }),
    ]);

    const tagIds = tags.map((t) => t.amocrmTagId);
    const sourceList = sources.map((s) => s.amocrmSource);

    if (tagIds.length === 0 && sourceList.length === 0) {
      return null;
    }

    return {
      OR: [
        ...(tagIds.length ? [{ tagIds: { hasSome: tagIds } }] : []),
        ...(sourceList.length ? [{ amocrmSource: { in: sourceList } }] : []),
      ],
    };
  }
}
