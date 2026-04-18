import { HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';

describe('LeadsService partner scope', () => {
  it('requires partner_id for admin in leads list', async () => {
    const prisma = {
      $transaction: jest.fn(),
      partnerTag: { findMany: jest.fn() },
      partnerSource: { findMany: jest.fn() },
      leadSnapshot: { count: jest.fn(), findMany: jest.fn() },
    } as any;

    const config = { get: jest.fn() } as any;
    const redis = { get: jest.fn(), set: jest.fn(), del: jest.fn() } as any;

    const service = new LeadsService(prisma, config, redis);

    await expect(
      service.getLeads(
        { page: 1, page_size: 20 },
        {
          id: 'admin-1',
          email: 'admin@test.com',
          role: 'admin',
          partnerId: null,
        },
      ),
    ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
  });
});
