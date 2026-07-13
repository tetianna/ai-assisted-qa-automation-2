#!/usr/bin/env node
/**
 * Print paths to PNG screenshots from Playwright test-results.
 * Usage: node scripts/collect-failure-screenshots.mjs --latest
 *        node scripts/collect-failure-screenshots.mjs "<folder-fragment>"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const resultsDir = path.join(root, 'test-results');

function walkPngs(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkPngs(full, acc);
    else if (entry.name.endsWith('.png')) acc.push(full);
  }
  return acc;
}

function latestByMtime(paths) {
  if (paths.length === 0) return [];
  const sorted = [...paths].sort(
    (a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs,
  );
  const newest = fs.statSync(sorted[0]).mtimeMs;
  return sorted.filter((p) => fs.statSync(p).mtimeMs === newest);
}

const arg = process.argv[2];
let pngs = walkPngs(resultsDir);

if (arg && arg !== '--latest') {
  pngs = pngs.filter((p) => p.includes(arg));
} else if (arg === '--latest') {
  pngs = latestByMtime(pngs);
  if (pngs.length === 0 && walkPngs(resultsDir).length > 0) {
    const all = walkPngs(resultsDir);
    const max = Math.max(...all.map((p) => fs.statSync(p).mtimeMs));
    pngs = all.filter((p) => fs.statSync(p).mtimeMs === max);
  }
}

for (const p of pngs) console.log(p);
