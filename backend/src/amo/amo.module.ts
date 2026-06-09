import { Module } from '@nestjs/common';
import { AmoController } from './amo.controller';
import { AmoService } from './amo.service';
import { AmoSyncService } from './amo-sync.service';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [AmoController],
  providers: [AmoService, AmoSyncService],
  exports: [AmoService],
})
export class AmoModule {}
