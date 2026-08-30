import { expect, test } from '@playwright/test';
import { PATIENT_NAME } from '../../src/config/env';
import { UserProfilePage } from '../../src/pages/UserProfilePage';

const EXPECTED_FIELDS = 5;
const FIELD_LABELS = ['Imię *', 'Nazwisko *', 'Kraj *', 'PESEL *', 'Domyślna strefa czasowa'];
const TOOLTIP_TEXT =
  'Nie można edytować pola. Aby zaktualizować dane skontaktuj się z Obsługą Klienta.';

test.describe('User profile', () => {
  test('does not allow the patient to change personal data', async ({ page }) => {
    const userProfilePage = new UserProfilePage(page);

    // Pre-condition: the `login` project has already authenticated this session.
    await userProfilePage.goto();

    await test.step('Open the "Dane personalne" dialog with the "Edytuj" button', async () => {
      await userProfilePage.openPersonalDataDialog();

      await expect(userProfilePage.dialog).toBeVisible();
      await expect(userProfilePage.dialogTitle).toBeVisible();
      await expect(userProfilePage.fields).toHaveCount(EXPECTED_FIELDS);
      await expect(userProfilePage.fields.locator('label')).toHaveText(FIELD_LABELS);
    });

    await test.step('Every field is disabled and cannot be edited', async () => {
      // The three text fields are disabled inputs.
      for (const input of await userProfilePage.textInputs.all()) {
        await expect(input).toBeDisabled();
        await expect(input).not.toBeEditable();
      }

      // "Kraj" and "Domyślna strefa czasowa" are MUI selects, disabled through aria.
      await expect(userProfilePage.selects).toHaveCount(2);
      for (const select of await userProfilePage.selects.all()) {
        await expect(select).toHaveAttribute('aria-disabled', 'true');
      }
    });

    await test.step('Typing into a field leaves its value unchanged', async () => {
      const originalValue = await userProfilePage.firstNameInput.inputValue();
      expect(originalValue).toBe(PATIENT_NAME.split(' ')[0]);

      await userProfilePage.firstNameInput.click({ force: true });
      await page.keyboard.type('Zmiana');

      await expect(userProfilePage.firstNameInput).toHaveValue(originalValue);
    });

    await test.step('Each field explains through a tooltip why it cannot be edited', async () => {
      for (let i = 0; i < EXPECTED_FIELDS; i++) {
        await userProfilePage.hoverFieldInfoIcon(i);
        await expect(userProfilePage.tooltip).toBeVisible();
        await expect(userProfilePage.tooltip).toHaveText(TOOLTIP_TEXT);
      }
    });

    await test.step('The dialog is closed with the "Zamknij" button', async () => {
      await page.mouse.move(0, 0);
      await userProfilePage.closeButton.click();

      await expect(userProfilePage.dialog).toHaveCount(0);
    });
  });
});
