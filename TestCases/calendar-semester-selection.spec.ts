// Playwright tests derived from Test Scenarios Gerkin/calendar-semester-selection.feature
import { test, expect } from '../fixtures/cleanup.fixture';
import { CalendarPage } from '../pages/CalendarPage';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from '../tests/helpers/didaxis';

test.describe('Calendar: program and semester selection gating', () => {
  let programName: string;
  let semesterName: string;

  test.beforeEach(async ({ page, trackProgram }) => {
    programName = uniqueName('Calendar Host Program');
    semesterName = uniqueName('Fall 2026');

    const programsPage = new ProgramsPage(page);
    await programsPage.goto();

    trackProgram(
      await programsPage.createProgram(programName, 'Program for calendar semester selection tests'),
      programName,
    );

    await programsPage.assignSemesterToProgram(
      programName,
      semesterName,
      '2026-09-01',
      '2026-12-15',
    );
  });

  test('TC-001 — Selecting a program and semester loads the calendar grid in Week view', { tag: '@e2e' }, async ({
    page,
  }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    await expect(calendarPage.programInput).toBeEnabled();
    await calendarPage.selectProgram(programName);
    await calendarPage.selectSemester(semesterName);

    await expect(calendarPage.grid).toBeVisible();
    await expect(calendarPage.viewButton('Week')).toHaveAttribute('aria-pressed', 'true');
    await expect(calendarPage.newSessionButton).toBeVisible();
    await expect(calendarPage.sessionSummary).toHaveText(
      '0 sessions scheduled • 2026-09-01 to 2026-12-15',
    );
  });

  test('TC-002 — Switching to Month view updates the pressed view and the period heading', { tag: '@regression' }, async ({
    page,
  }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    await expect(calendarPage.programInput).toBeEnabled();
    await calendarPage.selectProgram(programName);
    await calendarPage.selectSemester(semesterName);
    await expect(calendarPage.grid).toBeVisible();

    await calendarPage.clickView('Month');

    await expect(calendarPage.viewButton('Month')).toHaveAttribute('aria-pressed', 'true');
    await expect(calendarPage.viewButton('Week')).toHaveAttribute('aria-pressed', 'false');
    await expect(calendarPage.periodHeading).toHaveText('September 2026');
    await expect(calendarPage.navButton('Next Month')).toBeVisible();
  });

  test('TC-003 — Semester dropdown stays disabled until a program is chosen', { tag: '@sanity' }, async ({
    page,
  }) => {
    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();

    await expect(calendarPage.programInput).toBeEnabled();
    await expect(calendarPage.semesterInput).toBeDisabled();
    await expect(calendarPage.emptyStatePrompt).toBeVisible();

    await calendarPage.selectProgram(programName);

    await expect(calendarPage.semesterInput).toBeEnabled();
    await expect(calendarPage.semesterLoadHint).toBeVisible();
  });
});
