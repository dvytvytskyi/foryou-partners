import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({ include: { user: true }});
  console.log('Notifications count:', notifs.length);
  notifs.forEach(n => console.log(n.user.email, n.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());
