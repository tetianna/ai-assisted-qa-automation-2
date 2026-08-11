import type { Locator, Page } from '@playwright/test';

export class NewSemesterModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly semesterNameInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly validationError: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Semester' });
    this.heading = this.dialog.getByRole('heading', { name: 'New Semester' });
    this.semesterNameInput = this.dialog.getByRole('textbox', { name: 'Semester Name' });
    this.startDateInput = this.dialog.getByLabel('Start Date');
    this.endDateInput = this.dialog.getByLabel('End Date');
    this.createButton = this.dialog.getByRole('button', { name: 'Create Semester' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.validationError = this.dialog.getByText(
      /invalid|required|end date|start date|before|after|failed|too long|maximum/i,
    );
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: 'visible' });
    await this.heading.waitFor({ state: 'visible' });
  }

  async fillSemesterName(name: string) {
    await this.semesterNameInput.fill(name);
  }

  async fillStartDate(date: string) {
    await this.startDateInput.fill(date);
  }

  async fillEndDate(date: string) {
    await this.endDateInput.fill(date);
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async create() {
    await this.createButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 15_000 });
  }

  async createSemester(name: string, startDate: string, endDate: string) {
    await this.fillSemesterName(name);
    await this.fillStartDate(startDate);
    await this.fillEndDate(endDate);
    await this.create();
  }

  async cancel() {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }
}