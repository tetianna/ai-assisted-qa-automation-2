import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { locators } from '../TestCases/block4/helpers/locators';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }

  await page.goto('https://test.didaxis.studio/login');
  await expect(locators.login.signInHeading(page)).toBeVisible();
  await locators.login.email(page).fill(email);
  await locators.login.password(page).fill(password);
  await locators.login.signInButton(page).click();
  await expect(locators.login.dashboardHeading(page)).toBeVisible();
  await locators.navigation.programsButton(page).click();
  await page.waitForURL('**/programs');

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});