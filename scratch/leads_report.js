
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function report() {
  const totalLeads = await prisma.leadSnapshot.count();
  const leadsByStatus = await prisma.leadSnapshot.groupBy({
    by: ['status'],
    _count: {
      _all: true
    }
  });

  const partners = await prisma.partner.findMany({
    select: { id: true, name: true }
  });

  console.log('--- amoCRM Backfill Report ---');
  console.log(`Total Leads in DB: ${totalLeads}`);
  console.log(`Active Partners: ${partners.length}`);
  partners.forEach(p => console.log(`- Partner: ${p.name} (id: ${p.id})`));
  
  console.log('\nLeads by Status:');
  leadsByStatus.forEach(s => {
    console.log(`- ${s.status}: ${s._count._all}`);
  });
}

report().finally(() => prisma.$disconnect());
