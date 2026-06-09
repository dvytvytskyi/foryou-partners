import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { email: 'admin@foryou-realestate.com' } });
  console.log('Admin users:', users.map(u => u.id));
  const notifs = await prisma.notification.findMany();
  console.log('Notif userIds:', notifs.map(n => n.userId));
}
main().catch(console.error).finally(() => prisma.$disconnect());
