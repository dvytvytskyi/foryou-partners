import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { AppException } from '../common/errors/app-exception';
import { AmoService } from '../amo/amo.service';
import { EmailService } from '../common/email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

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
  mainContactId: bigint | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  updatedAt: Date;
  createdAt: Date;
  responsibleUserId: number | null;
  brokerName?: string | null;
  brokerEmail?: string | null;
  isApprovedPartner?: boolean;
};

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly amoService: AmoService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
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

    // Enrich missing contact details from API if needed
    const needsContactFetch = leads.filter(l => !l.contactPhone && l.mainContactId);
    if (needsContactFetch.length > 0) {
      try {
        const domain = this.configService.getOrThrow<string>('AMO_DOMAIN');
        const accessToken = await this.amoService.getAmoAccessTokenPublic();
        if (accessToken) {
          const contactsMap = await this.amoService.fetchContactsByIds(
            domain,
            accessToken,
            needsContactFetch.map(l => l.mainContactId!)
          );
          
          for (const lead of leads) {
            if (!lead.contactPhone && lead.mainContactId) {
              const info = contactsMap.get(lead.mainContactId.toString());
              if (info) {
                if (!lead.contactName) lead.contactName = info.name;
                lead.contactPhone = info.phone;
                if (!lead.contactEmail) lead.contactEmail = info.email;
              }
            }
          }
        }
      } catch (err) {
        this.logger.warn(`Failed to enrich leads with contacts: ${err}`);
      }
    }

    // Enrich broker details from cached users map
    try {
      const usersMap = await this.amoService.getCachedUsersMap();
      if (usersMap.size > 0) {
        for (const lead of leads) {
          if (lead.responsibleUserId && usersMap.has(lead.responsibleUserId)) {
            const user = usersMap.get(lead.responsibleUserId)!;
            lead.brokerName = user.name;
            lead.brokerEmail = user.email;
          }
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to enrich leads with broker details: ${err}`);
    }

    for (const lead of leads) {
      // PARTNER APPROVAL LOGIC
      if (lead.isApprovedPartner && (lead.contactEmail || lead.contactPhone)) {
        try {
          const whereClause: any = [];
          if (lead.contactEmail) whereClause.push({ email: lead.contactEmail.toLowerCase() });
          if (lead.contactPhone) whereClause.push({ phone: lead.contactPhone });

          const user = await this.prisma.user.findFirst({
            where: { OR: whereClause },
            include: { partner: true }
          });

          if (user && !user.isActive) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { isActive: true }
            });
            if (user.partnerId) {
              await this.prisma.partner.update({
                where: { id: user.partnerId },
                data: { isActive: true }
              });
            }
            this.logger.log(`Partner ${user.email} auto-approved via amoCRM webhook`);
          }
        } catch (err) {
          this.logger.error(`Error auto-approving partner: ${err}`);
        }
      }
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
          select: { status: true, brokerName: true },
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
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            brokerName: lead.brokerName,
            brokerEmail: lead.brokerEmail,
            amocrmSource: lead.source,
            tagIds: lead.tagIds,
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
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            brokerName: lead.brokerName,
            brokerEmail: lead.brokerEmail,
            amocrmSource: lead.source,
            tagIds: lead.tagIds,
            createdAtSource: lead.createdAt,
            updatedAtSource: lead.updatedAt,
            syncedAt: lead.createdAt,
          },
        });

        const fromStatus = existing?.status ?? lead.previousStatus ?? null;
        const statusChanged = !existing || fromStatus !== lead.status;
        const brokerChanged = !!existing && existing.brokerName !== lead.brokerName;

        if (statusChanged) {
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

        // Send email notifications (fire-and-forget, do not block processing)
        if (statusChanged || brokerChanged) {
          void this.sendNotifications({
            partnerId,
            lead,
            statusChanged,
            brokerChanged,
            fromStatus,
          });
        }
      }
    }
  }

  private async sendNotifications(params: {
    partnerId: string;
    lead: WebhookLead;
    statusChanged: boolean;
    brokerChanged: boolean;
    fromStatus: string | null;
  }) {
    const { partnerId, lead, statusChanged, brokerChanged, fromStatus } = params;

    // Find all active users for this partner with their notification prefs
    const users = await this.prisma.user.findMany({
      where: { partnerId, isActive: true },
      select: {
        id: true,
        email: true,
        notificationPrefs: {
          select: { onStatusChange: true, onBrokerChange: true },
        },
      },
    });

    const appUrl = this.configService.get<string>('APP_URL') ?? 'https://portal.foryou-realestate.com';
    const leadUrl = `${appUrl}/leads`;
    const leadName = lead.contactName ?? lead.title ?? 'Клієнт';
    const leadId = lead.externalLeadId.toString();

    for (const user of users) {
      const prefs = user.notificationPrefs;

      if (statusChanged && prefs?.onStatusChange) {
        const toStatusName = lead.status;
        const fromStatusName = fromStatus ?? '—';
        const subject = `Зміна статусу: ${leadName}`;
        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#003077">Зміна статусу клієнта</h2>
            <p>Статус клієнта <strong>${leadName}</strong> змінився:</p>
            <p style="font-size:16px">
              <span style="color:#71717a">${fromStatusName}</span>
              &nbsp;→&nbsp;
              <strong style="color:#003077">${toStatusName}</strong>
            </p>
            <a href="${leadUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#003077;color:white;text-decoration:none;border-radius:6px">
              Переглянути ліди
            </a>
            <p style="margin-top:24px;font-size:12px;color:#a1a1aa">For You Real Estate Partner Portal</p>
          </div>
        `;
        await this.emailService.send({ to: user.email, subject, html }).catch((err) =>
          this.logger.warn(`Failed to send status-change email to ${user.email}: ${err}`),
        );

        // App Notification
        await this.notificationsService.createNotification({
          userId: user.id,
          type: 'LEAD_STATUS_CHANGED',
          title: 'Зміна статусу ліда',
          message: `Статус ліда "${leadName}" змінився: ${fromStatusName} → ${toStatusName}`,
          link: `/deals/${leadId}`,
        }).catch((err) => this.logger.warn(`Failed to create app notification: ${err}`));
      }

      if (brokerChanged && prefs?.onBrokerChange) {
        const subject = `Змінився брокер: ${leadName}`;
        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#003077">Зміна відповідального брокера</h2>
            <p>По клієнту <strong>${leadName}</strong> змінився відповідальний брокер.</p>
            ${lead.brokerName ? `<p>Новий брокер: <strong>${lead.brokerName}</strong>${lead.brokerEmail ? ` (${lead.brokerEmail})` : ''}</p>` : ''}
            <a href="${leadUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#003077;color:white;text-decoration:none;border-radius:6px">
              Переглянути ліди
            </a>
            <p style="margin-top:24px;font-size:12px;color:#a1a1aa">For You Real Estate Partner Portal</p>
          </div>
        `;
        await this.emailService.send({ to: user.email, subject, html }).catch((err) =>
          this.logger.warn(`Failed to send broker-change email to ${user.email}: ${err}`),
        );

        // App Notification
        await this.notificationsService.createNotification({
          userId: user.id,
          type: 'BROKER_ASSIGNED',
          title: 'Призначено брокера',
          message: `Брокера ${lead.brokerName || ''} призначено для ліда "${leadName}"`,
          link: `/deals/${leadId}`,
        }).catch((err) => this.logger.warn(`Failed to create app notification: ${err}`));
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

    let isApprovedPartner = false;
    if (pipelineId === 8600274 && statusId === 142) {
      isApprovedPartner = true;
    }
    const cfArr = raw.custom_fields as any[];
    if (Array.isArray(cfArr)) {
      for (const field of cfArr) {
        const name = (field.name || '').toLowerCase();
        if (name.includes('одобрить') || name.includes('approve') || name.includes('схвалити')) {
          const val = field.values?.[0]?.value;
          if (val === 'Да' || val === '1' || val === true || val === 'Yes') {
            isApprovedPartner = true;
          }
        }
      }
    }

    let mainContactId: bigint | null = null;
    let contactName: string | null = null;
    let contactPhone: string | null = null;
    let contactEmail: string | null = null;

    // 1. Try to get mainContactId
    const mcid = raw.main_contact_id ?? raw.contact_id;
    if (mcid) {
      try {
        mainContactId = BigInt(String(mcid));
      } catch {}
    }

    // 2. Try to find phone/email in lead's OWN custom fields (some webhooks include them)
    const cfv = (raw.custom_fields_values as unknown[]) ?? [];
    for (const field of cfv) {
      if (!field || typeof field !== 'object') continue;
      const f = field as Record<string, unknown>;
      const code = this.toOptionalString(f.field_code);
      const fieldName = this.toOptionalString(f.field_name);
      const values = (f.values as unknown[]) ?? [];
      const firstVal = values[0] as Record<string, unknown> | undefined;
      const value = this.toOptionalString(firstVal?.value);

      if (value && this.amoService.isPhoneField(code ?? null, fieldName ?? null)) {
        contactPhone = value;
      }
      if (value && this.amoService.isEmailField(code ?? null, fieldName ?? null)) {
        contactEmail = value;
      }
    }

    // 3. Try to extract from _embedded.contacts if present in webhook
    const embedded = (raw._embedded as Record<string, unknown> | undefined);
    const contacts = (embedded?.contacts as unknown[]) ?? [];
    for (const c of contacts) {
      if (!c || typeof c !== 'object') continue;
      const contact = c as Record<string, unknown>;
      const isMain = contact.is_main === true || contacts.length === 1;

      if (!mainContactId || isMain) {
        try {
          const cid = contact.id ?? contact.contact_id;
          if (cid) mainContactId = BigInt(String(cid));
        } catch {}
      }

      if (isMain || !contactName) {
        contactName = this.toOptionalString(contact.name) ?? contactName;
        
        const ccfv = (contact.custom_fields_values as unknown[]) ?? [];
        for (const field of ccfv) {
          if (!field || typeof field !== 'object') continue;
          const f = field as Record<string, unknown>;
          const code = this.toOptionalString(f.field_code);
          const fieldName = this.toOptionalString(f.field_name);
          const values = (f.values as unknown[]) ?? [];
          const firstVal = values[0] as Record<string, unknown> | undefined;
          const value = this.toOptionalString(firstVal?.value);

          if (!contactPhone && value && this.amoService.isPhoneField(code ?? null, fieldName ?? null)) {
            contactPhone = value;
          }
          if (!contactEmail && value && this.amoService.isEmailField(code ?? null, fieldName ?? null)) {
            contactEmail = value;
          }
        }
      }
    }

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
      mainContactId,
      contactName,
      contactPhone,
      contactEmail,
      updatedAt: this.toTimestamp(raw.updated_at),
      createdAt: this.toTimestamp(raw.created_at),
      responsibleUserId: this.toOptionalNumber(raw.responsible_user_id) ?? null,
      isApprovedPartner,
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
