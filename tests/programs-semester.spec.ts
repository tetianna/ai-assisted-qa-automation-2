// Playwright tests derived from features/programs-semester.feature
import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from '../TestCases/block4/helpers/didaxis';

test.describe('Programs: semester management', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test.describe('Happy paths', () => {
    test('TC-001 — Admin adds a semester to a selected program', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Host Program');
      const semesterName = uniqueName('Fall 2026');

      trackProgram(
        await programsPage.createProgram(programName, 'Program used for semester assignment'),
        programName,
      );

      await programsPage.assignSemesterToProgram(
        programName,
        semesterName,
        '2026-09-01',
        '2026-12-15',
      );

      await expect(programsPage.semesterLabel(semesterName)).toBeVisible();
    });
  });

  test.describe('Negative', () => {
    test('TC-003 — Semester form unavailable without program selection', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Selection Gate');

      trackProgram(
        await programsPage.createProgram(programName, 'Program for selection gate test'),
        programName,
      );

      await expect(programsPage.manageSemestersHint).toBeVisible();
      await expect(programsPage.addSemesterButton).toBeHidden();
    });

    test('TC-004 — Empty semester name is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Empty Name');
      const modal = programsPage.newSemesterModal;

      trackProgram(await programsPage.createProgram(programName, 'Empty name test'), programName);

      await programsPage.selectProgramRow(programName);
      await programsPage.openNewSemesterForm();
      await modal.fillStartDate('2026-09-01');
      await modal.fillEndDate('2026-12-15');

      await expect(modal.createButton).toBeDisabled();
    });

    test('TC-005 — Whitespace-only semester name is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Whitespace Name');
      const modal = programsPage.newSemesterModal;

      trackProgram(await programsPage.createProgram(programName, 'Whitespace name test'), programName);

      await programsPage.selectProgramRow(programName);
      await programsPage.openNewSemesterForm();
      await modal.fillSemesterName('   ');
      await modal.fillStartDate('2026-09-01');
      await modal.fillEndDate('2026-12-15');

      await expect(modal.createButton).toBeDisabled();
    });

    test('TC-006 — End date before start date is rejected', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Bad Dates');
      const semesterName = uniqueName('Invalid Range Semester');
      const modal = programsPage.newSemesterModal;

      trackProgram(await programsPage.createProgram(programName, 'Bad dates test'), programName);

      await programsPage.selectProgramRow(programName);
      await programsPage.openNewSemesterForm();
      await modal.fillSemesterName(semesterName);
      await modal.fillStartDate('2026-12-15');
      await modal.fillEndDate('2026-09-01');
      await modal.clickCreate();

      await expect(modal.dialog).toBeVisible();
      await expect(programsPage.semesterLabel(semesterName)).toHaveCount(0);
    });

    test('TC-007 — Semester is not created when API fails', { tag: '@network' }, async ({
      page,
      trackProgram,
    }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester API Fail');
      const semesterName = uniqueName('API Fail Semester');
      const modal = programsPage.newSemesterModal;

      trackProgram(await programsPage.createProgram(programName, 'API fail test'), programName);

      await page.route('**/semesters**', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({ status: 500, body: 'Semester create unavailable' });
        } else {
          route.continue();
        }
      });

      await programsPage.selectProgramRow(programName);
      await programsPage.openNewSemesterForm();
      await modal.fillSemesterName(semesterName);
      await modal.fillStartDate('2026-09-01');
      await modal.fillEndDate('2026-12-15');
      await modal.clickCreate();

      await expect(programsPage.semesterLabel(semesterName)).toHaveCount(0);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-002 — Cancelling New Semester does not create a semester', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Cancel Host');
      const semesterName = uniqueName('Spring 2027');
      const modal = programsPage.newSemesterModal;

      trackProgram(
        await programsPage.createProgram(programName, 'Program for semester cancel test'),
        programName,
      );

      await programsPage.selectProgramRow(programName);
      await programsPage.openNewSemesterForm();
      await modal.fillSemesterName(semesterName);
      await modal.fillStartDate('2027-01-10');
      await modal.fillEndDate('2027-05-15');
      await modal.cancel();

      await expect(modal.dialog).toBeHidden();
      await expect(programsPage.semesterLabel(semesterName)).toHaveCount(0);
    });

    test('TC-008 — Multiple semesters can be added to one program', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Multi Semester Host');
      const fall = uniqueName('Fall 2026');
      const spring = uniqueName('Spring 2027');

      trackProgram(await programsPage.createProgram(programName, 'Multiple semesters test'), programName);

      await programsPage.assignSemesterToProgram(programName, fall, '2026-09-01', '2026-12-15');
      await programsPage.assignSemesterToProgram(programName, spring, '2027-01-10', '2027-05-15');

      await expect(programsPage.semesterLabel(fall)).toBeVisible();
      await expect(programsPage.semesterLabel(spring)).toBeVisible();
    });

    test('TC-009 — Special characters in semester name render correctly', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Special Chars Host');
      const semesterName = uniqueName('Fall & Spring (2026–27)');

      trackProgram(await programsPage.createProgram(programName, 'Special chars semester test'), programName);

      await programsPage.assignSemesterToProgram(
        programName,
        semesterName,
        '2026-09-01',
        '2026-12-15',
      );

      await expect(programsPage.semesterLabel(semesterName)).toBeVisible();
    });

    test('TC-010 — Long semester name is accepted and visible', async ({ page, trackProgram }) => {
      const programsPage = new ProgramsPage(page);
      const programName = uniqueName('Semester Long Name Host');
      const prefix = uniqueName('LongSem');
      const semesterName = (prefix + 'S'.repeat(200)).slice(0, 255);

      trackProgram(await programsPage.createProgram(programName, 'Long semester name test'), programName);

      await programsPage.assignSemesterToProgram(
        programName,
        semesterName,
        '2026-09-01',
        '2026-12-15',
      );

      await expect(programsPage.semesterLabel(semesterName)).toBeVisible();
    });
  });
});
