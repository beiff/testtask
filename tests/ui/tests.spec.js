import { test, expect } from '@playwright/test';
import { clearCart, openCart, switchPage, customLoginAPI, sortOutProducts } from './utils';
let currentPageProductData = {};
let currentPageDiscountedProducts = [];
let currentPageNormalProducts = [];

test.beforeEach('Логин', async ({ page, baseURL }) =>{
  const login = 'test';
  const password = 'test';

  await page.goto('/login');
  const loginField = page.getByPlaceholder('Логин клиента');
  const passwordField = page.getByPlaceholder('Пароль клиента');
  
  await loginField.fill(login);
  await passwordField.pressSequentially(password);


  const responsePromise = page.waitForResponse(
    response => 
      response.url().includes('/product/get') &&
      response.status() === 200
  );

  await page.locator('//*[@id="login-form"]/div[4]/button').click();
  await page.waitForURL(baseURL); 

  const response = await responsePromise;

  currentPageProductData = await response.json()

  console.log(currentPageProductData);

  currentPageDiscountedProducts = (await sortOutProducts(currentPageProductData))[0];
  currentPageNormalProducts = (await sortOutProducts(currentPageProductData))[1];

  await expect(page).toHaveURL(baseURL);
})

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

  const productCards = page.locator('.note-list.row');

  const notebookName = currentPageNormalProducts[0].name;
  const notebookPrice = currentPageNormalProducts[0].price;


  const firstProductLabel = await productCards.locator('.product_name.h6.mb-auto').filter({ hasText: notebookName }).first();
  
  console.log(await firstProductLabel.allTextContents());
  await firstProductLabel.locator('xpath=/..').getByRole('button').click();
  await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )  
  
  const updatedCount = page.locator('.basket-count-items');
  await expect(updatedCount).toHaveText('1', {timeout : 5000});

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice + ' р.');
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

  const productCards = page.locator('.note-list.row');

  const notebookName = currentPageDiscountedProducts[0].name;
  const notebookPrice = currentPageDiscountedProducts[0].price - currentPageDiscountedProducts[0].discount;

  const firstProductLabel = productCards.locator('.product_name.h6.mb-auto').filter({ hasText: notebookName }).first();
  
  await firstProductLabel.locator('xpath=/..').getByRole('button').click();
  await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )  

  const updatedCount = page.locator('.basket-count-items');
  await expect(updatedCount).toHaveText('1', {timeout : 5000});

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice + ' р.');
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

});



test('тесты', async ({ page, request, baseURL }) => { //тест для тестирования тестов
  

  
  //const firstProduct = firstProductLabel.locator('xpath=/..');
  //await firstProduct.getByRole('button').click();
});

