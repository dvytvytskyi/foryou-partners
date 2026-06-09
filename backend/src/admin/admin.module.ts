import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AmoModule } from '../amo/amo.module';

@Module({
  imports: [AmoModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
