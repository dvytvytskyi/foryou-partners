const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const rootDir = '/Users/vytvytskyi/foryou_partners';
const targetDirs = [
  path.join(rootDir, 'src'),
  path.join(rootDir, 'backend', 'src'),
];

const outputFile = path.join(rootDir, 'russian_translations.json');
const cyrillicRegex = /[А-Яа-яЁёІіЇїЄєҐґ]/i; // Added Ukrainian chars just in case

let results = {};

function walk(dir) {
  let list = [];
  try {
    list = fs.readdirSync(dir);
  } catch (err) {
    return;
  }
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        extractCyrillicFrom(file);
      }
    }
  });
}

function extractCyrillicFrom(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!cyrillicRegex.test(content)) return;

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let fileResults = [];

  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (cyrillicRegex.test(node.text)) {
        fileResults.push({
          type: 'string',
          value: node.text.trim()
        });
      }
    } else if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (cyrillicRegex.test(text) && text.length > 0) {
        fileResults.push({
          type: 'jsx',
          value: text
        });
      }
    } else if (ts.isTemplateHead(node) || ts.isTemplateTail(node) || ts.isTemplateMiddle(node)) {
      if (cyrillicRegex.test(node.text)) {
        fileResults.push({
          type: 'template',
          value: node.text.trim()
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (fileResults.length > 0) {
    // deduplicate values within a file
    const uniqueVals = [...new Set(fileResults.map(r => r.value))];
    const relativePath = path.relative(rootDir, filePath);
    results[relativePath] = uniqueVals;
  }
}

targetDirs.forEach(walk);

// Create a unified dictionary for translation
const uniquePhrases = new Set();
for (const file in results) {
  for (const phrase of results[file]) {
    uniquePhrases.add(phrase);
  }
}

const translationMap = {};
Array.from(uniquePhrases).sort().forEach(phrase => {
  translationMap[phrase] = phrase; // Default target is the same
});

// Read existing ru.json dictionary
const existingRuPath = path.join(rootDir, 'src', 'i18n', 'dictionaries', 'ru.json');
let existingRu = {};
if (fs.existsSync(existingRuPath)) {
  existingRu = JSON.parse(fs.readFileSync(existingRuPath, 'utf-8'));
}

const finalOutput = {
  _meta: {
    info: "This file contains BOTH the existing i18n dictionary and the hardcoded phrases found in the source code.",
    totalHardcodedFiles: Object.keys(results).length,
    totalHardcodedPhrases: uniquePhrases.size,
  },
  existing_dictionary: existingRu,
  hardcoded_phrases: translationMap,
  fileMapping: results
};

fs.writeFileSync(outputFile, JSON.stringify(finalOutput, null, 2), 'utf-8');
console.log(`Extraction complete. Found ${uniquePhrases.size} unique hardcoded phrases.`);
