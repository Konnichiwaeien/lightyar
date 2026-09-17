import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome',headless:true});
const out = '../tmp/pets-restoration';
await fs.mkdir(out,{recursive:true});
const report = [];
const base = process.argv[2] || 'http://localhost:3000';
try {
  for (const width of [320,390,768,1024,1440,1920]) {
    const page = await browser.newPage({viewport:{width,height:1000}});
    await page.goto(`${base}/pets`,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.pets-cover__animal').last().evaluate(async e=>{await e.decode();});
    await page.screenshot({path:`${out}/hero-${width}.png`});
    const hero = await page.evaluate(()=>({animals:document.querySelectorAll('.pets-cover__animal').length,overflow:document.documentElement.scrollWidth>innerWidth,clippedAnimals:[...document.querySelectorAll('.pets-cover__animal')].filter(e=>{const b=e.getBoundingClientRect();return b.left<0||b.right>document.documentElement.clientWidth;}).map(e=>e.className)}));
    assert.equal(hero.animals,5);
    assert.equal(hero.overflow,false);
    assert.deepEqual(hero.clippedAnimals,[]);
    await page.locator('#pets-catalog').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY+36,behavior:'instant'}));
    await page.screenshot({path:`${out}/controls-${width}.png`});
    const details = page.locator('.pet-entry__details').first();
    await details.locator('.pet-entry__details-toggle').focus();
    await page.keyboard.press('Enter');
    assert.equal(await details.locator('.pet-entry__details-toggle').getAttribute('aria-expanded'),'true');
    assert.equal(await details.locator('.pet-trait').count(),3);
    await page.locator('.pet-entry__body').first().scrollIntoViewIfNeeded();
    await page.screenshot({path:`${out}/characteristics-${width}.png`});
    await page.keyboard.press('Enter');
    const gallery = page.locator('.pet-entry__photos').first();
    const before = await gallery.locator('span[aria-live]').textContent();
    await gallery.getByRole('button',{name:/Следующее/}).click();
    assert.notEqual(await gallery.locator('span[aria-live]').textContent(),before);
    const footer = await page.evaluate(()=>({page:getComputedStyle(document.querySelector('.pets-page')).backgroundColor,body:getComputedStyle(document.body).backgroundColor,html:getComputedStyle(document.documentElement).backgroundColor,radius:getComputedStyle(document.querySelector('#footer')).borderTopLeftRadius}));
    assert.equal(footer.page,footer.body);assert.equal(footer.page,footer.html);assert.notEqual(footer.radius,'0px');
    await page.locator('#footer').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-160,behavior:'instant'}));
    await page.screenshot({path:`${out}/footer-${width}.png`});
    report.push({width,hero,footer,keyboardDetails:true,gallery:true});
    await page.close();
  }
} finally {await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report,null,2));
