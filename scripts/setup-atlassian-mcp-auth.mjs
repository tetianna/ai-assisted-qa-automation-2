import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
const mcpPath = resolve(root, '.cursor', 'mcp.json');

function parseEnv(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    values[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return values;
}

function serializeEnv(values, original) {
  const lines = original.split(/\r?\n/);
  const key = 'ATLASSIAN_MCP_BASIC_AUTH';
  const entry = `${key}=${values[key]}`;
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));

  if (index >= 0) {
    lines[index] = entry;
  } else {
    if (lines.at(-1) !== '') lines.push('');
    lines.push('# Base64(email:api_token) for Atlassian MCP Basic auth');
    lines.push(entry);
  }

  return `${lines.join('\n').replace(/\n?$/, '\n')}`;
}

function writeMcpConfig(basicAuth) {
  mkdirSync(dirname(mcpPath), { recursive: true });
  writeFileSync(
    mcpPath,
    `${JSON.stringify(
      {
        mcpServers: {
          'atlassian-rovo-mcp': {
            type: 'http',
            url: 'https://mcp.atlassian.com/v1/mcp',
            headers: {
              Authorization: `Basic ${basicAuth}`,
            },
          },
        },
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

const envContent = readFileSync(envPath, 'utf8');
const env = parseEnv(envContent);
const email = env.ATLASSIAN_EMAIL;
const token = env.ATLASSIAN_API_TOKEN;

if (!email || !token) {
  console.error('Missing ATLASSIAN_EMAIL or ATLASSIAN_API_TOKEN in .env');
  process.exit(1);
}

env.ATLASSIAN_MCP_BASIC_AUTH = Buffer.from(`${email}:${token}`, 'utf8').toString('base64');
writeFileSync(envPath, serializeEnv(env, envContent), 'utf8');
writeMcpConfig(env.ATLASSIAN_MCP_BASIC_AUTH);
console.log('Updated ATLASSIAN_MCP_BASIC_AUTH in .env and wrote .cursor/mcp.json for API token auth.');
