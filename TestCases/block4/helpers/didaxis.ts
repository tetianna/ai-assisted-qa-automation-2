import { expect, type Locator, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { dialogFields, locators } from './locators';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export { locators, dialogFields };

export function uniqueName(base: string): string {
  return `${base}-${Date.now()}`;
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function namePattern(name: string): RegExp {
  return new RegExp(escapeRegex(name));
}

export function baseUrl(): string {
  const url = process.env.DIDAXIS_URL;
  if (!url) throw new Error('DIDAXIS_URL is not set in .env');
  return url.replace(/\/$/, '');
}

export function requireEnvCredentials(): { email: string; password: string } {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }
  return { email, password };
}

export function hasNonAdminCredentials(): boolean {
  return !!(process.env.DIDAXIS_NON_ADMIN_EMAIL && process.env.DIDAXIS_NON_ADMIN_PASSWORD);
}

export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto(`${baseUrl()}/login`);
  await expect(locators.login.signInHeading(page)).toBeVisible();
  await locators.login.email(page).fill(email);
  await locators.login.password(page).fill(password);
  await locators.login.signInButton(page).click();
  await expect(locators.login.dashboardHeading(page)).toBeVisible();
  await expect(locators.login.welcomeText(page)).toBeVisible();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const { email, password } = requireEnvCredentials();
  await loginWithCredentials(page, email, password);
}

export async function loginAsNonAdmin(page: Page): Promise<void> {
  const email = process.env.DIDAXIS_NON_ADMIN_EMAIL;
  const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD must be set in .env');
  }
  await loginWithCredentials(page, email, password);
}

export async function waitForProgramsPage(page: Page): Promise<void> {
  await expect(locators.programsPage.heading(page)).toBeVisible();
  await expect(locators.programsPage.subtitle(page)).toBeVisible();
  await expect(
    locators.programsPage.table(page).or(locators.programsPage.emptyState(page)),
  ).toBeVisible({ timeout: 15_000 });
  if (await locators.programsPage.table(page).isVisible()) {
    await expect(locators.programsPage.programColumnHeader(page)).toBeVisible();
  }
}

/** @deprecated Use waitForProgramsPage */
export async function waitForProgramsTable(page: Page): Promise<void> {
  await waitForProgramsPage(page);
}

export async function goToPrograms(page: Page): Promise<void> {
  await locators.navigation.programsButton(page).click();
  await expect(page).toHaveURL(/\/programs/);
  await waitForProgramsPage(page);
}

/** Navigate to Programs using a pre-authenticated storageState session. */
export async function gotoProgramsAsAuthenticated(page: Page): Promise<void> {
  await page.goto(`${baseUrl()}/programs`);
  await waitForProgramsPage(page);
}

export function newProgramDialog(page: Page): Locator {
  return locators.createProgramDialog.dialog(page);
}

export function editProgramDialog(page: Page): Locator {
  return locators.editProgramDialog.dialog(page);
}

export async function openNewProgramDialog(page: Page): Promise<Locator> {
  await locators.programsPage.newProgramButton(page).click();
  const dialog = newProgramDialog(page);
  await expect(dialog).toBeVisible();
  await expect(locators.createProgramDialog.heading(page)).toBeVisible();
  return dialog;
}

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

function isProgramCreatePost(response: { request: () => { method: () => string }; url: () => string }): boolean {
  if (response.request().method() !== 'POST') return false;
  try {
    return /\/programs\/?$/i.test(new URL(response.url()).pathname);
  } catch {
    return /\/programs/i.test(response.url());
  }
}

async function captureProgramCreate(
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

export async function watchProgramCreates(
  page: Page,
  trackProgram: (uuid: string) => void,
): Promise<void> {
  await page.route('**/programs**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    const bodyBuffer = await response.body();
    let body: unknown = {};
    try {
      body = JSON.parse(bodyBuffer.toString());
    } catch {
      // Non-JSON response; still fulfill so the test can proceed.
    }

    const id = extractProgramId(body);
    if (id) trackProgram(id);
    await route.fulfill({
      status: response.status(),
      headers: response.headers(),
      body: bodyBuffer,
    });
  });
}

