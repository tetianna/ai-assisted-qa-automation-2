import { test as base, expect, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { extractProgramId, getCleanupApiToken } from './program-api';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

type TrackProgram = (uuid: string, name?: string) => void;
type TrackUser = (id: string, email?: string) => void;

type CleanupFixtures = {
  trackProgram: TrackProgram;
  trackUser: TrackUser;
};

function didaxisBaseUrl(): string {
  const url = process.env.DIDAXIS_URL || 'https://test.didaxis.studio';
  return url.replace(/\/$/, '');
}

function extractUserId(body: Record<string, unknown>): string | undefined {
  const data = body.data as Record<string, unknown> | undefined;
  return (
    (data?.id as string | undefined) ??
    (data?.uuid as string | undefined) ??
    (body.id as string | undefined) ??
    (body.uuid as string | undefined)
  );
}

async function getAuthToken(): Promise<string> {
  const token = await getCleanupApiToken();
  if (!token) {
    throw new Error(
      'Set DIDAXIS_API_TOKEN or DIDAXIS_EMAIL/DIDAXIS_PASSWORD in .env for program cleanup',
    );
  }
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

async function deleteUser(id: string, email?: string): Promise<boolean> {
  const baseUrl = didaxisBaseUrl();
  const token = await getAuthToken();

  const deleteRes = await fetch(`${baseUrl}/api/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (deleteRes.ok) {
    const label = email ?? id;
    console.log(`[cleanup] User "${label}" was deleted as part of trackUser cleanup`);
    return true;
  }

  const deactivateRes = await fetch(`${baseUrl}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: false }),
  });

  if (deactivateRes.ok) {
    const label = email ?? id;
    console.log(
      `[cleanup] User "${label}" was deactivated via PATCH (DELETE unavailable) during trackUser cleanup`,
    );
    return true;
  }

  console.warn(
    `[cleanup] Failed to delete or deactivate user ${email ?? id} (${id}): DELETE HTTP ${deleteRes.status}, PATCH HTTP ${deactivateRes.status}`,
  );
  return false;
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

export async function installUserCreateTracker(
  page: Page,
  trackUser: TrackUser,
): Promise<void> {
  await page.route('**/api/users', async (route) => {
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

    const id = extractUserId(body);
    if (id && response.ok()) trackUser(id);

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

  trackUser: async ({}, use) => {
    const userIds = new Map<string, string | undefined>();

    const trackUser: TrackUser = (id, email) => {
      if (id) userIds.set(id, email);
    };

    await use(trackUser);

    for (const [id, email] of userIds) {
      try {
        await deleteUser(id, email);
      } catch (error) {
        console.warn(`[cleanup] Error deleting user ${email ?? id} (${id}):`, error);
      }
    }
  },
});

export { expect };
