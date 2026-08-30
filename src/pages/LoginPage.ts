import { Locator, Page } from '@playwright/test';

/** Login screen of the Telemedi patient panel (https://testyautomatyczne.telemedi.com/pl). */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly acceptCookiesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    // `exact` keeps this from also matching the "Zaloguj się bez hasła" button.
    this.submitButton = page.getByRole('button', { name: 'Zaloguj się', exact: true });
    this.acceptCookiesButton = page.getByRole('button', { name: 'Akceptuję' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/pl');
    await this.usernameInput.waitFor();
  }

  /** The cookie banner covers the form on a fresh browser profile, but not on a reused one. */
  async acceptCookiesIfPresent(): Promise<void> {
    const button = this.acceptCookiesButton.first();
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      await button.waitFor({ state: 'hidden' }).catch(() => undefined);
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.first().click();
  }
}
