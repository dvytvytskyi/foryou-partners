import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { AdminModule } from './admin/admin.module';
import { WebhookModule } from './webhook/webhook.module';
import { AuditModule } from './audit/audit.module';
import { AmoModule } from './amo/amo.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfileModule } from './profile/profile.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './common/email/email.module';
import { PayoutsModule } from './payouts/payouts.module';
import { ReferralsModule } from './referrals/referrals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupportModule } from './support/support.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    RedisModule,
    AuditModule,
    EmailModule,
    HealthModule,
    AuthModule,
    LeadsModule,
    AdminModule,
    WebhookModule,
    AmoModule,
    ProfileModule,
    AnalyticsModule,
    PayoutsModule,
    ReferralsModule,
    NotificationsModule,
    SupportModule,
    KnowledgeModule,
  ],
})
export class AppModule {}
