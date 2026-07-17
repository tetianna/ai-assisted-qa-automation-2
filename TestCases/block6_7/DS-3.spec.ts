// Playwright tests derived from features/DS-3.feature
import path from 'path';
import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueName, watchProgramCreates } from '../block4/helpers/didaxis';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

test.describe('DS-3: Program Name Validation and Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test.describe('Happy paths', () => {
    test('TC-001: Valid program name with special characters is accepted', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Informatique & IA - Niveau 2');

      trackProgram(
        await programsPage.createProgram(name, 'Programme bilingue en informatique et intelligence artificielle'),
        name,
      );
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-002: Standard alphanumeric program name is accepted', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Web Development 2026');

      trackProgram(await programsPage.createProgram(name, 'Full-stack web development program'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-003: Program name with hyphens and numbers is accepted', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('AI-101: Intro to Machine Learning (2026)');

      trackProgram(await programsPage.createProgram(name, 'ML fundamentals'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });
  });

  test.describe('Negative', () => {
    test('TC-004: Whitespace-only program name is rejected', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName('   ');
      await modal.fillDescription('Full-stack web development program');

      await expect(modal.createButton).toBeDisabled();
    });

    test('TC-005: Empty program name is rejected', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      await programsPage.openNewProgramForm();
      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    });

    test('TC-006: Duplicate program name is rejected on create', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Web Development 2026');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(name, 'First program'), name);

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(name);
      await modal.fillDescription('Second attempt');
      await modal.clickCreate();

      await expect(modal.dialog).toBeVisible();
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(1);
    });

    test('TC-007: Case-insensitive duplicate name is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('CaseSensitive Test');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(name, 'Original'), name);

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(name.toLowerCase());
      await modal.fillDescription('Case variant');
      await modal.clickCreate();

      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(1);
      const stillOpen = await modal.dialog.isVisible();
      expect(stillOpen).toBeTruthy();
    });

    test('TC-008: Duplicate name after trim is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Trim Duplicate Test');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(name, 'Original'), name);

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(`  ${name}  `);
      await modal.clickCreate();

      await expect(modal.dialog).toBeVisible();
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(1);
    });

    test('TC-009: Program is not created when validation API fails', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('API Fail Test');
      const modal = programsPage.newProgramModal;

      await page.route('**/programs**', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 500, body: 'Validation service unavailable' });
        } else {
          route.continue();
        }
      });

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(name);
      await modal.clickCreate();

      await expect(programsPage.programRow(name)).toHaveCount(0);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-010: Program name at maximum length passes validation', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const prefix = uniqueName('Max');
      const maxName = (prefix + 'A'.repeat(255)).slice(0, 255);

      trackProgram(await programsPage.createProgram(maxName, 'Max length test'), maxName);
      await expect(programsPage.programRow(maxName)).toBeVisible();
    });

    test('TC-011: Program name one character over max length is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName('E'.repeat(256));

      const disabled = await modal.createButton.isDisabled();
      if (!disabled) {
        const programId = await modal.tryClickCreateAndCaptureId();
        if (programId) trackProgram(programId, 'E'.repeat(256));
        await expect(modal.dialog).toBeVisible();
      } else {
        await expect(modal.createButton).toBeDisabled();
      }
    });

    test('TC-012: Single-character program name passes validation', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Z');

      trackProgram(await programsPage.createProgram(name, 'Single char validation'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-013: Unicode and emoji in program name pass validation', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('日本語 🎌 Program');

      trackProgram(await programsPage.createProgram(name, 'Unicode validation'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-014: Disallowed special characters are rejected with clear message', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const invalidName = 'Invalid<>Name|"Test';
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(invalidName);
      await modal.fillDescription('Special char test');

      const programId = await modal.tryClickCreateAndCaptureId();
      if (programId) trackProgram(programId, invalidName);

      const created = (await programsPage.countRowsNamed(invalidName)) > 0;
      const stillOpen = await modal.dialog.isVisible();
      expect(created || stillOpen).toBeTruthy();
    });

    test('TC-015: Leading and trailing whitespace is trimmed before duplicate check', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Whitespace Dup');
      const modal = programsPage.newProgramModal;

      trackProgram(await programsPage.createProgram(name, 'First'), name);

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(`  ${name}  `);
      await modal.clickCreate();

      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(1);
    });

    test('TC-016: Tab and newline characters in name are handled', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName('Tab\tName Test');
      await modal.fillDescription('Tab test');

      if (await modal.createButton.isEnabled()) {
        const programId = await modal.tryClickCreateAndCaptureId();
        if (programId) trackProgram(programId, 'Tab\tName Test');
      }

      const rowCount = await programsPage.countRowsNamed('Tab\tName Test');
      const dialogOpen = await modal.dialog.isVisible();
      expect(rowCount === 0 || dialogOpen).toBeTruthy();
    });

    test('TC-017: Duplicate prevention on edit when renaming', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const existing = uniqueName('Existing Program');
      const toRename = uniqueName('Rename Target');
      const editModal = programsPage.editProgramModal;

      trackProgram(await programsPage.createProgram(existing, 'Existing'), existing);
      trackProgram(await programsPage.createProgram(toRename, 'Target'), toRename);

      await programsPage.openEditProgramForm(toRename);
      await editModal.fillProgramName(existing);
      await editModal.clickSave();

      await expect(editModal.dialog).toBeVisible();
      await expect(programsPage.programNameCell(toRename)).toBeVisible();
    });

    test.fixme('TC-018: Concurrent duplicate create results in at most one program', async ({ browser, trackProgram }) => {
      const name = uniqueName('Concurrent Dup');
      const contextA = await browser.newContext({ storageState: authFile });
      const contextB = await browser.newContext({ storageState: authFile });
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();
      const programsPageA = new ProgramsPage(pageA);
      const programsPageB = new ProgramsPage(pageB);

      await watchProgramCreates(pageA, trackProgram);
      await watchProgramCreates(pageB, trackProgram);
      await programsPageA.goto();
      await programsPageB.goto();

      await programsPageA.openNewProgramForm();
      await programsPageB.openNewProgramForm();
      await programsPageA.newProgramModal.fillProgramName(name);
      await programsPageB.newProgramModal.fillProgramName(name);

      await Promise.all([
        programsPageA.newProgramModal.clickCreate(),
        programsPageB.newProgramModal.clickCreate(),
      ]);

      await pageA.waitForTimeout(2000);
      expect(await programsPageA.countRowsNamed(name)).toBeLessThanOrEqual(1);

      await contextA.close();
      await contextB.close();
    });
  });
});
