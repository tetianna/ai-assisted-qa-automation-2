import type { Locator, Page } from '@playwright/test';

export class AppNavigation {
  readonly bar: Locator;
  readonly programsButton: Locator;
  readonly calendarButton: Locator;
  readonly dashboardButton: Locator;
  readonly signOutButton: Locator;

  constructor(private readonly page: Page) {
    this.bar = page.getByRole('navigation');
    this.programsButton = this.bar.getByRole('button', { name: 'Programs' });
    this.calendarButton = this.bar.getByRole('button', { name: 'Calendar' });
    this.dashboardButton = this.bar.getByRole('button', { name: 'Dashboard' });
    this.signOutButton = this.bar.getByRole('button', { name: 'Sign out' });
  }

  async openPrograms() {
    await this.programsButton.click();
    await this.page.waitForURL('**/programs');
  }

  async openCalendar() {
    await this.calendarButton.click();
    await this.page.waitForURL('**/calendar');
  }

  async openDashboard() {
    await this.dashboardButton.click();
    await this.page.waitForURL(/\/(?:$|\?)/);
  }
}