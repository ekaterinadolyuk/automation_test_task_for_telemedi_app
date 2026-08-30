import { Locator, Page } from '@playwright/test';

/**
 * Patient profile page (/pl/user-profile) and the "Dane personalne" dialog.
 *
 * Personal data is read-only: the dialog opens, but every field is disabled and
 * explains through a tooltip that changes go through customer service.
 */
export class UserProfilePage {
  static readonly PATH = '/pl/user-profile';

  readonly page: Page;
  readonly personalDataEditButton: Locator;
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly fields: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly peselInput: Locator;
  readonly textInputs: Locator;
  readonly selects: Locator;
  readonly tooltip: Locator;
  readonly closeButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // "Dane personalne" is the first of the three "Edytuj" buttons on the page.
    this.personalDataEditButton = page.getByRole('button', { name: 'Edytuj' }).first();
    this.dialog = page.getByRole('dialog');
    this.dialogTitle = this.dialog.getByRole('heading', { name: 'Dane personalne' });
    this.fields = this.dialog.locator('.MuiFormControl-root');
    this.firstNameInput = this.dialog.locator('#firstName');
    this.lastNameInput = this.dialog.locator('#lastName');
    this.peselInput = this.dialog.locator('#pesel');
    this.textInputs = this.dialog.locator('#firstName, #lastName, #pesel');
    // "Kraj" and "Domyślna strefa czasowa" are MUI selects, not native inputs.
    this.selects = this.dialog.locator('.MuiSelect-select');
    this.tooltip = page.locator('[role="tooltip"]');
    this.closeButton = page.getByRole('button', { name: 'Zamknij' });
    this.saveButton = page.getByRole('button', { name: 'Zapisz' });
  }

  async goto(): Promise<void> {
    await this.page.goto(UserProfilePage.PATH);
    await this.personalDataEditButton.waitFor({ timeout: 60_000 });
  }

  async openPersonalDataDialog(): Promise<void> {
    await this.personalDataEditButton.click();
    await this.closeButton.waitFor({ timeout: 30_000 });
  }

  /** Hovers the info icon of one field. The mouse is parked first so the previous tooltip closes. */
  async hoverFieldInfoIcon(index: number): Promise<void> {
    await this.page.mouse.move(0, 0);
    await this.tooltip.waitFor({ state: 'hidden' }).catch(() => undefined);
    await this.fields.nth(index).locator('.MuiInputAdornment-root').hover();
  }
}
