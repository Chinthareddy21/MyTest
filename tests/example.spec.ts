import { test, expect } from '@playwright/test';
import { WebActions } from '../lib/webActions';

let webActions: WebActions;

test.describe('Example Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    webActions = new WebActions(page);
    await webActions.navigateToUrl('https://playwright.dev/');
  });
  test('has title @sanity', async ({ page }) => {

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link @regression', async ({ page }) => {

    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });
});
