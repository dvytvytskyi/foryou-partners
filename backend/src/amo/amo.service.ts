import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';

const AMO_ACCESS_TOKEN_CACHE_KEY = 'amo:access_token';
const AMO_REFRESH_TOKEN_CACHE_KEY = 'amo:refresh_token';

export type AmoLead = {
  externalLeadId: bigint;
  title: string;
  status: string;
  budget: number | null;
  city: string | null;
  comment: string | null;
  source: string | null;
  pipelineId: bigint | null;
  tagIds: bigint[];
  mainContactId: bigint | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  brokerName: string | null;
  brokerPhone: string | null;
  brokerEmail: string | null;
  customFields: any;
  updatedAt: Date;
  createdAt: Date;
  responsibleUserId: number | null;
};

export type AmoContactInfo = {
  id: bigint;
  name: string | null;
  phone: string | null;
  email: string | null;
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

    const usersMap = await this.fetchAmoUsers(domain, accessToken);

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
        if (lead) {
          if (lead.responsibleUserId && usersMap.has(lead.responsibleUserId)) {
            const user = usersMap.get(lead.responsibleUserId)!;
            lead.brokerName = user.name;
            lead.brokerEmail = user.email;
          }
          leads.push(lead);
        }
      }

      const contactsById = await this.fetchContactsByIds(
        domain,
        accessToken,
        leads
          .map((lead) => lead.mainContactId)
          .filter((id): id is bigint => id !== null),
      );

      for (const lead of leads) {
        if (!lead.mainContactId) continue;
        const contact = contactsById.get(lead.mainContactId.toString());
        if (!contact) continue;

        if (!lead.contactName) {
          lead.contactName = contact.name;
        }
        if (!lead.contactPhone) {
          lead.contactPhone = contact.phone;
        }
        if (!lead.contactEmail) {
          lead.contactEmail = contact.email;
        }
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

  async syncLeadsByPipeline(pipelineId: number): Promise<void> {
    const start = Date.now();
    const accessToken = await this.getAccessToken();
    if (!accessToken) return;

    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    let page = 1;
    let hasMore = true;
    let totalFetched = 0;

    const usersMap = await this.fetchAmoUsers(domain, accessToken);

    while (hasMore) {
      const url = `https://${domain}/api/v4/leads?filter[pipeline_id][]=${pipelineId}&with=contacts,tags,custom_fields_values&limit=250&page=${page}`;
      
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 204 || response.status === 404) {
          hasMore = false;
          break;
        }

        if (!response.ok) break;

        const data = (await response.json()) as any;
        const rawLeads = data._embedded?.leads ?? [];
        if (rawLeads.length === 0) {
          hasMore = false;
          break;
        }

        totalFetched += rawLeads.length;
        const leads: AmoLead[] = [];
        for (const raw of rawLeads) {
          const lead = this.normalizeApiLead(raw);
          if (lead) {
            if (lead.responsibleUserId && usersMap.has(lead.responsibleUserId)) {
              const user = usersMap.get(lead.responsibleUserId)!;
              lead.brokerName = user.name;
              lead.brokerEmail = user.email;
            }
            leads.push(lead);
          }
        }

        const contactsById = await this.fetchContactsByIds(
          domain,
          accessToken,
          leads
            .map((lead) => lead.mainContactId)
            .filter((id): id is bigint => id !== null),
        );

        for (const lead of leads) {
          if (!lead.mainContactId) continue;
          const contact = contactsById.get(lead.mainContactId.toString());
          if (contact) {
            if (!lead.contactName) lead.contactName = contact.name;
            if (!lead.contactPhone) lead.contactPhone = contact.phone;
            if (!lead.contactEmail) lead.contactEmail = contact.email;
          }
        }

        await this.processLeads(leads);

        hasMore = !!data._links?.next?.href;
        page++;
        await this.sleep(150);
      } catch (err) {
        this.logger.error(`Error syncing pipeline ${pipelineId}: ${err}`);
        break;
      }
    }
    this.logger.log(`Pipeline ${pipelineId} sync complete: fetched=${totalFetched} duration=${Date.now() - start}ms`);
  }

  private async fetchAmoUsers(domain: string, accessToken: string): Promise<Map<number, { name: string; email: string }>> {
    const out = new Map<number, { name: string; email: string }>();
    try {
      const response = await fetch(`https://${domain}/api/v4/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return out;
      const data = (await response.json()) as { _embedded?: { users?: any[] } };
      const users = data._embedded?.users ?? [];
      for (const u of users) {
        out.set(Number(u.id), { name: u.name, email: u.email });
      }
    } catch (err) {
      this.logger.warn(`Failed to fetch amoCRM users: ${err}`);
    }
    return out;
  }

  async getCachedUsersMap(): Promise<Map<number, { name: string; email: string }>> {
    const CACHE_KEY = 'amo:users_map';
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      return new Map(data.map(([id, val]: [number, any]) => [id, val]));
    }

    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) return new Map();

    const usersMap = await this.fetchAmoUsers(domain, accessToken);
    if (usersMap.size > 0) {
      const serialized = JSON.stringify(Array.from(usersMap.entries()));
      await this.redis.set(CACHE_KEY, serialized, 'EX', 3600); // 1 hour cache
    }
    return usersMap;
  }
  async getCachedPipelines(): Promise<any[]> {
    const CACHE_KEY = 'amo:pipelines';
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const domain = this.configService.get<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();

    if (domain && accessToken) {
      try {
        const response = await fetch(`https://${domain}/api/v4/leads/pipelines`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json() as { _embedded?: { pipelines?: any[] } };
          const rawPipelines = data._embedded?.pipelines ?? [];
          const pipelines = rawPipelines.map((p) => ({
            id: p.id,
            name: p.name,
            sort: p.sort,
            statuses: (p._embedded?.statuses ?? []).map((s: any) => ({
              id: s.id,
              name: s.name,
              sort: s.sort,
              color: s.color,
            })),
          })).sort((a, b) => a.sort - b.sort);

          await this.redis.set(CACHE_KEY, JSON.stringify(pipelines), 'EX', 3600);
          return pipelines;
        } else {
          this.logger.error(`Failed to fetch pipelines: ${response.statusText}`);
        }
      } catch (err) {
        this.logger.error(`Error fetching pipelines: ${err}`);
      }
    }
    return [];
  }
  async getAvailableSources(): Promise<string[]> {
    const CACHE_KEY = 'amo:available_sources';
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const domain = this.configService.get<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();

    if (domain && accessToken) {
      try {
        const response = await fetch(`https://${domain}/api/v4/leads/custom_fields`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json() as { _embedded?: { custom_fields?: any[] } };
          const fields = data._embedded?.custom_fields ?? [];
          const sourceField = fields.find(f => 
            f.name?.trim() === 'Источник' || 
            f.field_name?.trim() === 'Источник' ||
            f.name?.toLowerCase() === 'source'
          );
          
          if (sourceField && sourceField.enums) {
            const sources = sourceField.enums.map((e: any) => e.value);
            this.logger.log(`Found ${sources.length} sources in amoCRM metadata`);
            await this.redis.set(CACHE_KEY, JSON.stringify(sources), 'EX', 3600);
            return sources;
          }
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch sources from amoCRM API: ${err}`);
      }
    }

    // Fallback: get unique sources from database
    const dbSources = await this.prisma.leadSnapshot.groupBy({
      by: ['amocrmSource'],
      where: { amocrmSource: { not: null } },
    });
    const sources = dbSources.map(s => s.amocrmSource!).filter(Boolean);
    if (sources.length > 0) {
      await this.redis.set(CACHE_KEY, JSON.stringify(sources), 'EX', 600);
    }
    return sources;
  }

  async getAvailableTags(): Promise<{ id: number, name: string }[]> {
    const CACHE_KEY = 'amo:available_tags';
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const domain = this.configService.get<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();

    if (domain && accessToken) {
      try {
        const response = await fetch(`https://${domain}/api/v4/leads/tags`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json() as { _embedded?: { tags?: any[] } };
          const tags = data._embedded?.tags ?? [];
          const mappedTags = tags.map(t => ({ id: t.id, name: t.name }));
          this.logger.log(`Found ${mappedTags.length} tags in amoCRM`);
          await this.redis.set(CACHE_KEY, JSON.stringify(mappedTags), 'EX', 3600);
          return mappedTags;
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch tags from amoCRM API: ${err}`);
      }
    }

    return [];
  }

  async syncLeadsBySource(sourceValues: string[]): Promise<{ upserted: number }> {
    if (sourceValues.length === 0) return { upserted: 0 };

    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) return { upserted: 0 };

    this.logger.log(`Starting targeted sync for sources: ${sourceValues.join(', ')}`);

    // Fetch field metadata to get enum IDs for source values
    const fieldId = 703131;
    const metadataRes = await fetch(`https://${domain}/api/v4/leads/custom_fields/${fieldId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!metadataRes.ok) {
      this.logger.error(`Failed to fetch metadata for field ${fieldId}: ${metadataRes.statusText}`);
      return { upserted: 0 };
    }
    
    const metadata = await metadataRes.json() as { enums?: { id: number, value: string }[] };
    const valueToIdMap = new Map<string, number>();
    metadata.enums?.forEach(e => valueToIdMap.set(e.value, e.id));

    let totalUpserted = 0;
    const usersMap = await this.getCachedUsersMap();

    for (const source of sourceValues) {
      const enumId = valueToIdMap.get(source);
      if (!enumId) {
        this.logger.warn(`Source value "${source}" not found in amoCRM metadata for field ${fieldId}`);
        continue;
      }

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `https://${domain}/api/v4/leads?query=${encodeURIComponent(source)}&with=contacts,tags,custom_fields_values&limit=250&page=${page}`;
        
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (response.status === 204) {
            hasMore = false;
            break;
          }

          if (!response.ok) {
            this.logger.error(`Failed to fetch leads for source ${source}: ${response.statusText}`);
            hasMore = false;
            break;
          }

          const data = await response.json() as { _embedded?: { leads?: any[] } };
          const rawLeads = data._embedded?.leads ?? [];
          
          if (rawLeads.length === 0) {
            hasMore = false;
            break;
          }

          const leads: AmoLead[] = [];
          for (const raw of rawLeads) {
            const lead = this.normalizeApiLead(raw);
            if (lead) {
              if (lead.responsibleUserId && usersMap.has(lead.responsibleUserId)) {
                const user = usersMap.get(lead.responsibleUserId)!;
                lead.brokerName = user.name;
                lead.brokerEmail = user.email;
              }
              leads.push(lead);
            }
          }

          const contactsById = await this.fetchContactsByIds(
            domain,
            accessToken,
            leads.filter(l => l.mainContactId && !l.contactPhone).map(l => l.mainContactId!)
          );

          for (const lead of leads) {
            if (lead.mainContactId && !lead.contactPhone) {
              const contact = contactsById.get(lead.mainContactId.toString());
              if (contact) {
                lead.contactName = contact.name;
                lead.contactPhone = contact.phone;
                lead.contactEmail = contact.email;
              }
            }
          }

          const { upserted } = await this.processLeads(leads);
          totalUpserted += upserted;

          if (rawLeads.length < 250) {
            hasMore = false;
          } else {
            page++;
            await this.sleep(150); // Rate limit
          }
        } catch (err) {
          this.logger.error(`Error during targeted sync for ${source}: ${err}`);
          hasMore = false;
        }
      }
    }

    this.logger.log(`Targeted sync complete. Total upserted: ${totalUpserted}`);
    return { upserted: totalUpserted };
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
            pipelineId: lead.pipelineId,
            tagIds: lead.tagIds,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            brokerName: lead.brokerName,
            brokerPhone: lead.brokerPhone,
            brokerEmail: lead.brokerEmail,
            customFields: lead.customFields,
            createdAtSource: lead.createdAt,
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
            pipelineId: lead.pipelineId,
            tagIds: lead.tagIds,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            brokerName: lead.brokerName,
            brokerPhone: lead.brokerPhone,
            brokerEmail: lead.brokerEmail,
            customFields: lead.customFields,
            createdAtSource: lead.createdAt,
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

    const [sources, tags, pipelines] = await this.prisma.$transaction([
      this.prisma.partnerSource.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmSource: true },
      }),
      this.prisma.partnerTag.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmTagId: true },
      }),
      this.prisma.partnerPipeline.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmPipelineId: true },
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

    if (lead.pipelineId) {
      const pId = lead.pipelineId.toString();
      for (const p of pipelines) {
        if (p.amocrmPipelineId.toString() === pId) {
          matched.add(p.partnerId);
        }
      }
    }

    if (matched.size > 0) {
      return Array.from(matched);
    }

    // No matches found
    return [];
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

    let mainContactId: bigint | null = null;
    let contactName: string | null = null;
    let contactPhone: string | null = null;
    let contactEmail: string | null = null;

    // 1. Try to find phone/email in lead's OWN custom fields (as seen in screenshot)
    const leadCfv = (lead['custom_fields_values'] as unknown[]) ?? [];
    for (const field of leadCfv) {
      if (!field || typeof field !== 'object') continue;
      const f = field as Record<string, unknown>;
      const code = this.toStr(f['field_code']);
      const fieldName = this.toStr(f['field_name']);
      const values = (f['values'] as unknown[]) ?? [];
      const firstVal = values[0] as Record<string, unknown> | undefined;
      const value = this.toStr(firstVal?.['value']);

      if (value && this.isPhoneField(code, fieldName)) {
        contactPhone = value;
      }
      if (value && this.isEmailField(code, fieldName)) {
        contactEmail = value;
      }
    }

    // 2. Extract main contact from _embedded.contacts and its details
    const embedded = lead['_embedded'] as Record<string, unknown> | undefined;
    const contacts = (embedded?.['contacts'] as unknown[]) ?? [];
    
    for (const c of contacts) {
      if (!c || typeof c !== 'object') continue;
      const contact = c as Record<string, unknown>;
      const isMain = contact['is_main'] === true || contacts.length === 1;

      if (!mainContactId || isMain) {
        const contactIdRaw = contact['id'];
        try {
          if (contactIdRaw !== undefined && contactIdRaw !== null) {
            mainContactId = BigInt(String(contactIdRaw));
          }
        } catch {
          // ignore invalid contact id
        }
      }
      
      if (!contactName || isMain) {
        contactName = this.toStr(contact['name']);
        
        // Contacts might also have phone/email in their own custom_fields_values
        const cfv = (contact['custom_fields_values'] as unknown[]) ?? [];
        for (const field of cfv) {
          if (!field || typeof field !== 'object') continue;
          const f = field as Record<string, unknown>;
          const code = this.toStr(f['field_code']);
          const fieldName = this.toStr(f['field_name']);
          const values = (f['values'] as unknown[]) ?? [];
          const firstVal = values[0] as Record<string, unknown> | undefined;
          const value = this.toStr(firstVal?.['value']);

          if (!contactPhone && value && this.isPhoneField(code, fieldName)) {
            contactPhone = value;
          }
          if (!contactEmail && value && this.isEmailField(code, fieldName)) {
            contactEmail = value;
          }
        }
      }
      if (isMain && contactPhone) break;
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
      pipelineId: pipelineId ? BigInt(pipelineId) : null,
      tagIds,
      mainContactId,
      contactName,
      contactPhone,
      contactEmail,
      brokerName: null, // Will be filled if available in _embedded
      brokerPhone: null,
      brokerEmail: null,
      customFields: lead['custom_fields_values'] || [],
      updatedAt,
      createdAt,
      responsibleUserId: this.toNum(lead['responsible_user_id']),
    };
  }

  async fetchContactsByIds(
    domain: string,
    accessToken: string,
    ids: bigint[],
  ): Promise<Map<string, AmoContactInfo>> {
    const uniqueIds = Array.from(new Set(ids.map((id) => id.toString())));
    if (!uniqueIds.length) {
      return new Map();
    }

    // amoCRM allows filtering contacts by ids; chunk to keep URL size safe.
    const CHUNK_SIZE = 80;
    const out = new Map<string, AmoContactInfo>();

    for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
      const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
      const params = new URLSearchParams();
      params.set('with', 'custom_fields_values');
      for (const id of chunk) {
        params.append('filter[id][]', id);
      }

      let response: Response;
      try {
        response = await fetch(`https://${domain}/api/v4/contacts?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (err) {
        this.logger.warn(`Contact fetch failed for ${chunk.length} ids: ${err}`);
        continue;
      }

      if (response.status === 204 || response.status === 404) {
        continue;
      }

      if (!response.ok) {
        this.logger.warn(`Contact fetch returned ${response.status}`);
        continue;
      }

      const body = (await response.json()) as {
        _embedded?: { contacts?: unknown[] };
      };

      const contacts = body._embedded?.contacts ?? [];
      for (const raw of contacts) {
        if (!raw || typeof raw !== 'object') continue;
        const contact = raw as Record<string, unknown>;
        const idRaw = contact['id'];
        if (idRaw === undefined || idRaw === null) continue;

        let id: bigint;
        try {
          id = BigInt(String(idRaw));
        } catch {
          continue;
        }

        const info = this.extractContactInfo(contact, id);
        out.set(id.toString(), info);
      }

      // Keep requests within amoCRM API limit.
      await this.sleep(150);
    }

    return out;
  }

  private extractContactInfo(raw: Record<string, unknown>, id: bigint): AmoContactInfo {
    let phone: string | null = null;
    let email: string | null = null;

    const cfv = (raw['custom_fields_values'] as unknown[]) ?? [];
    for (const field of cfv) {
      if (!field || typeof field !== 'object') continue;
      const f = field as Record<string, unknown>;
      const code = this.toStr(f['field_code']);
      const fieldName = this.toStr(f['field_name']);
      const values = (f['values'] as unknown[]) ?? [];
      const firstVal = values[0] as Record<string, unknown> | undefined;
      const value = this.toStr(firstVal?.['value']);
      if (!value) continue;

      if (!phone && this.isPhoneField(code, fieldName)) {
        phone = value;
      }
      if (!email && this.isEmailField(code, fieldName)) {
        email = value;
      }
    }

    return {
      id,
      name: this.toStr(raw['name']),
      phone,
      email,
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

  isPhoneField(code: string | null, fieldName: string | null): boolean {
    if (code?.toUpperCase() === 'PHONE') return true;
    const normalizedName = fieldName?.toLowerCase() ?? '';
    return normalizedName.includes('тел') || normalizedName.includes('phone');
  }

  isEmailField(code: string | null, fieldName: string | null): boolean {
    if (code?.toUpperCase() === 'EMAIL') return true;
    const normalizedName = fieldName?.toLowerCase() ?? '';
    return normalizedName.includes('email');
  }

  getAmoAccessTokenPublic(): Promise<string | null> {
    return this.getAccessToken();
  }

  async backfillLeadHistory(): Promise<{ processed: number; inserted: number }> {
    const domain = this.configService.get<string>('AMO_API_DOMAIN') || this.configService.get<string>('AMO_DOMAIN') || 'reforyou.amocrm.ru';
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No amoCRM access token. Please connect via /api/v1/amo-crm/connect first.');
    }

    // Fetch all lead external IDs from DB
    const snapshots = await this.prisma.leadSnapshot.findMany({
      select: { externalLeadId: true, partnerId: true },
    });

    if (snapshots.length === 0) return { processed: 0, inserted: 0 };

    // Group partner IDs per lead
    const leadPartnerMap = new Map<string, string[]>();
    for (const s of snapshots) {
      const key = String(s.externalLeadId);
      if (!leadPartnerMap.has(key)) leadPartnerMap.set(key, []);
      leadPartnerMap.get(key)!.push(s.partnerId);
    }

    const uniqueLeadIds = Array.from(leadPartnerMap.keys());
    const CHUNK = 50; // amoCRM allows filter[entity_id][] in batches
    let totalInserted = 0;

    for (let i = 0; i < uniqueLeadIds.length; i += CHUNK) {
      const chunk = uniqueLeadIds.slice(i, i + CHUNK);

      const qs = chunk.map(id => `filter[entity_id][]=${id}`).join('&');
      const url = `https://${domain}/api/v4/events?filter[entity]=lead&filter[type][]=lead_status_changed&${qs}&limit=250`;

      let response: Response;
      try {
        response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      } catch (e) {
        this.logger.warn(`[backfillHistory] fetch failed for chunk ${i}: ${e}`);
        continue;
      }

      if (!response.ok) {
        this.logger.warn(`[backfillHistory] amoCRM events returned ${response.status} for chunk ${i}`);
        continue;
      }

      const body = (await response.json()) as {
        _embedded?: {
          events?: Array<{
            id: string;
            type: string;
            entity_id: number;
            created_at: number;
            value_after?: Array<{ lead_status?: { id: number; pipeline_id: number } }>;
            value_before?: Array<{ lead_status?: { id: number; pipeline_id: number } }>;
          }>;
        };
      };

      const events = body._embedded?.events ?? [];

      for (const ev of events) {
        const externalLeadId = BigInt(ev.entity_id);
        const changedAt = new Date(ev.created_at * 1000);

        const afterStatus = ev.value_after?.[0]?.lead_status;
        const beforeStatus = ev.value_before?.[0]?.lead_status;

        const toStatus = afterStatus ? `${afterStatus.pipeline_id}:${afterStatus.id}` : null;
        const fromStatus = beforeStatus ? `${beforeStatus.pipeline_id}:${beforeStatus.id}` : null;

        if (!toStatus) continue;

        const partnerIds = leadPartnerMap.get(String(ev.entity_id)) ?? [];

        for (const partnerId of partnerIds) {
          const exists = await this.prisma.leadStatusHistory.findFirst({
            where: { externalLeadId, partnerId, changedAt },
            select: { id: true },
          });
          if (!exists) {
            await this.prisma.leadStatusHistory.create({
              data: {
                externalLeadId,
                partnerId,
                fromStatus,
                toStatus,
                changedAt,
                changedBy: 'history_backfill',
              },
            });
            totalInserted++;
          }
        }
      }

      // Rate limit: 7 req/sec
      await new Promise(r => setTimeout(r, 150));
    }

    return { processed: uniqueLeadIds.length, inserted: totalInserted };
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

  private async searchContactByPhone(phone: string): Promise<number | null> {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 5) return null;
    
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) return null;

    try {
      // Search by exact phone or generic query
      const url = `https://${domain}/api/v4/contacts?query=${encodeURIComponent(cleanPhone)}&limit=1`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.status === 204) return null;
      if (!response.ok) return null;

      const data = await response.json() as any;
      const contacts = data?._embedded?.contacts;
      if (contacts && contacts.length > 0) {
        return contacts[0].id;
      }
    } catch (e) {
      this.logger.warn(`Failed to search contact by phone: ${e}`);
    }
    return null;
  }

  async createAmoLead(dto: import('./dto/create-amo-lead.dto').CreateAmoLeadDto): Promise<{ externalLeadId: number }> {
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No amoCRM access token available.');
    }

    const leadCustomFields: any[] = [];
    if (dto.source) {
      leadCustomFields.push({
        field_id: 703131, // Источник
        values: [{ value: dto.source }],
      });
    }
    if (dto.city) {
      leadCustomFields.push({
        field_id: 1450539, // Location
        values: [{ value: dto.city }],
      });
    }
    if (dto.comment) {
      leadCustomFields.push({
        field_id: 1343875, // Комментарий
        values: [{ value: dto.comment }],
      });
    }
    if (dto.direction) {
      leadCustomFields.push({
        field_id: 1536048, // Направление
        values: [{ value: dto.direction }],
      });
    }
    if (dto.contactMethod) {
      leadCustomFields.push({
        field_id: 1536050, // Как связаться
        values: [{ value: dto.contactMethod }],
      });
    }
    if (dto.partnerName) {
      leadCustomFields.push({
        field_id: 1536052, // Название партнера
        values: [{ value: dto.partnerName }],
      });
    }

    const contactCustomFields: any[] = [];
    if (dto.phone) {
      contactCustomFields.push({
        field_code: 'PHONE',
        values: [{ value: dto.phone }],
      });
    }
    if (dto.email) {
      contactCustomFields.push({
        field_code: 'EMAIL',
        values: [{ value: dto.email }],
      });
    }

    const contactPayload: any = {};
    
    // First try to find existing contact to prevent DUBL issue
    let existingContactId: number | null = null;
    if (dto.phone) {
      existingContactId = await this.searchContactByPhone(dto.phone);
    }

    if (existingContactId) {
      contactPayload.id = existingContactId;
    } else {
      if (dto.name) contactPayload.name = dto.name;
      if (contactCustomFields.length > 0) {
        contactPayload.custom_fields_values = contactCustomFields;
      }
    }

    const leadPayload: any = {
      name: `Partners: ${dto.name}`,
      pipeline_id: 8696950,
      status_id: 70457446, // "ЗАЯВКА ПОЛУЧЕНА" instead of "ПАРТНЕРЫ"
    };
    if (dto.budget) leadPayload.price = dto.budget;
    if (leadCustomFields.length > 0) leadPayload.custom_fields_values = leadCustomFields;

    const embedded: any = {
      tags: [{ name: 'Partners Program' }]
    };
    if (Object.keys(contactPayload).length > 0) {
      embedded.contacts = [contactPayload];
    }
    if (dto.tagIds && dto.tagIds.length > 0) {
      embedded.tags = [...embedded.tags, ...dto.tagIds.map((id) => ({ id }))];
    }

    if (Object.keys(embedded).length > 0) {
      leadPayload._embedded = embedded;
    }

    const url = `https://${domain}/api/v4/leads/complex`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([leadPayload]),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`Failed to create lead in amoCRM: ${response.status} ${text}`);
      throw new Error(`Failed to create lead in amoCRM: ${response.statusText}`);
    }

    const data = await response.json();
    const createdId = data?.[0]?.id;
    if (!createdId) {
      throw new Error('Failed to retrieve created lead ID from amoCRM');
    }

    return { externalLeadId: createdId };
  }

  async getLeadNotes(leadId: number): Promise<any[]> {
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    const url = `https://${domain}/api/v4/leads/${leadId}/notes`;
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 204 || response.status === 404) return [];
      if (!response.ok) {
        this.logger.warn(`Failed to fetch notes for lead ${leadId}: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const notes = data?._embedded?.notes ?? [];
      
      // We only care about text notes (common) for the chat
      return notes
        .filter((n: any) => n.note_type === 'common' && n.params?.text)
        .map((n: any) => ({
          id: n.id,
          text: n.params.text,
          createdAt: new Date(n.created_at * 1000).toISOString(),
          createdBy: n.created_by, // user id in amocrm
        }))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (err) {
      this.logger.error(`Error fetching notes for lead ${leadId}: ${err}`);
      return [];
    }
  }

  async addLeadNote(leadId: number, text: string, authorName: string): Promise<void> {
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) throw new Error('No amoCRM access token available.');

    const payload = {
      entity_id: leadId,
      note_type: 'common',
      params: {
        text: `[От партнера ${authorName}]:\n${text}`
      }
    };

    const url = `https://${domain}/api/v4/leads/notes`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([payload]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Failed to add note to lead ${leadId}: ${response.status} ${errorText}`);
      throw new Error(`Failed to add note to amoCRM: ${response.statusText}`);
    }
  }

  async createPartnerRegistrationLead(dto: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    country?: string;
    direction?: string;
    partnerType?: string;
    referredById?: string;
  }): Promise<{ externalLeadId: number }> {
    const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No amoCRM access token available.');
    }

    const contactCustomFields: any[] = [];
    if (dto.phone) {
      contactCustomFields.push({
        field_code: 'PHONE',
        values: [{ value: dto.phone }],
      });
    }
    if (dto.email) {
      contactCustomFields.push({
        field_code: 'EMAIL',
        values: [{ value: dto.email }],
      });
    }

    const contactPayload: any = {};
    const fullName = `${dto.firstName || ''} ${dto.lastName || ''}`.trim();
    
    // Search existing contact to prevent duplicate issues
    let existingContactId: number | null = null;
    if (dto.phone) {
      existingContactId = await this.searchContactByPhone(dto.phone);
    }
    
    if (existingContactId) {
      contactPayload.id = existingContactId;
    } else {
      if (fullName) contactPayload.name = fullName;
      if (contactCustomFields.length > 0) {
        contactPayload.custom_fields_values = contactCustomFields;
      }
    }

    const leadPayload: any = {
      name: `Новый партнер: ${fullName}`,
      pipeline_id: 8600274, // Partners pipeline
      status_id: 71099310,  // "Заявка получена" stage
    };

    const leadCustomFields: any[] = [];
    if (dto.direction) {
      leadCustomFields.push({
        field_id: 1536048, // Направление 
        values: [{ value: dto.direction }],
      });
    }
    if (dto.country) {
      leadCustomFields.push({
        field_id: 1536416, // Страна
        values: [{ value: dto.country }],
      });
    }
    
    if (leadCustomFields.length > 0) {
      leadPayload.custom_fields_values = leadCustomFields;
    }

    // Construct comment to ensure all data is captured
    const commentParts = [
      `Имя: ${fullName}`,
      `Телефон: ${dto.phone || 'Не указан'}`,
      `Email: ${dto.email || 'Не указан'}`,
      `Страна: ${dto.country || 'Не указана'}`,
      `Направление: ${dto.direction || 'Не указано'}`,
      `Тип партнера: ${dto.partnerType || 'Не указан'}`,
    ];

    if (dto.referredById) {
      commentParts.push(`Запросил(а): Партнер с ID ${dto.referredById}`);
    }

    if (dto.partnerType) {
      leadCustomFields.push({
        field_id: 1499243, // Тип партнера
        values: [{ value: dto.partnerType }],
      });
    }

    leadCustomFields.push({
      field_id: 1343875, // Комментарий
      values: [{ value: commentParts.join('\n') }],
    });

    if (leadCustomFields.length > 0) leadPayload.custom_fields_values = leadCustomFields;

    const embedded: any = {
      tags: [{ name: 'New Partner Registration' }]
    };
    if (Object.keys(contactPayload).length > 0) {
      embedded.contacts = [contactPayload];
    }

    if (Object.keys(embedded).length > 0) {
      leadPayload._embedded = embedded;
    }

    const url = `https://${domain}/api/v4/leads/complex`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([leadPayload]),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`Failed to create partner registration lead in amoCRM: ${response.status} ${text}`);
      throw new Error(`Failed to create partner registration lead in amoCRM: ${response.statusText}`);
    }

    const data = await response.json();
    const createdId = data?.[0]?.id;
    if (!createdId) {
      throw new Error('Failed to retrieve created lead ID from amoCRM');
    }

    return { externalLeadId: createdId };
  }
}

