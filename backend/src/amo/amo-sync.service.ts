import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmoService } from './amo.service';

@Injectable()
export class AmoSyncService {
  private readonly logger = new Logger(AmoSyncService.name);
  private isSyncing = false;

  constructor(private readonly amoService: AmoService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    if (this.isSyncing) {
      this.logger.warn('Previous sync is still in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting scheduled 30-minute amoCRM sync...');
    
    try {
      const result = await this.amoService.runBackfill();
      this.logger.log(`Scheduled sync complete: fetched=${result.total_fetched}, upserted=${result.total_upserted}`);
    } catch (error) {
      this.logger.error('Scheduled sync failed', error);
    } finally {
      this.isSyncing = false;
    }
  }
}
