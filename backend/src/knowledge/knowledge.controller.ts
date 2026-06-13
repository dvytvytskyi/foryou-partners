import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  getArticles() {
    return this.knowledgeService.getArticles();
  }

  @Get(':id')
  getArticleById(@Param('id') id: string) {
    return this.knowledgeService.getArticleById(id);
  }

  @Post()
  createArticle(@Request() req: any, @Body() body: { 
    titleRu: string; 
    titleEn: string; 
    descriptionRu: string; 
    descriptionEn: string; 
    linksRu?: any; 
    linksEn?: any; 
  }) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create knowledge articles');
    }
    return this.knowledgeService.createArticle(req.user.id, body);
  }

  @Delete(':id')
  deleteArticle(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete knowledge articles');
    }
    return this.knowledgeService.deleteArticle(id);
  }
}
