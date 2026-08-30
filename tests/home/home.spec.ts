import { expect, test } from '@playwright/test';
import { HomePage } from '../../src/pages/HomePage';

test('homepage opens for a logged-in patient', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.waitUntilLoaded();

  await expect(page).toHaveURL(/\/pl(\?.*)?$/);
  await expect(homePage.patientName).toBeVisible();
  await expect(homePage.bookVisitButton).toBeVisible();
  await expect(homePage.consultationsLink).toBeVisible();
  await expect(homePage.documentationLink).toBeVisible();

  // TEMPORARY: deliberately wrong assertion, used to verify that the CI
  // workflow reports a failing run. Reverted straight after.
  await expect(homePage.bookVisitButton).toHaveText('Ten tekst nie istnieje');
});
