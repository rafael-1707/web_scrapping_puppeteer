const puppeteer = require("puppeteer");
const fs = require("fs");

const url = "https://www.mercadolivre.com.br/";
const searchFor = "notebook";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector("#cb1-edit")
  await page.type("#cb1-edit", searchFor);

  await Promise.all([
    page.waitForNavigation(),
    page.click(".nav-search-btn")
  ]);

  const links = await page.$$eval(".ui-search-result__image > a", item => item.map(link => link.href))
  for(const link of links) {
    await page.goto(link);
    await page.waitForSelector(".ui-pdp-title")
    const title = await page.$eval(".ui-pdp-title", title => title.innerText)
    const price = await page.$eval(".andes-money-amount__fraction", price => price.innerText)
    const description = await page.$eval(".ui-pdp-description__content", description => description.innerText)
    
    const seller = await page.evaluate(() => {
      const seller = document.querySelector(".ui-pdp-seller__link-trigger")
      return seller ? seller.innerText : null
    })

    const product = {title, price, description, seller, link}
   
    fs.appendFile("products.json", JSON.stringify(product, null, 2), err => {
      if (err) throw new Error("Something went wrong");
    });
  }
  
  await browser.close();
})();