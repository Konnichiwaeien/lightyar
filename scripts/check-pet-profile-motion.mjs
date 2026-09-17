import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://localhost:3000';
const out = '../tmp/pet-profile-motion';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [], errors = [];
try {
 const page = await browser.newPage();
 page.on('pageerror', e => errors.push(e.message));
 for (const width of [320,390,768,1024,1440,1920,2560]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(base + '/pets/uvpj4x6wdj2urazegzoxcqtf', { waitUntil:'domcontentloaded', timeout:60000 });
  await page.locator('#pet-name:visible').waitFor();
  await page.locator('.pet-gallery__swiper.swiper-initialized').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => { const img = document.querySelector('.pet-gallery__image'); return img?.complete && img.naturalWidth > 0; });
  assert.equal(await page.locator('#pet-story').count(), 0);
  await page.locator('.pet-profile__hero').screenshot({ path:`${out}/hero-${width}.png` });
  await page.locator('.pet-support__community').waitFor();
  for (const [name, selector] of [['support','.pet-support'],['meeting','#meet-pet']]) {
   await page.locator(selector).scrollIntoViewIfNeeded();
   await page.waitForFunction(s => [...document.querySelectorAll(s+' img')].every(i => i.complete), selector);
   await page.locator(selector).screenshot({ path:`${out}/${name}-${width}.png` });
  }
  await page.evaluate(() => { const f=document.querySelector('footer'); window.scrollTo({top:scrollY+f.getBoundingClientRect().top-130,behavior:'instant'}); });
  await page.screenshot({path:`${out}/footer-${width}.png`});
  const metrics = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,body:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(document.documentElement).backgroundColor,community:document.querySelector('.pet-support__community').textContent}));
  assert.ok(metrics.scroll <= width, `overflow ${width}`);
  assert.equal(metrics.body, 'rgb(244, 241, 235)');
  assert.equal(metrics.root, metrics.body);
  if ([320,390,1440].includes(width)) {
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
   metrics.axe = await page.evaluate(async () => (await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  }
  report.push(metrics); await fs.writeFile(out+'/report.json',JSON.stringify({report,errors},null,2));
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/pets/uvpj4x6wdj2urazegzoxcqtf',{waitUntil:'domcontentloaded',timeout:60000});
 const opener=page.getByRole('button',{name:'Открыть фото целиком'});
 await opener.click();
 await page.locator('.pet-gallery__full-swiper.swiper-initialized').waitFor();
 await page.waitForTimeout(350);
 await page.locator('dialog .swiper-slide-active img').evaluate(e=>e.decode().catch(()=>{}));
 await page.screenshot({path:out+'/modal-desktop.png'});
 const dialog=page.locator('dialog');
 await dialog.getByRole('button',{name:'Следующее фото',exact:true}).click();
 await page.waitForTimeout(400);
 assert.match(await dialog.locator('.swiper-slide-active img').getAttribute('alt'),/Фото 2/);
 await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400);
 assert.match(await dialog.locator('.swiper-slide-active img').getAttribute('alt'),/Фото 3/);
 await page.keyboard.press('Escape');
 await page.waitForTimeout(40); assert.ok(await dialog.isVisible(),'closing animation remains visible');
 await dialog.waitFor({state:'hidden'});
 assert.equal(await opener.evaluate(e=>e===document.activeElement),true);
 assert.match(await page.locator('.pet-gallery__image').getAttribute('alt'),/Фото 3/);
 const stage=await page.locator('.pet-gallery__stage').boundingBox();
 await page.mouse.move(stage.x+stage.width*.8,stage.y+stage.height*.5);await page.mouse.down();await page.mouse.move(stage.x+stage.width*.2,stage.y+stage.height*.5,{steps:12});await page.mouse.up();await page.waitForTimeout(400);
 assert.match(await page.locator('.pet-gallery__image').getAttribute('alt'),/Фото 4/);
 const form=page.locator('.pet-support__form');
 await form.locator('input[name="donorName"]').fill('Проверка');
 await form.locator('.donation-anonymous-toggle').scrollIntoViewIfNeeded();
 const heights=await page.evaluate(async()=>{
  const box=document.querySelector('.pet-support__form'), toggle=box.querySelector('input[name="anonymous"]');
  const points=[box.getBoundingClientRect().height]; toggle.click();
  const begin=performance.now(); while(performance.now()-begin<400){await new Promise(requestAnimationFrame);points.push(box.getBoundingClientRect().height);}return points;
 });
 assert.ok(new Set(heights.map(Math.round)).size>4,'form must animate through intermediate heights');
 assert.equal(await form.locator('input[name="donorName"]').count(),0);
 await form.locator('.donation-anonymous-toggle').click();await page.waitForTimeout(400);
 assert.equal(await form.locator('input[name="donorName"]').inputValue(),'Проверка');
 await form.locator('[data-cadence="monthly"]').click();await page.waitForTimeout(350);
 assert.equal(await form.locator('input[value="monthly"]').isChecked(),true);
 assert.equal(await form.locator('.donation-cadence__selection').count(),1);
 assert.equal(await form.locator('.donation-provider-button').isDisabled(),true);
 await form.screenshot({path:out+'/form-monthly.png'});
 await page.setViewportSize({width:390,height:844});await opener.click();await page.waitForTimeout(350);
 await page.screenshot({path:out+'/modal-mobile.png'});await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
 await page.emulateMedia({reducedMotion:'reduce'});await opener.click();await page.waitForTimeout(50);
 assert.equal(await page.locator('.pet-gallery__viewer').evaluate(e=>getComputedStyle(e).opacity),'1');
 await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden',timeout:500});
 assert.deepEqual(errors,[]);assert.ok(report.every(r=>!r.axe?.length),'axe violations');
 await fs.writeFile(out+'/report.json',JSON.stringify({report,heights,interactions:'passed',errors},null,2));
 console.log(JSON.stringify({widths:report.map(r=>r.width),heights:[Math.max(...heights),Math.min(...heights)],interactions:'passed',errors},null,2));
} finally {await browser.close();}
