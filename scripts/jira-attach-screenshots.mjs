#!/usr/bin/env node
/**
 * Attach PNG files to a Jira issue via REST API.
 * Usage: node scripts/jira-attach-screenshots.mjs DS-123 path1.png path2.png
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const issueKey = process.argv[2];
const files = process.argv.slice(3).filter((f) => f.endsWith('.png') && fs.existsSync(f));

if (!issueKey) {
  console.error('Usage: node scripts/jira-attach-screenshots.mjs <ISSUE-KEY> <png>...');
  process.exit(1);
}

const email = process.env.JIRA_LOGIN_EMAIL;
const token = process.env.JIRA_API_TOKEN;
const site = process.env.JIRA_SITE || 'legionqaschool.atlassian.net';

if (!email || !token) {
  console.error('Set JIRA_LOGIN_EMAIL and JIRA_API_TOKEN in .env');
  process.exit(1);
}

if (files.length === 0) {
  console.error('No PNG files to attach');
  process.exit(1);
}

const auth = Buffer.from(`${email}:${token}`).toString('base64');

for (const filePath of files) {
  const body = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const form = new FormData();
  form.append('file', new Blob([body], { type: 'image/png' }), filename);

  const res = await fetch(`https://${site}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'X-Atlassian-Token': 'no-check', // required for Jira Cloud attachment uploads
    },
    body: form,
  });

  if (!res.ok) {
    console.error(`Failed to attach ${filename}: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  console.log(`Attached ${filename} to ${issueKey}`);
}