/** Submit the new-program dialog and return the created program UUID. */
export async function submitNewProgram(page: Page, dialog: Locator): Promise<string> {
  const programId = await captureProgramCreate(page, async () => {
    await dialogFields.createButton(dialog).click();
  });

  if (!programId) {
    throw new Error('Program UUID not captured from POST /api/programs');
  }

  await expect(dialog).toBeHidden({ timeout: 15_000 });
  return programId;
}

/** Double-click Create and return UUID when a program is created. */
export async function submitNewProgramDblClick(
  page: Page,
  dialog: Locator,
): Promise<string | undefined> {
  const programId = await captureProgramCreate(page, async () => {
    await dialogFields.createButton(dialog).dblclick();
  });

  await expect(dialog).toBeHidden({ timeout: 15_000 });
  return programId;
}

/** Run a create action and return UUID when POST succeeds (no throw if absent). */
export async function tryCaptureProgramCreate(
  page: Page,
  action: () => Promise<void>,
): Promise<string | undefined> {
  return captureProgramCreate(page, action);
}

export async function createProgram(
  page: Page,
  name: string,
  description = '',
): Promise<string> {
  const programId = await captureProgramCreate(page, async () => {
    const dialog = await openNewProgramDialog(page);
    await dialogFields.programName(dialog).fill(name);
    if (description) {
      await dialogFields.description(dialog).fill(description);
    }
    await dialogFields.createButton(dialog).click();
    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expectProgramInList(page, name);
  });

  if (!programId) {
    throw new Error('Program UUID not captured from POST /api/programs');
  }

  return programId;
}

export async function openEditProgram(page: Page, name: string): Promise<Locator> {
  await locators.programList.editButton(page, name).click();
  const dialog = editProgramDialog(page);
  await expect(dialog).toBeVisible();
  await expect(locators.editProgramDialog.heading(page)).toBeVisible();
  return dialog;
}

export function programRow(page: Page, name: string): Locator {
  return locators.programList.row(page, name);
}

export async function expectProgramInList(page: Page, name: string): Promise<void> {
  const row = programRow(page, name).first();
  await expect(row).toBeVisible();
  await expect(locators.programList.programCell(row).getByText(name)).toBeVisible();
}

export async function expectProgramDescriptionInList(
  page: Page,
  name: string,
  description: string,
): Promise<void> {
  const row = programRow(page, name).first();
  await expect(row.getByText(description)).toBeVisible();
}

export async function expectProgramNotInList(page: Page, name: string): Promise<void> {
  await expect(programRow(page, name)).toHaveCount(0);
}

/** Program column cell with exact full name (avoids substring row-name false matches on rename). */
export function exactProgramNameCell(page: Page, name: string): Locator {
  return locators.programsPage.table(page).getByRole('cell').getByText(name, { exact: true });
}

export async function expectExactProgramNameInList(page: Page, name: string): Promise<void> {
  await expect(exactProgramNameCell(page, name)).toBeVisible();
}

export async function expectExactProgramNameNotInList(page: Page, name: string): Promise<void> {
  await expect(exactProgramNameCell(page, name)).toHaveCount(0);
}

export async function countExactProgramsNamed(page: Page, name: string): Promise<number> {
  return exactProgramNameCell(page, name).count();
}

/** Edit save blocked: dialog stays open and an inline or page-level error is shown. */
export async function expectEditValidationOrError(dialog: Locator): Promise<void> {
  await expect(dialog).toBeVisible();
  const inlineError = dialog.getByText(
    /already exists|duplicate|unique|invalid|required|failed|too long|maximum/i,
  );
  const pageError = locators.programsPage.errorMessage(dialog.page());
  await expect(inlineError.or(pageError)).toBeVisible();
}

