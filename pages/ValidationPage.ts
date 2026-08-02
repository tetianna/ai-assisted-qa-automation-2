import type { Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';

export class ValidationPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Validation' });
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/validation`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }
}
