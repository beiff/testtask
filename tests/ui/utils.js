import { Locator, Page } from '@playwright/test';
import { chromium, expect } from '@playwright/test';

export async function customLoginAPI(request, username, password) {
  const formToken = 'umZuw8SmKFLei8aTJSgdyhOpfwDzuFDJ8VqCV6OCWKrdCADw89VSO67ys_YVRTD8cfMxWLT5AY6WFeMSm7Uy-w==';
  const cookie = '_csrf=1c0ffff45ebacbd99f91419885580025548231b91dbe749104cb267b48c80b5ba%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22gnn37szipyue0m-6bZNXGAQGgOaE87jQ%22%3B%7D';
  const response = await request.post('/login', {
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      '_csrf': formToken,
      'LoginForm[username]': username,
      'LoginForm[password]': password,
      'LoginForm[rememberMe]': 1,
    } 
  })

  const sessionId = response.headers()['set-cookie'];

  expect(response).toBeOK();
  console.log(response);
  return {
    'formToken' : formToken,
    'cookieToken' : cookie,
    'sessionId': sessionId.split(';')[0].trim()
  }
}

export async function addProductsToCart(count, products, page){
    const productCards = page.locator('.note-list.row');
    const initialCount = await page.locator('.basket-count-items').innerText();

    for (let i = 0; i < count; i++) {
      if (i >= products.length - 1) {
        break;
      }
      const product = products[i];
      console.log(product.name);
      const productLabel = productCards.locator('.product_name.h6.mb-auto').filter({ hasText: product.name }).first();

      await productLabel.locator('xpath=/..').getByRole('button').click();
      await page.waitForResponse(response => 
      response.url().includes('/basket/get') && response.status() === 200
      )
      const updatedCount = page.locator('.basket-count-items');
      await expect(updatedCount).toHaveText(String(i + 1 + Number(initialCount)), {timeout : 5000});
    }

  }


export async function clearCart(page) {
    const cart = page.locator('#dropdownBasket');
    await cart.click();
    
    await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});
    await page.locator('a:has-text("Очистить корзину")').click();
    await page.waitForResponse(response => 
    response.url().includes('/basket/get') && response.status() === 200
  )
    await expect(page.locator('.basket-count-items')).toHaveText('0', {timeout : 5000});
}

export async function openCart(page) {
    const cart = page.locator('#dropdownBasket');
    await cart.click();
    await expect(page.locator('//*[@id="basketContainer"]/div[2]')).toHaveClass(/(^|\s)show(\s|$)/, {timeout : 5000});
}

export async function switchPage(page, targetPage) {
    const sheets = await page.locator('.page-link').all();
    for(const sheet of sheets) {
        // console.log(await sheet.innerText());
        if (await sheet.innerText() == String(targetPage))
        {
            await sheet.click();
            await expect(sheet.locator('xpath=..')).toHaveClass('page-item active');
            break;
        }
  }
}

export async function getTotalProductCount(page) {
    const pageCount = (await page.locator('.page-link').all()).length;
    //console.log(pageCount);
    let totalProductCount = (pageCount - 1) * 8;
  
    await switchPage(page, pageCount);
    //await page.waitForTimeout(5000);
    const productCards = await page.locator('.note-list.row >> .col-3.mb-5').all();
    //console.log(totalProductCount);
    const firstCard = page.locator('.note-list.row >> .col-3.mb-5').first();
    //console.log(await firstCard.innerText());
    totalProductCount += productCards.length;
    //console.log(totalProductCount);
    return totalProductCount;
}

export async function checkDiscountCheckBox(page) {
    const discountCheckBox = await page.locator('#gridCheck');
    await discountCheckBox.check();
    await expect(discountCheckBox).toBeChecked();
}

export async function sortOutProducts(initialLoadData) {
    let discountedProducts = [];
    let normalProducts = [];

    for (const product of initialLoadData.products) {
      
      if (product.discount > 0){
        discountedProducts.push(product);
      } else {
        normalProducts.push(product);
      }
    }
    return [discountedProducts, normalProducts];
}

