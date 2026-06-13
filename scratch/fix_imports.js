const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';

const filesToFix = [
  'src/app/[locale]/(protected)/support/[id]/page.tsx',
  'src/components/deals/LeadChat.tsx',
  'src/components/layout/AppShell.tsx',
  'src/components/layout/SpotlightSearch.tsx',
  'src/components/leads/LeadDrawer.tsx',
  'src/components/leads/LeadsBoard.tsx',
  'src/app/styles/page.tsx' // style guide page, doesn't matter much but let's fix it
];

const importInjection = `
import dictRu from '@/i18n/dictionaries/ru.json';
import dictEn from '@/i18n/dictionaries/en.json';
const dict = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? dictEn : dictRu;
`;

for (const relPath of filesToFix) {
  const filePath = path.join(rootDir, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if dict is already imported or declared
    if (!content.includes('import dictRu')) {
      // Find the last import statement
      const importRegex = /import .* from '.*';\n/g;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      
      content = content.slice(0, lastIndex) + importInjection + content.slice(lastIndex);
      
      // For LeadsBoard.tsx, there's a specific TS error about string | null to number
      if (relPath.includes('LeadsBoard.tsx')) {
         content = content.replace(/leadId=\{drawerLeadId\}/g, 'leadId={Number(drawerLeadId)}');
      }
      
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed imports in', relPath);
    }
  }
}
