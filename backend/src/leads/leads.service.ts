import { HttpStatus, Injectable, Inject, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { GetLeadsDto } from './dto/get-leads.dto';
import { AppException } from '../common/errors/app-exception';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../redis/redis.constants';

type AmoPipelineStatus = {
  id: number;
  name: string;
  sort: number;
};

type AmoPipeline = {
  id: number;
  name: string;
  sort: number;
  statuses: AmoPipelineStatus[];
};

const AMO_PIPELINES_CACHE_KEY = 'amo:pipelines:v1';
const AMO_PIPELINES_CACHE_TTL_SECONDS = 120;
const AMO_ACCESS_TOKEN_CACHE_KEY = 'amo:access_token';
const AMO_REFRESH_TOKEN_CACHE_KEY = 'amo:refresh_token';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

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

  async getLeadsBoard(dto: GetLeadsDto, user: AuthenticatedUser) {
    const partnerId = this.resolvePartnerId(user, dto.partner_id);
    const visibilityFilter = await this.buildVisibilityFilter(partnerId);

    if (!visibilityFilter) {
      return {
        pipelines: [],
        unassigned: { count: 0, items: [] },
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

    const leads = await this.prisma.leadSnapshot.findMany({
      where,
      orderBy: { updatedAtSource: dto.sort_dir ?? 'desc' },
      take: dto.board_limit ?? 500,
    });

    const cards = leads.map((row) => ({
      id: String(row.externalLeadId),
      title: row.title,
      status: row.status,
      budget: row.budget ? Number(row.budget) : null,
      city: row.city,
      contact_name: row.contactName,
      broker_name: row.brokerName,
      updated_at: row.updatedAtSource.toISOString(),
    }));

    const pipelines = await this.fetchAmoPipelines();
    if (!pipelines.length) {
      return {
        pipelines: [
          {
            id: 'fallback',
            name: 'Default pipeline',
            sort: 0,
            columns: this.buildFallbackColumns(cards),
          },
        ],
        unassigned: { count: 0, items: [] },
      };
    }

    const pipelineBuckets = pipelines.map((p) => ({
      id: String(p.id),
      name: p.name,
      sort: p.sort,
      columns: p.statuses
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((s) => ({
          id: String(s.id),
          name: s.name,
          sort: s.sort,
          count: 0,
          items: [] as typeof cards,
        })),
    }));

    const statusToColumn = new Map<string, { pipelineId: string; statusId: string }>();
    for (const p of pipelineBuckets) {
      for (const c of p.columns) {
        statusToColumn.set(c.name.trim().toLowerCase(), { pipelineId: p.id, statusId: c.id });
      }
    }

    const unassigned: typeof cards = [];
    for (const card of cards) {
      const key = card.status.trim().toLowerCase();
      const target = statusToColumn.get(key);
      if (!target) {
        unassigned.push(card);
        continue;
      }

      const pipeline = pipelineBuckets.find((p) => p.id === target.pipelineId);
      const column = pipeline?.columns.find((c) => c.id === target.statusId);
      if (!column) {
        unassigned.push(card);
        continue;
      }

      column.items.push(card);
      column.count += 1;
    }

    return {
      pipelines: pipelineBuckets,
      unassigned: {
        count: unassigned.length,
        items: unassigned,
      },
      meta: {
        total_cards: cards.length,
        board_limit: dto.board_limit ?? 500,
        pipelines_source: 'amocrm_live',
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

  private buildFallbackColumns(cards: Array<{ id: string; title: string; status: string; budget: number | null; city: string | null; contact_name: string | null; broker_name: string | null; updated_at: string }>) {
    const byStatus = new Map<string, typeof cards>();
    for (const card of cards) {
      const key = card.status || 'Unknown';
      if (!byStatus.has(key)) byStatus.set(key, []);
      byStatus.get(key)!.push(card);
    }

    return Array.from(byStatus.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([status, items], idx) => ({
        id: `fallback-${idx + 1}`,
        name: status,
        sort: idx,
        count: items.length,
        items,
      }));
  }

  private async fetchAmoPipelines(): Promise<AmoPipeline[]> {
    const cached = await this.redis.get(AMO_PIPELINES_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as AmoPipeline[];
      } catch {
        await this.redis.del(AMO_PIPELINES_CACHE_KEY);
      }
    }

    const apiDomain = this.configService.get<string>('AMO_API_DOMAIN');
    if (!apiDomain) return [];

    let accessToken = await this.getAmoAccessToken();
    if (!accessToken) return [];

    let response: Response;
    try {
      response = await this.fetchWithRetry(`https://${apiDomain}/api/v4/leads/pipelines`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      return [];
    }

    // Token can be expired — force refresh once and retry.
    if (response.status === 401) {
      accessToken = await this.getAmoAccessToken(true);
      if (!accessToken) return [];
      try {
        response = await this.fetchWithRetry(`https://${apiDomain}/api/v4/leads/pipelines`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch {
        return [];
      }
    }

    if (!response.ok) {
      this.logger.warn(`amoCRM pipelines request failed: status=${response.status}`);
      return [];
    }

    const data = (await response.json()) as {
      _embedded?: {
        pipelines?: Array<{
          id: number;
          name: string;
          sort: number;
          _embedded?: {
            statuses?: Array<{ id: number; name: string; sort: number }>;
          };
        }>;
      };
    };

    const pipelines = data._embedded?.pipelines ?? [];
    const normalized = pipelines
      .map((p) => ({
        id: p.id,
        name: p.name,
        sort: p.sort,
        statuses: (p._embedded?.statuses ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          sort: s.sort,
        })),
      }))
      .sort((a, b) => a.sort - b.sort);

    if (normalized.length) {
      await this.redis.set(
        AMO_PIPELINES_CACHE_KEY,
        JSON.stringify(normalized),
        'EX',
        AMO_PIPELINES_CACHE_TTL_SECONDS,
      );
    }

    return normalized;
  }

  private async getAmoAccessToken(forceRefresh = false): Promise<string | null> {
    const envAccessToken = this.configService.get<string>('AMO_ACCESS_TOKEN');
    if (!forceRefresh && envAccessToken) return envAccessToken;

    if (!forceRefresh) {
      const cachedAccessToken = await this.redis.get(AMO_ACCESS_TOKEN_CACHE_KEY);
      if (cachedAccessToken) return cachedAccessToken;
    }

    return this.refreshAmoAccessToken();
  }

  private async refreshAmoAccessToken(): Promise<string | null> {
    const domain = this.configService.get<string>('AMO_DOMAIN');
    const clientId = this.configService.get<string>('AMO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AMO_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('AMO_REDIRECT_URI');
    const envRefreshToken = this.configService.get<string>('AMO_REFRESH_TOKEN');
    const cachedRefreshToken = await this.redis.get(AMO_REFRESH_TOKEN_CACHE_KEY);
    const refreshToken = cachedRefreshToken || envRefreshToken;

    if (!domain || !clientId || !clientSecret || !redirectUri || !refreshToken) {
      return null;
    }

    let response: Response;
    try {
      response = await this.fetchWithRetry(`https://${domain}/oauth2/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          redirect_uri: redirectUri,
        }),
      });
    } catch {
      return null;
    }

    if (!response.ok) {
      this.logger.warn(`amoCRM token refresh failed: status=${response.status}`);
      return null;
    }

    const body = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!body.access_token) return null;

    const ttl = Math.max((body.expires_in ?? 900) - 30, 60);
    await this.redis.set(AMO_ACCESS_TOKEN_CACHE_KEY, body.access_token, 'EX', ttl);

    if (body.refresh_token) {
      await this.redis.set(AMO_REFRESH_TOKEN_CACHE_KEY, body.refresh_token);
    }

    return body.access_token;
  }

  private async fetchWithRetry(url: string, init: RequestInit, maxAttempts = 3): Promise<Response> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await fetch(url, init);
        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxAttempts) {
            const delay = this.getBackoffDelay(attempt);
            this.logger.warn(`External call retry ${attempt}/${maxAttempts} after status=${response.status}, delay=${delay}ms`);
            await this.sleep(delay);
            continue;
          }
        }
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          const delay = this.getBackoffDelay(attempt);
          this.logger.warn(`External call retry ${attempt}/${maxAttempts} after network error, delay=${delay}ms`);
          await this.sleep(delay);
          continue;
        }
      }
    }

    this.logger.error(`External call failed after ${maxAttempts} attempts: ${url}`);
    if (lastError instanceof Error) {
      throw lastError;
    }
    throw new Error('External call failed');
  }

  private getBackoffDelay(attempt: number): number {
    return 300 * 2 ** (attempt - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
