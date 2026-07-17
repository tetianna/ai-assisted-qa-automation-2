import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { formatViolations, recordViolations } from './helpers/a11y';
import { HomePage } from '../pages/HomePage';

test.describe('Home accessibility', () => {
  test('home page has no axe violations', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    recordViolations('Home page (full scan)', results.violations);

    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('navigation has no axe violations', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.navigation).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include(await homePage.axeIncludeSelector())
      .analyze();
    recordViolations('Navigation (scoped scan)', results.violations);

    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
});