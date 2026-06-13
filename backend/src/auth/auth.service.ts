import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { EmailService } from '../common/email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AppException } from '../common/errors/app-exception';
import { JwtPayload } from './auth.types';
import { AmoService } from '../amo/amo.service';

const RESET_TOKEN_TTL_SECONDS = 3600; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly emailService: EmailService,
    private readonly amoService: AmoService,
  ) {}

  async register(dto: RegisterDto) {
    // Ensure email is unique
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new AppException('VALIDATION_ERROR', 'User already exists', HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const partner = await this.prisma.partner.create({
      data: {
        name: `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || dto.email.split('@')[0],
        country: dto.country,
        direction: dto.direction,
        partnerType: dto.partnerType,
        referredById: dto.referredById || null,
        isActive: false, // Must be approved by admin!
      }
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: 'partner_user' as const,
        isActive: false,
        partnerId: partner.id,
      },
    });

    try {
      await this.amoService.createPartnerRegistrationLead({
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        country: dto.country,
        direction: dto.direction,
        partnerType: dto.partnerType,
        referredById: dto.referredById,
      });
    } catch (e) {
      // Don't fail the registration if AmoCRM integration fails
      console.error('Failed to create AmoCRM lead on registration', e);
    }

    // Return minimal user data (front‑end can auto‑login if desired)
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto, userAgent?: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!user || !user.isActive) {
      throw new AppException('AUTH_INVALID_CREDENTIALS', 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppException('AUTH_INVALID_CREDENTIALS', 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      partnerId: user.partnerId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.getAccessTtl(),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getRefreshTtl(),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshExpiresAt = this.getRefreshExpirationDate();

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: refreshExpiresAt,
        userAgent,
        ip,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.parseTtlToSeconds(this.getAccessTtl()),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        partner_id: user.partnerId,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new AppException('AUTH_TOKEN_EXPIRED', 'Refresh token invalid or expired', HttpStatus.UNAUTHORIZED);
    }

    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    let matchedSessionId: string | null = null;
    for (const session of sessions) {
      const ok = await bcrypt.compare(dto.refresh_token, session.refreshTokenHash);
      if (ok) {
        matchedSessionId = session.id;
        break;
      }
    }

    if (!matchedSessionId) {
      await this.prisma.refreshSession.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new AppException('AUTH_FORBIDDEN', 'Refresh token reuse detected', HttpStatus.FORBIDDEN);
    }

    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      partnerId: payload.partnerId,
    };

    const accessToken = await this.jwtService.signAsync(newPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.getAccessTtl(),
    });

    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getRefreshTtl(),
    });

    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.$transaction([
      this.prisma.refreshSession.update({
        where: { id: matchedSessionId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshSession.create({
        data: {
          userId: payload.sub,
          refreshTokenHash: newRefreshHash,
          expiresAt: this.getRefreshExpirationDate(),
        },
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: this.parseTtlToSeconds(this.getAccessTtl()),
    };
  }

  async logout(dto: LogoutDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      return;
    }

    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
      },
    });

    for (const session of sessions) {
      const ok = await bcrypt.compare(dto.refresh_token, session.refreshTokenHash);
      if (ok) {
        await this.prisma.refreshSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return accepted — never reveal if email exists
    if (!user || !user.isActive) {
      return { accepted: true };
    }

    const token = randomBytes(32).toString('hex');
    await this.redis.set(
      `reset:${token}`,
      user.id,
      'EX',
      RESET_TOKEN_TTL_SECONDS,
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.send({
      to: user.email,
      subject: 'Відновлення паролю — For You Real Estate',
      text: `Перейдіть за посиланням для відновлення паролю: ${resetLink}\n\nПосилання дійсне 1 годину.`,
      html: `
        <p>Для відновлення паролю перейдіть за посиланням:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Посилання дійсне протягом 1 години.</p>
        <p>Якщо ви не запитували відновлення паролю — ігноруйте цей лист.</p>
      `,
    });

    return { accepted: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const userId = await this.redis.get(`reset:${dto.token}`);
    if (!userId) {
      throw new AppException(
        'AUTH_TOKEN_EXPIRED',
        'Reset token is invalid or expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordHash = await bcrypt.hash(dto.new_password, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate token and all refresh sessions for this user
    await Promise.all([
      this.redis.del(`reset:${dto.token}`),
      this.prisma.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private getRefreshExpirationDate(): Date {
    const seconds = this.parseTtlToSeconds(this.getRefreshTtl());
    return new Date(Date.now() + seconds * 1000);
  }

  private getAccessTtl(): string {
    return this.configService.get<string>('JWT_ACCESS_TTL', '7d');
  }

  private getRefreshTtl(): string {
    return this.configService.get<string>('JWT_REFRESH_TTL', '30d');
  }

  private parseTtlToSeconds(ttl: string): number {
    const value = ttl.trim();
    if (!value) return 7 * 24 * 60 * 60;

    if (/^\d+$/.test(value)) {
      return Number(value);
    }

    const m = value.match(/^(\d+)\s*([smhd])$/i);
    if (!m) {
      return 7 * 24 * 60 * 60;
    }

    const amount = Number(m[1]);
    const unit = m[2].toLowerCase();

    if (unit === 's') return amount;
    if (unit === 'm') return amount * 60;
    if (unit === 'h') return amount * 60 * 60;
    return amount * 24 * 60 * 60;
  }
}
