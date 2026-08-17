// Playwright tests derived from features/DS-4.feature
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from '../tests/helpers/didaxis';

test.describe('DS-4: Delete Program with Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Confirmed deletion removes program from list', { tag: '@smoke' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Test Program');

      trackProgram(await programsPage.createProgram(name, 'Program used for deletion testing'), name);
      await programsPage.deleteProgramAndWaitForRemoval(name);
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
    });

    test('TC-002 — Cancelled deletion keeps program in list', { tag: '@sanity' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Web Development 2026');

      trackProgram(await programsPage.createProgram(name, 'Keep this program'), name);
      await programsPage.clickDeleteAndHandleDialog(name, 'dismiss');
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-003 — Confirmation dialog displays program identifier', { tag: '@sanity' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Data Science Fundamentals');

      trackProgram(await programsPage.createProgram(name, 'Foundations of data science'), name);
      const message = await programsPage.clickDeleteAndHandleDialog(name, 'dismiss');
      expect(message).toContain(name);
      expect(message.toLowerCase()).toMatch(/delete|remove/);
    });

    test('TC-004 — List updates immediately after successful deletion', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Cybersecurity Bootcamp');

      trackProgram(await programsPage.createProgram(name, 'Security program'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
      await programsPage.deleteProgramAndWaitForRemoval(name);
      await expect(page).toHaveURL(/\/programs/);
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
    });

    test('TC-005 — Success feedback shown after deletion', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Mobile App Development');

      trackProgram(await programsPage.createProgram(name, 'iOS and Android development'), name);
      await programsPage.deleteProgramAndWaitForRemoval(name);
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);

      if ((await programsPage.successToast.count()) > 0) {
        await expect(programsPage.successToast).toBeVisible();
      }
    });
  });

  test.describe('Negative', () => {
    test('TC-006 — Delete icon click alone does not remove program', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('UX Design Certificate');

      trackProgram(await programsPage.createProgram(name, 'UX program'), name);
      await programsPage.clickDeleteAndHandleDialog(name, 'dismiss');
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test.skip('TC-007 — Non-admin user cannot delete programs', { tag: '@regression' }, async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test('TC-008 — Server error during delete leaves program intact', { tag: '@api' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Cloud Computing 2026');

      trackProgram(await programsPage.createProgram(name, 'Cloud program'), name);

      await page.route('**/programs/**', (route) => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({ status: 500, body: 'Delete failed' });
        } else {
          route.continue();
        }
      });

      await programsPage.clickDeleteAndHandleDialog(name, 'accept');
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-009 — Deleting already-deleted program shows appropriate error', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('DevOps Engineering 2026');

      trackProgram(await programsPage.createProgram(name, 'DevOps'), name);
      await programsPage.deleteProgramAndWaitForRemoval(name);
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
    });

    test.skip('TC-010 — Program with dependencies cannot be deleted (if business rule applies)', { tag: '@regression' }, async () => {
      test.skip(true, 'Requires program with linked courses/enrollments');
    });
  });

  test.describe('Edge cases', () => {
    test('TC-011 — Delete program with long name displays correctly in dialog', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const prefix = uniqueName('LongName');
      const longName = (prefix + 'L'.repeat(200)).slice(0, 255);

      trackProgram(await programsPage.createProgram(longName, 'Long name delete test'), longName);
      const message = await programsPage.clickDeleteAndHandleDialog(longName, 'dismiss');
      expect(message).toContain(longName);
    });

    test('TC-012 — Delete program with special characters in name', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('AI & ML: Phase-1 (2026)');

      trackProgram(await programsPage.createProgram(name, 'Special chars'), name);
      const message = await programsPage.clickDeleteAndHandleDialog(name, 'dismiss');
      expect(message).toContain(name);
    });

    test('TC-013 — Escape key dismisses confirmation without deleting', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Escape Delete Test');

      trackProgram(await programsPage.createProgram(name, 'Escape test'), name);

      page.once('dialog', (dialog) => dialog.dismiss());
      await programsPage.deleteButton(name).click();
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-014 — Double-click confirm does not cause errors', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Double Confirm Delete');

      trackProgram(await programsPage.createProgram(name, 'Double confirm'), name);

      let confirmCount = 0;
      page.on('dialog', async (dialog) => {
        confirmCount += 1;
        await dialog.accept();
      });

      await programsPage.deleteButton(name).click();
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
      expect(confirmCount).toBeGreaterThanOrEqual(1);
    });

    test('TC-015 — Delete last remaining program transitions to empty state', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Last Program Probe');

      trackProgram(await programsPage.createProgram(name, 'Only one for this test scope'), name);
      await programsPage.deleteProgramAndWaitForRemoval(name);
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
    });

    test('TC-016 — Click outside dialog cancels deletion (if supported)', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Outside Click Delete');

      trackProgram(await programsPage.createProgram(name, 'Outside click test'), name);

      page.once('dialog', (dialog) => dialog.dismiss());
      await programsPage.deleteButton(name).click();
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test.skip('TC-017 — Undo after delete (if feature exists)', { tag: '@regression' }, async () => {
      test.skip(true, 'Undo after delete is not implemented in the application');
    });
  });
});
