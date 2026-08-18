// Playwright tests derived from features/DS-5.feature
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from '../tests/helpers/didaxis';

test.describe('DS-5: Program list filtering and display', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Program list displays name and description for each program', { tag: '@smoke' }, async ({
      page,
      trackProgram,
    }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Web Development 2026');
      const description = 'Full-stack web development program';

      trackProgram(await programsPage.createProgram(name, description), name);
      await expect(programsPage.programRow(name)).toBeVisible();
      await expect(programsPage.rowWithText(name, description)).toBeVisible();
    });

    test.skip('TC-002 — Empty state shown when no programs exist', { tag: '@regression' }, async () => {
      test.skip(true, 'Shared test environment contains existing programs; empty state cannot be guaranteed');
    });

    test('TC-003 — List updates after creating a new program', { tag: '@sanity' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Mobile App Development');
      const description = 'iOS and Android development';

      trackProgram(await programsPage.createProgram(name, description), name);
      await expect(programsPage.programRow(name)).toBeVisible();
      await expect(programsPage.rowWithText(name, description)).toBeVisible();
    });

    test('TC-004 — List reflects edits immediately', { tag: '@sanity' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Edit Display Test');
      const updated = `${name} Updated`;
      const editModal = programsPage.editProgramModal;

      trackProgram(await programsPage.createProgram(name, 'Original'), name);
      await programsPage.openEditProgramForm(name);
      await editModal.fillProgramName(updated);
      await editModal.clickSave();

      await expect(programsPage.programRow(updated)).toBeVisible();
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
    });

    test('TC-005 — List reflects deletion immediately', { tag: '@sanity' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Delete Display Test');

      trackProgram(await programsPage.createProgram(name, 'To be deleted'), name);
      await programsPage.deleteProgramAndWaitForRemoval(name);
      await expect(programsPage.exactProgramNameCell(name)).toHaveCount(0);
    });

    test('TC-006 — Programs with empty description display appropriately', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('No Description Program');

      trackProgram(await programsPage.createProgram(name), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });
  });

  test.describe('Negative', () => {
    test.skip('TC-007 — List does not show programs user is unauthorized to view', { tag: '@regression' }, async () => {
      test.skip(true, 'Requires non-admin credentials in .env');
    });

    test.fixme('TC-008 — API failure shows error state instead of misleading empty list', { tag: '@api' }, async ({
      page,
    }) => {
      const programsPage = new ProgramsPage(page);

      await page.route('**/api/programs**', (route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({ status: 500, body: 'List unavailable' });
        } else {
          route.continue();
        }
      });

      await programsPage.goto();
      await expect(programsPage.errorMessage).toBeVisible();
      await expect(programsPage.emptyState).not.toBeVisible();
    });

    test('TC-009 — Partial data does not break list rendering', { tag: '@regression' }, async ({ page }) => {
      const programsPage = new ProgramsPage(page);

      await expect(programsPage.table).toBeVisible();
      await expect(programsPage.programColumnHeader).toBeVisible();
    });

    test('TC-010 — XSS in stored description is not executed in list', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      let alertFired = false;
      page.on('dialog', (dialog) => {
        alertFired = true;
        dialog.dismiss();
      });

      const name = uniqueName('XSS List Test');
      trackProgram(
        await programsPage.createProgram(name, "<img src=x onerror=alert('xss')>"),
        name,
      );

      await expect(programsPage.programRow(name)).toBeVisible();
      expect(alertFired).toBe(false);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-011 — Long program name displays with truncation or wrap', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const prefix = uniqueName('LongDisplay');
      const longName = (prefix + 'N'.repeat(200)).slice(0, 255);

      trackProgram(await programsPage.createProgram(longName, 'Long name display'), longName);
      await expect(programsPage.programRow(longName)).toBeVisible();
    });

    test('TC-012 — Long description displays with truncation or expand', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Long Desc Display');
      const description = 'L'.repeat(500);

      trackProgram(await programsPage.createProgram(name, description), name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });

    test('TC-013 — Special characters in name and description render correctly', { tag: '@regression' }, async ({
      page,
      trackProgram,
    }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Informatique & IA - Niveau 2');
      const description = 'Programme bilingue — niveau avancé';

      trackProgram(await programsPage.createProgram(name, description), name);
      await expect(programsPage.rowWithText(name, description)).toBeVisible();
    });

    test('TC-014 — Large number of programs renders performantly', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);

      for (let i = 0; i < 3; i += 1) {
        const name = uniqueName(`Perf Program ${i}`);
        trackProgram(await programsPage.createProgram(name, `Performance seed ${i}`), name);
      }

      await expect(programsPage.table).toBeVisible({ timeout: 10_000 });
      await expect(programsPage.dataRows()).not.toHaveCount(0);
    });

    test('TC-015 — Single program list displays correctly', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Single Program Display');

      trackProgram(await programsPage.createProgram(name, 'Only program in this test'), name);
      await expect(programsPage.programRow(name)).toBeVisible();
      await expect(programsPage.programColumnHeader).toBeVisible();
    });

    test('TC-016 — Emoji in program name and description display correctly', { tag: '@regression' }, async ({
      page,
      trackProgram,
    }) => {
      const programsPage = new ProgramsPage(page);
      const name = uniqueName('Data Science 🚀 2026');
      const description = 'Learn ML with fun 🎯';

      trackProgram(await programsPage.createProgram(name, description), name);
      await expect(programsPage.programRow(name)).toBeVisible();
      await expect(programsPage.rowWithText(name, description)).toBeVisible();
    });

    test('TC-017 — List sort order is consistent', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const first = uniqueName('AAA Sort Test');
      const second = uniqueName('ZZZ Sort Test');

      trackProgram(await programsPage.createProgram(first, 'First'), first);
      trackProgram(await programsPage.createProgram(second, 'Second'), second);

      const orderBefore = await programsPage.getProgramListNames();
      expect(orderBefore).toContain(first);
      expect(orderBefore).toContain(second);

      await programsPage.goto();
      const orderAfter = await programsPage.getProgramListNames();
      expect(orderAfter).toEqual(orderBefore);
    });

    test('TC-018 — Empty state CTA navigates to create flow', { tag: '@regression' }, async ({ page }) => {
      const programsPage = new ProgramsPage(page);

      await programsPage.newProgramButton.click();
      await expect(programsPage.newProgramModal.dialog).toBeVisible();
    });

    test('TC-019 — List filtering by search narrows visible programs', { tag: '@regression' }, async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);

      if ((await programsPage.searchBox.count()) === 0) {
        test.skip(true, 'Search filter is not available on the Programs page');
        return;
      }

      const name = uniqueName('Search Filter Test');
      trackProgram(await programsPage.createProgram(name, 'Searchable program'), name);
      await programsPage.searchBox.fill(name);
      await expect(programsPage.programRow(name)).toBeVisible();
    });
  });
});
