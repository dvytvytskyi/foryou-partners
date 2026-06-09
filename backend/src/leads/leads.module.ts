import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { AmoModule } from '../amo/amo.module';

@Module({
  imports: [AmoModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
