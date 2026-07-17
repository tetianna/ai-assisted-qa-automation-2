import type { Locator, Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly nameValidationError: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'Edit Program' });
    this.programNameInput = this.dialog.getByRole('textbox', { name: 'Program Name' });
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.nameValidationError = this.dialog.getByText(
      /already exists|duplicate|unique|invalid|required|too long|maximum/i,
    );
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: 'visible' });
    await this.heading.waitFor({ state: 'visible' });
  }

  async fillProgramName(name: string) {
    await this.programNameInput.fill(name);
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}