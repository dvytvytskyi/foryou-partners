const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@foryou-realestate.com' } });
  const klykov = await prisma.user.findUnique({ where: { email: 'klykov_boards@foryou-realestate.com' } });
  const p15 = await prisma.user.findUnique({ where: { email: 'partner15@foryou-realestate.com' } });

  console.log("Admin:", admin ? "Exists" : "Not Found");
  console.log("Klykov:", klykov ? "Exists" : "Not Found");
  console.log("Partner 15:", p15 ? "Exists" : "Not Found");
}

checkUsers().finally(() => prisma.$disconnect());
