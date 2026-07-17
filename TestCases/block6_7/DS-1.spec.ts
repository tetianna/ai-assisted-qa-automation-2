// Playwright tests derived from features/DS-1.feature
import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueName } from '../block4/helpers/didaxis';

// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid, name?) after each program create; teardown deletes via DELETE /api/programs/<uuid>.

test.describe('DS-1: Create New Academic Program', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test.describe('Happy paths', () => {
    test('TC-001: Program creation form displays required fields', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      await programsPage.openNewProgramForm();

      const modal = programsPage.newProgramModal;
      await expect(modal.programNameInput).toBeVisible();
      await expect(modal.descriptionInput).toBeVisible();
      await expect(modal.createButton).toBeVisible();
      await expect(modal.cancelButton).toBeVisible();
    });

    test('TC-002: New program appears in list after successful creation', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Web Development 2026');
      const description = 'Full-stack web development program';

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(name);
      await programsPage.newProgramModal.fillDescription(description);
      trackProgram(await programsPage.newProgramModal.submitAndCaptureId(), name);

      await expect(programsPage.programRow(name)).toBeVisible();
      await expect(programsPage.rowWithText(name, description)).toBeVisible();
    });

    test('TC-003: Create button remains disabled when Program Name is empty', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillDescription('Full-stack web development program');

      await expect(programsPage.newProgramModal.createButton).toBeDisabled();
    });

    test('TC-004: Program can be created with Program Name only', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Data Science Fundamentals');

      trackProgram(await programsPage.createProgram(name), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-005: Cancel closes form without creating a program', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Cybersecurity Bootcamp 2026');

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(name);
      await programsPage.newProgramModal.fillDescription('Introductory cybersecurity program');
      await programsPage.newProgramModal.cancel();

      await expect(programsPage.newProgramModal.dialog).toBeHidden();
      await expect(programsPage.programRow(name)).toHaveCount(0);
    });

    test('TC-006: Create button enables after clearing and re-entering Program Name', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Mobile App Development');
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName(name);
      await expect(modal.createButton).toBeEnabled();
      await modal.clearProgramName();
      await expect(modal.createButton).toBeDisabled();
      await modal.fillProgramName(name);
      trackProgram(await modal.submitAndCaptureId(), name);

      await expect(programsPage.programRow(name)).toBeVisible();
    });
  });

  test.describe('Negative', () => {
    test('TC-007: Program is not created when submission is blocked by empty name', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName('   ');
      await modal.fillDescription('Full-stack web development program');

      await expect(modal.createButton).toBeDisabled();
      await expect(modal.dialog).toBeVisible();
    });

    test('TC-008: Duplicate program name is not allowed', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Web Development 2026');

      trackProgram(await programsPage.createProgram(name, 'First program'), name);

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(name);
      await programsPage.newProgramModal.fillDescription('Duplicate attempt description');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.newProgramModal.dialog).toBeVisible();
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(1);
    });

    test.skip('TC-009: Non-admin user cannot create a program', async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test('TC-010: Program is not created when create request fails due to server error', async ({ page }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Cloud Computing 2026');

      await page.route('**/programs**', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 500, body: 'Internal Server Error' });
        } else {
          route.continue();
        }
      });

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(name);
      await programsPage.newProgramModal.fillDescription('AWS and Azure fundamentals');
      await programsPage.newProgramModal.clickCreate();

      await expect(programsPage.programRow(name)).toHaveCount(0);
    });

    test('TC-011: XSS payload in Description is not executed in the program list', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      let alertFired = false;
      page.on('dialog', (dialog) => {
        alertFired = true;
        dialog.dismiss();
      });

      const name = uniqueName('Secure Coding 2026');
      trackProgram(
        await programsPage.createProgram(name, "<script>alert('xss')</script>"),
        name,
      );

      await expect(programsPage.programRow(name)).toBeVisible();
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-012: Program Name at maximum allowed length is accepted', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const prefix = uniqueName('MaxLen');
      const fullName = (prefix + 'A'.repeat(255)).slice(0, 255);

      trackProgram(
        await programsPage.createProgram(fullName, 'Boundary length validation program'),
        fullName,
      );
      await expect(programsPage.programRow(fullName)).toBeVisible();
    });

    test('TC-013: Program Name exceeding maximum length is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const modal = programsPage.newProgramModal;

      await programsPage.openNewProgramForm();
      await modal.fillProgramName('B'.repeat(256));
      await modal.fillDescription('Over limit test');

      const isDisabled = await modal.createButton.isDisabled();
      if (!isDisabled) {
        const programId = await modal.tryClickCreateAndCaptureId();
        if (programId) trackProgram(programId, 'B'.repeat(256));
        await expect(modal.dialog).toBeVisible();
      } else {
        await expect(modal.createButton).toBeDisabled();
      }
    });

    test('TC-014: Program Name with special characters is handled correctly', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('AI & ML: Phase-1 (2026)');

      trackProgram(await programsPage.createProgram(name, 'Covers neural networks and NLP'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-015: Leading and trailing whitespace in Program Name is trimmed', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const base = uniqueName('Web Development 2026');

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(`  ${base}  `);
      await programsPage.newProgramModal.fillDescription('Whitespace trim test');
      trackProgram(await programsPage.newProgramModal.submitAndCaptureId(), base);

      await expect(programsPage.programRow(base)).toBeVisible();
    });

    test('TC-016: Description at maximum allowed length is accepted', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('UX Design Certificate');
      const description = 'D'.repeat(2000);

      trackProgram(await programsPage.createProgram(name, description), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-017: Unicode and emoji in Program Name are preserved', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Programme Français 🎓 2026');

      trackProgram(
        await programsPage.createProgram(name, 'Programme bilingue pour étudiants internationaux'),
        name,
      );

      await expect(programsPage.programRow(name)).toBeVisible();
      await expect(programsPage.rowWithText(name, '🎓')).toBeVisible();
    });

    test('TC-018: Single-character Program Name is accepted', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('X');

      trackProgram(await programsPage.createProgram(name, 'Single character name boundary test'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test.fixme('TC-019: Rapid double-click on Create does not create duplicate programs', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('DevOps Engineering 2026');

      await programsPage.openNewProgramForm();
      await programsPage.newProgramModal.fillProgramName(name);
      await programsPage.newProgramModal.fillDescription('CI/CD and infrastructure automation');

      const programId = await programsPage.newProgramModal.doubleClickSubmitAndCaptureId();
      if (programId) trackProgram(programId, name);

      expect(await programsPage.countRowsNamed(name)).toBeLessThanOrEqual(1);
    });
  });
});
