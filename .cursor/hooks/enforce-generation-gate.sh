#!/usr/bin/env bash
# Generation gate for agent-written Playwright specs under tests/
# BLOCK (exit 2): no expect( assertions, or page.locator with CSS/XPath selectors.
set -euo pipefail

input="$(cat)"

node - "$input" <<'NODE'
const fs = require('fs');
const path = require('path');

const input = JSON.parse(process.argv[2]);
const filePath = input.file_path || '';

function log(level, message) {
  process.stderr.write(`[generation-gate] ${level}: ${message}\n`);
}

function deny(reason) {
  log('BLOCK', reason);
  process.stderr.write(
    JSON.stringify({
      permission: 'deny',
      user_message: reason,
      agent_message:
        'Spec blocked by generation gate. Use POM locators (getByRole/getByLabel/etc.), not page.locator with CSS (#, .) or XPath (//). Every test must contain at least one expect( assertion.',
    }) + '\n',
  );
  process.exit(2);
}

function allow(reason) {
  log('ALLOW', reason);
  process.exit(0);
}

const normalized = filePath.replace(/\\/g, '/');
if (!/\/tests\/.+\.spec\.(ts|js)$/.test(normalized)) {
  allow(`skipped (not a tests/**/*.spec file): ${filePath || '(no path)'}`);
}

let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  log('ERROR', `could not read ${filePath}: ${err.message}`);
  process.exit(1);
}

const withoutComments = content
  .replace(/\/\/.*$/gm, '')
  .replace(/\/\*[\s\S]*?\*\//g, '');

if (!/\bexpect\s*\(/.test(withoutComments)) {
  deny(`${path.basename(filePath)}: no expect( assertions — test asserts nothing`);
}

const locatorRe = /page\.locator\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
let match;
while ((match = locatorRe.exec(content)) !== null) {
  const selector = match[2];
  if (selector.includes('.') || selector.includes('#') || selector.includes('//')) {
    deny(
      `${path.basename(filePath)}: forbidden CSS/XPath page.locator — "${selector.slice(0, 80)}${selector.length > 80 ? '…' : ''}"`,
    );
  }
}

allow(`${path.basename(filePath)}: passed generation gate`);
NODE
