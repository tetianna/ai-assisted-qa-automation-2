#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const confirm = process.argv.includes('--confirm');

function extractPrograms(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.programs)) return payload.programs;
  return [];
}

function programId(program) {
  return program?.id ?? program?.uuid ?? program?.programId;
}

async function getToken(baseUrl) {
  const apiToken = process.env.DIDAXIS_API_TOKEN;
  if (apiToken) return apiToken;
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    console.error('Set DIDAXIS_API_TOKEN or DIDAXIS_EMAIL/DIDAXIS_PASSWORD in .env');
    process.exit(1);
  }
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`Login failed: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const body = await res.json();
  const token =
    body?.token ??
    body?.data?.token ??
    body?.data?.access_token ??
    body?.accessToken ??
    body?.access_token;
  if (!token) {
    console.error('Login succeeded but no token found in response');
    process.exit(1);
  }
  return token;
}

async function main() {
  const baseUrl = (process.env.DIDAXIS_URL || 'https://test.didaxis.studio').replace(/\/$/, '');
  const token = await getToken(baseUrl);
  const listRes = await fetch(`${baseUrl}/api/programs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) {
    console.error(`GET /api/programs failed: HTTP ${listRes.status} ${await listRes.text()}`);
    process.exit(1);
  }
  const programs = extractPrograms(await listRes.json())
    .map((program) => ({ id: programId(program), name: program?.name ?? program?.title ?? '(unnamed)' }))
    .filter((program) => program.id);
  console.log(`Found ${programs.length} program(s)`);
  for (const program of programs) console.log(`  - ${program.id}  ${program.name}`);
  if (programs.length === 0) { console.log('Nothing to delete.'); return; }
  if (!confirm) { console.log(''); console.log('Dry run. Pass --confirm to delete all listed programs.'); return; }
  let deleted = 0; let failed = 0;
  for (const program of programs) {
    const delRes = await fetch(`${baseUrl}/api/programs/${program.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (delRes.ok) { deleted += 1; console.log(`Deleted ${program.id} (${program.name})`); }
    else { failed += 1; console.error(`Failed ${program.id}: HTTP ${delRes.status} ${await delRes.text()}`); }
  }
  console.log(''); console.log(`Done: ${deleted} deleted, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });