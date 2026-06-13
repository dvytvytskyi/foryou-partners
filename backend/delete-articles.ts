import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.knowledgeArticle.deleteMany().then(() => console.log('Deleted')).finally(() => prisma.$disconnect());
