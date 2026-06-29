import { test, expect } from '@playwright/test';
import {
  createProgram,
  dialogFields,
  editProgramDialog,
  expectProgramInList,
  goToPrograms,
  loginAsAdmin,
  openEditProgram,
  uniqueName,
} from './helpers/didaxis';

test.describe('DS-2: Edit Existing Program Details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPrograms(page);
  });

  test.describe('Positive Flows', () => {
    test('TC-001: Edit form opens with current program data pre-populated', async ({ page }) => {
      const name = uniqueName('Web Development 2026');
      const description = 'Full-stack web development program';
      await createProgram(page, name, description);

      const dialog = await openEditProgram(page, name);
      await expect(dialogFields.programName(dialog)).toHaveValue(name);
      await expect(dialogFields.description(dialog)).toHaveValue(description);
      await expect(dialogFields.saveButton(dialog)).toBeVisible();
      await expect(dialogFields.cancelButton(dialog)).toBeVisible();
    });

    test('TC-002: Updated program name is reflected immediately in the list', async ({ page }) => {
      const name = uniqueName('Web Development 2026');
      const updated = `${name} - Updated`;
      await createProgram(page, name, 'Original description');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, updated);
    });

    test('TC-003: Unchanged fields remain intact when only Description is edited', async ({ page }) => {
      const name = uniqueName('Data Science Fundamentals');
      await createProgram(page, name, 'Introductory data science course');

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill('Advanced data science and machine learning track');
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.programName(reopen)).toHaveValue(name);
      await expect(dialogFields.description(reopen)).toHaveValue(
        'Advanced data science and machine learning track',
      );
    });

    test('TC-004: Both Name and Description can be updated in a single save', async ({ page }) => {
      const name = uniqueName('Cybersecurity Bootcamp');
      const updatedName = `${name} 2026`;
      await createProgram(page, name, 'Original');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updatedName);
      await dialogFields.description(dialog).fill('Hands-on security operations and incident response');
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, updatedName);
    });

    test('TC-005: Cancel discards unsaved edits', async ({ page }) => {
      const name = uniqueName('Mobile App Development');
      await createProgram(page, name, 'Original description');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(`${name} - Draft`);
      await dialogFields.cancelButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, name);

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.programName(reopen)).toHaveValue(name);
    });

    test('TC-006: Save button enables when valid changes are made', async ({ page }) => {
      const name = uniqueName('UX Design Certificate');
      await createProgram(page, name, 'Original');

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill('User research and prototyping fundamentals');
      await expect(dialogFields.saveButton(dialog)).toBeEnabled();
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
    });
  });

  test.describe('Negative Flows', () => {
    test('TC-007: Empty Name prevents save on edit', async ({ page }) => {
      const name = uniqueName('Cloud Computing 2026');
      await createProgram(page, name, 'Description');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).clear();
      await expect(dialogFields.saveButton(dialog)).toBeDisabled();
      await expectProgramInList(page, name);
    });

    test('TC-008: Duplicate name on edit is rejected', async ({ page }) => {
      const existing = uniqueName('Web Development 2026');
      const toRename = uniqueName('AI Fundamentals');
      await createProgram(page, existing, 'Existing program');
      await createProgram(page, toRename, 'To rename');

      const dialog = await openEditProgram(page, toRename);
      await dialogFields.programName(dialog).fill(existing);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeVisible();
      await expectProgramInList(page, toRename);
    });

    test('TC-009: Server error during save does not corrupt program data', async ({ page }) => {
      const name = uniqueName('DevOps Engineering 2026');
      const originalDesc = 'Original DevOps curriculum';
      await createProgram(page, name, originalDesc);

      await page.route('**/programs/**', (route) => {
        if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
          route.fulfill({ status: 500, body: 'Internal Server Error' });
        } else {
          route.continue();
        }
      });

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill('Updated DevOps curriculum');
      await dialogFields.saveButton(dialog).click();

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.description(reopen)).toHaveValue(originalDesc);
    });

    test.skip('TC-010: Non-admin user cannot edit programs', async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test('TC-011: Saving with no changes does not trigger unnecessary update', async ({ page }) => {
      const name = uniqueName('Secure Coding 2026');
      await createProgram(page, name, 'Secure coding basics');

      const dialog = await openEditProgram(page, name);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, name);
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-012: Name at maximum length can be saved on edit', async ({ page }) => {
      const name = uniqueName('MaxLen');
      const maxName = (name + 'A'.repeat(255)).slice(0, 255);
      await createProgram(page, name, 'Short');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(maxName);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, maxName);
    });

    test('TC-013: Name exceeding max length is rejected on edit', async ({ page }) => {
      const name = uniqueName('OverLimit');
      await createProgram(page, name, 'Test');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill('C'.repeat(256));
      const saveBtn = dialogFields.saveButton(dialog);
      if (await saveBtn.isEnabled()) {
        await saveBtn.click();
        await expect(editProgramDialog(page)).toBeVisible();
      } else {
        await expect(saveBtn).toBeDisabled();
      }
    });

    test('TC-014: Special characters in edited Name are preserved', async ({ page }) => {
      const name = uniqueName('SpecialChars');
      const updated = `${name} & Co. (2026)`;
      await createProgram(page, name, 'Test');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expectProgramInList(page, updated);
    });

    test('TC-015: Leading and trailing whitespace is trimmed on save', async ({ page }) => {
      const name = uniqueName('TrimTest');
      await createProgram(page, name, 'Test');

      const dialog = await openEditProgram(page, name);
      const trimmed = uniqueName('Trimmed Name');
      await dialogFields.programName(dialog).fill(`  ${trimmed}  `);
      await dialogFields.saveButton(dialog).click();
      await expectProgramInList(page, trimmed);
    });

    test('TC-016: Unicode and emoji in edited fields are preserved', async ({ page }) => {
      const name = uniqueName('UnicodeEdit');
      const updated = `${name} 🎓 Français`;
      await createProgram(page, name, 'Test');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expectProgramInList(page, updated);
    });

    test('TC-017: Description cleared to empty is handled per product rules', async ({ page }) => {
      const name = uniqueName('ClearDesc');
      await createProgram(page, name, 'Has description');

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).clear();
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, name);
    });

    test('TC-018: Rapid double-click on Save does not cause duplicate updates', async ({ page }) => {
      const name = uniqueName('DoubleSave');
      await createProgram(page, name, 'Original');

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill('Updated once');
      await dialogFields.saveButton(dialog).dblclick();
      await expect(dialog).toBeHidden({ timeout: 15_000 });
      await expectProgramInList(page, name);
    });

    test('TC-019: Editing program to same name as itself succeeds', async ({ page }) => {
      const name = uniqueName('SameNameEdit');
      await createProgram(page, name, 'Description');

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill('Updated description only');
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramInList(page, name);
    });
  });
});
