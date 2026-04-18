import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Controller('admin/partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getPartners() {
    return this.adminService.getPartners();
  }

  @Post()
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.adminService.createPartner(dto);
  }

  @Put(':id')
  updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.adminService.updatePartner(id, dto);
  }
}
