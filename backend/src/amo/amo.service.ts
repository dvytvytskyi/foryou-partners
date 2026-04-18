import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';

const AMO_ACCESS_TOKEN_CACHE_KEY = 'amo:access_token';
const AMO_REFRESH_TOKEN_CACHE_KEY = 'amo:refresh_token';

type AmoLead = {
  externalLeadId: bigint;
  title: string;
  status: string;
  budget: number | null;
  city: string | null;
  comment: string | null;
  source: string | null;
  tagIds: bigint[];
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  updatedAt: Date;
  createdAt: Date;
};

@Injectable()
export class AmoService {
  private readonly logger = new Logger(AmoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  getConnectUrl(): string {
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const clientId = this.configService.getOrThrow<string>('AMO_CLIENT_ID');
    const redirectUri = this.configService.getOrThrow<string>('AMO_REDIRECT_URI');
    const state = `${Date.now()}`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `https://www.amocrm.ru/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<void> {
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const clientId = this.configService.getOrThrow<string>('AMO_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>('AMO_CLIENT_SECRET');
    const redirectUri = this.configService.getOrThrow<string>('AMO_REDIRECT_URI');

    const response = await fetch(`https://${domain}/oauth2/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${text}`);
    }

    const body = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!body.access_token) {
      throw new Error('No access_token in response');
    }

    const ttl = Math.max((body.expires_in ?? 900) - 30, 60);
    await this.redis.set(AMO_ACCESS_TOKEN_CACHE_KEY, body.access_token, 'EX', ttl);

    if (body.refresh_token) {
      await this.redis.set(AMO_REFRESH_TOKEN_CACHE_KEY, body.refresh_token);
      this.logger.log('amoCRM refresh token stored in Redis');
    }

