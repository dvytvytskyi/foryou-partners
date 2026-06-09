import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    const partnerId = req.user.role === 'admin' ? null : req.user.partnerId;
    return this.supportService.createTicket(req.user.id, partnerId, dto);
  }

  @Get()
  getTickets(@Request() req: any, @Query('partner_id') queryPartnerId?: string) {
    const partnerId = req.user.role === 'admin' ? queryPartnerId : req.user.partnerId;
    return this.supportService.getTickets(partnerId);
  }

  @Get(':id')
  getTicket(@Request() req: any, @Param('id') id: string) {
    const partnerId = req.user.role === 'admin' ? undefined : req.user.partnerId;
    return this.supportService.getTicket(id, partnerId);
  }

  @Post(':id/messages')
  addMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateTicketMessageDto,
  ) {
    const partnerId = req.user.role === 'admin' ? null : req.user.partnerId;
    return this.supportService.addMessage(id, req.user.id, partnerId, dto);
  }

  @Patch(':id/close')
  closeTicket(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can close tickets');
    }
    return this.supportService.closeTicket(id);
  }
}
