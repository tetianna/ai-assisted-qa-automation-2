// Playwright tests derived from features/DS-213.feature
import { test, expect } from '../fixtures/cleanup.fixture';
import { AppNavigation } from '../pages/AppNavigation';
import { LoginPage } from '../pages/LoginPage';
import { SettingsPage } from '../pages/SettingsPage';
import { hasNonAdminCredentials, uniqueName } from '../TestCases/block4/helpers/didaxis';

function uniqueEmail(prefix = 'qa-ds213'): string {
  return `${prefix}-${Date.now()}@example.com`;
}

function testPassword(): string {
  return `Pass-${Date.now()}!aa`;
}

function maxLengthEmail(): string {
  const local = 'a'.repeat(64);
  const domain = 'b'.repeat(189);
  return `${local}@${domain}`;
}

test.describe('DS-213: Add user in Settings', () => {
  test.beforeEach(async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await settingsPage.waitForUsersSection();
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Admin navigates to Settings and opens add-user form', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      const modal = settingsPage.addUserModal;

      await expect(settingsPage.heading).toBeVisible();
      await expect(settingsPage.usersSectionHeading).toBeVisible();
      await settingsPage.openAddUserForm();
      await expect(modal.dialog).toBeVisible();
      await expect(modal.nameInput).toBeVisible();
      await expect(modal.emailInput).toBeVisible();
      await expect(modal.passwordInput).toBeVisible();
    });

    test('TC-002 — Admin successfully adds a new user with required fields', async ({
      page,
      trackUser,
    }) => {
      const settingsPage = new SettingsPage(page);
      const modal = settingsPage.addUserModal;
      const name = uniqueName('QA New User');
      const email = uniqueEmail('qa.newuser');
      const password = testPassword();

      const userId = await settingsPage.addUser(name, email, password);
      trackUser(userId, email);

      await expect(modal.dialog).toBeHidden();
      await expect(settingsPage.userRow(name)).toBeVisible();
      await expect(settingsPage.userRowByEmail(email)).toBeVisible();
    });

    test('TC-003 — Newly added user appears without manual page refresh', async ({
      page,
      trackUser,
    }) => {
      const settingsPage = new SettingsPage(page);
      const name = uniqueName('QA Refresh User');
      const email = uniqueEmail('qa.refresh');
      const password = testPassword();

      trackUser(await settingsPage.addUser(name, email, password), email);
      await expect(settingsPage.userRow(name)).toBeVisible();
      await expect(page).toHaveURL(/\/settings/);
    });
  });

  test.describe('Negative', () => {
    test('TC-004 — Add user form rejects submission with empty email', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      const modal = settingsPage.addUserModal;
      const name = uniqueName('Empty Email User');

      await settingsPage.openAddUserForm();
      await modal.fillName(name);
      await modal.fillPassword(testPassword());

      await expect(modal.createButton).toBeDisabled();
      await expect(modal.emailInput).toHaveAttribute('required', '');
      await expect(await settingsPage.countUsersNamed(name)).toBe(0);
    });

    test('TC-005 — Add user form rejects duplicate email', async ({ page, trackUser }) => {
      const settingsPage = new SettingsPage(page);
      const modal = settingsPage.addUserModal;
      const email = uniqueEmail('existing.user');
      const firstName = uniqueName('Existing User');
      const duplicateName = uniqueName('Duplicate User');
      const password = testPassword();

      trackUser(await settingsPage.addUser(firstName, email, password), email);
      await expect(await settingsPage.countUsersWithEmail(email)).toBe(1);

      await settingsPage.openAddUserForm();
      await modal.fillUserDetails(duplicateName, email, testPassword());

      const createResponse = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' && /\/api\/users\/?$/i.test(response.url()),
      );
      await modal.clickCreate();
      const response = await createResponse;

      expect(response.ok()).toBe(false);
      await expect(modal.dialog).toBeVisible();
      await expect(await settingsPage.countUsersWithEmail(email)).toBe(1);
      await expect(await settingsPage.countUsersNamed(duplicateName)).toBe(0);
    });

    test('TC-006 — Non-admin cannot access add-user functionality', async ({ page }) => {
      test.skip(
        !hasNonAdminCredentials(),
        'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD in .env',
      );

      const settingsPage = new SettingsPage(page);
      const navigation = new AppNavigation(page);
      const loginPage = new LoginPage(page);
      const email = process.env.DIDAXIS_NON_ADMIN_EMAIL!;
      const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD!;

      await navigation.signOutButton.click();
      await loginPage.goto();
      await loginPage.signIn(email, password);
      await settingsPage.goto();

      await expect(settingsPage.heading).toBeVisible();
      await expect(settingsPage.accountSectionHeading).toBeVisible();
      await expect(settingsPage.addUserButton).toHaveCount(0);
      await expect(settingsPage.usersSectionHeading).toHaveCount(0);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-007 — Add user with special characters in display name', async ({
      page,
      trackUser,
    }) => {
      const settingsPage = new SettingsPage(page);
      const name = "O'Brien-Smith (QA)";
      const email = uniqueEmail('qa.special');
      const password = testPassword();

      trackUser(await settingsPage.addUser(name, email, password), email);
      await expect(settingsPage.userRow(name)).toBeVisible();
    });

    test('TC-008 — Add user with maximum-length email', async ({ page, trackUser }) => {
      const settingsPage = new SettingsPage(page);
      const email = maxLengthEmail();
      const name = uniqueName('Max Email User');
      const password = testPassword();

      expect(email.length).toBe(254);
      trackUser(await settingsPage.addUser(name, email, password), email);
      await expect(settingsPage.userRowByEmail(email)).toBeVisible();
    });

    test('TC-009 — Cancel add-user form discards input', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      const modal = settingsPage.addUserModal;
      const name = uniqueName('Cancelled User');
      const email = uniqueEmail('qa.cancel');

      await settingsPage.openAddUserForm();
      await modal.fillUserDetails(name, email, testPassword());
      await modal.close();

      await expect(modal.dialog).toBeHidden();
      await expect(await settingsPage.countUsersNamed(name)).toBe(0);
      await expect(await settingsPage.countUsersWithEmail(email)).toBe(0);
    });
  });
});
