import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { UpdatePayoutStatusDto } from './dto/update-payout-status.dto';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  getPayouts(@CurrentUser() user: AuthenticatedUser) {
    return this.payoutsService.getPayoutsDashboard(user);
  }

  @Post('request')
  requestPayout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestPayoutDto
  ) {
    return this.payoutsService.requestPayout(user, dto);
  }

  @Patch(':id/status')
  updatePayoutStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePayoutStatusDto
  ) {
    return this.payoutsService.updatePayoutStatus(user, id, dto);
  }
}
