const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const leads = await prisma.leadSnapshot.findMany({ take: 5, orderBy: { id: 'desc' } });
  for (const lead of leads) {
    const existing = await prisma.leadStatusHistory.findFirst({ where: { externalLeadId: lead.externalLeadId }});
    if (!existing) {
      await prisma.leadStatusHistory.create({
        data: {
          externalLeadId: lead.externalLeadId,
          partnerId: lead.partnerId,
          fromStatus: 'Создано',
          toStatus: lead.status,
          changedAt: lead.createdAtSource || new Date()
        }
      });
      console.log("Added history for", lead.externalLeadId);
    }
  }
}
run().then(() => console.log("Done")).catch(console.error).finally(() => prisma.$disconnect());
