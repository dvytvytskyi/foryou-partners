import { Controller, Get, Post, Query, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AmoService } from './amo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('amo-crm')
export class AmoController {
  private readonly logger = new Logger(AmoController.name);

  constructor(private readonly amoService: AmoService) {}

  /**
   * Redirect admin browser to amoCRM OAuth authorization page.
   * Usage: open https://partners.foryou-realestate.com/api/v1/amo-crm/connect in browser while logged in as admin
   */
  @Get('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  connect(@Res() res: Response) {
    const url = this.amoService.getConnectUrl();
    return res.redirect(url);
  }

  /**
   * amoCRM OAuth callback. Exchanges authorization code for tokens.
   * Configured as AMO_REDIRECT_URI in .env
   */
  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    try {
      await this.amoService.exchangeCode(code);
      return res.send(`
        <html><body style="font-family:sans-serif;padding:2rem">
          <h2>✅ amoCRM підключено успішно!</h2>
          <p>Access token збережено. Тепер можна запустити backfill лідів.</p>
          <p><a href="/api/v1/amo-crm/backfill" style="color:blue">Натисни тут щоб запустити backfill</a> (POST запит потрібен)</p>
        </body></html>
      `);
    } catch (err) {
      this.logger.error('OAuth callback error', err);
      return res.status(500).send('OAuth exchange failed: ' + (err instanceof Error ? err.message : 'unknown'));
    }
  }

  /**
   * POST /api/v1/amo-crm/backfill
   * Pulls all leads from amoCRM and upserts to DB.
   * Admin only. Returns progress summary.
   */
  @Post('backfill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async backfill() {
    const result = await this.amoService.runBackfill();
    return result;
  }

  @Post('backfill-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async backfillHistory() {
    const result = await this.amoService.backfillLeadHistory();
    return result;
  }

  @Get('sources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSources() {
    const sources = await this.amoService.getAvailableSources();
    return { items: sources };
  }

  @Get('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTags() {
    const tags = await this.amoService.getAvailableTags();
    return { items: tags };
  }

  @Get('pipelines')
  @UseGuards(JwtAuthGuard) // allow any authenticated user to fetch pipelines
  async getPipelines() {
    const pipelines = await this.amoService.getCachedPipelines();
    return { items: pipelines };
  }
}
