import { expect, test } from '@playwright/test';
import { BASE_URL } from '../../src/config/env';
import { BookingMenu } from '../../src/pages/BookingMenu';
import { ConsultationsPage } from '../../src/pages/ConsultationsPage';
import { HomePage } from '../../src/pages/HomePage';
import { PrescriptionPage } from '../../src/pages/PrescriptionPage';

const DRUG_NAME = 'Normaclin';
const EXPECTED_SUGGESTIONS = 6;
const EXPECTED_CONDITION_TILES = 17;
const CONSULTATION_PRICE = '59.00';
const PAYMENT_OPERATOR_URL = 'https://secure.payu.com/pay/';

const MENU_OPTION_NAME = 'Recepta Konsultacja z ankietą medyczną';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const DOCTOR_NAME = 'lek. lek. Michał Stach';
const DOCTOR_DESCRIPTION = 'Lekarz ogólny - konsultacja z receptą';
const DOCTOR_ASSIGN_INFO =
  '*Ten lekarz zostanie przypisany do Twojej wizyty dopiero gdy dokonasz rezerwacji. Nie zwlekaj więc.';

const PATIENT_DETAILS = ['Pacjent Testowy', 'PESEL: ********132', 'Data urodzenia: 2000-01-01'];

const CONSENTS = [
  'Jestem świadomy/a, że po wypełnieniu formularza oraz umówieniu konsultacji lekarskiej lekarz może się ze mną kontaktować telefonicznie lub na czacie.*',
  'Rozumiem, że umówienie e-konsultacji nie gwarantuje otrzymania wnioskowanej recepty. Lekarz stawia diagnozę na podstawie deklarowanych objawów oraz decyduje o ilości i dawkowaniu.*',
  'Rozumiem, że jestem zobowiązny/a do wejścia w konsultację czat z lekarzem lub odebranie połączenia. Jestem świadomy/a, że jeśli tego nie zrobię nie ma podstaw do reklamacji w przypadku niewystawienia recepty.*',
];

