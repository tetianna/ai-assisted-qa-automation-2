import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { formatViolations, recordViolations } from './helpers/a11y';

test.describe('Programs accessibility', () => {
  test('programs page has no axe violations', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await expect(programsPage.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    recordViolations('Programs page (full scan)', results.violations);

    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('New Program modal has no axe violations', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
    await programsPage.openNewProgramForm();
    await expect(programsPage.newProgramModal.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include(await programsPage.newProgramModal.axeIncludeSelector())
      .analyze();
    recordViolations('New Program modal (scoped scan)', results.violations);

    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
});