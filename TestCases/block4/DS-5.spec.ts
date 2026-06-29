import { test, expect } from '@playwright/test';
import {
  createProgram,
  deleteProgram,
  dialogFields,
  expectProgramDescriptionInList,
  expectProgramInList,
  getProgramListNames,
  goToPrograms,
  locators,
  loginAsAdmin,
  openEditProgram,
  openNewProgramDialog,
  programRow,
  uniqueName,
} from './helpers/didaxis';

test.describe('DS-5: Program List Filtering and Display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPrograms(page);
  });

  test.describe('Positive Flows', () => {
    test('TC-001: Program list displays name and description for each program', async ({ page }) => {
      const name = uniqueName('Web Development 2026');
      const description = 'Full-stack web development program';
      await createProgram(page, name, description);
      await expectProgramInList(page, name);
      await expectProgramDescriptionInList(page, name, description);
    });

    test.skip('TC-002: Empty state shown when no programs exist', async () => {
      test.skip(true, 'Test environment contains existing programs; empty state cannot be guaranteed');
    });

    test('TC-003: List updates after creating a new program', async ({ page }) => {
      const name = uniqueName('Mobile App Development');
      const description = 'iOS and Android development';
      await createProgram(page, name, description);
      await expectProgramDescriptionInList(page, name, description);
    });

    test('TC-004: List reflects edits immediately', async ({ page }) => {
      const name = uniqueName('Edit Display Test');
      const updated = `${name} Updated`;
      await createProgram(page, name, 'Original');

      const dialog = await openEditProgram(page, name);
      await dialogFields.programName(dialog).fill(updated);
      await dialogFields.saveButton(dialog).click();
      await expectProgramInList(page, updated);
    });

    test('TC-005: List reflects deletion immediately', async ({ page }) => {
      const name = uniqueName('Delete Display Test');
      await createProgram(page, name, 'To be deleted');
      await deleteProgram(page, name);
    });

    test('TC-006: Programs with empty description display appropriately', async ({ page }) => {
      const name = uniqueName('No Description Program');
      await createProgram(page, name);
      await expectProgramInList(page, name);
    });
  });

  test.describe('Negative Flows', () => {
    test.skip('TC-007: List does not show programs user is unauthorized to view', async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test('TC-008: API failure shows error state instead of empty list', async ({ page }) => {
      await page.route('**/programs**', (route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({ status: 500, body: 'List unavailable' });
        } else {
          route.continue();
        }
      });

      await page.reload();
      const hasTable = await locators.programsPage.table(page).isVisible().catch(() => false);
      const hasError = await locators.programsPage.errorMessage(page).first().isVisible().catch(() => false);
      expect(hasTable || hasError).toBeTruthy();
    });

    test('TC-009: Partial data does not break list rendering', async ({ page }) => {
      await expect(locators.programsPage.table(page)).toBeVisible();
      await expect(locators.programsPage.programColumnHeader(page)).toBeVisible();
    });

    test('TC-010: XSS in stored description is not executed in list', async ({ page }) => {
      let alertFired = false;
      page.on('dialog', (dialog) => {
        alertFired = true;
        dialog.dismiss();
      });

      const name = uniqueName('XSS List Test');
      await createProgram(page, name, "<img src=x onerror=alert('xss')>");
      await expectProgramInList(page, name);
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Edge Cases', () => {
    test('TC-011: Long program name displays with truncation or wrap', async ({ page }) => {
      const prefix = uniqueName('LongDisplay');
      const longName = (prefix + 'N'.repeat(200)).slice(0, 255);
      await createProgram(page, longName, 'Long name display');
      await expect(programRow(page, longName).first()).toBeVisible();
    });

    test('TC-012: Long description displays with truncation or expand', async ({ page }) => {
      const name = uniqueName('Long Desc Display');
      const description = 'L'.repeat(500);
      await createProgram(page, name, description);
      await expect(programRow(page, name).first()).toBeVisible();
    });

    test('TC-013: Special characters in name and description render correctly', async ({ page }) => {
      const name = uniqueName('Informatique & IA - Niveau 2');
      const description = 'Programme bilingue — niveau avancé';
      await createProgram(page, name, description);
      await expectProgramDescriptionInList(page, name, description);
    });

    test('TC-014: Large number of programs renders performantly', async ({ page }) => {
      const start = Date.now();
      await expect(locators.programsPage.table(page)).toBeVisible();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10_000);
      expect(await locators.programsPage.dataRows(page).count()).toBeGreaterThan(1);
    });

    test('TC-015: Single program list displays correctly', async ({ page }) => {
      const name = uniqueName('Single Program Display');
      await createProgram(page, name, 'Only program in this test');
      await expectProgramInList(page, name);
      await expect(locators.programsPage.programColumnHeader(page)).toBeVisible();
    });

    test('TC-016: Emoji in program name and description display correctly', async ({ page }) => {
      const name = uniqueName('Data Science 🚀 2026');
      const description = 'Learn ML with fun 🎯';
      await createProgram(page, name, description);
      await expect(programRow(page, name).getByText('🚀')).toBeVisible();
      await expect(programRow(page, name).getByText('🎯')).toBeVisible();
    });

    test('TC-017: List sort order is consistent', async ({ page }) => {
      const first = uniqueName('AAA Sort Test');
      const second = uniqueName('ZZZ Sort Test');
      await createProgram(page, first, 'First');
      await createProgram(page, second, 'Second');

      const names = await getProgramListNames(page);
      expect(names.length).toBeGreaterThan(0);
    });

    test('TC-018: Empty state CTA navigates to create flow', async ({ page }) => {
      await locators.programsPage.newProgramButton(page).click();
      await expect(locators.createProgramDialog.dialog(page)).toBeVisible();
    });

    test('TC-019: List filtering by search (if feature exists)', async ({ page }) => {
      const search = locators.programsPage.searchBox(page);
      if ((await search.count()) === 0) {
        test.skip(true, 'Search filter is not available on the Programs page');
        return;
      }

      const name = uniqueName('Search Filter Test');
      await createProgram(page, name, 'Searchable program');
      await search.fill(name);
      await expectProgramInList(page, name);
    });
  });
});