test.describe('Prescription consultation', () => {
  // The flow books a real consultation, so it is cancelled again in the post-condition.
  test('is booked from the menu up to the handover to the payment operator', async ({ page }) => {
    test.setTimeout(240_000);

    const homePage = new HomePage(page);
    const bookingMenu = new BookingMenu(page);
    const prescriptionPage = new PrescriptionPage(page);
    const consultationsPage = new ConsultationsPage(page);

    // Pre-condition: the `login` project has already authenticated this session.
    await homePage.goto();
    await homePage.waitUntilLoaded();

    await test.step('1. Click the "Umów się" button', async () => {
      await bookingMenu.open();

      // a) the context menu with appointment options appears
      await expect(bookingMenu.options).toHaveCount(6);

      // b) every option is highlighted on hover
      const optionCount = await bookingMenu.options.count();
      for (let i = 0; i < optionCount; i++) {
        const option = bookingMenu.options.nth(i);
        await expect(option).toHaveCSS('background-color', TRANSPARENT);
        await option.hover();
        await expect(option).not.toHaveCSS('background-color', TRANSPARENT);
      }

      // c) the menu contains the prescription option
      const optionText = await bookingMenu.prescriptionOption.innerText();
      expect(optionText.replace(/\s+/g, ' ').trim()).toBe(MENU_OPTION_NAME);
    });

    await test.step(`2. Click the "${MENU_OPTION_NAME}" option`, async () => {
      await bookingMenu.prescriptionOption.click();
      await prescriptionPage.waitUntilSearchLoaded();

      // a) the prescription consultation page is opened
      await expect(page).toHaveURL(`${BASE_URL}${PrescriptionPage.PATH}`);

      // b) both sections are visible
      await expect(prescriptionPage.searchHeader).toHaveText('Wyszukaj lek');
      await expect(prescriptionPage.conditionsHeader).toHaveText('Wybierz przypadłość');

      // c) the drug field is available. The app renders "Wpisz nazwę leku" as a label above a
      //    react-select combobox rather than as a native placeholder attribute.
      await expect(prescriptionPage.drugInputLabel).toHaveText('Wpisz nazwę leku');
      await expect(prescriptionPage.drugInput).toBeAttached();

      // d) 17 clickable condition boxes are offered
      await expect(prescriptionPage.conditionTiles).toHaveCount(EXPECTED_CONDITION_TILES);
    });

    await test.step(`3. Enter "${DRUG_NAME}" into the drug field`, async () => {
      await prescriptionPage.searchForDrug(DRUG_NAME);

      // a) six suggestions are returned
      await expect(prescriptionPage.suggestions).toHaveCount(EXPECTED_SUGGESTIONS);

      // b) every suggestion is for the searched drug
      for (const suggestion of await prescriptionPage.suggestions.all()) {
        await expect(suggestion).toContainText(DRUG_NAME);
      }
    });

    await test.step('4. Choose the first suggestion', async () => {
      const chosenDrug = await prescriptionPage.chooseFirstSuggestion();
      const [name, substance, strength, packaging] = chosenDrug.split(',').map((part) => part.trim());

      // a) the summary page title is visible
      await expect(prescriptionPage.summaryTitle).toBeVisible();

      // b) the chosen drug is shown with the details from the previous step
      for (const detail of [name, substance, strength, packaging]) {
        await expect(page.getByText(detail, { exact: false }).first()).toBeVisible();
      }

      // c) and d) quantity and packaging
      await expect(prescriptionPage.quantity).toHaveText('1 szt.');
      await expect(prescriptionPage.packaging).toHaveText(`opakowanie: ${packaging}`);

      // e) and f) doctor details
      await expect(prescriptionPage.doctorName).toHaveText(DOCTOR_NAME);
      await expect(prescriptionPage.doctorDescription).toHaveText(DOCTOR_DESCRIPTION);
      await expect(prescriptionPage.doctorAssignInfo).toHaveText(DOCTOR_ASSIGN_INFO);

      // g) the rating is rendered as five stars
      await expect(prescriptionPage.doctorStars).toHaveCount(5);

      // h) and i) the patient section
      await expect(prescriptionPage.patientDataTitle).toBeVisible();
      for (const detail of PATIENT_DETAILS) {
        await expect(prescriptionPage.patientData).toContainText(detail);
      }

      // j) the lock icon and the data-protection note
      await expect(prescriptionPage.lockIcon).toBeVisible();
      await expect(prescriptionPage.dataProtectionText).toHaveText('Bezpiecznie przechowujemy Twoje dane.');

      // k) and l) the amount due, with the value in bold and in PLN
      await expect(prescriptionPage.priceRow).toContainText('Do zapłaty (konsultacja receptowa):');
      await expect(prescriptionPage.priceValue).toHaveText(`${CONSULTATION_PRICE} PLN`);
      await expect(prescriptionPage.priceValue).toHaveCSS('font-weight', '700');

      // m) the "select all" row is bold and has a checkbox
      await expect(prescriptionPage.selectAllLabel).toHaveText('Zaznacz wszystkie');
      await expect(prescriptionPage.selectAllLabel).toHaveCSS('font-weight', '700');
      await expect(prescriptionPage.selectAllCheckbox).toBeAttached();

      // n) it groups the three consents
      await expect(prescriptionPage.consentCheckboxes).toHaveCount(CONSENTS.length);
      await expect(prescriptionPage.consentLabels).toHaveText(CONSENTS);

      // o) all three action buttons are present
      await expect(prescriptionPage.cancelButton).toBeVisible();
      await expect(prescriptionPage.bookPaidButton).toHaveText(`Umów za ${CONSULTATION_PRICE} PLN`);
      await expect(prescriptionPage.bookFreeButton).toBeVisible();
    });

    await test.step('5. Tick the "Zaznacz wszystkie" checkbox', async () => {
      await prescriptionPage.selectAllConsents();

      // a) every checkbox is ticked
      await expect(prescriptionPage.selectAllCheckbox).toBeChecked();
      for (const consent of await prescriptionPage.consentCheckboxes.all()) {
        await expect(consent).toBeChecked();
      }
    });

    await test.step(`6. Click "Umów za ${CONSULTATION_PRICE} PLN"`, async () => {
      await prescriptionPage.bookPaidButton.click();

      // a) the application hands the payment over to the external operator
      await page.waitForURL(`${PAYMENT_OPERATOR_URL}**`, { timeout: 90_000 });
      expect(page.url()).toContain(PAYMENT_OPERATOR_URL);
    });

    // Post-condition: the reservation created above is cancelled again.
    await test.step('Post-condition: go back and cancel the reservation', async () => {
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(`${PrescriptionPage.PATH}$`));

      await consultationsPage.consultationsLink.click();
      await expect(consultationsPage.upcomingSection).toBeVisible();

      await consultationsPage.cancelLatestReservation();
      await expect(consultationsPage.upcomingSection).toBeHidden();
    });
  });
});
