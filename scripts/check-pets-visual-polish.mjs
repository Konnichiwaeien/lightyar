import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='../tmp/pets-visual-polish';
const base=process.argv[2]||'http://localhost:3000';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try {
 for(const [width,height] of [[320,740],[390,844],[600,960],[768,1024],[1024,768],[1280,800],[1366,768],[1440,900],[1920,1080],[2560,1440]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/pets',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.pets-cover__scene img').evaluate(e=>e.decode());
  await page.waitForTimeout(1000);
  const source=await page.locator('.pets-cover__scene img').getAttribute('src');
  const currentSource=await page.locator('.pets-cover__scene img').evaluate(e=>e.currentSrc);
  await page.screenshot({path:`${out}/hero-${width}.png`});
  await page.locator('.pets-cover').screenshot({path:`${out}/hero-full-${width}.png`});
  const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,visibleAnimals:[...document.querySelectorAll('.pets-cover__animal')].filter(e=>getComputedStyle(e).display!=='none').length,overflow:[...document.querySelectorAll('main *')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&(b.left< -2||b.right>innerWidth+2);}).map(e=>e.className)}));
  assert.ok(geometry.scrollWidth<=width);
  assert.equal(await page.getByText('Ждут встречи',{exact:true}).count(),0);
  await page.locator('.pets-controls').evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-28,behavior:'instant'}));
  await page.waitForTimeout(300);
  await page.screenshot({path:`${out}/catalog-${width}.png`});
  const card=page.locator('.pet-entry').first();
  await card.scrollIntoViewIfNeeded();
  await card.locator('img').evaluate(e=>e.decode());
  await page.waitForTimeout(350);
  await card.screenshot({path:`${out}/card-${width}.png`});
  const cta=card.locator('.pet-entry__cta');
  await cta.scrollIntoViewIfNeeded();
  const before=await cta.evaluate(e=>({width:getComputedStyle(e).width,bg:getComputedStyle(e).backgroundColor,transition:getComputedStyle(e).transitionDuration}));
  if(width>=1024){await cta.hover();await page.waitForTimeout(250);await card.locator('.pet-entry__body').screenshot({path:`${out}/hover-${width}.png`});}
  await page.mouse.move(0,0);
  await page.keyboard.press('Tab');await cta.focus();await page.waitForTimeout(250);
  await card.locator('.pet-entry__body').screenshot({path:`${out}/focus-${width}.png`});
  const focus=await cta.evaluate(e=>({width:getComputedStyle(e).width,outline:getComputedStyle(e).outlineStyle}));
  assert.equal(focus.width,before.width);assert.notEqual(focus.outline,'none');
  await cta.hover();await page.mouse.down();await page.waitForTimeout(160);
  const pressed=await cta.evaluate(e=>getComputedStyle(e).transform);
  await card.locator('.pet-entry__body').screenshot({path:`${out}/pressed-${width}.png`});
  await page.mouse.move(0,0);await page.mouse.up();
  assert.notEqual(pressed,'none');
  const toggle=card.locator('.pet-entry__details-toggle');
  await toggle.focus();await page.keyboard.press('Enter');await page.waitForTimeout(320);
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  await card.locator('.pet-entry__body').screenshot({path:`${out}/expanded-${width}.png`});
  if([320,1440].includes(width)){
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
   geometry.axe=await page.evaluate(async()=>{const r=await window.axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
  }
  assert.equal(errors.length,0);
  assert.equal(geometry.axe?.length||0,0);
  assert.match(currentSource,width<600?/hero-home-mobile/:width<1200?/hero-home-tablet/:/hero-home-desktop/);
  report.push({width,height,source,currentSource,geometry,cta:{before,focus,pressed},errors});
  await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
  await page.close();
 }
}finally{await browser.close();}
console.log(JSON.stringify(report,null,2));
