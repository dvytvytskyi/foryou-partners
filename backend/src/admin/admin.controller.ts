import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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

  @Get('users')
  getUsers(
    @Query('role') role?: 'admin' | 'partner_user',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers(
      role, 
      page ? parseInt(page, 10) : 1, 
      limit ? parseInt(limit, 10) : 10
    );
  }

  @Put('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post()
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.adminService.createPartner(dto);
  }

  @Put(':id')
  updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.adminService.updatePartner(id, dto);
  }

  @Delete(':id')
  deletePartner(@Param('id') id: string) {
    return this.adminService.deletePartner(id);
  }

  @Post('sync')
  @Roles('admin')
  manualSync() {
    return this.adminService.triggerManualSync();
  }
}
