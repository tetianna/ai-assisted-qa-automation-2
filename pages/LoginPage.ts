import type { Locator, Page } from '@playwright/test';
import { baseUrl } from './baseUrl';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signInHeading: Locator;
  readonly dashboardHeading: Locator;
  readonly welcomeText: Locator;
  readonly programsNavButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.signInHeading = page.getByText('Sign in to your account');
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.welcomeText = page.getByText('Welcome to Didaxis Studio');
    this.programsNavButton = page.getByRole('navigation').getByRole('button', { name: 'Programs' });
  }

  async goto() {
    await this.page.goto(`${baseUrl()}/login`);
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async signInAndOpenPrograms(email: string, password: string) {
    await this.signIn(email, password);
    await this.programsNavButton.click();
    await this.page.waitForURL('**/programs');
  }
}