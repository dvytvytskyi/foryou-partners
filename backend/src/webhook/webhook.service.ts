import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { AppException } from '../common/errors/app-exception';

type WebhookLead = {
  externalLeadId: bigint;
  title: string;
  status: string;
  previousStatus?: string;
  budget: number | null;
  city: string | null;
  comment: string | null;
  source: string | null;
  tagIds: bigint[];
  updatedAt: Date;
  createdAt: Date;
};

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleAmocrmWebhook(params: {
    eventId: string;
    signature?: string;
    payload: unknown;
  }) {
    const webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');
    if (webhookSecret && params.signature !== webhookSecret) {
      throw new AppException('AUTH_FORBIDDEN', 'Invalid webhook signature', HttpStatus.FORBIDDEN);
    }

    const existing = await this.prisma.webhookEvent.findUnique({
      where: { eventId: params.eventId },
    });

    if (existing) {
      return { accepted: true, duplicate: true };
    }

    const created = await this.prisma.webhookEvent.create({
      data: {
        eventId: params.eventId,
        source: 'amocrm',
        payload: params.payload as object,
        receivedAt: new Date(),
        status: 'received',
      },
    });

    try {
      const leads = this.extractLeadsFromPayload(params.payload);
      await this.processLeads(leads);

      await this.prisma.webhookEvent.update({
        where: { id: created.id },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown webhook processing error';
      this.logger.error(`Failed webhook processing for ${params.eventId}: ${message}`);
      await this.prisma.webhookEvent.update({
        where: { id: created.id },
        data: {
          status: 'failed',
          processedAt: new Date(),
          errorMessage: message,
        },
      });
      throw new AppException('VALIDATION_ERROR', 'Webhook processing failed', HttpStatus.BAD_REQUEST);
    }

    return { accepted: true, duplicate: false };
  }

  private async processLeads(leads: WebhookLead[]) {
    if (leads.length === 0) return;

    for (const lead of leads) {
      const partnerIds = await this.resolvePartnerIdsForLead(lead);
      if (partnerIds.length === 0) {
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
            updatedAtSource: lead.updatedAt,
            syncedAt: lead.createdAt,
          },
        });

        const fromStatus = existing?.status ?? lead.previousStatus ?? null;
        if (!existing || fromStatus !== lead.status) {
          await this.prisma.leadStatusHistory.create({
            data: {
              externalLeadId: lead.externalLeadId,
              partnerId,
              fromStatus,
              toStatus: lead.status,
              changedAt: lead.updatedAt,
              changedBy: 'webhook',
            },
          });
        }
      }
    }
  }

  private async resolvePartnerIdsForLead(lead: WebhookLead): Promise<string[]> {
    const activePartners = await this.prisma.partner.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activePartners.length) return [];

    const partnerIds = activePartners.map((p) => p.id);

    const [sources, tags, existingSnapshots] = await this.prisma.$transaction([
      this.prisma.partnerSource.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmSource: true },
      }),
      this.prisma.partnerTag.findMany({
        where: { partnerId: { in: partnerIds } },
        select: { partnerId: true, amocrmTagId: true },
      }),
      this.prisma.leadSnapshot.findMany({
        where: { externalLeadId: lead.externalLeadId },
        select: { partnerId: true },
      }),
    ]);

    const matchedBySource = new Set<string>();
    if (lead.source) {
      for (const s of sources) {
        if (s.amocrmSource === lead.source) {
          matchedBySource.add(s.partnerId);
        }
      }
    }

    const matchedByTag = new Set<string>();
    if (lead.tagIds.length) {
      const leadTagSet = new Set(lead.tagIds.map((x) => x.toString()));
      for (const t of tags) {
        if (leadTagSet.has(t.amocrmTagId.toString())) {
          matchedByTag.add(t.partnerId);
        }
      }
    }

    const matched = new Set<string>([...matchedBySource, ...matchedByTag]);
    if (matched.size > 0) {
      return Array.from(matched);
    }

    // If tags/source are absent in payload, keep existing partner bindings for the lead.
    if (existingSnapshots.length > 0) {
      return Array.from(new Set(existingSnapshots.map((s) => s.partnerId)));
    }

    return [];
  }

  private extractLeadsFromPayload(payload: unknown): WebhookLead[] {
    const raw = payload as Record<string, unknown>;
    const leadsContainer = (raw?.leads as Record<string, unknown> | undefined) ?? {};

    const candidates: unknown[] = [];
    if (Array.isArray(leadsContainer.add)) candidates.push(...leadsContainer.add);
    if (Array.isArray(leadsContainer.update)) candidates.push(...leadsContainer.update);
    if (Array.isArray(leadsContainer.status)) candidates.push(...leadsContainer.status);

    const embeddedLeads = ((raw?._embedded as Record<string, unknown> | undefined)?.leads ?? []) as unknown[];
    if (Array.isArray(embeddedLeads)) candidates.push(...embeddedLeads);

    const result: WebhookLead[] = [];
    for (const item of candidates) {
      const lead = this.normalizeLead(item);
      if (lead) result.push(lead);
    }

    const uniq = new Map<string, WebhookLead>();
    for (const lead of result) {
      uniq.set(lead.externalLeadId.toString(), lead);
    }
    return Array.from(uniq.values());
  }

  private normalizeLead(item: unknown): WebhookLead | null {
    if (!item || typeof item !== 'object') return null;
    const raw = item as Record<string, unknown>;

    const idValue = raw.id ?? raw.lead_id;
    if (idValue === undefined || idValue === null) return null;

    let externalLeadId: bigint;
    try {
      externalLeadId = BigInt(String(idValue));
    } catch {
      return null;
    }

    const statusId = this.toOptionalNumber(raw.status_id);
    const oldStatusId = this.toOptionalNumber(raw.old_status_id);
    const pipelineId = this.toOptionalNumber(raw.pipeline_id);
    const oldPipelineId = this.toOptionalNumber(raw.old_pipeline_id);

    const status = statusId ? `${pipelineId ?? 0}:${statusId}` : String(raw.status ?? 'unknown');
    const previousStatus = oldStatusId ? `${oldPipelineId ?? pipelineId ?? 0}:${oldStatusId}` : undefined;

    const source = this.toOptionalString(raw.source_name)
      ?? this.toOptionalString(raw.source)
      ?? this.extractCustomFieldString(raw, 'Источник')
      ?? null;

    const city = this.extractCustomFieldString(raw, 'Город')
      ?? this.toOptionalString(raw.city)
      ?? null;

    const comment = this.extractCustomFieldString(raw, 'Комментарий')
      ?? this.toOptionalString(raw.comment)
      ?? null;

    return {
      externalLeadId,
      title: this.toOptionalString(raw.name) ?? `Lead ${externalLeadId.toString()}`,
      status,
      previousStatus,
      budget: this.toOptionalNumber(raw.price),
      city,
      comment,
      source,
      tagIds: this.extractTagIds(raw),
      updatedAt: this.toTimestamp(raw.updated_at),
      createdAt: this.toTimestamp(raw.created_at),
    };
  }

  private extractTagIds(raw: Record<string, unknown>): bigint[] {
    const tags = (raw.tags as unknown[]) ?? [];
    if (!Array.isArray(tags)) return [];

    const out: bigint[] = [];
    for (const tag of tags) {
      if (!tag || typeof tag !== 'object') continue;
      const id = (tag as Record<string, unknown>).id;
      if (id === undefined || id === null) continue;
      try {
        out.push(BigInt(String(id)));
      } catch {
        // ignore invalid tag ids
      }
    }
    return out;
  }

  private extractCustomFieldString(raw: Record<string, unknown>, fieldName: string): string | undefined {
    const values = raw.custom_fields_values;
    if (!Array.isArray(values)) return undefined;

    for (const field of values) {
      if (!field || typeof field !== 'object') continue;
      const fieldObj = field as Record<string, unknown>;
      if (fieldObj.field_name !== fieldName) continue;
      const fieldValues = fieldObj.values;
      if (!Array.isArray(fieldValues) || fieldValues.length === 0) continue;
      const first = fieldValues[0] as Record<string, unknown>;
      const value = this.toOptionalString(first?.value);
      if (value) return value;
    }
    return undefined;
  }

  private toOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private toOptionalNumber(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private toTimestamp(value: unknown): Date {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return new Date();
    return new Date(n * 1000);
  }
}
