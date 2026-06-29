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

export async function loginAsAdmin(page: Page): Promise<void> {
  const { email, password } = requireEnvCredentials();

  await page.goto(`${baseUrl()}/login`);
  await expect(locators.login.signInHeading(page)).toBeVisible();
  await locators.login.email(page).fill(email);
  await locators.login.password(page).fill(password);
  await locators.login.signInButton(page).click();
  await expect(locators.login.dashboardHeading(page)).toBeVisible();
  await expect(locators.login.welcomeText(page)).toBeVisible();
}

export async function waitForProgramsTable(page: Page): Promise<void> {
  await expect(locators.programsPage.heading(page)).toBeVisible();
  await expect(locators.programsPage.subtitle(page)).toBeVisible();
  await expect(locators.programsPage.table(page)).toBeVisible({ timeout: 15_000 });
  await expect(locators.programsPage.programColumnHeader(page)).toBeVisible();
}

export async function goToPrograms(page: Page): Promise<void> {
  await locators.navigation.programsButton(page).click();
  await expect(page).toHaveURL(/\/programs/);
  await waitForProgramsTable(page);
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

export async function createProgram(
  page: Page,
  name: string,
  description = '',
): Promise<void> {
  const dialog = await openNewProgramDialog(page);
  await dialogFields.programName(dialog).fill(name);
  if (description) {
    await dialogFields.description(dialog).fill(description);
  }
  await dialogFields.createButton(dialog).click();
  await expect(dialog).toBeHidden({ timeout: 15_000 });
  await expectProgramInList(page, name);
}

export async function openEditProgram(page: Page, name: string): Promise<Locator> {
  await locators.programList.editButton(page, name).click();
  const dialog = editProgramDialog(page);
  await expect(dialog).toBeVisible();
  await expect(locators.editProgramDialog.heading(page)).toBeVisible();
  return dialog;
}

export function programRow(page: Page, name: string): Locator {
  return locators.programList.row(page, name, namePattern(name));
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
