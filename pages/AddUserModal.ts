import type { ElementHandle, Locator, Page } from '@playwright/test';
import { captureUserCreate } from './userCreate';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export class AddUserModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly createButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Add User' });
    this.heading = this.dialog.getByRole('heading', { name: 'Add User' });
    this.nameInput = this.dialog.getByRole('textbox', { name: 'Name' });
    this.emailInput = this.dialog.getByRole('textbox', { name: 'Email' });
    this.passwordInput = this.dialog.getByRole('textbox', { name: 'Password' });
    this.roleSelect = this.dialog.getByLabel('Role');
    this.createButton = this.dialog.getByRole('button', { name: 'Create User' });
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: 'visible' });
    await this.heading.waitFor({ state: 'visible' });
  }

  async axeIncludeSelector(): Promise<ElementHandle<SVGElement | HTMLElement>> {
    const handle = await this.dialog.elementHandle();
    if (!handle) {
      throw new Error('Add User modal dialog is not mounted for scoped axe scan');
    }
    return handle;
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async clearEmail() {
    await this.emailInput.clear();
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async selectRole(role: UserRole) {
    await this.roleSelect.click();
    await this.page.getByRole('option', { name: role, exact: true }).click();
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async close() {
    await this.page.keyboard.press('Escape');
  }

  async fillUserDetails(name: string, email: string, password: string, role: UserRole = 'EDITOR') {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.selectRole(role);
  }

  async submitAndCaptureId(): Promise<string> {
    const userId = await captureUserCreate(this.page, async () => {
      await this.clickCreate();
    });

    if (!userId) {
      throw new Error('User id not captured from POST /api/users');
    }

    await this.dialog.waitFor({ state: 'hidden', timeout: 15_000 });
    return userId;
  }

  async trySubmitAndCaptureId(): Promise<string | undefined> {
    return captureUserCreate(this.page, async () => {
      await this.clickCreate();
    });
  }
}
