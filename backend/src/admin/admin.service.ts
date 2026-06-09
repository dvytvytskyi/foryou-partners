import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AppException } from '../common/errors/app-exception';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

import { AmoService } from '../amo/amo.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amoService: AmoService,
  ) {}

  async getPartners() {
    const partners = await this.prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        users: true,
        sources: true,
      },
    });

    return {
      items: partners.map((p) => ({
        id: p.id,
        name: p.name,
        tag_ids: p.tags.map((t) => Number(t.amocrmTagId)),
        source_values: p.sources.map((s) => s.amocrmSource),
        labels: p.labels,
        users_count: p.users.length,
        is_active: p.isActive,
      })),
    };
  }

  async getUsers(role?: 'admin' | 'partner_user', page: number = 1, limit: number = 10) {
    const whereClause = role ? { role } : {};
    
    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          partner: {
            include: {
              _count: {
                select: { referrals: true },
              },
            },
          },
          refreshSessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return {
      items: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || (u.partner?.name) || '',
        phone: u.phone || '',
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        lastLogin: u.refreshSessions[0]?.createdAt || null,
        referralsCount: u.partner?._count?.referrals || 0,
        partnerId: u.partnerId,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppException('VALIDATION_ERROR', 'User not found', HttpStatus.NOT_FOUND);
    }
    
    await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });

    if (user.partnerId) {
      await this.prisma.partner.update({
        where: { id: user.partnerId },
        data: { isActive },
      });
    }

    return { success: true, isActive };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppException('VALIDATION_ERROR', 'User not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.refreshSession.deleteMany({ where: { userId: id } });
      await tx.notificationPref.deleteMany({ where: { userId: id } });
      await tx.ticketMessage.deleteMany({ where: { senderId: id } });
      await tx.auditLog.deleteMany({ where: { actorUserId: id } });
      await tx.user.delete({ where: { id } });
    });

    return { success: true };
  }

  async createPartner(dto: CreatePartnerDto) {
    const created = await this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          name: dto.name,
          labels: dto.labels || [],
          country: dto.country,
          direction: dto.direction,
          partnerType: dto.partnerType,
        },
      });

      if (dto.tag_ids.length > 0) {
        await tx.partnerTag.createMany({
          data: dto.tag_ids.map((tagId) => ({
            partnerId: partner.id,
            amocrmTagId: BigInt(tagId),
          })),
          skipDuplicates: true,
        });
      }

      if (dto.source_values?.length) {
        await tx.partnerSource.createMany({
          data: dto.source_values.map((source) => ({
            partnerId: partner.id,
            amocrmSource: source,
          })),
          skipDuplicates: true,
        });
      }

      if (dto.user) {
        const existingUser = await tx.user.findUnique({ where: { email: dto.user.email.toLowerCase() } });
        if (existingUser) {
          throw new AppException('VALIDATION_ERROR', 'User email already exists', HttpStatus.BAD_REQUEST);
        }

        await tx.user.create({
          data: {
            email: dto.user.email.toLowerCase(),
            passwordHash: await bcrypt.hash(dto.user.temp_password, 10),
            role: 'partner_user',
            partnerId: partner.id,
          },
        });
      }

      return partner;
    });

    // Trigger targeted sync AFTER transaction is committed
    if (dto.source_values?.length) {
      void this.amoService.syncLeadsBySource(dto.source_values);
    }

    return { id: created.id };
  }

  async updatePartner(id: string, dto: UpdatePartnerDto) {
    const exists = await this.prisma.partner.findUnique({ where: { id } });
    if (!exists) {
      throw new AppException('VALIDATION_ERROR', 'Partner not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.partner.update({
        where: { id },
        data: {
          name: dto.name,
          isActive: dto.is_active,
          labels: dto.labels,
          country: dto.country,
          direction: dto.direction,
          partnerType: dto.partnerType,
        },
      });

      if (dto.tag_ids) {
        await tx.partnerTag.deleteMany({ where: { partnerId: id } });
        if (dto.tag_ids.length > 0) {
          await tx.partnerTag.createMany({
            data: dto.tag_ids.map((tagId) => ({
              partnerId: id,
              amocrmTagId: BigInt(tagId),
            })),
            skipDuplicates: true,
          });
        }
      }

      if (dto.source_values) {
        await tx.partnerSource.deleteMany({ where: { partnerId: id } });
        if (dto.source_values.length > 0) {
          await tx.partnerSource.createMany({
            data: dto.source_values.map((source) => ({
              partnerId: id,
              amocrmSource: source,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    // Trigger targeted sync AFTER transaction is committed
    if (dto.source_values?.length) {
      void this.amoService.syncLeadsBySource(dto.source_values);
    }

    return {
      id,
      updated_at: new Date().toISOString(),
    };
  }

  async triggerManualSync() {
    return this.amoService.runBackfill();
  }

  async deletePartner(id: string) {
    const exists = await this.prisma.partner.findUnique({ where: { id } });
    if (!exists) {
      throw new AppException('VALIDATION_ERROR', 'Partner not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete associated data
      await tx.partnerTag.deleteMany({ where: { partnerId: id } });
      await tx.partnerSource.deleteMany({ where: { partnerId: id } });
      await tx.partnerPipeline.deleteMany({ where: { partnerId: id } });
      await tx.leadSnapshot.deleteMany({ where: { partnerId: id } });
      await tx.leadStatusHistory.deleteMany({ where: { partnerId: id } });
      
      // Delete users associated with this partner
      await tx.user.deleteMany({ where: { partnerId: id } });
      
      // Finally delete the partner
      await tx.partner.delete({ where: { id } });
    });

    return { success: true };
  }
}
