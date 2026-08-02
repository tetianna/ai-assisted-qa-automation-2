import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture';
import { formatViolations, recordViolations } from './helpers/a11y';
import { AIAssistPage } from '../pages/AIAssistPage';
import { AppNavigation } from '../pages/AppNavigation';
import { CalendarPage } from '../pages/CalendarPage';
import { HomePage } from '../pages/HomePage';
import { ProgramsPage } from '../pages/ProgramsPage';
import { ValidationPage } from '../pages/ValidationPage';

const DASHBOARD_BLOCKS = ['Programs', 'Calendar', 'Validation', 'AI Assist'] as const;

test.describe('DS-119: Dashboard displaying the right components', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
  });

  test('TC-001 — Navigate to the Dashboard', async ({ page }) => {
    const homePage = new HomePage(page);

    await expect(homePage.heading).toBeVisible();
    for (const name of DASHBOARD_BLOCKS) {
      await expect(homePage.dashboardBlock(name)).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    recordViolations('Dashboard (full scan)', results.violations);
    await expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('TC-002 — Successfully navigate to Program Page', async ({ page }) => {
    const homePage = new HomePage(page);
    const programsPage = new ProgramsPage(page);

    await homePage.openProgramsViaCard();
    await programsPage.waitForLoaded();
    await expect(programsPage.heading).toBeVisible();
  });

  test('TC-003 — Successfully navigate to Calendar Page', async ({ page }) => {
    const homePage = new HomePage(page);
    const calendarPage = new CalendarPage(page);

    await homePage.openCalendarViaCard();
    await calendarPage.waitForLoaded();
    await expect(calendarPage.heading).toBeVisible();
  });

  test('TC-004 — Successfully navigate to Validation Page', async ({ page }) => {
    const homePage = new HomePage(page);
    const validationPage = new ValidationPage(page);

    await homePage.openValidationViaCard();
    await validationPage.waitForLoaded();
    await expect(validationPage.heading).toBeVisible();
  });

  test('TC-005 — Successfully navigate to AI Assist Page', async ({ page }) => {
    const homePage = new HomePage(page);
    const aiAssistPage = new AIAssistPage(page);

    await homePage.openAIAssistViaCard();
    await aiAssistPage.waitForLoaded();
    await expect(aiAssistPage.heading).toBeVisible();
  });

  test('TC-006 — Dashboard block cards are not duplicated in the main content area', async ({ page }) => {
    const homePage = new HomePage(page);

    for (const name of DASHBOARD_BLOCKS) {
      await expect(homePage.dashboardBlock(name)).toHaveCount(1);
    }
  });

  test('TC-007 — Dashboard remains visible after returning from Programs page', async ({ page }) => {
    const homePage = new HomePage(page);
    const programsPage = new ProgramsPage(page);
    const navigation = new AppNavigation(page);

    await homePage.openProgramsViaCard();
    await programsPage.waitForLoaded();
    await expect(programsPage.heading).toBeVisible();

    await navigation.openDashboard();
    await homePage.waitForDashboardBlocks();

    await expect(homePage.heading).toBeVisible();
    for (const name of DASHBOARD_BLOCKS) {
      await expect(homePage.dashboardBlock(name)).toBeVisible();
    }
  });
});
