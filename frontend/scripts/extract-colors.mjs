import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

const TEXT_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.md',
  '.json',
  '.yml',
  '.yaml',
]);

const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git']);

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      out.push(...walk(full));
      continue;
    }
    if (!e.isFile()) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (TEXT_EXTS.has(ext)) out.push(full);
  }
  return out;
}

function uniqSorted(arr) {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
}

function extractFromText(text) {
  const hex = [];
  const rgb = [];
  const hsl = [];
  const tailwind = [];

  // Hex: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
  for (const m of text.matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) {
    hex.push(m[0]);
  }

  // rgb/rgba
  for (const m of text.matchAll(/\brgba?\(\s*[^)]+\)/g)) {
    rgb.push(m[0]);
  }

  // hsl/hsla
  for (const m of text.matchAll(/\bhsla?\(\s*[^)]+\)/g)) {
    hsl.push(m[0]);
  }

  // Tailwind-ish color tokens inside class strings:
  // bg-slate-900/80, text-cyan-400, border-slate-800/50, from-cyan-500, to-teal-600, ring-cyan-500/20, etc.
  // Also allow black/white with optional /opacity (bg-black/60)
  const twRegex =
    /\b(?:bg|text|border|from|via|to|ring|outline|shadow|fill|stroke)-(?:black|white|transparent|current|[a-z]+)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/\d{1,3})?\b/g;
  for (const m of text.matchAll(twRegex)) {
    tailwind.push(m[0]);
  }

  // Tailwind tokens without numeric shade but with opacity (bg-black/60, text-white/80)
  const twSimple =
    /\b(?:bg|text|border|from|via|to|ring|outline|shadow|fill|stroke)-(?:black|white)(?:\/\d{1,3})\b/g;
  for (const m of text.matchAll(twSimple)) {
    tailwind.push(m[0]);
  }

  return { hex, rgb, hsl, tailwind };
}

function main() {
  const files = walk(ROOT);
  const byFile = {};
  const allHex = [];
  const allRgb = [];
  const allHsl = [];
  const allTailwind = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { hex, rgb, hsl, tailwind } = extractFromText(raw);
    if (hex.length || rgb.length || hsl.length || tailwind.length) {
      const rel = path.relative(ROOT, file).replaceAll('\\', '/');
      byFile[rel] = {
        hex: uniqSorted(hex),
        rgb: uniqSorted(rgb),
        hsl: uniqSorted(hsl),
        tailwind: uniqSorted(tailwind),
      };
      allHex.push(...hex);
      allRgb.push(...rgb);
      allHsl.push(...hsl);
      allTailwind.push(...tailwind);
    }
  }

  const result = {
    themeName: 'DB_DarkTheme',
    scannedRoot: ROOT.replaceAll('\\', '/'),
    totals: {
      filesScanned: files.length,
      filesWithMatches: Object.keys(byFile).length,
      uniqueHex: new Set(allHex).size,
      uniqueRgb: new Set(allRgb).size,
      uniqueHsl: new Set(allHsl).size,
      uniqueTailwind: new Set(allTailwind).size,
    },
    unique: {
      hex: uniqSorted(allHex),
      rgb: uniqSorted(allRgb),
      hsl: uniqSorted(allHsl),
      tailwind: uniqSorted(allTailwind),
    },
    byFile,
  };

  const outDir = path.join(ROOT, 'src', 'theme');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'DB_DarkTheme.used-colors.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n', 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(ROOT, outPath)} with ${result.totals.filesWithMatches} matching files.`);
}

main();

