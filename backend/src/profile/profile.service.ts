import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AppException } from '../common/errors/app-exception';
import * as bcrypt from 'bcrypt';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partner: true,
        notificationPrefs: true,
      },
    });

    if (!user) {
      throw new AppException('AUTH_FORBIDDEN', 'User not found', HttpStatus.FORBIDDEN);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      partner: user.partner ? {
        id: user.partner.id,
        name: user.partner.name,
      } : null,
      notifications: {
        statusChange: user.notificationPrefs?.onStatusChange ?? true,
        brokerChange: user.notificationPrefs?.onBrokerChange ?? true,
        weeklySummary: user.notificationPrefs?.onWeeklySummary ?? false,
      }
    };
  }

  async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    return this.prisma.notificationPref.upsert({
      where: { userId },
      update: {
        onStatusChange: dto.statusChange,
        onBrokerChange: dto.brokerChange,
        onWeeklySummary: dto.weeklySummary,
      },
      create: {
        userId,
        onStatusChange: dto.statusChange,
        onBrokerChange: dto.brokerChange,
        onWeeklySummary: dto.weeklySummary,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException('AUTH_FORBIDDEN', 'User not found', HttpStatus.FORBIDDEN);
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppException('VALIDATION_ERROR', 'Incorrect current password', HttpStatus.BAD_REQUEST);
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }
}