    this.logger.log(`amoCRM tokens obtained. Access TTL: ${ttl}s`);
  }

  async runBackfill(): Promise<{
    total_fetched: number;
    total_upserted: number;
    total_skipped: number;
    pages: number;
    duration_ms: number;
  }> {
    const start = Date.now();
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No amoCRM access token. Please connect via /api/v1/amo-crm/connect first.');
    }

    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    let page = 1;
    let totalFetched = 0;
    let totalUpserted = 0;
    let totalSkipped = 0;
    let hasMore = true;
    const pageCount = { value: 0 };

    while (hasMore) {
      const url = `https://${domain}/api/v4/leads?with=contacts,tags,custom_fields_values&limit=250&page=${page}&order[updated_at]=asc`;

      let response: Response;
      try {
        response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (err) {
        this.logger.error(`Backfill fetch error on page ${page}: ${err}`);
        break;
      }

      if (response.status === 204 || response.status === 404) {
        // No more leads
        hasMore = false;
        break;
      }

      if (!response.ok) {
        this.logger.error(`amoCRM API returned ${response.status} on page ${page}`);
        break;
      }

      const data = (await response.json()) as {
        _embedded?: { leads?: unknown[] };
        _links?: { next?: { href?: string } };
      };

      const rawLeads: unknown[] = data._embedded?.leads ?? [];
      if (rawLeads.length === 0) {
        hasMore = false;
        break;
      }

      pageCount.value = page;
      totalFetched += rawLeads.length;

      const leads: AmoLead[] = [];
      for (const raw of rawLeads) {
        const lead = this.normalizeApiLead(raw);
        if (lead) leads.push(lead);
      }

      const { upserted, skipped } = await this.processLeads(leads);
      totalUpserted += upserted;
      totalSkipped += skipped;

      this.logger.log(`Backfill page ${page}: fetched=${rawLeads.length} upserted=${upserted} skipped=${skipped}`);

      // Check if there's a next page
      hasMore = !!data._links?.next?.href;
      page++;

      // Rate limit: max 7 req/sec → ~145ms between requests
      await this.sleep(150);
    }

    const duration = Date.now() - start;
    this.logger.log(`Backfill complete: fetched=${totalFetched} upserted=${totalUpserted} skipped=${totalSkipped} pages=${pageCount.value} duration=${duration}ms`);

    return {
      total_fetched: totalFetched,
      total_upserted: totalUpserted,
      total_skipped: totalSkipped,
      pages: pageCount.value,
      duration_ms: duration,
    };
  }

  private async processLeads(leads: AmoLead[]): Promise<{ upserted: number; skipped: number }> {
    let upserted = 0;
    let skipped = 0;

    for (const lead of leads) {
      const partnerIds = await this.resolvePartnerIdsForLead(lead);
      if (partnerIds.length === 0) {
        skipped++;
        continue;
      }

      for (const partnerId of partnerIds) {
        const existing = await this.prisma.leadSnapshot.findUnique({
          where: {
            externalLeadId_partnerId: {
              externalLeadId: lead.externalLeadId,
              partnerId,
            },
          },
          select: { status: true },
        });

        await this.prisma.leadSnapshot.upsert({
          where: {
            externalLeadId_partnerId: {
              externalLeadId: lead.externalLeadId,
              partnerId,
            },
          },
          update: {
            title: lead.title,
            status: lead.status,
            budget: lead.budget,
            city: lead.city,
            comment: lead.comment,
            amocrmSource: lead.source,
            tagIds: lead.tagIds,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            updatedAtSource: lead.updatedAt,
            syncedAt: new Date(),
          },
          create: {
            externalLeadId: lead.externalLeadId,
            partnerId,
            title: lead.title,
            status: lead.status,
            budget: lead.budget,
            city: lead.city,
            comment: lead.comment,
            amocrmSource: lead.source,
            tagIds: lead.tagIds,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            updatedAtSource: lead.updatedAt,
            syncedAt: new Date(),
          },
        });

        // Record status history if status changed or it's a new record
        const fromStatus = existing?.status ?? null;
        if (!existing || fromStatus !== lead.status) {
          await this.prisma.leadStatusHistory.create({
            data: {
              externalLeadId: lead.externalLeadId,
              partnerId,
              fromStatus,
              toStatus: lead.status,
              changedAt: lead.updatedAt,
              changedBy: 'backfill',
            },
          });
        }
      }

      upserted++;
    }

    return { upserted, skipped };
  }

  private async resolvePartnerIdsForLead(lead: AmoLead): Promise<string[]> {
    const activePartners = await this.prisma.partner.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activePartners.length) return [];

    const partnerIds = activePartners.map((p) => p.id);

    const [sources, tags] = await this.prisma.$transaction([
      this.prisma.partnerSource.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmSource: true },
      }),
      this.prisma.partnerTag.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmTagId: true },
      }),
    ]);

    const matched = new Set<string>();

    if (lead.source) {
      for (const s of sources) {
        if (s.amocrmSource === lead.source) {
          matched.add(s.partnerId);
        }
      }
    }

    if (lead.tagIds.length) {
      const leadTagSet = new Set(lead.tagIds.map((x) => x.toString()));
      for (const t of tags) {
        if (leadTagSet.has(t.amocrmTagId.toString())) {
          matched.add(t.partnerId);
        }
      }
    }

    return Array.from(matched);
  }

  private normalizeApiLead(raw: unknown): AmoLead | null {
    if (!raw || typeof raw !== 'object') return null;
    const lead = raw as Record<string, unknown>;

    const id = lead['id'];
    if (id === undefined || id === null) return null;

    let externalLeadId: bigint;
    try {
      externalLeadId = BigInt(String(id));
    } catch {
      return null;
    }

    const statusId = this.toNum(lead['status_id']);
    const pipelineId = this.toNum(lead['pipeline_id']);
    const status = statusId ? `${pipelineId ?? 0}:${statusId}` : 'unknown';

    const source = this.extractCustomFieldString(lead, 'Источник') ?? null;
    const city = this.extractCustomFieldString(lead, 'Город') ?? null;
    const comment = this.extractCustomFieldString(lead, 'Комментарий') ?? null;

    const tagIds = this.extractTagIds(lead);

    // Extract main contact from _embedded.contacts
    const embedded = lead['_embedded'] as Record<string, unknown> | undefined;
    const contacts = (embedded?.['contacts'] as unknown[]) ?? [];
    let contactName: string | null = null;
    let contactPhone: string | null = null;
    let contactEmail: string | null = null;

    for (const c of contacts) {
      if (!c || typeof c !== 'object') continue;
      const contact = c as Record<string, unknown>;
      const isMain = contact['is_main'] === true;
      if (!contactName || isMain) {
        contactName = this.toStr(contact['name']);
        // phones/emails in custom_fields_values of contact
        const cfv = (contact['custom_fields_values'] as unknown[]) ?? [];
        for (const field of cfv) {
          if (!field || typeof field !== 'object') continue;
          const f = field as Record<string, unknown>;
          const code = this.toStr(f['field_code']);
          const values = (f['values'] as unknown[]) ?? [];
          const firstVal = values[0] as Record<string, unknown> | undefined;
          if (code === 'PHONE' && !contactPhone) {
            contactPhone = this.toStr(firstVal?.['value']);
          }
          if (code === 'EMAIL' && !contactEmail) {
            contactEmail = this.toStr(firstVal?.['value']);
          }
        }
      }
      if (isMain) break;
    }

    const updatedAt = this.toTimestamp(lead['updated_at']);
    const createdAt = this.toTimestamp(lead['created_at']);

    return {
      externalLeadId,
      title: this.toStr(lead['name']) ?? `Lead ${String(externalLeadId)}`,
      status,
      budget: this.toNum(lead['price']),
      city,
      comment,
      source,
      tagIds,
      contactName,
      contactPhone,
      contactEmail,
      updatedAt,
      createdAt,
    };
  }

  private extractTagIds(raw: Record<string, unknown>): bigint[] {
    const tagsArr = raw['tags'] as unknown[];
    if (!Array.isArray(tagsArr)) return [];
    const out: bigint[] = [];
    for (const tag of tagsArr) {
      if (!tag || typeof tag !== 'object') continue;
      const tid = (tag as Record<string, unknown>)['id'];
      if (tid === undefined || tid === null) continue;
      try {
        out.push(BigInt(String(tid)));
      } catch {
        // ignore
      }
    }
    return out;
  }

  private extractCustomFieldString(raw: Record<string, unknown>, fieldName: string): string | undefined {
    const values = raw['custom_fields_values'];
    if (!Array.isArray(values)) return undefined;
    for (const field of values) {
      if (!field || typeof field !== 'object') continue;
      const f = field as Record<string, unknown>;
      if (f['field_name'] !== fieldName) continue;
      const fvs = f['values'];
      if (!Array.isArray(fvs) || fvs.length === 0) continue;
      const first = fvs[0] as Record<string, unknown>;
      const val = this.toStr(first?.['value']);
      if (val) return val;
    }
    return undefined;
  }

  private toNum(v: unknown): number | null {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  private toStr(v: unknown): string | null {
    if (v === null || v === undefined || v === '') return null;
    return String(v);
  }

  private toTimestamp(v: unknown): Date {
    if (!v) return new Date();
    const n = Number(v);
    if (!isNaN(n) && n > 0) return new Date(n * 1000);
    if (typeof v === 'string') {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }

  private async getAccessToken(): Promise<string | null> {
    const envToken = this.configService.get<string>('AMO_ACCESS_TOKEN');
    if (envToken) return envToken;

    const cached = await this.redis.get(AMO_ACCESS_TOKEN_CACHE_KEY);
    if (cached) return cached;

    // Try refresh
    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string | null> {
    const domain = this.configService.get<string>('AMO_DOMAIN');
    const clientId = this.configService.get<string>('AMO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AMO_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('AMO_REDIRECT_URI');
    const refreshToken = await this.redis.get(AMO_REFRESH_TOKEN_CACHE_KEY)
      ?? this.configService.get<string>('AMO_REFRESH_TOKEN');

    if (!domain || !clientId || !clientSecret || !redirectUri || !refreshToken) {
      return null;
    }

    let response: Response;
    try {
      response = await fetch(`https://${domain}/oauth2/access_token`, {
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
    } catch (err) {
      this.logger.warn(`Token refresh request failed: ${err}`);
      return null;
    }

    if (!response.ok) {
      this.logger.warn(`Token refresh failed: ${response.status}`);
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
