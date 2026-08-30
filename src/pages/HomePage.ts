import { Locator, Page } from '@playwright/test';
import { PATIENT_NAME } from '../config/env';

/** Patient dashboard shown after a successful login. */
export class HomePage {
  readonly page: Page;
  readonly bookVisitButton: Locator;
  readonly consultationsLink: Locator;
  readonly documentationLink: Locator;
  readonly patientName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookVisitButton = page.getByRole('button', { name: 'Umów się' });
    this.consultationsLink = page.getByRole('link', { name: 'Konsultacje' });
    this.documentationLink = page.getByRole('link', { name: 'Dokumentacja' });
    this.patientName = page.getByText(PATIENT_NAME).first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/pl');
  }

  /** Resolves once the dashboard has finished rendering. */
  async waitUntilLoaded(): Promise<void> {
    await this.bookVisitButton.waitFor({ timeout: 30_000 });
  }
}