async function hasAiConfigSection(dialog: Locator): Promise<boolean> {
  if (await dialogFields.aiConfigToggle(dialog).isVisible()) return true;
  return dialogFields.totalProgramHours(dialog).isVisible();
}

async function expandAiConfig(dialog: Locator): Promise<void> {
  const hoursField = dialogFields.totalProgramHours(dialog);
  if (await hoursField.isVisible()) return;

  const toggle = dialogFields.aiConfigToggle(dialog);
  if (!(await toggle.isVisible())) return;

  await toggle.click();
  await expect(hoursField).toBeVisible({ timeout: 5_000 });
}

/**
 * When the edit form includes AI Generation Config, expand it and assert the fields are visible.
 * No-op if that section is not part of the current form (not required by DS-2 ACs).
 */
export async function expectAiConfigFieldsVisible(dialog: Locator): Promise<void> {
  if (!(await hasAiConfigSection(dialog))) return;

  await expandAiConfig(dialog);
  await expect(dialogFields.totalProgramHours(dialog)).toBeVisible();
  await expect(dialogFields.defaultSessionHours(dialog)).toBeVisible();
  await expect(dialogFields.defaultExamHours(dialog)).toBeVisible();
  await expect(dialogFields.targetAudience(dialog)).toBeVisible();
  await expect(dialogFields.focusAreas(dialog)).toBeVisible();
}

export async function expectEditDiscarded(
  page: Page,
  originalName: string,
  draftName: string,
  dismiss: (dialog: Locator) => Promise<void>,
): Promise<void> {
  const dialog = await openEditProgram(page, originalName);
  await dialogFields.programName(dialog).fill(draftName);
  await dismiss(dialog);
  await expect(dialog).toBeHidden();
  await expectExactProgramNameNotInList(page, draftName);
  await expectExactProgramNameInList(page, originalName);

  const reopen = await openEditProgram(page, originalName);
  await expect(dialogFields.programName(reopen)).toHaveValue(originalName);
  await dialogFields.cancelButton(reopen).click();
  await expect(reopen).toBeHidden();
}

/** Asserts success feedback when the product shows a toast or inline message after save. */
export async function expectSaveSuccessFeedback(page: Page): Promise<void> {
  const feedback = locators.toast.success(page);
  if ((await feedback.count()) === 0) return;
  await expect(feedback.first()).toBeVisible();
}

export async function dismissEditProgramIfOpen(page: Page): Promise<void> {
  const dialog = editProgramDialog(page);
  if (await dialog.isVisible()) {
    await dialogFields.cancelButton(dialog).click();
    await expect(dialog).toBeHidden();
  }
}

export async function countProgramsNamed(page: Page, name: string): Promise<number> {
  return programRow(page, name).count();
}

export async function clickDeleteAndHandleDialog(
  page: Page,
  name: string,
  action: 'accept' | 'dismiss',
): Promise<string> {
  const row = programRow(page, name).first();
  await row.scrollIntoViewIfNeeded();

  let message = '';
  const dialogHandled = new Promise<void>((resolve) => {
    page.once('dialog', async (dialog) => {
      message = dialog.message();
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
      resolve();
    });
  });

  await locators.programList.deleteButton(page, name).click();
  await dialogHandled;
  return message;
}

export async function deleteProgram(page: Page, name: string): Promise<void> {
  await clickDeleteAndHandleDialog(page, name, 'accept');
  await expectProgramNotInList(page, name);
}

export async function getProgramListNames(page: Page): Promise<string[]> {
  const rows = locators.programsPage
    .table(page)
    .getByRole('row')
    .filter({ has: page.getByRole('button', { name: /^Edit / }) });
  const count = await rows.count();
  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const cell = locators.programList.programCell(rows.nth(i));
    const text = (await cell.textContent())?.trim();
    if (text) names.push(text.split('\n')[0]?.trim() ?? text);
  }
  return names;
}
