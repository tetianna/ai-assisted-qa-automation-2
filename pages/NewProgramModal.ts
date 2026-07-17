import type { Locator, Page } from '@playwright/test';
import { captureProgramCreate } from './programCreate';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly nameValidationError: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'New Program' });
    this.programNameInput = this.dialog.getByRole('textbox', { name: 'Program Name' });
    this.descriptionInput = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
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

  async clearProgramName() {
    await this.programNameInput.clear();
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async doubleClickCreate() {
    await this.createButton.dblclick();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async submitAndCaptureId(): Promise<string> {
    const programId = await captureProgramCreate(this.page, async () => {
      await this.clickCreate();
    });

    if (!programId) {
      throw new Error('Program UUID not captured from POST /api/programs');
    }

    await this.dialog.waitFor({ state: 'hidden', timeout: 15_000 });
    return programId;
  }

  async doubleClickSubmitAndCaptureId(): Promise<string | undefined> {
    const programId = await captureProgramCreate(this.page, async () => {
      await this.doubleClickCreate();
    });

    await this.dialog.waitFor({ state: 'hidden', timeout: 15_000 });
    return programId;
  }

  async tryClickCreateAndCaptureId(): Promise<string | undefined> {
    return captureProgramCreate(this.page, async () => {
      await this.clickCreate();
    });
  }
}