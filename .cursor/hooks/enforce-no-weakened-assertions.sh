#!/usr/bin/env bash
# Refuse weakened Playwright specs under tests/** after agent edits.
# BLOCK (exit 2): fewer active expect( than before, or expect( commented out.
set -euo pipefail

input="$(cat)"

node - "$input" <<'NODE'
const fs = require('fs');
const path = require('path');

const input = JSON.parse(process.argv[2]);
const filePath = input.file_path || '';
const edits = Array.isArray(input.edits) ? input.edits : [];

function log(level, message) {
  process.stderr.write(`[no-weakened-assertions] ${level}: ${message}\n`);
}

function deny(reason) {
  log('BLOCK', reason);
  process.stderr.write(
    JSON.stringify({
      permission: 'deny',
      user_message: reason,
      agent_message:
        'Edit blocked: assertions were weakened (removed or commented out). Fix the locator or POM instead. See playwright-conventions Refusals (hard stops).',
    }) + '\n',
  );
  process.exit(2);
}

function allow(reason) {
  log('ALLOW', reason);
  process.exit(0);
}

const normalized = filePath.replace(/\\/g, '/');
if (!/\/tests\/.+\.(spec|test)\.(ts|js)$/.test(normalized)) {
  allow(`skipped (not tests/**/*.spec): ${filePath || '(no path)'}`);
}

let afterContent;
try {
  afterContent = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  log('ERROR', `could not read ${filePath}: ${err.message}`);
  process.exit(1);
}

function stripBlockComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '');
}

function countActiveExpects(content) {
  const lines = stripBlockComments(content).split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;
    const matches = line.match(/\bexpect\s*\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function countCommentedExpects(content) {
  const lines = stripBlockComments(content).split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') && /\bexpect\s*\(/.test(line)) {
      count += (line.match(/\bexpect\s*\(/g) || []).length;
    }
  }
  return count;
}

function reconstructBefore(after, editList) {
  let before = after;
  for (let i = editList.length - 1; i >= 0; i -= 1) {
    const { old_string, new_string } = editList[i];
    if (!old_string && !new_string) continue;
    if (new_string && before.includes(new_string)) {
      before = before.replace(new_string, old_string);
    } else if (old_string && !before.includes(old_string)) {
      return null;
    }
  }
  return before;
}

if (edits.length === 0) {
  allow(`${path.basename(filePath)}: no edits payload — weaken check skipped`);
}

const beforeContent = reconstructBefore(afterContent, edits);
if (!beforeContent) {
  allow(`${path.basename(filePath)}: could not reconstruct pre-edit content — skipped`);
}

const activeBefore = countActiveExpects(beforeContent);
const activeAfter = countActiveExpects(afterContent);
const commentedBefore = countCommentedExpects(beforeContent);
const commentedAfter = countCommentedExpects(afterContent);

if (activeAfter < activeBefore) {
  deny(
    `${path.basename(filePath)}: active expect( count dropped ${activeBefore} -> ${activeAfter} (assertion removed or weakened)`,
  );
}

if (commentedAfter > commentedBefore) {
  deny(
    `${path.basename(filePath)}: expect( commented out (${commentedBefore} -> ${commentedAfter} commented expects)`,
  );
}

for (const edit of edits) {
  const oldActive = countActiveExpects(edit.old_string || '');
  const newActive = countActiveExpects(edit.new_string || '');
  const oldCommented = countCommentedExpects(edit.old_string || '');
  const newCommented = countCommentedExpects(edit.new_string || '');
  if (newActive < oldActive || newCommented > oldCommented) {
    deny(
      `${path.basename(filePath)}: edit chunk weakened assertions (active ${oldActive}->${newActive}, commented ${oldCommented}->${newCommented})`,
    );
  }
}

allow(
  `${path.basename(filePath)}: assertions preserved (active expect: ${activeBefore} -> ${activeAfter})`,
);
NODE
