import { Body, Controller, HttpCode, HttpStatus, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Ip() ip: string) {
    return this.authService.login(dto, req.headers['user-agent'], ip);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto);
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
  }
}
