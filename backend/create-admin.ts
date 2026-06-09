import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@foryou.com';
  const password = 'admin123';

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'admin',
      isActive: true,
      partnerId: null,
    },
    create: {
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Admin user created/updated successfully!');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
