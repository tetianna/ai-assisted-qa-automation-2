import type { Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';
import { EditProgramModal } from './EditProgramModal';
import { NewProgramModal } from './NewProgramModal';
import { NewSemesterModal } from './NewSemesterModal';

export class ProgramsPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly table: Locator;
  readonly newProgramButton: Locator;
  readonly emptyState: Locator;
  readonly programColumnHeader: Locator;
  readonly errorMessage: Locator;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;
  readonly newSemesterModal: NewSemesterModal;
  readonly addSemesterButton: Locator;
  readonly manageSemestersHint: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Programs', exact: true });
    this.subtitle = page.getByText('Manage academic programs and semesters');
    this.table = page.getByRole('table');
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.emptyState = page.getByText(/no programs yet|create your first program/i);
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.errorMessage = page
      .getByRole('alert')
      .or(page.getByRole('status'))
      .or(page.getByText(/error|failed|unable|something went wrong/i));
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.newSemesterModal = new NewSemesterModal(page);
    this.addSemesterButton = page.getByRole('button', { name: '+ Semester' });
    this.manageSemestersHint = page.getByText('Select a program to manage semesters');
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/programs`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.subtitle.waitFor({ state: 'visible' });
    const list = this.table.or(this.emptyState);
    await list.first().waitFor({ state: 'visible', timeout: 15_000 });
    if (await this.table.isVisible()) {
      await this.programColumnHeader.waitFor({ state: 'visible' });
    }
  }

  async openNewProgramForm() {
    await this.newProgramButton.click();
    await this.newProgramModal.waitForOpen();
  }

  editButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${name}`, exact: true });
  }

  deleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${name}`, exact: true });
  }

  dataRows(): Locator {
    return this.table.getByRole('row').filter({
      has: this.page.getByRole('button', { name: /^Edit / }),
    });
  }

  async programNameAt(index: number): Promise<string> {
    const cell = this.dataRows().nth(index).getByRole('cell').first();
    const text = (await cell.textContent())?.trim() ?? '';
    return text.split('\n')[0]?.trim() ?? text;
  }

  async deleteProgram(name: string) {
    const dialogHandled = new Promise<void>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        await dialog.accept();
        resolve();
      });
    });

    await this.deleteButton(name).click();
    await dialogHandled;
  }

  async openEditProgramForm(name: string) {
    await this.editButton(name).click();
    await this.editProgramModal.waitForOpen();
  }

  programRow(name: string): Locator {
    return this.table.getByRole('row').filter({
      has: this.page.getByText(name, { exact: true }),
    });
  }

  exactProgramNameCell(name: string): Locator {
    return this.table.getByRole('cell').getByText(name, { exact: true });
  }

  programNameCell(name: string): Locator {
    return this.exactProgramNameCell(name).first();
  }

  rowWithText(name: string, text: string): Locator {
    return this.programRow(name).getByText(text);
  }

  async countRowsNamed(name: string): Promise<number> {
    return this.exactProgramNameCell(name).count();
  }

  async waitForProgramInList(name: string) {
    await this.programNameCell(name).waitFor({ state: 'visible', timeout: 15_000 });
  }

  async createProgram(name: string, description = ''): Promise<string> {
    await this.openNewProgramForm();
    await this.newProgramModal.fillProgramName(name);
    if (description) {
      await this.newProgramModal.fillDescription(description);
    }
    const programId = await this.newProgramModal.submitAndCaptureId();
    await this.waitForProgramInList(name);
    return programId;
  }

  async selectProgramRow(name: string) {
    await this.programRow(name).click();
  }

  async openNewSemesterForm() {
    await this.addSemesterButton.click();
    await this.newSemesterModal.waitForOpen();
  }

  async assignSemesterToProgram(
    programName: string,
    semesterName: string,
    startDate: string,
    endDate: string,
  ) {
    await this.selectProgramRow(programName);
    await this.openNewSemesterForm();
    await this.newSemesterModal.createSemester(semesterName, startDate, endDate);
  }

  semesterLabel(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }
}