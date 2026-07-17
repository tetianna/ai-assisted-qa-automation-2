import type { ElementHandle, Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';

export class HomePage {
  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly navigation: Locator;
  readonly main: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.welcomeText = page.getByText('Welcome to Didaxis Studio');
    this.navigation = page.getByRole('navigation');
    this.main = page.getByRole('main');
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.welcomeText.waitFor({ state: 'visible' });
    await this.navigation.waitFor({ state: 'visible' });
  }

  async axeIncludeSelector(): Promise<ElementHandle<SVGElement | HTMLElement>> {
    const handle = await this.navigation.elementHandle();
    if (!handle) {
      throw new Error('Navigation is not mounted for scoped axe scan');
    }
    return handle;
  }
}