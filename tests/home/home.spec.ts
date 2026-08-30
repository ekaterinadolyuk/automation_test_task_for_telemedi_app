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
});
