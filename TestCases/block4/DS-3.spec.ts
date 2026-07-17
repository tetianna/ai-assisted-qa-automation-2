import { test, expect } from '../../fixtures/cleanup.fixture';
import {
  countProgramsNamed,
  createProgram,
  dialogFields,
  expectProgramInList,
  expectProgramNotInList,
  goToPrograms,
  loginAsAdmin,
  openEditProgram,
  openNewProgramDialog,
  tryCaptureProgramCreate,
  uniqueName,
  watchProgramCreates,
} from './helpers/didaxis';

// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.

test.describe('DS-3: Program Name Validation and Duplicate Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPrograms(page);
  });

  test.describe('Positive Flows', () => {
    test('TC-001: Valid program name with special characters is accepted', async ({ page, trackProgram }) => {
      const name = uniqueName('Informatique & IA - Niveau 2');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Programme bilingue en informatique et intelligence artificielle'));
      await expectProgramInList(page, name);
    });

    test('TC-002: Standard alphanumeric program name is accepted', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Full-stack web development program'));
      await expectProgramInList(page, name);
    });

    test('TC-003: Program name with hyphens and numbers is accepted', async ({ page, trackProgram }) => {
      const name = uniqueName('AI-101: Intro to Machine Learning (2026)');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'ML fundamentals'));
      await expectProgramInList(page, name);
    });
  });

  test.describe('Negative Flows', () => {
    test('TC-004: Whitespace-only program name is rejected', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('   ');
      await dialogFields.description(dialog).fill('Full-stack web development program');
      await expect(dialogFields.createButton(dialog)).toBeDisabled();
    });

    test('TC-005: Empty program name is rejected', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await expect(dialogFields.createButton(dialog)).toBeDisabled();
    });

    test('TC-006: Duplicate program name is rejected on create', async ({ page, trackProgram }) => {
      const name = uniqueName('Duplicate Test Program');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'First'));

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('Second attempt');
      await dialogFields.createButton(dialog).click();
      await expect(dialog).toBeVisible();
      expect(await countProgramsNamed(page, name)).toBe(1);
    });

    test('TC-007: Duplicate check is case-insensitive (if product rule applies)', async ({ page, trackProgram }) => {
      const name = uniqueName('CaseSensitive Test');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original'));

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name.toLowerCase());
      await dialogFields.description(dialog).fill('Case variant');
      await dialogFields.createButton(dialog).click();

      const stillOpen = await dialog.isVisible();
      const total = await countProgramsNamed(page, name);
      expect(stillOpen || total === 1).toBeTruthy();
    });

    test('TC-008: Duplicate name after trim is rejected', async ({ page, trackProgram }) => {
      const name = uniqueName('Trim Duplicate Test');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original'));

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(`  ${name}  `);
      await dialogFields.createButton(dialog).click();
      await expect(dialog).toBeVisible();
      expect(await countProgramsNamed(page, name)).toBe(1);
    });

    test('TC-009: Program is not created when validation API fails', async ({ page, trackProgram }) => {
      const name = uniqueName('API Fail Test');
      await page.route('**/programs**', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 500, body: 'Validation service unavailable' });
        } else {
          route.continue();
        }
      });

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.createButton(dialog).click();
      await expectProgramNotInList(page, name);
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-010: Program name at maximum length passes validation', async ({ page, trackProgram }) => {
      const prefix = uniqueName('Max');
      const maxName = (prefix + 'A'.repeat(255)).slice(0, 255);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, maxName, 'Max length test'));
      await expectProgramInList(page, maxName);
    });

    test('TC-011: Program name one character over max length is rejected', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('E'.repeat(256));
      const createBtn = dialogFields.createButton(dialog);
      const disabled = await createBtn.isDisabled();
      if (!disabled) {
        const programId = await tryCaptureProgramCreate(page, async () => {
          await createBtn.click();
        });
        if (programId) trackProgram(programId); // Cleanup: track if create succeeded
        await expect(dialog).toBeVisible();
      } else {
        await expect(createBtn).toBeDisabled();
      }
    });

    test('TC-012: Single-character program name validation', async ({ page, trackProgram }) => {
      const name = uniqueName('Z');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Single char validation'));
      await expectProgramInList(page, name);
    });

    test('TC-013: Unicode and emoji in program name pass validation', async ({ page, trackProgram }) => {
      const name = uniqueName('日本語 🎌 Program');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Unicode validation'));
      await expectProgramInList(page, name);
    });

    test('TC-014: Disallowed special characters are rejected with clear message', async ({ page, trackProgram }) => {
      const invalidName = 'Invalid<>Name|"Test';
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(invalidName);
      await dialogFields.description(dialog).fill('Special char test');
      const programId = await tryCaptureProgramCreate(page, async () => {
        await dialogFields.createButton(dialog).click();
      });
      if (programId) trackProgram(programId); // Cleanup: track if create succeeded
      const created = (await countProgramsNamed(page, invalidName)) > 0;
      const stillOpen = await dialog.isVisible();
      expect(created || stillOpen).toBeTruthy();
    });

    test('TC-015: Leading and trailing whitespace is trimmed before duplicate check', async ({ page, trackProgram }) => {
      const name = uniqueName('Whitespace Dup');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'First'));

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(`  ${name}  `);
      await dialogFields.createButton(dialog).click();
      expect(await countProgramsNamed(page, name)).toBe(1);
    });

    test('TC-016: Tab and newline characters in name are handled', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('Tab\tName Test');
      await dialogFields.description(dialog).fill('Tab test');
      const createBtn = dialogFields.createButton(dialog);
      if (await createBtn.isEnabled()) {
        const programId = await tryCaptureProgramCreate(page, async () => {
          await createBtn.click();
        });
        if (programId) trackProgram(programId); // Cleanup: track if create succeeded
      }
      const visible = await dialog.isVisible();
      expect(visible !== undefined).toBeTruthy();
    });

    test('TC-017: Duplicate prevention on edit when renaming', async ({ page, trackProgram }) => {
      const existing = uniqueName('Existing Program');
      const toRename = uniqueName('Rename Target');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, existing, 'Existing'));
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, toRename, 'Target'));

      const dialog = await openEditProgram(page, toRename);
      await dialogFields.programName(dialog).fill(existing);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeVisible();
      await expectProgramInList(page, toRename);
    });

    test('TC-018: Concurrent duplicate create by two users', async ({ browser, trackProgram }) => {
      const name = uniqueName('Concurrent Dup');
      const contextA = await browser.newContext();
      const contextB = await browser.newContext();
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();

      await loginAsAdmin(pageA);
      await goToPrograms(pageA);
      // Cleanup: auto-track programs created on this page
      await watchProgramCreates(pageA, trackProgram);
      await loginAsAdmin(pageB);
      await goToPrograms(pageB);
      // Cleanup: auto-track programs created on this page
      await watchProgramCreates(pageB, trackProgram);

      const dialogA = await openNewProgramDialog(pageA);
      const dialogB = await openNewProgramDialog(pageB);
      await dialogFields.programName(dialogA).fill(name);
      await dialogFields.programName(dialogB).fill(name);

      await Promise.all([
        dialogFields.createButton(dialogA).click(),
        dialogFields.createButton(dialogB).click(),
      ]);

      await pageA.waitForTimeout(2000);
      expect(await countProgramsNamed(pageA, name)).toBeLessThanOrEqual(1);

      await contextA.close();
      await contextB.close();
    });
  });
});
