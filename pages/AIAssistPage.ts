import type { Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';

export class AIAssistPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'AI Assist' });
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/cli`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }
}
