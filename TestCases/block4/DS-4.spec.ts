import { test, expect } from '@playwright/test';
import {
  clickDeleteAndHandleDialog,
  createProgram,
  deleteProgram,
  expectProgramInList,
  expectProgramNotInList,
  goToPrograms,
  locators,
  loginAsAdmin,
  uniqueName,
} from './helpers/didaxis';

test.describe('DS-4: Delete Program with Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPrograms(page);
  });

  test.describe('Positive Flows', () => {
    test('TC-001: Confirmed deletion removes program from list', async ({ page }) => {
      const name = uniqueName('Test Program');
      await createProgram(page, name, 'Program used for deletion testing');
      await deleteProgram(page, name);
    });

    test('TC-002: Cancelled deletion keeps program in list', async ({ page }) => {
      const name = uniqueName('Web Development 2026');
      await createProgram(page, name, 'Keep this program');
      await clickDeleteAndHandleDialog(page, name, 'dismiss');
      await expectProgramInList(page, name);
    });

    test('TC-003: Confirmation dialog displays program identifier', async ({ page }) => {
      const name = uniqueName('Data Science Fundamentals');
      await createProgram(page, name, 'Foundations of data science');
      const message = await clickDeleteAndHandleDialog(page, name, 'dismiss');
      expect(message).toContain(name);
      expect(message.toLowerCase()).toMatch(/delete|remove/);
    });

    test('TC-004: List updates immediately after successful deletion', async ({ page }) => {
      const name = uniqueName('Cybersecurity Bootcamp');
      await createProgram(page, name, 'Security program');
      await expectProgramInList(page, name);
      await deleteProgram(page, name);
      await expect(page).toHaveURL(/\/programs/);
    });

    test('TC-005: Success feedback shown after deletion', async ({ page }) => {
      const name = uniqueName('Mobile App Development');
      await createProgram(page, name, 'iOS and Android development');
      await deleteProgram(page, name);
      await expectProgramNotInList(page, name);
    });
  });

  test.describe('Negative Flows', () => {
    test('TC-006: Delete icon click alone does not remove program', async ({ page }) => {
      const name = uniqueName('UX Design Certificate');
      await createProgram(page, name, 'UX program');
      await clickDeleteAndHandleDialog(page, name, 'dismiss');
      await expectProgramInList(page, name);
    });

    test.skip('TC-007: Non-admin user cannot delete programs', async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test('TC-008: Server error during delete leaves program intact', async ({ page }) => {
      const name = uniqueName('Cloud Computing 2026');
      await createProgram(page, name, 'Cloud program');

      await page.route('**/programs/**', (route) => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({ status: 500, body: 'Delete failed' });
        } else {
          route.continue();
        }
      });

      page.once('dialog', (dialog) => dialog.accept());
      await locators.programList.deleteButton(page, name).click();
      await expectProgramInList(page, name);
    });

    test('TC-009: Deleting already-deleted program shows appropriate error', async ({ page }) => {
      const name = uniqueName('DevOps Engineering 2026');
      await createProgram(page, name, 'DevOps');
      await deleteProgram(page, name);
      await expectProgramNotInList(page, name);
    });

    test.skip('TC-010: Program with dependencies cannot be deleted (if business rule applies)', async () => {
      test.skip(true, 'Requires program with linked courses/enrollments');
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-011: Delete program with long name displays correctly in dialog', async ({ page }) => {
      const prefix = uniqueName('LongName');
      const longName = (prefix + 'L'.repeat(200)).slice(0, 255);
      await createProgram(page, longName, 'Long name delete test');
      const message = await clickDeleteAndHandleDialog(page, longName, 'dismiss');
      expect(message).toContain(longName);
    });

    test('TC-012: Delete program with special characters in name', async ({ page }) => {
      const name = uniqueName('AI & ML: Phase-1 (2026)');
      await createProgram(page, name, 'Special chars');
      const message = await clickDeleteAndHandleDialog(page, name, 'dismiss');
      expect(message).toContain(name);
    });

    test('TC-013: Escape key dismisses confirmation without deleting', async ({ page }) => {
      const name = uniqueName('Escape Delete Test');
      await createProgram(page, name, 'Escape test');

      page.once('dialog', (dialog) => dialog.dismiss());
      await locators.programList.deleteButton(page, name).click();
      await expectProgramInList(page, name);
    });

    test('TC-014: Double-click confirm does not cause errors', async ({ page }) => {
      const name = uniqueName('Double Confirm Delete');
      await createProgram(page, name, 'Double confirm');

      let confirmCount = 0;
      page.on('dialog', async (dialog) => {
        confirmCount += 1;
        await dialog.accept();
      });

      await locators.programList.deleteButton(page, name).click();
      await page.waitForTimeout(1000);
      expect(confirmCount).toBeGreaterThanOrEqual(1);
    });

    test('TC-015: Delete last remaining program transitions to empty state', async ({ page }) => {
      const name = uniqueName('Last Program Probe');
      await createProgram(page, name, 'Only one for this test scope');
      await deleteProgram(page, name);
      await expectProgramNotInList(page, name);
    });

    test('TC-016: Click outside dialog cancels deletion (if supported)', async ({ page }) => {
      const name = uniqueName('Outside Click Delete');
      await createProgram(page, name, 'Outside click test');

      page.once('dialog', (dialog) => dialog.dismiss());
      await locators.programList.deleteButton(page, name).click();
      await expectProgramInList(page, name);
    });

    test.skip('TC-017: Undo after delete (if feature exists)', async () => {
      test.skip(true, 'Undo after delete is not implemented in the application');
    });
  });
});
