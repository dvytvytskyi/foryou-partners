import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Request() req, @Query('date_from') dateFrom?: string, @Query('date_to') dateTo?: string) {
    const user = req.user;
    return this.analyticsService.getDashboardData(user.id, user.role, user.partnerId, dateFrom, dateTo);
  }
}
