import type { Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';
import { AddUserModal, type UserRole } from './AddUserModal';

export class SettingsPage {
  readonly heading: Locator;
  readonly usersSectionHeading: Locator;
  readonly addUserButton: Locator;
  readonly usersTable: Locator;
  readonly accountSectionHeading: Locator;
  readonly calendarViewHeading: Locator;
  readonly addUserModal: AddUserModal;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Settings' });
    this.usersSectionHeading = page.getByRole('heading', { name: 'Users' });
    this.addUserButton = page.getByRole('button', { name: 'Add User' });
    this.usersTable = page.getByRole('table').filter({
      has: page.getByRole('columnheader', { name: 'Email' }),
    });
    this.accountSectionHeading = page.getByRole('heading', { name: 'Account' });
    this.calendarViewHeading = page.getByRole('heading', { name: 'Calendar View' });
    this.addUserModal = new AddUserModal(page);
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/settings`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.calendarViewHeading.waitFor({ state: 'visible' });
    await this.accountSectionHeading.waitFor({ state: 'visible' });
  }

  async waitForUsersSection() {
    await this.usersSectionHeading.waitFor({ state: 'visible' });
    await this.usersTable.waitFor({ state: 'visible' });
  }

  async openAddUserForm() {
    await this.addUserButton.click();
    await this.addUserModal.waitForOpen();
  }

  userRow(name: string): Locator {
    return this.usersTable.getByRole('row').filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  userRowByEmail(email: string): Locator {
    return this.usersTable.getByRole('row').filter({
      has: this.page.getByText(email, { exact: true }),
    });
  }

  async countUsersNamed(name: string): Promise<number> {
    return this.userRow(name).count();
  }

  async countUsersWithEmail(email: string): Promise<number> {
    return this.userRowByEmail(email).count();
  }

  async addUser(
    name: string,
    email: string,
    password: string,
    role: UserRole = 'EDITOR',
  ): Promise<string> {
    await this.openAddUserForm();
    await this.addUserModal.fillUserDetails(name, email, password, role);
    const userId = await this.addUserModal.submitAndCaptureId();
    await this.userRow(name).waitFor({ state: 'visible', timeout: 15_000 });
    return userId;
  }
}
