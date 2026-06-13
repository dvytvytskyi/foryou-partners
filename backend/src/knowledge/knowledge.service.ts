import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async createArticle(authorId: string, data: { 
    titleRu: string; 
    titleEn: string; 
    descriptionRu: string; 
    descriptionEn: string; 
    linksRu?: any; 
    linksEn?: any; 
  }) {
    return this.prisma.knowledgeArticle.create({
      data: {
        titleRu: data.titleRu,
        titleEn: data.titleEn,
        descriptionRu: data.descriptionRu,
        descriptionEn: data.descriptionEn,
        linksRu: data.linksRu,
        linksEn: data.linksEn,
        authorId,
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async getArticles() {
    return this.prisma.knowledgeArticle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async getArticleById(id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async deleteArticle(id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    
    return this.prisma.knowledgeArticle.delete({
      where: { id }
    });
  }
}
