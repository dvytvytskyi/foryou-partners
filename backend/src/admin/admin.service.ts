import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AppException } from '../common/errors/app-exception';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
        users_count: p.users.length,
        is_active: p.isActive,
      })),
    };
  }

  async createPartner(dto: CreatePartnerDto) {
    const created = await this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          name: dto.name,
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

    return {
      id,
      updated_at: new Date().toISOString(),
    };
  }
}
