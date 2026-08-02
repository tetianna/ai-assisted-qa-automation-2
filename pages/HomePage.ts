import type { ElementHandle, Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';

type DashboardBlock = 'Programs' | 'Calendar' | 'Validation' | 'AI Assist';

const DASHBOARD_CARD_SUBTITLES: Record<DashboardBlock, string> = {
  Programs: 'Manage academic programs',
  Calendar: 'Schedule & drag-drop',
  Validation: 'Check for conflicts',
  'AI Assist': 'AI-powered editing',
};

export class HomePage {
  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly navigation: Locator;
  readonly main: Locator;
  readonly programsCard: Locator;
  readonly calendarCard: Locator;
  readonly validationCard: Locator;
  readonly aiAssistCard: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.welcomeText = page.getByText('Welcome to Didaxis Studio');
    this.navigation = page.getByRole('navigation');
    this.main = page.getByRole('main');
    this.programsCard = this.dashboardCard('Programs');
    this.calendarCard = this.dashboardCard('Calendar');
    this.validationCard = this.dashboardCard('Validation');
    this.aiAssistCard = this.dashboardCard('AI Assist');
  }

  private dashboardCard(title: DashboardBlock): Locator {
    const subtitle = DASHBOARD_CARD_SUBTITLES[title];
    return this.main
      .getByRole('paragraph')
      .filter({ hasText: new RegExp(`^${title}$`) })
      .locator('xpath=ancestor::*[contains(normalize-space(.), "' + subtitle + '")][1]');
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.welcomeText.waitFor({ state: 'visible' });
    await this.navigation.waitFor({ state: 'visible' });
    await this.waitForDashboardBlocks();
  }

  async waitForDashboardBlocks() {
    await this.programsCard.waitFor({ state: 'visible' });
    await this.calendarCard.waitFor({ state: 'visible' });
    await this.validationCard.waitFor({ state: 'visible' });
    await this.aiAssistCard.waitFor({ state: 'visible' });
  }

  dashboardBlock(name: DashboardBlock): Locator {
    switch (name) {
      case 'Programs':
        return this.programsCard;
      case 'Calendar':
        return this.calendarCard;
      case 'Validation':
        return this.validationCard;
      case 'AI Assist':
        return this.aiAssistCard;
    }
  }

  async openProgramsViaCard() {
    await this.programsCard.click();
    await this.page.waitForURL('**/programs');
  }

  async openCalendarViaCard() {
    await this.calendarCard.click();
    await this.page.waitForURL('**/calendar');
  }

  async openValidationViaCard() {
    await this.validationCard.click();
    await this.page.waitForURL('**/validation');
  }

  async openAIAssistViaCard() {
    await this.aiAssistCard.click();
    await this.page.waitForURL('**/cli');
  }

  async axeIncludeSelector(): Promise<ElementHandle<SVGElement | HTMLElement>> {
    const handle = await this.navigation.elementHandle();
    if (!handle) {
      throw new Error('Navigation is not mounted for scoped axe scan');
    }
    return handle;
  }
}