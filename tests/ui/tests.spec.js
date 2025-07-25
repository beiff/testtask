import { test, expect } from '@playwright/test';
import { clearCart, openCart, switchPage, customLoginAPI, addToCart } from './utils';
let token = '';

// test.beforeEach('Логин', async ({ page, baseURL }) =>{
//   const login = 'test';
//   const password = 'test';

//   await page.goto('/login');
//   const loginField = page.getByPlaceholder('Логин клиента');
//   const passwordField = page.getByPlaceholder('Пароль клиента');
  
//   await loginField.fill(login);
//   await passwordField.pressSequentially(password);

//   await page.locator('//*[@id="login-form"]/div[4]/button').click();
//   await page.waitForURL(baseURL); // or use regex: /\/dashboard/
//   await expect(page).toHaveURL(baseURL);
// })

// test.afterEach('Очистка корзины после теста', async ({ page }) =>{
//   await clearCart(page);
// })

test.fail('TC-1. Переход в пустую корзину', async ({ page }) => {

  const count = await page.locator('.basket-count-items').innerText(); // смотрим сколько товаров в корзине на начало теста

  if (count != '0') {
      await clearCart(page); // чистим корзину, если там что-то есть
  }

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/);
  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');
});

test('TC-2. Переход в корзину с 1 неакционным товаром', async ({ page }) => {
  const count = await page.locator('.basket-count-items').innerText();
  if (count != '0') {
      await clearCart(page);
  }

  const productCards = await page.locator('.col-3.mb-5').all();

  let notebookName = '';
  let notebookPrice = '';

  for (const product of productCards) {
  const child = product.locator('div[class*="note-item"]');
  const classList = await child.getAttribute('class');
  if (classList && classList.includes('hasDiscount')) {
    continue;
  } else {
    notebookName = await child.locator('.product_name.h6.mb-auto').innerText();
    notebookPrice = await child.locator('.product_price.ml-1').innerText();
    await product.getByRole('button').click();
    await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )
    break;
  }
}
  
  const updatedCount = page.locator('.basket-count-items');
  await expect(updatedCount).toHaveText('1', {timeout : 5000});

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText('1');

  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');
});

test('TC-3. Переход в корзину с 1 акционным товаром', async ({ page }) => {
  
  const count = await page.locator('.basket-count-items').innerText();

  if (count != '0') {
      await clearCart(page);
  }

  const productCards = await page.locator('.col-3.mb-5').all();

  let notebookName = '';
  let notebookPrice = '';

  for (const product of productCards) {
  const child = product.locator('div[class*="note-item"]');
  const classList = await child.getAttribute('class');
  if (classList && classList.includes('hasDiscount')) {
    notebookName = await child.locator('.product_name.h6.mb-auto').innerText();
    notebookPrice = await child.locator('.product_price.ml-1').evaluate(el => el.firstChild.textContent.trim());;
    await product.getByRole('button').click();
    await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )
    break;
  } else {
    continue;
  }
}

  const updatedCount = page.locator('.basket-count-items');
  await expect(updatedCount).toHaveText('1', {timeout : 5000});

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText('1');

  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');

});

test.fail('TC-4. Переход в корзину с 9 разными товарами', async ({ page }) => {

  const count = await page.locator('.basket-count-items').innerText();

  if (count != '0') {
      await clearCart(page);
  }

  const productCards = await page.locator('.col-3.mb-5').all();

  let notebookName = '';
  let notebookPrice = '';

  for (const product of productCards) {
  const child = product.locator('div[class*="note-item"]');
  const classList = await child.getAttribute('class');
  if (classList && classList.includes('hasDiscount')) {
    notebookName = await child.locator('.product_name.h6.mb-auto').innerText();
    notebookPrice = await child.locator('.product_price.ml-1').evaluate(el => el.firstChild.textContent.trim());;
    await product.getByRole('button').click();
    await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )
    break;
  } else {
    continue;
  }
}

  for (const product of productCards) {
  const child = product.locator('div[class*="note-item"]');
    notebookName = await child.locator('.product_name.h6.mb-auto').innerText();
    notebookPrice = (await child.locator('.product_price.ml-1').innerText()).match(/^\d+ р\./)[0];
    await product.getByRole('button').click();
    await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )
    let updatedCount = await page.locator('.basket-count-items').innerText();
    if (updatedCount == '9'){
      break;
    }
  }

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText('9');

  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');

});

test.fail('TC-5. Переход в корзину с 9 акционными товарами одного наименования', async ({ page, baseURL }) => {

  const count = await page.locator('.basket-count-items').innerText();

  if (Number(count) != 0) {
      await clearCart(page);
  }

  const productCards = await page.locator('.col-3.mb-5').all();
  console.log(productCards);

  let notebookName = '';
  let notebookPrice = '';

  for (const product of productCards) {
  const child = product.locator('div[class*="note-item"]');
  const classList = await child.getAttribute('class');
  if (classList && classList.includes('hasDiscount')) {
    notebookName = await child.locator('.product_name.h6.mb-auto').innerText();
    notebookPrice = await child.locator('.product_price.ml-1').evaluate(el => el.firstChild.textContent.trim());;
    for (let i = 0; i < 9; i++) {
      await product.getByRole('button').click();
    }
    break;
  } else {
    continue;
  }
}

console.log(notebookName + ' ' + notebookPrice);

  const updatedCount = await page.locator('.basket-count-items').innerText();
  expect(Number(updatedCount)).toEqual(9);

  const cart = page.locator('#dropdownBasket');
  await cart.click();
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  //await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText('9');




  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');

  //await page.waitForTimeout(30000);

});



test.only('тесты', async ({ request, baseURL }) => {
  //await addToCart(request, 4, 1);
  await customLoginAPI(request, 'test', 'test');
});

