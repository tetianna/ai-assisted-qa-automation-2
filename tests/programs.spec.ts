import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueName } from '../TestCases/block4/helpers/didaxis';

test.describe('Programs', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('new program form displays required fields', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.openNewProgramForm();

    const modal = programsPage.newProgramModal;
    await expect(modal.programNameInput).toBeVisible();
    await expect(modal.descriptionInput).toBeVisible();
    await expect(modal.createButton).toBeVisible();
    await expect(modal.cancelButton).toBeVisible();
  });

  test('creates a program and shows it in the list', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';

    trackProgram(await programsPage.createProgram(name, description), name);

    await expect(programsPage.programRow(name)).toBeVisible();
    await expect(programsPage.rowWithText(name, description)).toBeVisible();
  });

  test('cancel closes the form without creating a program', async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    const name = uniqueName('Cybersecurity Bootcamp 2026');

    await programsPage.openNewProgramForm();
    await programsPage.newProgramModal.fillProgramName(name);
    await programsPage.newProgramModal.fillDescription('Introductory cybersecurity program');
    await programsPage.newProgramModal.cancel();

    await expect(programsPage.newProgramModal.dialog).toBeHidden();
    await expect(programsPage.programRow(name)).toHaveCount(0);
  });
});