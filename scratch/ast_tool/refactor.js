const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';
const mapFile = path.join(rootDir, 'scratch', 'safe_key_map.json');
const translationsFile = path.join(rootDir, 'russian_translations.json');

const safeKeyMap = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
const translationsData = JSON.parse(fs.readFileSync(translationsFile, 'utf-8'));
const fileMapping = translationsData.fileMapping;

const project = new Project({
  tsConfigFilePath: path.join(rootDir, 'tsconfig.json'),
});

function processNode(node, filePath) {
  if (node.getKind() === SyntaxKind.StringLiteral || node.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
    const text = node.getLiteralText();
    if (safeKeyMap[text]) {
      const parent = node.getParent();
      const safeKey = safeKeyMap[text];
      const replacement = `dict.hardcoded.${safeKey}`;

      if (parent.getKind() === SyntaxKind.JsxAttribute) {
        // e.g. placeholder="Поиск" -> placeholder={dict.hardcoded.hc_1}
        const attrName = parent.getNameNode().getText();
        parent.replaceWithText(`${attrName}={${replacement}}`);
      } else {
        node.replaceWithText(replacement);
      }
      return true; // indicates a replacement was made
    }
  } else if (node.getKind() === SyntaxKind.JsxText) {
    const text = node.getLiteralText().trim();
    if (safeKeyMap[text]) {
      const safeKey = safeKeyMap[text];
      // JsxText might have surrounding whitespace, we should replace the whole JsxText node
      // but carefully to keep whitespace if needed. But usually replacing with a JsxExpression is easier.
      // Wait, replacing JsxText with JsxExpression removes the space before and after.
      // Actually, if we just replace it with `{dict.hardcoded.${safeKey}}`, it works.
      const rawText = node.getText();
      const replacedText = rawText.replace(text, `{dict.hardcoded.${safeKey}}`);
      node.replaceWithText(replacedText);
      return true;
    }
  }

  let replaced = false;
  node.forEachChild(child => {
    if (processNode(child, filePath)) {
      replaced = true;
    }
  });
  return replaced;
}

let modifiedFiles = 0;

for (const [relativePath, phrases] of Object.entries(fileMapping)) {
  if (relativePath.startsWith('backend/')) continue; // Skip backend for now

  const absPath = path.join(rootDir, relativePath);
  const sourceFile = project.getSourceFile(absPath) || project.addSourceFileAtPath(absPath);

  if (!sourceFile) {
    console.log(`Could not load ${absPath}`);
    continue;
  }

  // Ensure `dict` is in props if this is a React component?
  // We'll skip auto-injecting `dict` for now because most already have it, or it's complex to find the right component signature.
  // The user can fix the few compile errors if `dict` is missing.
  
  let replaced = false;
  sourceFile.forEachChild(child => {
    if (processNode(child, absPath)) {
      replaced = true;
    }
  });

  if (replaced) {
    sourceFile.saveSync();
    console.log(`Updated ${relativePath}`);
    modifiedFiles++;
  }
}

console.log(`Finished updating ${modifiedFiles} frontend files.`);
