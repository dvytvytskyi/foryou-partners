import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AppException } from '../common/errors/app-exception';

describe('AuthService.refresh', () => {
  it('revokes all sessions and throws AUTH_FORBIDDEN on token reuse', async () => {
    const mismatchedHash = await bcrypt.hash('some-other-token', 10);

    const prisma = {
      refreshSession: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'session-1',
            refreshTokenHash: mismatchedHash,
            createdAt: new Date(),
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: jest.fn(),
    } as any;

    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-1',
        email: 'u@test.com',
        role: 'partner_user',
        partnerId: 'partner-1',
      }),
      signAsync: jest.fn(),
    } as any;

    const config = {
      get: jest.fn((key: string) => (key === 'JWT_REFRESH_SECRET' ? 'x'.repeat(32) : undefined)),
    } as any;

    const redis = { get: jest.fn(), set: jest.fn(), del: jest.fn() } as any;
    const emailService = { send: jest.fn() } as any;

    const amoService = { createPartnerRegistrationLead: jest.fn() } as any;
    const service = new AuthService(prisma, jwtService, config, redis, emailService, amoService);

    let thrown: unknown;
    try {
      await service.refresh({ refresh_token: 'incoming-refresh-token' });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AppException);
    expect(thrown).toMatchObject({ status: HttpStatus.FORBIDDEN });

    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
