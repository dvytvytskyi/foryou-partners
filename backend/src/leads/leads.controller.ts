import { Controller, Get, Param, Query, UseGuards, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { GetLeadsDto } from './dto/get-leads.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  getLeads(@Query() dto: GetLeadsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.getLeads(dto, user);
  }

  @Post()
  createLead(@Body() dto: import('./dto/create-lead.dto').CreateLeadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.createLead(dto, user);
  }

  @Get('board')
  getLeadsBoard(@Query() dto: GetLeadsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.getLeadsBoard(dto, user);
  }

  @Get(':id')
  getLeadById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Query('partner_id') partnerId?: string) {
    return this.leadsService.getLeadById(id, user, partnerId);
  }

  @Get(':id/history')
  getLeadHistory(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Query('partner_id') partnerId?: string) {
    return this.leadsService.getLeadHistory(id, user, partnerId);
  }

  @Get(':id/notes')
  getLeadNotes(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.getLeadNotes(id, user);
  }

  @Post(':id/notes')
  addLeadNote(@Param('id') id: string, @Body('text') text: string, @CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.addLeadNote(id, text, user);
  }
}
