import { test, expect, type Page } from '@playwright/test';

const login = async (page: Page, username: string, password: string) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
};

test.describe('Sauce Demo UI Automation', () => {
  test.describe('Login Flow', () => {
    test('TC_1 Happy Path: standard_user logs in and sees inventory page', async ({ page }) => {
      await login(page, 'standard_user', 'secret_sauce');
      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(page.locator('.inventory_list')).toBeVisible();
    });

    test('TC_2 Negative Check: locked_out_user receives locked out error', async ({ page }) => {
      await login(page, 'locked_out_user', 'secret_sauce');
      await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
    });
  });

  test.describe('Product Search & Selection Flow', () => {
    test('TC_3 Happy Path: add Sauce Labs Backpack to cart and badge increments to 1', async ({ page }) => {
      await login(page, 'standard_user', 'secret_sauce');
      const backpackItem = page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' });
      await backpackItem.getByRole('button', { name: 'Add to cart' }).click();
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    test('TC_4 Negative/Edge Check: sort Low to High shows Sauce Labs Onesie first', async ({ page }) => {
      await login(page, 'standard_user', 'secret_sauce');
      await page.getByRole('combobox').selectOption('lohi');
      const firstItemName = page.locator('.inventory_item_name').first();
      await expect(firstItemName).toHaveText('Sauce Labs Onesie');
      await expect(firstItemName).not.toHaveText('Sauce Labs Fleece Jacket');
    });
  });

  test.describe('Checkout Flow', () => {
    test('TC_5 Happy Path: complete checkout and see thank you message', async ({ page }) => {
      await login(page, 'standard_user', 'secret_sauce');
      await page.locator('.inventory_item', { hasText: 'Sauce Labs Backpack' }).getByRole('button', { name: 'Add to cart' }).click();
      await page.locator('.shopping_cart_link').click();
      await page.getByRole('button', { name: 'Checkout' }).click();
      await page.getByPlaceholder('First Name').fill('Test');
      await page.getByPlaceholder('Last Name').fill('User');
      await page.getByPlaceholder('Zip/Postal Code').fill('12345');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    });

    test('TC_6 Negative Check: missing first name shows required field error', async ({ page }) => {
      await login(page, 'standard_user', 'secret_sauce');
      await page.locator('.shopping_cart_link').click();
      await page.getByRole('button', { name: 'Checkout' }).click();
      await page.getByPlaceholder('Last Name').fill('User');
      await page.getByPlaceholder('Zip/Postal Code').fill('12345');
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Error: First Name is required')).toBeVisible();
    });
  });
});
