import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://localhost:3000';
const out='../tmp/pets-visual-polish';
const results=[];
try{
 for(const [width,height] of [[320,740],[390,844],[1280,800],[1366,768]]){
  const p=await browser.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600});
  await p.goto(base+'/pets',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1000);
  await p.screenshot({path:`${out}/final-hero-${width}.png`});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const card=p.locator('.pet-entry').first();await card.scrollIntoViewIfNeeded();
  const btn=card.locator('.pet-entry__details-toggle');
  if(width<600)await btn.tap();else await btn.click();
  await p.waitForTimeout(300);assert.equal(await btn.getAttribute('aria-expanded'),'true');
  await card.locator('.pet-entry__body').screenshot({path:`${out}/final-card-${width}.png`});
  if(width<600){await card.locator('.pet-entry__favorite').tap();assert.equal(await card.locator('.pet-entry__favorite').getAttribute('aria-pressed'),'true');}
  results.push({width,height,touch:width<600,expanded:true});await p.close();
 }
 const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await p.goto(base+'/pets',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.pets-cover__copy').evaluate(e=>getComputedStyle(e).animationName),'none');
 const btn=p.locator('.pet-entry__cta').first();await btn.scrollIntoViewIfNeeded();await btn.hover();
 assert.ok(await btn.evaluate(e=>getComputedStyle(e).transitionDuration.split(',').every(x=>x.trim()==='0s')));
 results.push({reducedMotion:true});await p.close();
}finally{await browser.close();}
await fs.writeFile(`${out}/touch-motion-report.json`,JSON.stringify(results,null,2));console.log(results);
