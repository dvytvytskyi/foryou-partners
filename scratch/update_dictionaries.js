const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';
const mapFile = path.join(rootDir, 'scratch', 'translate_map.json');
const enFile = path.join(rootDir, 'src', 'i18n', 'dictionaries', 'en.json');
const ruFile = path.join(rootDir, 'src', 'i18n', 'dictionaries', 'ru.json');

const map = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));

// Sanitize keys for JSON paths (e.g., replace spaces, dots, etc. with underscores)
// But since we will access them via `dict.hardcoded["key"]` or `dict.hardcoded.key`, 
// keeping keys as simple alphanumeric strings is better. 
// However, the original strings have HTML and long texts! 
// We should generate a safe key map.

const safeKeyMap = {};
const enHardcoded = {};
const ruHardcoded = {};

let counter = 1;

for (const [ruPhrase, enPhrase] of Object.entries(map)) {
  // Generate a safe key based on English text if possible, or just h1, h2...
  let safeKey = enPhrase.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').substring(0, 30).replace(/_$/, '').toLowerCase();
  
  if (!safeKey || safeKey === '_' || Object.values(safeKeyMap).includes(safeKey)) {
    safeKey = 'hc_' + counter++;
  }
  
  // ensure completely unique
  while(Object.values(safeKeyMap).includes(safeKey)) {
    safeKey = 'hc_' + counter++;
  }

  safeKeyMap[ruPhrase] = safeKey;
  enHardcoded[safeKey] = enPhrase;
  ruHardcoded[safeKey] = ruPhrase;
}

// Write the safeKeyMap out so we can use it for source code replacement
fs.writeFileSync(path.join(rootDir, 'scratch', 'safe_key_map.json'), JSON.stringify(safeKeyMap, null, 2));

// Update en.json
const enDict = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
enDict.hardcoded = enHardcoded;
fs.writeFileSync(enFile, JSON.stringify(enDict, null, 2));

// Update ru.json
const ruDict = JSON.parse(fs.readFileSync(ruFile, 'utf-8'));
ruDict.hardcoded = ruHardcoded;
fs.writeFileSync(ruFile, JSON.stringify(ruDict, null, 2));

console.log("Dictionaries updated with 'hardcoded' section.");
console.log(`Generated ${Object.keys(safeKeyMap).length} safe keys.`);
