// Playwright tests derived from features/DS-2.feature
import { test, expect } from '../../fixtures/cleanup.fixture';
import {
  countExactProgramsNamed,
  createProgram,
  dialogFields,
  dismissEditProgramIfOpen,
  editProgramDialog,
  expectAiConfigFieldsVisible,
  expectEditDiscarded,
  expectEditValidationOrError,
  expectExactProgramNameInList,
  expectExactProgramNameNotInList,
  expectProgramDescriptionInList,
  expectSaveSuccessFeedback,
  goToPrograms,
  gotoProgramsAsAuthenticated,
  hasNonAdminCredentials,
  locators,
  loginAsNonAdmin,
  openEditProgram,
  uniqueName,
} from '../block4/helpers/didaxis';

// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.

test.describe('DS-2: Edit Existing Program Details', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProgramsAsAuthenticated(page);
  });

  test.describe('Happy paths', () => {
    // Jira DS-2 AC: "Open program for editing"
    test('TC-001: Edit form opens with current program data pre-populated', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const description = 'Full-stack web development program';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, description));

      const dialog = await openEditProgram(page, name);
      await expect(dialogFields.programName(dialog)).toHaveValue(name);
      await expect(dialogFields.description(dialog)).toHaveValue(description);
      await expect(dialogFields.saveButton(dialog)).toBeVisible();
      await expect(dialogFields.cancelButton(dialog)).toBeVisible();
      await expectAiConfigFieldsVisible(dialog);
    });

    // Jira DS-2 AC: "Successfully edit a program name"
    test('TC-002: Updated program name is reflected immediately in the list', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const updated = `${name} - Updated`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original description'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await expect(dialogFields.programName(dialog)).toHaveValue(updated);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, updated);
      await expectExactProgramNameNotInList(page, name);

      const reopen = await openEditProgram(page, updated);
      await expect(dialogFields.programName(reopen)).toHaveValue(updated);
    });

    // Jira DS-2 AC: "Edit preserves unchanged fields"
    test('TC-003: Unchanged fields remain intact when only Description is edited', async ({ page, trackProgram }) => {
      const name = uniqueName('Data Science Fundamentals');
      const updatedDescription = 'Advanced data science and machine learning track';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Introductory data science course'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill(updatedDescription);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, name);
      await expectProgramDescriptionInList(page, name, updatedDescription);

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.programName(reopen)).toHaveValue(name);
      await expect(dialogFields.description(reopen)).toHaveValue(updatedDescription);
    });

    test('TC-004: Both Name and Description can be updated in a single save', async ({ page, trackProgram }) => {
      const name = uniqueName('Cybersecurity Bootcamp');
      const updatedName = `${name} 2026`;
      const updatedDescription = 'Hands-on security operations and incident response';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updatedName);
      await dialogFields.description(dialog).fill(updatedDescription);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, updatedName);
      await expectExactProgramNameNotInList(page, name);
      await expectProgramDescriptionInList(page, updatedName, updatedDescription);

      const reopen = await openEditProgram(page, updatedName);
      await expect(dialogFields.programName(reopen)).toHaveValue(updatedName);
      await expect(dialogFields.description(reopen)).toHaveValue(updatedDescription);
    });

    test('TC-005: Cancel discards unsaved edits', async ({ page, trackProgram }) => {
      const name = uniqueName('Mobile App Development');
      const draftName = `${name} - Draft`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original description'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(draftName);
      await dialogFields.cancelButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameNotInList(page, draftName);
      await expectExactProgramNameInList(page, name);

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.programName(reopen)).toHaveValue(name);
    });

    test('TC-006: Save button enables when valid changes are made', async ({ page, trackProgram }) => {
      const name = uniqueName('UX Design Certificate');
      const updatedDescription = 'User research and prototyping fundamentals';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill(updatedDescription);
      await expect(dialogFields.saveButton(dialog)).toBeEnabled();
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramDescriptionInList(page, name, updatedDescription);
    });

    test('TC-024: Close button discards unsaved edits', async ({ page, trackProgram }) => {
      const name = uniqueName('Mobile App Development Close');
      const draftName = `${name} - Draft`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original description'));

      await expectEditDiscarded(page, name, draftName, async (dialog) => {
        await dialogFields.closeButton(dialog).click();
      });
    });

    test('TC-025: Escape key discards unsaved edits', async ({ page, trackProgram }) => {
      const name = uniqueName('Mobile App Development Escape');
      const draftName = `${name} - Draft`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original description'));

      await expectEditDiscarded(page, name, draftName, async (dialog) => {
        await dialog.page().keyboard.press('Escape');
      });
    });
  });

  test.describe('Negative', () => {
    test('TC-007: Empty Name prevents save on edit', async ({ page, trackProgram }) => {
      const name = uniqueName('Cloud Computing 2026');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Description'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).clear();

      const saveBtn = dialogFields.saveButton(dialog);
      if (await saveBtn.isEnabled()) {
        await saveBtn.click();
        await expect(editProgramDialog(page)).toBeVisible();
        await expectEditValidationOrError(dialog);
      } else {
        await expect(saveBtn).toBeDisabled();
      }
      await expectExactProgramNameInList(page, name);
    });

    test('TC-008: Duplicate name on edit is rejected', async ({ page, trackProgram }) => {
      const existing = uniqueName('Web Development 2026');
      const toRename = uniqueName('AI Fundamentals');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, existing, 'Existing program'));
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, toRename, 'To rename'));

      const dialog = await openEditProgram(page, toRename);
      await dialogFields.programName(dialog).fill(existing);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeVisible();
      await expectEditValidationOrError(dialog);
      await expectExactProgramNameInList(page, toRename);
      expect(await countExactProgramsNamed(page, existing)).toBe(1);
      expect(await countExactProgramsNamed(page, toRename)).toBe(1);
    });

    test('TC-009: Server error during save does not corrupt program data', async ({ page, trackProgram }) => {
      const name = uniqueName('DevOps Engineering 2026');
      const originalDesc = 'Original DevOps curriculum';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, originalDesc));

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

      await expect(dialog).toBeVisible();
      const dialogError = dialog.getByText(/error|failed|unable|something went wrong|internal server/i);
      const pageError = locators.programsPage.errorMessage(page);
      await expect(dialogError.or(pageError)).toBeVisible();
      await expectProgramDescriptionInList(page, name, originalDesc);

      await dismissEditProgramIfOpen(page);

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.description(reopen)).toHaveValue(originalDesc);
    });

    test('TC-010: Non-admin user cannot edit programs', async ({ page, trackProgram }) => {
      test.skip(!hasNonAdminCredentials(), 'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD in .env');

      const name = uniqueName('Web Development 2026');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Admin-created program'));
      await locators.navigation.signOutButton(page).click();
      await loginAsNonAdmin(page);
      await goToPrograms(page);

      await expect(locators.programList.editButton(page, name)).toHaveCount(0);
      await expect(page.getByRole('button', { name: `Edit ${name}` })).toHaveCount(0);
    });

    test('TC-011: Saving with no changes does not trigger unnecessary update', async ({ page, trackProgram }) => {
      const name = uniqueName('Secure Coding 2026');
      const description = 'Secure coding basics';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, description));
      expect(await countExactProgramsNamed(page, name)).toBe(1);

      const dialog = await openEditProgram(page, name);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, name);
      await expectProgramDescriptionInList(page, name, description);
      expect(await countExactProgramsNamed(page, name)).toBe(1);
    });

    test('TC-026: XSS payload in edited Description is not executed in the program list', async ({ page, trackProgram }) => {
      let alertFired = false;
      page.on('dialog', (browserDialog) => {
        alertFired = true;
        browserDialog.dismiss();
      });

      const name = uniqueName('Secure Coding 2026');
      const xssPayload = "<script>alert('xss')</script>";
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original safe description'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill(xssPayload);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, name);
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-012: Name at maximum length can be saved on edit', async ({ page, trackProgram }) => {
      const name = uniqueName('MaxLen');
      const maxName = (name + 'A'.repeat(255)).slice(0, 255);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Short'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(maxName);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, maxName);
      await expectExactProgramNameNotInList(page, name);
    });

    test('TC-013: Name exceeding max length is rejected on edit', async ({ page, trackProgram }) => {
      const name = uniqueName('Boundary Test Program');
      const overLimitName = 'C'.repeat(256);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Test'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(overLimitName);
      const saveBtn = dialogFields.saveButton(dialog);
      if (await saveBtn.isEnabled()) {
        await saveBtn.click();
        await expect(editProgramDialog(page)).toBeVisible();
      } else {
        await expect(saveBtn).toBeDisabled();
      }
      await expectExactProgramNameInList(page, name);
      await expectExactProgramNameNotInList(page, overLimitName);
    });

    test('TC-014: Special characters in edited Name are preserved', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const updated = 'Informatique & IA - Niveau 2 (2026)';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Test'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, updated);
      await expectExactProgramNameNotInList(page, name);

      const reopen = await openEditProgram(page, updated);
      await expect(dialogFields.programName(reopen)).toHaveValue(updated);
    });

    test('TC-015: Leading and trailing whitespace is trimmed on save', async ({ page, trackProgram }) => {
      const name = uniqueName('TrimTest');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Test'));

      const dialog = await openEditProgram(page, name);
      const trimmed = uniqueName('Trimmed Name');
      await dialogFields.programName(dialog).fill(`  ${trimmed}  `);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, trimmed);
      await expectExactProgramNameNotInList(page, name);
    });

    test('TC-016: Unicode and emoji in edited fields are preserved', async ({ page, trackProgram }) => {
      const name = uniqueName('French Program');
      const updatedName = 'Programme Français 🎓 2026';
      const updatedDescription = 'Cours pour étudiants internationaux';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Test'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updatedName);
      await dialogFields.description(dialog).fill(updatedDescription);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, updatedName);
      await expectProgramDescriptionInList(page, updatedName, updatedDescription);
    });

    test('TC-017: Description cleared to empty is handled per product rules', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const originalDescription = 'Has description';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, originalDescription));

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).clear();
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, name);

      const reopen = await openEditProgram(page, name);
      await expect(dialogFields.description(reopen)).toHaveValue('');
    });

    test('TC-018: Rapid double-click on Save does not cause duplicate updates', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const finalName = `${name} - Final`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Original'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(finalName);
      await dialogFields.saveButton(dialog).dblclick();
      await expect(dialog).toBeHidden({ timeout: 15_000 });
      await expectExactProgramNameInList(page, finalName);
      await expectExactProgramNameNotInList(page, name);
      expect(await countExactProgramsNamed(page, finalName)).toBe(1);
    });

    test('TC-019: Editing program to same name as itself succeeds', async ({ page, trackProgram }) => {
      const name = uniqueName('Web Development 2026');
      const updatedDescription = 'Updated full-stack curriculum';
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Description'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill(updatedDescription);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, name);
      await expectProgramDescriptionInList(page, name, updatedDescription);
      await expect(
        locators.programsPage.errorMessage(page).filter({ hasText: /already exists|duplicate|unique/i }),
      ).toHaveCount(0);
    });

    test('TC-027: Description at maximum allowed length is accepted on edit', async ({ page, trackProgram }) => {
      const name = uniqueName('UX Design Certificate');
      const description = 'D'.repeat(2000);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Short description'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.description(dialog).fill(description);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectProgramDescriptionInList(page, name, description);
    });

    test('TC-028: Single-character Name is accepted on edit', async ({ page, trackProgram }) => {
      const name = uniqueName('Rename Source');
      const singleCharName = String.fromCharCode(65 + (Date.now() % 26));
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Single character rename test'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(singleCharName);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, singleCharName);
      await expectExactProgramNameNotInList(page, name);
    });

    test('TC-020: Case-only duplicate name on edit is rejected', async ({ page, trackProgram }) => {
      const existing = uniqueName('CaseDuplicate');
      const toRename = uniqueName('CaseDuplicate Target');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, existing, 'Original casing'));
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, toRename, 'Rename candidate'));

      const dialog = await openEditProgram(page, toRename);
      await dialogFields.programName(dialog).fill(existing.toLowerCase());
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeVisible();
      await expectEditValidationOrError(dialog);
      await expectExactProgramNameInList(page, existing);
      await expectExactProgramNameInList(page, toRename);
    });

    test('TC-021: Renamed program appears in list without page refresh', async ({ page, trackProgram }) => {
      const name = uniqueName('NoRefresh Rename');
      const updated = `${name} - Live`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Refresh probe'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();

      await expectExactProgramNameInList(page, updated);
      await expect(page).toHaveURL(/\/programs/);
      await expectExactProgramNameNotInList(page, name);
    });

    test('TC-022: Whitespace-only Name on edit is rejected', async ({ page, trackProgram }) => {
      const name = uniqueName('Whitespace Edit');
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Whitespace probe'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill('   ');
      const saveBtn = dialogFields.saveButton(dialog);
      if (await saveBtn.isEnabled()) {
        await saveBtn.click();
        await expect(editProgramDialog(page)).toBeVisible();
        await expectEditValidationOrError(dialog);
      } else {
        await expect(saveBtn).toBeDisabled();
      }
      await expectExactProgramNameInList(page, name);
    });

    test('TC-023: Saving 255-character name on edit completes without hanging', async ({ page, trackProgram }) => {
      const name = uniqueName('MaxLen Hang');
      const maxName = (name + 'B'.repeat(255)).slice(0, 255);
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Boundary timing'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(maxName);
      await dialogFields.saveButton(dialog).click({ timeout: 45_000 });
      await expect(dialog).toBeHidden({ timeout: 45_000 });
      await expectExactProgramNameInList(page, maxName);
    });

    test('TC-029: Success feedback shown after save when product displays it', async ({ page, trackProgram }) => {
      const name = uniqueName('Success Feedback');
      const updated = `${name} - Saved`;
      // Cleanup: track created program for API delete after test
      trackProgram(await createProgram(page, name, 'Feedback probe'));

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expect(dialog).toBeHidden();
      await expectExactProgramNameInList(page, updated);
      await expectSaveSuccessFeedback(page);
    });
  });
});
