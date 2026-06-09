import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

const bcrypt = require('bcrypt');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create or find Klikov partner
  let klikovPartner = await prisma.partner.findFirst({
    where: { name: 'Klikov' },
  });

  if (!klikovPartner) {
    klikovPartner = await prisma.partner.create({
      data: {
        name: 'Klikov',
        isActive: true,
        labels: [],
      },
    });
    console.log('✅ Created Klikov partner:', klikovPartner.id);
  } else {
    console.log('✅ Found existing Klikov partner:', klikovPartner.id);
  }

  // Create or update user
  const email = 'klykov_boards@foryou-realestate.com';
  const password = 'TempPassword123!'; // Change this password after first login

  let user = await prisma.user.findUnique({
    where: { email },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Олексій Кликов',
        phone: '+380501234567',
        passwordHash,
        role: 'partner_user',
        partnerId: klikovPartner.id,
        isActive: true,
      },
    });
    console.log('✅ Created user:', email);
  } else {
    user = await prisma.user.update({
      where: { email },
      data: {
        name: 'Олексій Кликов',
        phone: '+380501234567',
        passwordHash,
        partnerId: klikovPartner.id,
        isActive: true,
      },
    });
    console.log('✅ Updated user:', email);
  }

  // Create or update admin user
  const adminEmail = 'admin@foryou-realestate.com';
  const adminPassword = 'AdminPassword123!';

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Головний Адмін',
        phone: '+380990000000',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Created admin user:', adminEmail);
  } else {
    adminUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: 'Головний Адмін',
        phone: '+380990000000',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Updated admin user:', adminEmail);
  }

  // Create second admin
  const adminEmail2 = 'admin2@foryou-realestate.com';
  let adminUser2 = await prisma.user.findUnique({
    where: { email: adminEmail2 },
  });

  if (!adminUser2) {
    adminUser2 = await prisma.user.create({
      data: {
        email: adminEmail2,
        name: 'Другий Адмін',
        phone: '+380991111111',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Created admin user 2:', adminEmail2);
  } else {
    adminUser2 = await prisma.user.update({
      where: { email: adminEmail2 },
      data: {
        name: 'Другий Адмін',
        phone: '+380991111111',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Updated admin user 2:', adminEmail2);
  }

    // Generate mock partners and referrals for testing pagination
  let lastPartnerId: string | null = null;
  for (let i = 1; i <= 15; i++) {
    const pName = `Test Partner ${i}`;
    let partner = await prisma.partner.findFirst({
      where: { name: pName },
      include: { users: true }
    });

    if (!partner) {
      partner = await prisma.partner.create({
        data: {
          name: pName,
          isActive: true,
          labels: [],
          users: {
            create: {
              email: `partner${i}@foryou-realestate.com`,
              name: pName,
              phone: `+380500000${i < 10 ? '0' + i : i}`,
              passwordHash: await bcrypt.hash('PartnerPassword123!', 10),
              role: 'partner_user',
              isActive: true,
            }
          }
        },
        include: { users: true }
      });
      console.log(`✅ Created ${pName}`);
    }
    
    lastPartnerId = partner.id;

    // Create 1-3 referrals for each partner
    const refCount = await prisma.partner.count({ where: { referredById: lastPartnerId } });
    if (refCount === 0 && lastPartnerId) {
      const numRefs = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numRefs; j++) {
        await prisma.partner.create({
          data: {
            name: `Referred Partner ${i}-${j}`,
            isActive: true,
            labels: [],
            referredById: lastPartnerId,
            users: {
              create: {
                email: `ref_${i}_${j}@example.com`,
                name: `Referred User ${j} of ${i}`,
                passwordHash: 'dummy',
                role: 'partner_user',
                isActive: true,
              }
            }
          }
        });
      }
    }
  }

  // Add specific test deals and tickets for the last partner (Partner 15)
  if (lastPartnerId) {
    const p15DealsCount = await prisma.leadSnapshot.count({ where: { partnerId: lastPartnerId } });
    if (p15DealsCount === 0) {
      await prisma.leadSnapshot.createMany({
        data: [
          {
            externalLeadId: 90001n,
            partnerId: lastPartnerId,
            title: 'Квартира в Marina',
            status: 'Первичный контакт',
            budget: 500000,
            createdAtSource: new Date(),
            updatedAtSource: new Date(),
            syncedAt: new Date(),
          },
          {
            externalLeadId: 90002n,
            partnerId: lastPartnerId,
            title: 'Вилла на Palm Jumeirah',
            status: 'Принимают решение',
            budget: 2500000,
            createdAtSource: new Date(),
            updatedAtSource: new Date(),
            syncedAt: new Date(),
          }
        ]
      });
      console.log('✅ Created test deals for Partner 15');
    }

    const p15TicketsCount = await prisma.ticket.count({ where: { partnerId: lastPartnerId } });
    if (p15TicketsCount === 0) {
      await prisma.ticket.createMany({
        data: [
          {
            partnerId: lastPartnerId,
            subject: 'Проблема с выплатой за виллу',
            status: 'IN_PROGRESS',
            updatedAt: new Date(),
          },
          {
            partnerId: lastPartnerId,
            subject: 'Как добавить нового брокера?',
            status: 'CLOSED',
            updatedAt: new Date(),
          }
        ]
      });
      console.log('✅ Created test tickets for Partner 15');
    }
  }

  // Create notification preferences
  const notifPrefs = await prisma.notificationPref.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      onStatusChange: true,
      onBrokerChange: true,
    },
  });
  console.log('✅ Created/updated notification preferences');

  console.log('\n📋 User Details:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: partner_user`);
  console.log(`   Partner: Klikov`);
  console.log('\n⚠️  Remember to change the password after first login!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seeding complete!');
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
