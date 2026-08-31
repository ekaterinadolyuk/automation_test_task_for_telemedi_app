import { Locator, Page } from '@playwright/test';

export type Channel = 'Telefon' | 'Czat' | 'Wideo';

/**
 * Remote consultation flow (/pl/make-consultation), reached from
 * "Umów się" → "Wizyta zdalna".
 *
 * Like the prescription flow, the widget renders inside the open shadow root of
 * `#telemedico-widget`, so only Playwright locators resolve these elements.
 */
export class RemoteConsultationPage {
  static readonly PATH = '/pl/make-consultation';

  readonly page: Page;
  readonly menuOption: Locator;
  readonly specializationHeader: Locator;
  readonly channelHeader: Locator;
  /** Hint shown under the channel radios; its text changes with the selected channel. */
  readonly channelHint: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuOption = page.locator('[id="consultationNestedMenu:remoteConsultationHeader"]');
    this.specializationHeader = page.getByText('1. Wybierz specjalizację');
    this.channelHeader = page.getByText('2. Określ kanał komunikacji');
    this.channelHint = page.locator('.select-wrapper__description--cb');
  }

  /** Opens the flow the way a patient does: "Umów się" → "Wizyta zdalna". */
  async openFromMenu(): Promise<void> {
    await this.page.getByRole('button', { name: 'Umów się' }).first().click();
    await this.menuOption.waitFor({ timeout: 30_000 });
    await this.menuOption.click();
    await this.specializationHeader.waitFor({ timeout: 90_000 });
    await this.channelHint.waitFor({ timeout: 30_000 });
  }

  channelOption(channel: Channel): Locator {
    return this.page.getByText(channel, { exact: true }).first();
  }

  async selectChannel(channel: Channel): Promise<void> {
    await this.channelOption(channel).click();
    // The hint re-renders after the channel changes.
    await this.page.waitForTimeout(1_000);
  }

  async hintText(): Promise<string> {
    return (await this.channelHint.innerText()).trim();
  }
}
