import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueName } from '../block4/helpers/didaxis';

test.describe('Block 10: Delete third program from Programs list', () => {
  test.beforeEach(async ({ page }) => {
    const programsPage = new ProgramsPage(page);
    await programsPage.goto();
  });

  test('user can find the third program and delete it successfully', async ({ page, trackProgram }) => {
    const programsPage = new ProgramsPage(page);
    const firstName = uniqueName('Block10 Program One');
    const secondName = uniqueName('Block10 Program Two');
    const thirdName = uniqueName('Block10 Program Three');

    trackProgram(await programsPage.createProgram(firstName, 'First program for delete-order test'), firstName);
    //trackProgram(await programsPage.createProgram(secondName, 'Second program for delete-order test'), secondName);
    //trackProgram(await programsPage.createProgram(thirdName, 'Third program targeted for deletion'), thirdName);

    await expect(programsPage.programRow(thirdName)).toBeVisible();
    await expect(programsPage.programRow(firstName)).toBeVisible();
    await expect(programsPage.programRow(secondName)).toBeVisible();

    await programsPage.deleteProgram(thirdName);

    await expect(programsPage.programRow(thirdName)).toHaveCount(0);
    await expect(programsPage.programRow(firstName)).toBeVisible();
    await expect(programsPage.programRow(secondName)).toBeVisible();
  });
});