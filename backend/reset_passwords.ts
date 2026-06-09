import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);
  
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: passwordHash
    }
  });
  
  console.log(`Updated ${result.count} users with password '12345678'`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
