import type { Page } from '@playwright/test';

function extractProgramId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const record = body as Record<string, unknown>;
  const data = record.data as Record<string, unknown> | undefined;
  return (
    (data?.id as string | undefined) ??
    (data?.uuid as string | undefined) ??
    (record.id as string | undefined) ??
    (record.uuid as string | undefined)
  );
}

function isProgramCreatePost(response: {
  request: () => { method: () => string };
  url: () => string;
}): boolean {
  if (response.request().method() !== 'POST') return false;
  try {
    return /\/programs\/?$/i.test(new URL(response.url()).pathname);
  } catch {
    return /\/programs/i.test(response.url());
  }
}

export async function captureProgramCreate(
  page: Page,
  action: () => Promise<void>,
): Promise<string | undefined> {
  const responsePromise = page.waitForResponse(isProgramCreatePost, { timeout: 15_000 });

  await action();

  try {
    const response = await responsePromise;
    const body = await response.json();
    return extractProgramId(body);
  } catch {
    return undefined;
  }
}