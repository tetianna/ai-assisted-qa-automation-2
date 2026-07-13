// Playwright tests derived from features/DS-1.feature
import { test, expect } from '../../fixtures/cleanup.fixture';
import {
  countProgramsNamed,
  createProgram,
  dialogFields,
  expectProgramDescriptionInList,
  expectProgramInList,
  expectProgramNotInList,
  goToPrograms,
  loginAsAdmin,
  openNewProgramDialog,
  programRow,
  submitNewProgram,
  submitNewProgramDblClick,
  tryCaptureProgramCreate,
  uniqueName,
} from '../block4/helpers/didaxis';

// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid, name?) after each program create; teardown deletes via DELETE /api/programs/<uuid>.

test.describe('DS-1: Create New Academic Program', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPrograms(page);
  });

  test.describe('Happy paths', () => {
    test('TC-001: Program creation form displays required fields', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await expect(dialogFields.programName(dialog)).toBeVisible();
      await expect(dialogFields.description(dialog)).toBeVisible();
      await expect(dialogFields.createButton(dialog)).toBeVisible();
      await expect(dialogFields.cancelButton(dialog)).toBeVisible();
    });

    test('TC-002: New program appears in list after successful creation', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('Full-stack web development program');
      // Cleanup: track created program for API delete after test
      trackProgram(await submitNewProgram(page, dialog), name);
      await expectProgramInList(page, name);
      await expectProgramDescriptionInList(page, name, 'Full-stack web development program');
    });

    test('TC-003: Create button remains disabled when Program Name is empty', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.description(dialog).fill('Full-stack web development program');
      await expect(dialogFields.createButton(dialog)).toBeDisabled();
    });

    test('TC-004: Program can be created with Program Name only', async ({ page, trackProgram }) => {
      const name = uniqueName('Data Science Fundamentals');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name), name);
      await expectProgramInList(page, name);
    });

    test('TC-005: Cancel closes form without creating a program', async ({ page, trackProgram }) => {
      const name = uniqueName('Cybersecurity Bootcamp 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('Introductory cybersecurity program');
      await dialogFields.cancelButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramNotInList(page, name);
    });

    test('TC-006: Create button enables after clearing and re-entering Program Name', async ({ page, trackProgram }) => {
      const name = uniqueName('Mobile App Development');
      const dialog = await openNewProgramDialog(page);
      const nameField = dialogFields.programName(dialog);
      const createBtn = dialogFields.createButton(dialog);

      await nameField.fill(name);
      await expect(createBtn).toBeEnabled();
      await nameField.clear();
      await expect(createBtn).toBeDisabled();
      await nameField.fill(name);
      // Cleanup: track created program for API delete after test
      trackProgram(await submitNewProgram(page, dialog), name);
      await expectProgramInList(page, name);
    });
  });

  test.describe('Negative', () => {
    test('TC-007: Program is not created when submission is blocked by empty name', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('   ');
      await dialogFields.description(dialog).fill('Full-stack web development program');
      await expect(dialogFields.createButton(dialog)).toBeDisabled();
      await expect(dialog).toBeVisible();
    });

    test('TC-008: Duplicate program name is not allowed', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'First program'), name);

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('Duplicate attempt description');
      await dialogFields.createButton(dialog).click();

      await expect(dialog).toBeVisible();
      expect(await countProgramsNamed(page, name)).toBe(1);
    });

    test.skip('TC-009: Non-admin user cannot create a program', async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test('TC-010: Program is not created when create request fails due to server error', async ({ page, trackProgram }) => {
      const name = uniqueName('Cloud Computing 2026');
      await page.route('**/programs**', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 500, body: 'Internal Server Error' });
        } else {
          route.continue();
        }
      });

      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('AWS and Azure fundamentals');
      await dialogFields.createButton(dialog).click();

      await expectProgramNotInList(page, name);
    });

    test('TC-011: XSS payload in Description is not executed in the program list', async ({ page, trackProgram }) => {
      let alertFired = false;
      page.on('dialog', (dialog) => {
        alertFired = true;
        dialog.dismiss();
      });

      const name = uniqueName('Secure Coding 2026');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, "<script>alert('xss')</script>"), name);
      await expectProgramInList(page, name);
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-012: Program Name at maximum allowed length is accepted', async ({ page, trackProgram }) => {
      const prefix = uniqueName('MaxLen');
      const fullName = (prefix + 'A'.repeat(255)).slice(0, 255);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, fullName, 'Boundary length validation program'), fullName);
      await expectProgramInList(page, fullName);
    });

    test('TC-013: Program Name exceeding maximum length is rejected', async ({ page, trackProgram }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('B'.repeat(256));
      await dialogFields.description(dialog).fill('Over limit test');
      const createBtn = dialogFields.createButton(dialog);
      const isDisabled = await createBtn.isDisabled();
      if (!isDisabled) {
        const programId = await tryCaptureProgramCreate(page, async () => {
          await createBtn.click();
        });
        if (programId) trackProgram(programId, 'B'.repeat(256)); // Cleanup: track if create succeeded
        await expect(dialog).toBeVisible();
      } else {
        await expect(createBtn).toBeDisabled();
      }
    });

    test('TC-014: Program Name with special characters is handled correctly', async ({ page, trackProgram }) => {
      const name = uniqueName('AI & ML: Phase-1 (2026)');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Covers neural networks and NLP'), name);
      await expectProgramInList(page, name);
    });

    test('TC-015: Leading and trailing whitespace in Program Name is trimmed', async ({ page, trackProgram }) => {
      const base = uniqueName('Web Development 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(`  ${base}  `);
      await dialogFields.description(dialog).fill('Whitespace trim test');
      // Cleanup: track created program for API delete after test
      trackProgram(await submitNewProgram(page, dialog), base);
      await expectProgramInList(page, base);
    });

    test('TC-016: Description at maximum allowed length is accepted', async ({ page, trackProgram }) => {
      const name = uniqueName('UX Design Certificate');
      const description = 'D'.repeat(2000);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, description), name);
      await expectProgramInList(page, name);
    });

    test('TC-017: Unicode and emoji in Program Name are preserved', async ({ page, trackProgram }) => {
      const name = uniqueName('Programme Français 🎓 2026');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Programme bilingue pour étudiants internationaux'), name);
      await expectProgramInList(page, name);
      await expect(programRow(page, name).getByText('🎓')).toBeVisible();
    });

    test('TC-018: Single-character Program Name is accepted', async ({ page, trackProgram }) => {
      const name = uniqueName('X');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Single character name boundary test'), name);
      await expectProgramInList(page, name);
    });

    test('TC-019: Rapid double-click on Create does not create duplicate programs', async ({ page, trackProgram }) => {
      const name = uniqueName('DevOps Engineering 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('CI/CD and infrastructure automation');
      const programId = await submitNewProgramDblClick(page, dialog);
      if (programId) trackProgram(programId, name); // Cleanup: track if create succeeded
      expect(await countProgramsNamed(page, name)).toBeLessThanOrEqual(1);
    });
  });
});
