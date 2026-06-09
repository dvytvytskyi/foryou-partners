const fs = require('fs');

const path = 'backend/src/leads/leads.service.ts';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `
      return {
        success: true,
        externalLeadId: result.externalLeadId,
      };
`;

const replaceStr = `
      // Immediately insert into LeadSnapshot to prevent 404 before webhook arrives
      const resolvedPartnerId = partnerId || 'admin_test';
      await this.prisma.leadSnapshot.upsert({
        where: { externalLeadId_partnerId: { externalLeadId: result.externalLeadId, partnerId: resolvedPartnerId } },
        update: {},
        create: {
          externalLeadId: result.externalLeadId,
          partnerId: resolvedPartnerId,
          title: \`Лід від партнера: \${dto.name}\`,
          status: '143', // Or some default status
          budget: dto.budget ? new (require('@prisma/client').Prisma.Decimal)(dto.budget) : null,
          city: dto.city,
          comment: dto.comment,
          contactName: dto.name,
          contactPhone: dto.phone,
          contactEmail: dto.email,
          amocrmSource: source,
          tagIds: tagIds.map(id => BigInt(id)),
          updatedAtSource: new Date(),
          syncedAt: new Date(),
        }
      });

      return {
        success: true,
        externalLeadId: result.externalLeadId,
      };
`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(path, code);
console.log('Fixed leads.service.ts');
