import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { partner: true }
  });
  
  console.log(JSON.stringify(users.map(u => ({
    email: u.email,
    role: u.role,
    name: u.name || u.partner?.name || 'N/A',
    isActive: u.isActive
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
