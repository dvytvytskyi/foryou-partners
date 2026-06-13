const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';
const structuredFile = path.join(rootDir, 'structured_translations.json');
const mapFile = path.join(rootDir, 'scratch', 'translate_map.json');
const enFile = path.join(rootDir, 'src', 'i18n', 'dictionaries', 'en.json');
const outputFile = path.join(rootDir, 'en_structured_translations.json');

const structure = JSON.parse(fs.readFileSync(structuredFile, 'utf-8'));
const map = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
const enDict = JSON.parse(fs.readFileSync(enFile, 'utf-8'));

// The logic to replace existing from enDict
const dictMap = {
  auth: ['login', 'register', 'forgot_password', 'reset_password', 'pending'],
  dashboard: ['dashboard'],
  deals: ['leads_page', 'deals_page', 'deal_detail'],
  payouts: ['payouts_page'],
  referrals: ['referrals_page'],
  settings: ['profile_page', 'settings_page'],
  knowledge: ['knowledge_page'],
  support: ['help_page', 'support_page', 'feedback_page'],
  admin: ['admin_partners_page'],
  transfer: ['transfer_page']
};

for (const [page, keys] of Object.entries(dictMap)) {
  if (structure.pages[page]) {
    structure.pages[page].existing = {};
    for (const key of keys) {
      if (enDict[key]) structure.pages[page].existing[key] = enDict[key];
    }
  }
}

if (structure.components.layout) {
  structure.components.layout.existing = {
    layout: enDict.layout,
    notification_dropdown: enDict.notification_dropdown
  };
}

// Function to recursively translate hardcoded arrays
function translateHardcoded(obj) {
  for (const key in obj) {
    if (key === 'hardcoded' && Array.isArray(obj[key])) {
      obj[key] = obj[key].map(phrase => map[phrase] || phrase);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key]) && key !== 'hardcoded') {
        // e.g. modals or backend
        obj[key] = obj[key].map(phrase => map[phrase] || phrase);
      } else {
        translateHardcoded(obj[key]);
      }
    }
  }
}

translateHardcoded(structure);

fs.writeFileSync(outputFile, JSON.stringify(structure, null, 2), 'utf-8');
console.log(`English translations saved to ${outputFile}`);
