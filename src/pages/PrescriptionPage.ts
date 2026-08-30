import { Locator, Page } from '@playwright/test';

/**
 * Prescription consultation flow (/pl/make-prescription-consultation).
 *
 * The whole widget is rendered inside the open shadow root of `#telemedico-widget`,
 * so only Playwright locators resolve these elements — plain `document` queries
 * and XPath do not pierce shadow DOM.
 */
export class PrescriptionPage {
  static readonly PATH = '/pl/make-prescription-consultation';

  readonly page: Page;

  // --- drug search step ---
  readonly searchHeader: Locator;
  readonly conditionsHeader: Locator;
  readonly drugInputLabel: Locator;
  readonly drugInput: Locator;
  readonly conditionTiles: Locator;
  readonly suggestions: Locator;

  // --- consultation summary step ---
  readonly summaryTitle: Locator;
  readonly drugSummary: Locator;
  readonly quantity: Locator;
  readonly packaging: Locator;
  readonly doctorName: Locator;
  readonly doctorDescription: Locator;
  readonly doctorAssignInfo: Locator;
  readonly doctorStars: Locator;
  readonly patientDataTitle: Locator;
  readonly patientData: Locator;
  readonly lockIcon: Locator;
  readonly dataProtectionText: Locator;
  readonly priceRow: Locator;
  readonly priceValue: Locator;
  readonly selectAllLabel: Locator;
  readonly selectAllCheckbox: Locator;
  readonly consentLabels: Locator;
  readonly consentCheckboxes: Locator;
  readonly cancelButton: Locator;
  readonly bookPaidButton: Locator;
  readonly bookFreeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchHeader = page.locator('h2.fk-content__header');
    this.conditionsHeader = page.locator('.categories-header');
    this.drugInputLabel = page.locator('label.fk-input__label');
    this.drugInput = page.locator('input[id^="react-select"]').first();
    this.conditionTiles = page.locator('.category-item');
    this.suggestions = page.locator('[id^="react-select"][id*="option"]');

    this.summaryTitle = page.locator('h3.fk-content__subtitle').filter({ hasText: 'Twoja konsultacja z e-receptą' });
    this.drugSummary = page.locator('.prescription-drug-details, .prescription-details-section').first();
    this.quantity = page.locator('span.text-bold').filter({ hasText: 'szt.' });
    this.packaging = page.getByText(/^opakowanie:/);
    this.doctorName = page.locator('.booked-visit-summary__name');
    this.doctorDescription = page.locator('.booked-visit-summary__description');
    this.doctorAssignInfo = page.locator('.booked-visit-summary-doctor-assign-info');
    this.doctorStars = page.locator('.booked-visit-summary__stars--star');
    this.patientDataTitle = page.locator('h3.fk-content__subtitle').filter({ hasText: 'Twoje dane' });
    this.patientData = page.locator('.user-details-wrapper');
    this.lockIcon = page.locator('.fk-footer__info svg');
    this.dataProtectionText = page.locator('.fk-footer__info a.link');
    this.priceRow = page.locator('.prescription_price');
    this.priceValue = page.locator('.prescription_price span');
    this.selectAllLabel = page.locator('label[for="checkAll"]');
    this.selectAllCheckbox = page.locator('#checkAll');
    this.consentLabels = page.locator('label[for^="additionalAgreement"]');
    this.consentCheckboxes = page.locator('input[id^="additionalAgreement"]');
    this.cancelButton = page.getByRole('button', { name: 'Anuluj', exact: true });
    this.bookPaidButton = page.getByRole('button', { name: /^Umów za \d+\.\d{2} PLN$/ });
    this.bookFreeButton = page.getByRole('button', { name: /^Umów za 0 PLN/ });
  }

  async waitUntilSearchLoaded(): Promise<void> {
    await this.searchHeader.waitFor({ timeout: 90_000 });
    await this.conditionTiles.first().waitFor({ timeout: 90_000 });
  }

  /** Types a drug name into the react-select combobox and waits for suggestions. */
  async searchForDrug(name: string): Promise<void> {
    await this.drugInput.click();
    await this.drugInput.type(name, { delay: 50 });
    await this.suggestions.first().waitFor({ timeout: 30_000 });
  }

  /** Picks the first suggestion and returns its label, e.g. "Normaclin, Clindamycinum, 10 mg/g, 1 tuba 15 g". */
  async chooseFirstSuggestion(): Promise<string> {
    const first = this.suggestions.first();
    const label = (await first.innerText()).trim();
    await first.click();
    await this.summaryTitle.waitFor({ timeout: 90_000 });
    return label;
  }

  async selectAllConsents(): Promise<void> {
    await this.selectAllLabel.click();
  }
}
