import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await expect(loginPage.signInHeading).toBeVisible();
  await loginPage.signInAndOpenPrograms(email, password);

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});