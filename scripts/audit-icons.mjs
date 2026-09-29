import assert from "node:assert/strict";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import ts from "typescript";

const root = process.cwd();
const ignored = new Set(["node_modules", ".next", ".git", "artifacts", "test-results", "playwright-report"]);
const extensions = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs", ".html", ".css", ".scss"]);
const candidates = /[\u2190-\u21ff\u2300-\u23ff\u25a0-\u27ff\ufe0e\ufe0f\u22ef\u2026\u2212\u2013\u00d7+]/gu;
const forbidden = /[\u2190-\u21ff\u2300-\u23ff\u25a0-\u27ff\ufe0e\ufe0f\u22ef\u2212]/u;
const files = [];
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(folder, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (extensions.has(extname(path))) files.push(path);
  }
}
walk(root);
const occurrences = [];
const pseudoContents = [];
const escapedSymbols = [];
for (const path of files) {
  const source = readFileSync(path, "utf8");
  const file = relative(root, path).replaceAll("\\", "/");
  const record = (text, position) => {
    for (const match of text.matchAll(candidates)) {
      const offset = position + match.index;
      const line = source.slice(0, offset).split("\n").length;
      const context = text.slice(Math.max(0, match.index - 65), match.index + 90).trim();
      occurrences.push({ file, line, symbol: match[0], codepoint: `U+${match[0].codePointAt(0).toString(16).toUpperCase()}`, context, classification: forbidden.test(match[0]) ? "requires review" : [".css", ".scss"].includes(extname(path)) && match[0] === "+" ? "CSS selector or calculation" : "ordinary typography or copy" });
    }
  };
  if ([".css", ".scss", ".html"].includes(extname(path))) {
    record(source, 0);
    for (const match of source.matchAll(/(?:^|[;{])\s*content\s*:\s*([^;}]+)/g)) pseudoContents.push({ file, value: match[1].trim() });
    for (const match of source.matchAll(/&(?:#(?:x[0-9a-f]+|\d+)|rarr|larr|uarr|darr|nearr|searr|times|hearts|star);/gi)) escapedSymbols.push({ file, value: match[0] });
  } else {
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = node => {
      if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || [ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail].includes(node.kind)) record(node.text, node.getStart(ast));
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
}
const report = { filesChecked: files.length, occurrences, pseudoContents, escapedSymbols, remainingUnicodeUiIcons: occurrences.filter(item => item.classification === "requires review") };
mkdirSync(join(root, "artifacts", "icon-consistency"), { recursive: true });
writeFileSync(join(root, "artifacts", "icon-consistency", "source-audit.json"), JSON.stringify(report, null, 2));
assert.equal(report.remainingUnicodeUiIcons.length, 0, "Review Unicode icon candidates in source-audit.json.");
assert.equal(escapedSymbols.length, 0, "Review HTML entity icons in source-audit.json.");
console.log(JSON.stringify({ filesChecked: files.length, unicodeUiIcons: 0, typographyOccurrences: occurrences.length, pseudoContents, escapedSymbols }));
