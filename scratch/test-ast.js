const ts = require('typescript');

const code = `
const x = "Тест 1";
const el = <input placeholder="Поиск" label={'Название'} />;
const tpl = \`Шаблон \${x} здесь\`;
const tpl2 = \`Просто шаблон\`;
`;

const sourceFile = ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true);

function visit(node) {
  if (ts.isStringLiteral(node)) {
    console.log('StringLiteral:', node.text);
  } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
    console.log('NoSubstitutionTemplateLiteral:', node.text);
  } else if (ts.isJsxText(node)) {
    console.log('JsxText:', node.text);
  } else if (ts.isTemplateHead(node) || ts.isTemplateTail(node) || ts.isTemplateMiddle(node)) {
    console.log('TemplatePart:', node.text);
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
