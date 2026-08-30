import { Locator, Page } from '@playwright/test';

/** Context menu opened by the "Umów się" button in the left sidebar. */
export class BookingMenu {
  readonly page: Page;
  /** All six appointment options. */
  readonly options: Locator;
  readonly prescriptionOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.options = page.locator('[id^="consultationNestedMenu:"], #medicalExamination');
    this.prescriptionOption = page.locator('[id="consultationNestedMenu:prescriptionHeader"]');
  }

  async open(): Promise<void> {
    await this.page.getByRole('button', { name: 'Umów się' }).first().click();
    await this.prescriptionOption.waitFor();
  }
}
