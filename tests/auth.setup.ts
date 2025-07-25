// import { test as setup, expect } from '@playwright/test';
// import path from 'path';

// const authFile = path.join(__dirname, '../playwright/.auth/user.json');

// setup('authenticate', async ({ page }) => {
//   // Perform authentication steps. Replace these actions with your own.
//   const login = 'test';
//   const password = 'test';

//   await page.goto('/login');
//   const loginField = page.getByPlaceholder('Логин клиента');
//   const passwordField = page.getByPlaceholder('Пароль клиента');
  
//   await loginField.fill(login);
//   await passwordField.pressSequentially(password);
//   await page.locator('//*[@id="login-form"]/div[4]/button').click();
//   // Wait until the page receives the cookies.
//   //
//   // Sometimes login flow sets cookies in the process of several redirects.
//   // Wait for the final URL to ensure that the cookies are actually set.
//   await page.waitForURL('https://enotes.pointschool.ru/');
//   // Alternatively, you can wait until the page reaches a state where all cookies are set.
//   // End of authentication steps.

//   await page.context().storageState({ path: authFile });
// });