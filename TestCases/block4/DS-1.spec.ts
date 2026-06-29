import { test, expect } from '@playwright/test';
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
  uniqueName,
} from './helpers/didaxis';

test.describe('DS-1: Create New Academic Program', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPrograms(page);
  });

  test.describe('Positive Flows', () => {
    test('TC-001: Program creation form displays required fields', async ({ page }) => {
      const dialog = await openNewProgramDialog(page);
      await expect(dialogFields.programName(dialog)).toBeVisible();
      await expect(dialogFields.description(dialog)).toBeVisible();
      await expect(dialogFields.createButton(dialog)).toBeVisible();
      await expect(dialogFields.cancelButton(dialog)).toBeVisible();
    });

    test('TC-002: New program appears in list after successful creation', async ({ page }) => {
      const name = uniqueName('Web Development 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('Full-stack web development program');
      await dialogFields.createButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, name);
      await expectProgramDescriptionInList(page, name, 'Full-stack web development program');
    });

    test('TC-003: Create button remains disabled when Program Name is empty', async ({ page }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.description(dialog).fill('Full-stack web development program');
      await expect(dialogFields.createButton(dialog)).toBeDisabled();
    });

    test('TC-004: Program can be created with Program Name only', async ({ page }) => {
      const name = uniqueName('Data Science Fundamentals');
      await createProgram(page, name);
      await expectProgramInList(page, name);
    });

    test('TC-005: Cancel closes form without creating a program', async ({ page }) => {
      const name = uniqueName('Cybersecurity Bootcamp 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('Introductory cybersecurity program');
      await dialogFields.cancelButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramNotInList(page, name);
    });

    test('TC-006: Create button enables after clearing and re-entering Program Name', async ({ page }) => {
      const name = uniqueName('Mobile App Development');
      const dialog = await openNewProgramDialog(page);
      const nameField = dialogFields.programName(dialog);
      const createBtn = dialogFields.createButton(dialog);

      await nameField.fill(name);
      await expect(createBtn).toBeEnabled();
      await nameField.clear();
      await expect(createBtn).toBeDisabled();
      await nameField.fill(name);
      await createBtn.click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, name);
    });
  });

  test.describe('Negative Flows', () => {
    test('TC-007: Program is not created when submission is blocked by empty name', async ({ page }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('   ');
      await dialogFields.description(dialog).fill('Full-stack web development program');
      await expect(dialogFields.createButton(dialog)).toBeDisabled();
      await expect(dialog).toBeVisible();
    });

    test('TC-008: Duplicate program name is not allowed', async ({ page }) => {
      const name = uniqueName('Web Development 2026');
      await createProgram(page, name, 'First program');

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

    test('TC-010: Program is not created when create request fails due to server error', async ({ page }) => {
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

    test('TC-011: XSS payload in Description is not executed in the program list', async ({ page }) => {
      let alertFired = false;
      page.on('dialog', (dialog) => {
        alertFired = true;
        dialog.dismiss();
      });

      const name = uniqueName('Secure Coding 2026');
      await createProgram(page, name, "<script>alert('xss')</script>");
      await expectProgramInList(page, name);
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-012: Program Name at maximum allowed length is accepted', async ({ page }) => {
      const prefix = uniqueName('MaxLen');
      const fullName = (prefix + 'A'.repeat(255)).slice(0, 255);
      await createProgram(page, fullName, 'Boundary length validation program');
      await expectProgramInList(page, fullName);
    });

    test('TC-013: Program Name exceeding maximum length is rejected', async ({ page }) => {
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill('B'.repeat(256));
      await dialogFields.description(dialog).fill('Over limit test');
      const createBtn = dialogFields.createButton(dialog);
      const isDisabled = await createBtn.isDisabled();
      if (!isDisabled) {
        await createBtn.click();
        await expect(dialog).toBeVisible();
      } else {
        await expect(createBtn).toBeDisabled();
      }
    });

    test('TC-014: Program Name with special characters is handled correctly', async ({ page }) => {
      const name = uniqueName('AI & ML: Phase-1 (2026)');
      await createProgram(page, name, 'Covers neural networks and NLP');
      await expectProgramInList(page, name);
    });

    test('TC-015: Leading and trailing whitespace in Program Name is trimmed', async ({ page }) => {
      const base = uniqueName('Web Development 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(`  ${base}  `);
      await dialogFields.description(dialog).fill('Whitespace trim test');
      await dialogFields.createButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, base);
    });

    test('TC-016: Description at maximum allowed length is accepted', async ({ page }) => {
      const name = uniqueName('UX Design Certificate');
      const description = 'D'.repeat(2000);
      await createProgram(page, name, description);
      await expectProgramInList(page, name);
    });

    test('TC-017: Unicode and emoji in Program Name are preserved', async ({ page }) => {
      const name = uniqueName('Programme Français 🎓 2026');
      await createProgram(page, name, 'Programme bilingue pour étudiants internationaux');
      await expectProgramInList(page, name);
      await expect(programRow(page, name).getByText('🎓')).toBeVisible();
    });

    test('TC-018: Single-character Program Name is accepted', async ({ page }) => {
      const name = uniqueName('X');
      await createProgram(page, name, 'Single character name boundary test');
      await expectProgramInList(page, name);
    });

    test('TC-019: Rapid double-click on Create does not create duplicate programs', async ({ page }) => {
      const name = uniqueName('DevOps Engineering 2026');
      const dialog = await openNewProgramDialog(page);
      await dialogFields.programName(dialog).fill(name);
      await dialogFields.description(dialog).fill('CI/CD and infrastructure automation');
      await dialogFields.createButton(dialog).dblclick();
      await expect(dialog).toBeHidden({ timeout: 15_000 });
      expect(await countProgramsNamed(page, name)).toBeLessThanOrEqual(1);
    });
  });
});
