import { Locator, Page } from '@playwright/test';

/** Consultation list ("Konsultacje") and the cancellation dialog. */
export class ConsultationsPage {
  readonly page: Page;
  readonly consultationsLink: Locator;
  readonly upcomingSection: Locator;
  readonly cancelButton: Locator;
  readonly cancelDialogTitle: Locator;
  readonly confirmCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.consultationsLink = page.getByRole('link', { name: 'Konsultacje' });
    this.upcomingSection = page.getByText('Wkrótce', { exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Anuluj', exact: true });
    this.cancelDialogTitle = page.getByText('Anulowanie konsultacji');
    this.confirmCancelButton = page.getByRole('button', { name: 'Tak, odwołuję' });
  }

  /** Cancels the most recent reservation and waits for it to disappear from the list. */
  async cancelLatestReservation(): Promise<void> {
    await this.cancelButton.first().click();
    await this.confirmCancelButton.waitFor();
    await this.confirmCancelButton.click();
    await this.cancelButton.first().waitFor({ state: 'detached' });
  }
}
