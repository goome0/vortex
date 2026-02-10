const fs = require('fs');
const path = require('path');

function listTsFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.ts'))
    .filter((f) => f !== 'index.ts');
}

function rewriteLocalImportsToEntity(content) {
  // Rewrites `from "./foo"` -> `from "./foo.entity"`
  // and `from '../x/foo'` when it is local to same folder? (we only target "./")
  return content.replace(/from\s+["']\.\/([a-z0-9-]+)["']/gi, 'from "./$1.entity"');
}

function promoteDb(dbName) {
  const srcDir = path.join(__dirname, '..', 'src', 'database', '_generated', dbName);
  const dstDir = path.join(__dirname, '..', 'src', 'database', 'entities', dbName);

  if (!fs.existsSync(srcDir)) {
    throw new Error(`Source dir not found: ${srcDir}`);
  }

  fs.mkdirSync(dstDir, { recursive: true });

  const files = listTsFiles(srcDir);

  for (const file of files) {
    const base = file.replace(/\.ts$/i, '');
    const dstFile = `${base}.entity.ts`;

    const srcPath = path.join(srcDir, file);
    const dstPath = path.join(dstDir, dstFile);

    const raw = fs.readFileSync(srcPath, 'utf8');
    const rewritten = rewriteLocalImportsToEntity(raw);

    fs.writeFileSync(dstPath, rewritten, 'utf8');
  }

  // Generate a simple index.ts exporting everything.
  const exports = files
    .map((f) => f.replace(/\.ts$/i, ''))
    .sort((a, b) => a.localeCompare(b))
    .map((base) => `export { ${toExportNameGuess(base)} } from './${base}.entity';`)
    .join('\n');

  fs.writeFileSync(path.join(dstDir, 'index.ts'), exports + '\n', 'utf8');
}

function toExportNameGuess(fileBase) {
  // The generator uses PascalCase class names derived from table names.
  // With `--ce pascal`, file `account-world-data.ts` likely contains `AccountWorldData`.
  return fileBase
    .split('-')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function main() {
  const dbs = ['comp_hack', 'world'];
  for (const db of dbs) promoteDb(db);
  console.log('Promoted generated entities for:', dbs.join(', '));
}

main();

