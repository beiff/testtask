import { test, expect } from '@playwright/test';
import { clearCart, openCart, switchPage, addProductsToCart, sortOutProducts, addIdenticalProductsToCart } from './utils';
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

  //await page.locator('//*[@id="login-form"]/div[4]/button').click();
  await page.getByRole('button', { name: 'Вход' }).click();
  await page.waitForURL(baseURL); 

  const response = await responsePromise;

  currentPageProductData = await response.json()

  //console.log(currentPageProductData);

  currentPageDiscountedProducts = (await sortOutProducts(currentPageProductData))[0];
  currentPageNormalProducts = (await sortOutProducts(currentPageProductData))[1];

  await expect(page).toHaveURL(baseURL);
})

// test.afterEach('Очистка корзины после теста', async ({ page }) =>{
//   await clearCart(page);
// })

test('TC-1. Переход в пустую корзину', async ({ page }) => {

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

test('TC-2. Переход в корзину с 1 неакционным товаром', async ({ page, browser }) => {

  const count = await page.locator('.basket-count-items').innerText();
  if (count != '0') {
      await clearCart(page);
  }

  const notebookName = currentPageNormalProducts[0].name;
  const notebookPrice = currentPageNormalProducts[0].price;

  await addProductsToCart(1, currentPageNormalProducts, page)

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

  const notebookName = currentPageDiscountedProducts[0].name;
  const notebookPrice = currentPageDiscountedProducts[0].price - currentPageDiscountedProducts[0].discount;

  await addProductsToCart(1, currentPageDiscountedProducts, page)

//-------------------

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice + ' р.');
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText('1');

  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');
});

test.only('TC-4. Переход в корзину с 9 разными товарами', async ({ page }) => {

  const count = await page.locator('.basket-count-items').innerText();

  let totalPrice = 0;

  if (count != '0') {
      await clearCart(page);
  }
  await addProductsToCart(1, currentPageDiscountedProducts, page);

//--------------------------------------------------------------------

  totalPrice += await addProductsToCart(4, currentPageNormalProducts, page);
  console.log('\nTotal = ' + totalPrice);
    
  totalPrice += await addProductsToCart(3, currentPageDiscountedProducts, page);
  console.log('\nTotal = ' + totalPrice);

  const responsePromise = page.waitForResponse(
    response => 
      response.url().includes('/product/get') &&
      response.status() === 200
  );
  page = await switchPage(page, 2);
  
  const response = await responsePromise;

  currentPageProductData = await response.json()

  currentPageDiscountedProducts = (await sortOutProducts(currentPageProductData))[0];
  currentPageNormalProducts = (await sortOutProducts(currentPageProductData))[1];

  totalPrice += await addProductsToCart(3, currentPageNormalProducts, page);
  console.log('\nTotal = ' + totalPrice);

  await openCart(page);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});

  //await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  //await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice);
  //await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText('9');

  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');
});

test('TC-5. Переход в корзину с 9 акционными товарами одного наименования', async ({ page, baseURL }) => {
  const targetCount = 6;
  const targetProduct = currentPageDiscountedProducts[0];

  const count = await page.locator('.basket-count-items').innerText();

  if (Number(count) != 0) {
      await clearCart(page);
  }

  const notebookName = targetProduct.name;
  const notebookPrice = targetCount * (Number(targetProduct.price) - Number(targetProduct.discount));

  await addIdenticalProductsToCart(targetCount, targetProduct, page);

  const cart = page.locator('#dropdownBasket');
  await cart.click();
  await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 10000});

  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[1]')).toHaveText(notebookName);
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[2]')).toHaveText(' - ' + notebookPrice + ' р.');
  await expect(page.locator('//*[@id="basketContainer"]/div[2]/ul/li[1]/span[3]')).toHaveText(String(targetCount));
  await expect(page.locator('.basket_price')).toHaveText(String(notebookPrice));

  await page.locator('a:has-text("Перейти в корзину")').click();
  await page.waitForURL('/basket');
  await expect(page).toHaveURL('/basket');
});



test.skip('тесты', async ({ page, request, baseURL }) => { //тест для тестирования тестов

   // await addIdenticalProductsToCart(6, currentPageNormalProducts[1], page);
    
  
  //const firstProduct = firstProductLabel.locator('xpath=/..');
  //await firstProduct.getByRole('button').click();
});

