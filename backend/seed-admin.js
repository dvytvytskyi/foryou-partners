const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const email = 'admin@foryou-realestate.com';
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'admin' },
    create: { email, passwordHash, role: 'admin', isActive: true }
  });
  console.log('Admin created: admin@foryou-realestate.com / admin123');
}
main().finally(() => prisma.$disconnect());
