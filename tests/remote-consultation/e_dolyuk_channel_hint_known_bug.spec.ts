import { expect, test } from '@playwright/test';
import { HomePage } from '../../src/pages/HomePage';
import { RemoteConsultationPage } from '../../src/pages/RemoteConsultationPage';

const PHONE_HINT = 'Lekarz zadzwoni na twój telefon.';
const LOGIN_PROMPT = 'Wymagane zalogowanie na konto pacjenta.';

/**
 * Known bug BUG-02 — communication channel hints.
 *
 * Selecting "Czat" or "Wideo" shows "Wymagane zalogowanie na konto pacjenta."
 * ("Logging in to a patient account is required"). The booking flow is only
 * reachable while authenticated, so the message is never accurate, it replaces
 * the channel explanation that "Telefon" provides, and the same string is
 * reused for two different channels.
 *
 * The test is marked `test.fail()`, so Playwright expects it to fail and the
 * run stays green while the defect is open. Once the hints are fixed the test
 * will start passing, Playwright will report "expected to fail but passed", and
 * the `test.fail()` annotation should be removed.
 */
test.describe('Remote consultation — communication channel hints', () => {
  test('@known-bug every channel explains itself and none asks a logged-in patient to log in', async ({
    page,
  }) => {
    test.fail();
    test.setTimeout(180_000);

    const homePage = new HomePage(page);
    const remoteConsultationPage = new RemoteConsultationPage(page);

    // 1. Pre-condition: the `login` project has already authenticated this session.
    await homePage.goto();
    await homePage.waitUntilLoaded();

    // 2. Click "Umów się" and choose "Wizyta zdalna".
    await remoteConsultationPage.openFromMenu();
    await expect(page).toHaveURL(new RegExp(`${RemoteConsultationPage.PATH}$`));
    await expect(remoteConsultationPage.channelHeader).toBeVisible();

    // 3. Telefon is preselected and explains what happens. This part is correct today.
    const phoneHint = await remoteConsultationPage.hintText();
    expect(phoneHint).toBe(PHONE_HINT);

    // 4. Czat should explain the chat consultation, not ask the patient to log in.
    await remoteConsultationPage.selectChannel('Czat');
    const chatHint = await remoteConsultationPage.hintText();
    expect.soft(chatHint, 'Czat hint must not be a login prompt').not.toBe(LOGIN_PROMPT);

    // 5. Wideo should explain the video consultation, and differ from the chat hint.
    await remoteConsultationPage.selectChannel('Wideo');
    const videoHint = await remoteConsultationPage.hintText();
    expect.soft(videoHint, 'Wideo hint must not be a login prompt').not.toBe(LOGIN_PROMPT);
    expect
      .soft(videoHint, 'Wideo and Czat must not share one hint')
      .not.toBe(chatHint);

    // Each channel should describe itself, the way Telefon does.
    for (const [channel, hint] of [
      ['Czat', chatHint],
      ['Wideo', videoHint],
    ] as const) {
      expect.soft(hint, `${channel} must have its own channel-specific hint`).not.toBe(PHONE_HINT);
      expect.soft(hint.length, `${channel} must show a hint`).toBeGreaterThan(0);
    }
  });
});
