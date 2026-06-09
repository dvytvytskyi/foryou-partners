const fs = require('fs');

const path = 'backend/src/leads/leads.service.ts';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `
      // Immediately insert into LeadSnapshot to prevent 404 before webhook arrives
      const resolvedPartnerId = partnerId || 'admin_test';
      await this.prisma.leadSnapshot.upsert({
        where: { externalLeadId_partnerId: { externalLeadId: result.externalLeadId, partnerId: resolvedPartnerId } },
`;

const replaceStr = `
      // Immediately insert into LeadSnapshot to prevent 404 before webhook arrives
      let resolvedPartnerId = partnerId;
      if (!resolvedPartnerId) {
        const anyPartner = await this.prisma.partner.findFirst();
        if (anyPartner) resolvedPartnerId = anyPartner.id;
      }
      
      if (resolvedPartnerId) {
        await this.prisma.leadSnapshot.upsert({
          where: { externalLeadId_partnerId: { externalLeadId: result.externalLeadId, partnerId: resolvedPartnerId } },
`;

const targetStr2 = `
          syncedAt: new Date(),
        }
      });
`;

const replaceStr2 = `
          syncedAt: new Date(),
        }
      });
      }
`;

code = code.replace(targetStr, replaceStr);
code = code.replace(targetStr2, replaceStr2);
fs.writeFileSync(path, code);
console.log('Fixed leads.service.ts again');
