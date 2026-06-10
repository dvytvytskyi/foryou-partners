import { HttpStatus, Injectable, Inject, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { GetLeadsDto } from './dto/get-leads.dto';
import { AppException } from '../common/errors/app-exception';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { AmoService } from '../amo/amo.service';

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

const STATUS_NAME_MAP: Record<string, string> = {
  // System statuses
  '142': 'Успішно',
  '143': 'Відмова',
  '0': 'Не розібрано',

  // Pipeline 8696950 (Main / General)
  '8696950:74717798': 'Первинний контакт',
  '8696950:74717802': 'Переговори',
  '8696950:74717806': 'Прийняття рішення',
  '8696950:74717810': 'Завдаток',
  '8696950:142': 'Успішно',
  '8696950:143': 'Відмова / Архів',

  // Sales Pipeline (10651778)
  '10651778:83955614': 'Новий лід',
  '10651778:83955618': 'Первинний контакт',
  '10651778:83955622': 'Переговори',
  '10651778:83955626': 'Завдаток / Бронь',
  '10651778:83955630': 'Узгодження',
  '10651778:142': 'Успішно',
  '10651778:143': 'Відмова',

  // FB / Marketing Pipeline (8550470)
  '8550470:69436834': 'Новий лід (FB)',
  '8550470:69436838': 'В роботі',
  '8550470:143': 'Архів',

  // Site Pipeline (10120046)
  '10120046:80192646': 'Заявка з сайту',

  // Klykov Leads Pipeline (10776450)
  '10776450:84853590': 'СОЗДАН ЛИД',
  '10776450:84853926': 'ЗАЯВКА ПОЛУЧЕНА',
  '10776450:84853594': 'ЗАЯВКА ВЗЯТА В РАБОТУ',
  '10776450:84853930': 'УСТАНОВИТЬ КОНТАКТ',
  '10776450:84853934': 'КВАЛИФИКАЦИЯ ПРОЙДЕНА',
  '10776450:84853938': 'ПРЕЗЕНТАЦИЯ НАЗНАЧЕНА',
  '10776450:84853942': 'ПРЕЗЕНТАЦИЯ ПРОВЕДЕНА',
  '10776450:84853946': 'ВСТРЕЧА НАЗНАЧЕНА',
  '10776450:84853950': 'ВСТРЕЧА ПРОВЕДЕНА',
  '10776450:84853954': 'ВЫБОР ОБЪЕКТА',
  '10776450:84853958': 'ПРЕДЛОЖЕНИЕ / ОФФЕР',
  '10776450:84853962': 'СОГЛАСОВАНИЕ УСЛОВИЙ',
  '10776450:84853966': 'БРОНЬ / ЗАДАТОК',
  '10776450:84853970': 'ПОДГОТОВКА ДОКУМЕНТОВ',
  '10776450:84854454': 'КОНТРАКТ ПОДПИСАН',
  '10776450:84854458': 'ОЖИДАНИЕ ОПЛАТЫ',
  '10776450:142': 'УСПЕШНО РЕАЛИЗОВАНО',
  '10776450:143': 'ЗАКРЫТО И НЕ РЕАЛИЗОВАНО',
};

const KLYKOV_PIPELINE_STAGES = [
  '10776450:84853590',
  '10776450:84853926',
  '10776450:84853594',
  '10776450:84853930',
  '10776450:84853934',
  '10776450:84853938',
  '10776450:84853942',
  '10776450:84853946',
  '10776450:84853950',
  '10776450:84853954',
  '10776450:84853958',
  '10776450:84853962',
  '10776450:84853966',
  '10776450:84853970',
  '10776450:84854454',
  '10776450:84854458',
  '10776450:142',
  '10776450:143',
];

const STATUS_SORT_ORDER: Record<string, number> = {
  // 10776450
  '10776450:84853590': 1,
  '10776450:84853926': 2,
  '10776450:84853594': 3,
  '10776450:84853930': 4,
  '10776450:84853934': 5,
  '10776450:84853938': 6,
  '10776450:84853942': 7,
  '10776450:84853946': 8,
  '10776450:84853950': 9,
  '10776450:84853954': 10,
  '10776450:84853958': 11,
  '10776450:84853962': 12,
  '10776450:84853966': 13,
  '10776450:84853970': 14,
  '10776450:84854454': 15,
  '10776450:84854458': 16,
  '10776450:142': 100,
  '10776450:143': 101,
};

const PIPELINE_NAME_MAP: Record<string, string> = {
  '8696950': 'Загальна воронка',
  '10651778': 'Воронка продажів',
  '8550470': 'Facebook / Instagram',
  '10120046': 'Сайт',
  '10776450': 'KLYKOV LEADS',
  '10835598': 'Оренда',
};

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly amoService: AmoService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getLeads(dto: GetLeadsDto, user: AuthenticatedUser) {
    const partnerId = this.resolvePartnerId(user, dto.partner_id);
    const visibilityFilter = partnerId ? await this.buildVisibilityFilter(partnerId) : null;

    const page = dto.page ?? 1;
    const pageSize = dto.page_size ?? 20;

    const where: Prisma.LeadSnapshotWhereInput = {
      ...(visibilityFilter ? visibilityFilter : {}),
      ...(dto.pipeline_id ? { pipelineId: this.safeBigInt(dto.pipeline_id) } : {}),
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
        created_at: row.syncedAt.toISOString(),
        updated_at: row.updatedAtSource.toISOString(),
        last_edited: row.updatedAtSource.toISOString(),
      })),
      pagination: {
        page,
        page_size: pageSize,
        total,
      },
    };
  }

  async createLead(dto: import('./dto/create-lead.dto').CreateLeadDto, user: AuthenticatedUser) {
    const partnerId = this.resolvePartnerId(user);
    
    // Admins might test creating a lead without a partner context.
    if (!partnerId && user.role !== 'admin') {
      throw new AppException('ACCESS_DENIED_PARTNER_SCOPE', 'Partner scope missing', HttpStatus.FORBIDDEN);
    }

    let tagIds: number[] = [];
    let source: string | undefined = undefined;
    let partnerName = 'Admin';

    // Get partner tags and sources to attach to the lead automatically
    if (partnerId) {
      const [partner, tags, sources] = await this.prisma.$transaction([
        this.prisma.partner.findUnique({ where: { id: partnerId }, select: { name: true } }),
        this.prisma.partnerTag.findMany({ where: { partnerId } }),
        this.prisma.partnerSource.findMany({ where: { partnerId } }),
      ]);

      if (partner) partnerName = partner.name;
      tagIds = tags.map(t => Number(t.amocrmTagId));
      source = sources.length > 0 ? sources[0].amocrmSource : undefined;
    }

    try {
      const result = await this.amoService.createAmoLead({
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        budget: dto.budget,
        comment: dto.comment,
        city: dto.city,
        source: source,
        tagIds: tagIds,
        direction: dto.direction,
        contactMethod: dto.contactMethod,
        partnerName: partnerName,
      });

      // Immediately insert into LeadSnapshot to prevent 404 before webhook arrives
      let resolvedPartnerId = partnerId;
      if (!resolvedPartnerId) {
        const anyPartner = await this.prisma.partner.findFirst();
        if (anyPartner) resolvedPartnerId = anyPartner.id;
      }
      
      if (resolvedPartnerId) {
        await this.prisma.leadSnapshot.upsert({
          where: { externalLeadId_partnerId: { externalLeadId: result.externalLeadId, partnerId: resolvedPartnerId } },
        update: {},
        create: {
          externalLeadId: result.externalLeadId,
          partnerId: resolvedPartnerId,
          title: `Лид от партнера: ${dto.name}`,
          status: '8696950:70457446', // ЗАЯВКА ПОЛУЧЕНА
          pipelineId: BigInt(8696950),
          budget: dto.budget ? new (require('@prisma/client').Prisma.Decimal)(dto.budget) : null,
          city: dto.city,
          comment: dto.comment,
          contactName: dto.name,
          contactPhone: dto.phone,
          contactEmail: dto.email,
          amocrmSource: source,
          tagIds: tagIds.map(id => BigInt(id)),
          updatedAtSource: new Date(),
          syncedAt: new Date(),
        }
      });
      }

      return {
        success: true,
        externalLeadId: result.externalLeadId,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create lead via AmoService: ${err.message}`);
      throw new AppException('VALIDATION_ERROR', 'Failed to create lead in CRM', HttpStatus.BAD_REQUEST);
    }
  }

  async getLeadsBoard(dto: GetLeadsDto, user: AuthenticatedUser) {
    const partnerId = this.resolvePartnerId(user, dto.partner_id);
    const visibilityFilter = partnerId ? await this.buildVisibilityFilter(partnerId) : null;

    this.logger.log(`[getLeadsBoard] partnerId: ${partnerId}`);

    // 1. Resolve pipelines first to determine which one to show if none specified
    const pipelines = await this.amoService.getCachedPipelines();
    
    let allowedPipelineIds: Set<string>;
    if (partnerId) {
      const partnerPipelines = await this.prisma.partnerPipeline.findMany({
        where: { partnerId },
        select: { amocrmPipelineId: true },
      });
      allowedPipelineIds = new Set(partnerPipelines.map(p => p.amocrmPipelineId.toString()));
    } else {
      const allBoundPipelines = await this.prisma.partnerPipeline.findMany({
        select: { amocrmPipelineId: true },
      });
      allowedPipelineIds = new Set(allBoundPipelines.map(p => p.amocrmPipelineId.toString()));
    }

    const filteredPipelines = allowedPipelineIds.size > 0 
      ? pipelines.filter(p => allowedPipelineIds.has(p.id.toString()))
      : pipelines;

    // 2. Determine the active pipeline ID with specific business rules
    let activePipelineId: bigint | null = null;
    if (dto.pipeline_id) {
      activePipelineId = this.safeBigInt(dto.pipeline_id) ?? null;
    } else if (partnerId === 'dcf2713e-22a9-464a-8bad-5a0c8c182562') {
      // RULE: Klikov always defaults to his specific pipeline
      activePipelineId = BigInt(10776450);
    } else if (partnerId) {
      // RULE: Everyone else defaults to Real Estate
      activePipelineId = BigInt(8696950);
    } else if (filteredPipelines.length > 0) {
      // Default to the first filtered pipeline for "All partners" or others
      activePipelineId = BigInt(filteredPipelines[0].id);
    }

    const where: Prisma.LeadSnapshotWhereInput = {
      ...(visibilityFilter ? visibilityFilter : {}),
      ...(activePipelineId ? { pipelineId: activePipelineId } : {}),
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

    const [totalCards, leads] = await this.prisma.$transaction([
      this.prisma.leadSnapshot.count({ where }),
      this.prisma.leadSnapshot.findMany({
        where,
        orderBy: { updatedAtSource: dto.sort_dir ?? 'desc' },
        take: dto.board_limit ?? 500,
      }),
    ]);

    const cards = leads.map((row) => ({
      id: String(row.externalLeadId),
      title: row.title,
      status: row.status,
      budget: row.budget ? Number(row.budget) : null,
      city: row.city,
      contact_name: row.contactName,
      contact_phone: row.contactPhone,
      broker_name: row.brokerName,
      created_at: row.syncedAt.toISOString(),
      updated_at: row.updatedAtSource.toISOString(),
      last_edited: row.updatedAtSource.toISOString(),
    }));

    if (!filteredPipelines.length) {
      // FALLBACK: If no pipelines metadata available, group by status from the leads themselves
      const fallbackColumns = this.buildFallbackColumns(cards);
      
      // Try to guess pipeline name if we have a single predominant pipeline in the cards
      const pipelineIds = new Set(cards.map(c => c.status.split(':')[0]).filter(id => id && id !== 'undefined'));
      const pipelineName = pipelineIds.size === 1 
        ? (PIPELINE_NAME_MAP[Array.from(pipelineIds)[0]] || `Pipeline ${Array.from(pipelineIds)[0]}`)
        : 'Всі воронки (Metadata Unavailable)';

      return {
        pipelines: [
          {
            id: 'fallback',
            name: pipelineName,
            sort: 0,
            columns: fallbackColumns,
          },
        ],
        unassigned: { 
          count: 0, 
          items: [] 
        },
        meta: {
          total_cards: totalCards,
          board_limit: dto.board_limit ?? 500,
          pipelines_source: 'local_fallback',
          updated_at: new Date().toISOString(),
        },
      };
    }

    const pipelineBuckets = filteredPipelines.map((p) => ({
      id: String(p.id),
      name: p.name,
      sort: p.sort,
      columns: p.statuses
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((s) => ({
          id: String(s.id),
          name: s.name,
          count: cards.filter((c) => c.status === `${p.id}:${s.id}`).length,
          items: cards.filter((c) => c.status === `${p.id}:${s.id}`),
        })),
    }));

    // Find cards that didn't match any column in any of the allowed pipelines
    const matchedCardIds = new Set(
      pipelineBuckets.flatMap(p => p.columns.flatMap(c => c.items.map(i => i.id)))
    );
    const unassigned = cards.filter(c => !matchedCardIds.has(c.id));

    return {
      pipelines: pipelineBuckets,
      unassigned: {
        count: unassigned.length,
        items: unassigned,
      },
      meta: {
        total_cards: totalCards,
        board_limit: dto.board_limit ?? 500,
        pipelines_source: 'amocrm_live',
        updated_at: new Date().toISOString(),
      },
    };
  }

  async getLeadById(id: string, user: AuthenticatedUser, partnerIdQuery?: string) {
    const partnerId = this.resolvePartnerId(user, partnerIdQuery);
    const visibilityFilter = partnerId ? await this.buildVisibilityFilter(partnerId) : null;

    const externalLeadId = this.parseLeadId(id);
    const lead = await this.prisma.leadSnapshot.findFirst({
      where: {
        externalLeadId,
        ...(partnerId ? { partnerId } : {}),
        ...(visibilityFilter ? { AND: [visibilityFilter] } : {}),
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
      custom_fields: lead.customFields,
    };
  }

  async getLeadHistory(id: string, user: AuthenticatedUser, partnerIdQuery?: string) {
    const partnerId = this.resolvePartnerId(user, partnerIdQuery);
    const externalLeadId = this.parseLeadId(id);

    const history = await this.prisma.leadStatusHistory.findMany({
      where: {
        externalLeadId,
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { changedAt: 'desc' },
    });

    const statusName = (raw: string | null): string | null => {
      if (!raw) return null;
      return STATUS_NAME_MAP[raw] ?? (raw.includes(':') ? `Status ${raw.split(':')[1]}` : raw);
    };

    return {
      items: history.map((h) => ({
        from_status: h.fromStatus,
        from_status_name: statusName(h.fromStatus),
        to_status: h.toStatus,
        to_status_name: statusName(h.toStatus),
        changed_at: h.changedAt.toISOString(),
        changed_by: h.changedBy,
      })),
    };
  }

  async getLeadNotes(id: string, user: AuthenticatedUser) {
    const partnerId = this.resolvePartnerId(user);
    const externalLeadId = this.parseLeadId(id);

    // Verify visibility
    const visibilityFilter = await this.buildVisibilityFilter(partnerId);
    const lead = await this.prisma.leadSnapshot.findFirst({
      where: {
        externalLeadId,
        ...(visibilityFilter ? { AND: [visibilityFilter] } : {}),
      },
      select: { id: true }
    });

    if (!lead) {
      throw new AppException('LEAD_NOT_FOUND', 'Lead not found or no access', HttpStatus.NOT_FOUND);
    }

    return this.amoService.getLeadNotes(Number(externalLeadId));
  }

  async addLeadNote(id: string, text: string, user: AuthenticatedUser) {
    if (!text || !text.trim()) {
      throw new AppException('VALIDATION_ERROR', 'Comment text cannot be empty', HttpStatus.BAD_REQUEST);
    }

    const partnerId = this.resolvePartnerId(user);
    const externalLeadId = this.parseLeadId(id);

    // Verify visibility
    const visibilityFilter = await this.buildVisibilityFilter(partnerId);
    const lead = await this.prisma.leadSnapshot.findFirst({
      where: {
        externalLeadId,
        ...(visibilityFilter ? { AND: [visibilityFilter] } : {}),
      },
      select: { id: true }
    });

    if (!lead) {
      throw new AppException('LEAD_NOT_FOUND', 'Lead not found or no access', HttpStatus.NOT_FOUND);
    }

    // Get partner info to use as author name
    let partner: { name: string } | null = null;
    if (partnerId) {
      partner = await this.prisma.partner.findUnique({
        where: { id: partnerId },
        select: { name: true }
      });
    }

    const authorName = partner?.name || (user.role === 'admin' ? 'Admin' : 'Unknown Partner');
    try {
      await this.amoService.addLeadNote(Number(externalLeadId), text.trim(), authorName);
      return { success: true };
    } catch (e: any) {
      this.logger.error(`Failed to add note to AmoCRM for lead ${externalLeadId}:`, e);
      throw new AppException('AMO_ERROR', 'Не удалось отправить сообщение в AmoCRM. Возможно, сделка была удалена или ID недействителен.', HttpStatus.BAD_REQUEST);
    }
  }

  private resolvePartnerId(user: AuthenticatedUser, partnerIdQuery?: string): string | undefined {
    if (user.role === 'admin') {
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

  private async buildVisibilityFilter(partnerId?: string): Promise<Prisma.LeadSnapshotWhereInput | null> {
    if (!partnerId) return null;
    return { partnerId };
  }

  private buildFallbackColumns(cards: Array<{ id: string; title: string; status: string; budget: number | null; city: string | null; contact_name: string | null; contact_phone: string | null; broker_name: string | null; created_at: string; updated_at: string; last_edited: string }>) {
    const byStatus = new Map<string, typeof cards>();
    
    // Initialize all Klykov stages if any lead belongs to it
    const isKlykov = cards.some(c => c.status.startsWith('10776450:'));
    if (isKlykov) {
      for (const stage of KLYKOV_PIPELINE_STAGES) {
        byStatus.set(stage, []);
      }
    }

    for (const card of cards) {
      const key = card.status || 'Unknown';
      if (!byStatus.has(key)) byStatus.set(key, []);
      byStatus.get(key)!.push(card);
    }

    return Array.from(byStatus.entries())
      .sort((a, b) => {
        const orderA = STATUS_SORT_ORDER[a[0]] ?? 999;
        const orderB = STATUS_SORT_ORDER[b[0]] ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a[0].localeCompare(b[0]);
      })
      .map(([status, items], idx) => ({
        id: `fallback-${idx + 1}`,
        name: STATUS_NAME_MAP[status] || (status.includes(':') ? `Status ${status.split(':')[1]}` : status),
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

    const apiDomain = this.configService.get<string>('AMO_API_DOMAIN') || 'reforyou.amocrm.ru';
    console.log(`[fetchAmoPipelines] Using domain: ${apiDomain}`);

    let accessToken = await this.getAmoAccessToken();
    if (!accessToken) {
      console.error('[fetchAmoPipelines] No access token available');
      return [];
    }

    let response: Response;
    try {
      const url = `https://${apiDomain}/api/v4/leads/pipelines`;
      response = await this.fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(`[fetchAmoPipelines] Response status: ${response.status} from ${url}`);
    } catch (e) {
      console.error('[fetchAmoPipelines] Fetch failed:', e);
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

  private safeBigInt(val: any): bigint | undefined {
    if (!val) return undefined;
    try {
      return BigInt(val);
    } catch {
      return undefined;
    }
  }

  private getBackoffDelay(attempt: number): number {
    return 300 * 2 ** (attempt - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
