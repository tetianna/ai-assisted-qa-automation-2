import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { SettingsPage } from '../pages/SettingsPage';
import { formatViolations, recordViolations } from './helpers/a11y';

test.describe('DS-212 Settings add-user accessibility', () => {
  test.beforeEach(async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.waitForUsersSection();
  });

  test('Settings page has no axe violations', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await expect(settingsPage.heading).toBeVisible();
    await expect(settingsPage.usersSectionHeading).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    recordViolations('Settings page (full scan)', results.violations);

    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('Add User modal has no axe violations', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.openAddUserForm();
    await expect(settingsPage.addUserModal.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include(await settingsPage.addUserModal.axeIncludeSelector())
      .analyze();
    recordViolations('Add User modal (scoped scan)', results.violations);

    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('Add User opens from keyboard focus on Add User control', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const addUserButton = settingsPage.addUserButton;

    await addUserButton.focus();
    await expect(addUserButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(settingsPage.addUserModal.dialog).toBeVisible();
  });
});
