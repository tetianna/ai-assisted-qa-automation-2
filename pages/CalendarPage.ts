import type { Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';

export class CalendarPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly programInput: Locator;
  readonly semesterInput: Locator;
  readonly emptyStatePrompt: Locator;
  readonly calendarHint: Locator;
  readonly selectSemesterPrompt: Locator;
  readonly semesterLoadHint: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Calendar' });
    this.subtitle = page.getByText('Schedule sessions with drag-and-drop across month, week, and day views');
    this.programInput = page.getByRole('textbox', { name: 'Program' });
    this.semesterInput = page.getByRole('textbox', { name: 'Semester' });
    this.emptyStatePrompt = page.getByText('Select a program and semester to view the calendar');
    this.calendarHint = page.getByText('Use the dropdowns above to choose a program, then a semester');
    this.selectSemesterPrompt = page.getByText('Select a semester');
    this.semesterLoadHint = page.getByText('Choose a semester from the dropdown to load its sessions');
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/calendar`);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
    await this.subtitle.waitFor({ state: 'visible' });
    await this.programInput.waitFor({ state: 'visible' });
    await this.semesterInput.waitFor({ state: 'visible' });
  }

  async selectProgram(name: string) {
    await this.programInput.click();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async selectSemester(name: string) {
    await this.semesterInput.click();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async assignProgramAndSemester(programName: string, semesterName: string) {
    await this.selectProgram(programName);
    await this.selectSemester(semesterName);
  }

  viewButton(name: 'Month' | 'Week' | 'Day'): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }
}