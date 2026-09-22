import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://localhost:3000';
const results=[];
try{
for(const mode of ['desktop','touch','reduced']){
 const page=await browser.newPage({viewport:{width:mode==='touch'?390:1366,height:768},hasTouch:mode==='touch',isMobile:mode==='touch',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
 await page.goto(base,{waitUntil:'load'});await page.locator('[data-ring-hydrated]').waitFor();
 const link=page.locator('#campaigns a[href^="/campaigns/"]').last();
 await link.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 const previousY=await page.evaluate(()=>scrollY);
 await link.click();await page.waitForURL('**/campaigns/*');await page.waitForTimeout(500);
 assert.ok(await page.evaluate(()=>scrollY<5));
 await page.goBack();await page.waitForURL(base+'/');await page.waitForTimeout(800);
 const restoredY=await page.evaluate(()=>scrollY);
 assert.ok(Math.abs(previousY-restoredY)<10,`${mode} history: ${previousY} -> ${restoredY}`);
 await page.getByRole('button',{name:'Открыть меню навигации'}).click();
 await page.getByRole('button',{name:'Закрыть меню'}).click();await page.waitForTimeout(700);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY)-restoredY)<10,`${mode} menu close must keep position`);
 await page.getByRole('button',{name:'Открыть меню навигации'}).click();
 await page.getByRole('dialog',{name:'Главное меню'}).getByRole('link',{name:'Питомцы',exact:true}).click();
 await page.waitForURL('**/pets');await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>scrollY<5),`${mode} menu navigation must start at top`);
 await page.goto(base+'/pets',{waitUntil:'load'});await page.waitForTimeout(500);
 await page.locator('a[href="#pets-catalog"]').click();
 const anchorStart=await page.evaluate(()=>scrollY);await page.waitForTimeout(100);
 const anchorMiddle=await page.evaluate(()=>scrollY);await page.waitForTimeout(1300);
 const anchorEnd=await page.evaluate(()=>scrollY);
 assert.ok(anchorEnd>100);
 if(mode!=='reduced')assert.ok(anchorMiddle>anchorStart&&anchorMiddle<anchorEnd,`${mode} anchor not smooth`);
 await page.goto(base,{waitUntil:'load'});await page.locator('[data-ring-hydrated]').waitFor();
 await page.locator('.wishlist-scene').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 const a=await page.locator('.wishlist-orbit__slot').first().evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(400);
 const b=await page.locator('.wishlist-orbit__slot').first().evaluate(e=>getComputedStyle(e).transform);
 if(mode==='reduced')assert.equal(a,b);else assert.notEqual(a,b);
 results.push({mode,previousY,restoredY,anchorStart,anchorMiddle,anchorEnd});
 console.log('PASS',mode,JSON.stringify(results.at(-1)));await page.close();
}
}finally{await fs.writeFile('../tmp/home-fixes-2026-09-18/interactions.json',JSON.stringify(results,null,2));await browser.close();}
