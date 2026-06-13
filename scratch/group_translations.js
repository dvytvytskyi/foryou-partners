const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';
const inputFile = path.join(rootDir, 'russian_translations.json');
const outputFile = path.join(rootDir, 'structured_translations.json');

const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

const existing = data.existing_dictionary || {};
const fileMapping = data.fileMapping || {};

const structure = {
  pages: {
    auth: { existing: {}, hardcoded: [] },
    dashboard: { existing: {}, hardcoded: [] },
    deals: { existing: {}, hardcoded: [] },
    payouts: { existing: {}, hardcoded: [] },
    referrals: { existing: {}, hardcoded: [] },
    settings: { existing: {}, hardcoded: [] },
    knowledge: { existing: {}, hardcoded: [] },
    support: { existing: {}, hardcoded: [] },
    admin: { existing: {}, hardcoded: [] },
    transfer: { existing: {}, hardcoded: [] },
    other: { existing: {}, hardcoded: [] }
  },
  modals: {},
  components: {
    layout: { existing: {}, hardcoded: [] },
    other: { existing: {}, hardcoded: [] }
  },
  backend: {}
};

// 1. Map existing dictionary keys
const dictMap = {
  auth: 'auth', register: 'auth', forgot_password: 'auth', reset_password: 'auth', pending: 'auth',
  dashboard: 'dashboard',
  referrals_page: 'referrals',
  leads_page: 'deals', deals_page: 'deals', deal_detail: 'deals',
  payouts_page: 'payouts',
  transfer_page: 'transfer',
  profile_page: 'settings', settings_page: 'settings',
  knowledge_page: 'knowledge',
  help_page: 'support', support_page: 'support', feedback_page: 'support',
  admin_partners_page: 'admin'
};

for (const [key, value] of Object.entries(existing)) {
  if (dictMap[key]) {
    structure.pages[dictMap[key]].existing[key] = value;
  } else if (key === 'layout' || key === 'notification_dropdown') {
    structure.components.layout.existing[key] = value;
  } else {
    structure.pages.other.existing[key] = value;
  }
}

// 2. Map hardcoded files
for (const [filePath, phrases] of Object.entries(fileMapping)) {
  const isModal = filePath.includes('Modal') || filePath.includes('Drawer');
  
  if (filePath.startsWith('backend/')) {
    const serviceName = filePath.split('/')[2] || 'other';
    if (!structure.backend[serviceName]) structure.backend[serviceName] = [];
    structure.backend[serviceName].push(...phrases);
    continue;
  }

  if (isModal) {
    const modalName = path.basename(filePath, path.extname(filePath));
    if (!structure.modals[modalName]) structure.modals[modalName] = [];
    structure.modals[modalName].push(...phrases);
    continue;
  }

  // Determine category for frontend files
  let cat = 'other';
  if (filePath.includes('/auth/')) cat = 'auth';
  else if (filePath.includes('/dashboard/')) cat = 'dashboard';
  else if (filePath.includes('/deals/') || filePath.includes('/leads/')) cat = 'deals';
  else if (filePath.includes('/payouts/')) cat = 'payouts';
  else if (filePath.includes('/referrals/')) cat = 'referrals';
  else if (filePath.includes('/profile/') || filePath.includes('/settings/')) cat = 'settings';
  else if (filePath.includes('/support/') || filePath.includes('tickets')) cat = 'support';
  else if (filePath.includes('/admin/')) cat = 'admin';
  else if (filePath.includes('/transfer/')) cat = 'transfer';
  else if (filePath.includes('/knowledge')) cat = 'knowledge';
  
  if (filePath.includes('/layout/') || filePath.includes('AppShell') || filePath.includes('Header')) {
    structure.components.layout.hardcoded.push(...phrases);
  } else if (structure.pages[cat]) {
    structure.pages[cat].hardcoded.push(...phrases);
  } else {
    structure.components.other.hardcoded.push(...phrases);
  }
}

// Clean up empty arrays/objects for cleaner JSON
function cleanEmpty(obj) {
  if (Array.isArray(obj)) return obj;
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      cleanEmpty(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}
cleanEmpty(structure);

fs.writeFileSync(outputFile, JSON.stringify(structure, null, 2), 'utf-8');
console.log(`Structured data saved to ${outputFile}`);
