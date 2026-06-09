import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  const email = 'admin@foryou-realestate.com';
  const password = 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'admin' },
    create: { email, passwordHash, role: 'admin', isActive: true }
  });
  
  console.log('Admin user updated:', email);
  await prisma.$disconnect();
}

main();
