import fs from 'fs';
import path from 'path';
import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { HomePage } from '../../src/pages/HomePage';
import { STORAGE_STATE, USER_EMAIL, USER_PASSWORD } from '../../src/config/env';

/**
 * The `login` project. Every other project declares it as a dependency, so this
 * runs once per test run and hands the authenticated session to the rest.
 */
setup('log in to the patient panel and store the session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.acceptCookiesIfPresent();
  await loginPage.login(USER_EMAIL, USER_PASSWORD);

  // The dashboard rendering is the signal that authentication succeeded.
  const homePage = new HomePage(page);
  await homePage.waitUntilLoaded();
  await expect(homePage.patientName).toBeVisible();

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
