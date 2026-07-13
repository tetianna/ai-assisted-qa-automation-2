import { test as base, expect, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

type TrackProgram = (uuid: string, name?: string) => void;

type CleanupFixtures = {
  trackProgram: TrackProgram;
};

let cachedLoginToken: string | null = null;

function didaxisBaseUrl(): string {
  const url = process.env.DIDAXIS_URL || 'https://test.didaxis.studio';
  return url.replace(/\/$/, '');
}

function extractAuthToken(body: Record<string, unknown>): string | undefined {
  const data = body.data as Record<string, unknown> | undefined;
  return (
    (body.token as string | undefined) ??
    (data?.token as string | undefined) ??
    (data?.access_token as string | undefined) ??
    (body.accessToken as string | undefined) ??
    (body.access_token as string | undefined)
  );
}

function extractProgramId(body: Record<string, unknown>): string | undefined {
  const data = body.data as Record<string, unknown> | undefined;
  return (data?.id as string | undefined) ?? (body.id as string | undefined);
}

async function getAuthToken(): Promise<string> {
  const apiToken = process.env.DIDAXIS_API_TOKEN;
  if (apiToken) return apiToken;

  if (cachedLoginToken) return cachedLoginToken;

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'Set DIDAXIS_API_TOKEN or DIDAXIS_EMAIL/DIDAXIS_PASSWORD in .env for program cleanup',
    );
  }

  const baseUrl = didaxisBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Didaxis login failed for cleanup: HTTP ${res.status} ${await res.text()}`);
  }

  const body = (await res.json()) as Record<string, unknown>;
  const token = extractAuthToken(body);
  if (!token) {
    throw new Error('Didaxis login succeeded but no auth token was returned');
  }

  cachedLoginToken = token;
  return token;
}

async function deleteProgram(uuid: string, name?: string): Promise<boolean> {
  const baseUrl = didaxisBaseUrl();
  const token = await getAuthToken();
  const res = await fetch(`${baseUrl}/api/programs/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.warn(
      `[cleanup] Failed to delete program ${name ?? uuid} (${uuid}): HTTP ${res.status} ${await res.text()}`,
    );
    return false;
  }

  const label = name ?? uuid;
  console.log(
    `[cleanup] Program named "${label}" was deleted as part of trackProgram cleanup`,
  );
  return true;
}

export async function installProgramCreateTracker(
  page: Page,
  trackProgram: TrackProgram,
): Promise<void> {
  await page.route('**/api/programs', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      // Non-JSON response; still fulfill so the test can proceed.
    }

    const id = extractProgramId(body);
    if (id) trackProgram(id);

    await route.fulfill({ response });
  });
}

export const test = base.extend<CleanupFixtures>({
  trackProgram: async ({}, use) => {
    const programIds = new Map<string, string | undefined>();

    const trackProgram: TrackProgram = (uuid, name) => {
      if (uuid) programIds.set(uuid, name);
    };

    await use(trackProgram);

    for (const [uuid, name] of programIds) {
      try {
        await deleteProgram(uuid, name);
      } catch (error) {
        console.warn(`[cleanup] Error deleting program ${name ?? uuid} (${uuid}):`, error);
      }
    }
  },
});

export { expect };