import { test, expect } from '../../fixtures/cleanup.fixture';
import { AppNavigation } from '../../pages/AppNavigation';
import { CalendarPage } from '../../pages/CalendarPage';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueName } from '../block4/helpers/didaxis';

test.describe('Block 10: Assign semester to program via Calendar', () => {
  test('user can select a program and assign a semester on the Calendar tab', async ({
    page,
    trackProgram,
  }) => {
    const programsPage = new ProgramsPage(page);
    const navigation = new AppNavigation(page);
    const calendarPage = new CalendarPage(page);
    const programName = uniqueName('Block10 Calendar Program');
    const semesterName = uniqueName('Fall 2026');

    await programsPage.goto();
   // trackProgram(
    //  await programsPage.createProgram(programName, 'Program used for calendar semester assignment'),
     // programName,
    //);

    await programsPage.assignSemesterToProgram(programName, semesterName, '2026-09-01', '2026-12-15');
    await expect(programsPage.semesterLabel(semesterName)).toBeVisible();

    await navigation.openCalendar();
    await expect(calendarPage.emptyStatePrompt).toBeVisible();

    await calendarPage.assignProgramAndSemester(programName, semesterName);

    await expect(calendarPage.programInput).toHaveValue(programName);
    await expect(calendarPage.semesterInput).toHaveValue(semesterName);
    await expect(calendarPage.selectSemesterPrompt).toBeHidden();
    await expect(calendarPage.semesterLoadHint).toBeHidden();
  });
});