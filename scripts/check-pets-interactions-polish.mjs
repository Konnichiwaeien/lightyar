import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3000';
const out='../tmp/pets-interaction-qa';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
 for(const [width,height] of [[320,740],[390,844],[600,960],[768,1024],[1024,768],[1280,800],[1366,768],[1440,900],[1920,1080],[2560,1440]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600,deviceScaleFactor:width<600?2:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/pets',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
  await page.screenshot({path:`${out}/hero-${width}.png`});
  let scroll;
  if([320,390,1440].includes(width)){
   await page.evaluate(()=>{window.scrollSamples=[];let n=0;const tick=()=>{window.scrollSamples.push(scrollY);if(++n<100)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
   await page.locator('.pets-cover .pets-button').click();await page.waitForTimeout(1700);
   scroll=await page.evaluate(()=>({samples:window.scrollSamples,target:document.querySelector('#pets-catalog').getBoundingClientRect().top,position:scrollY}));
   assert.ok(new Set(scroll.samples.map(Math.round)).size>5,'Anchor must animate through intermediate scroll positions');
   assert.ok(Math.abs(scroll.target-24)<5,JSON.stringify(scroll));
  }
  const controls=page.locator('.pets-controls');await controls.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  await controls.screenshot({path:`${out}/controls-${width}.png`});
  if(width<=700){
   assert.ok((await controls.boundingBox()).height<230,'Collapsed mobile controls too tall');
   assert.equal(await page.getByRole('combobox',{name:'Кого ищете',exact:true}).isVisible(),false);
   await page.getByRole('button',{name:/Фильтры и порядок/}).click();await page.waitForTimeout(280);
   assert.equal(await page.getByRole('combobox',{name:'Кого ищете',exact:true}).isVisible(),true);
   await controls.screenshot({path:`${out}/filters-open-${width}.png`});
   await page.getByRole('button',{name:/Фильтры и порядок/}).click();await page.waitForTimeout(280);
  }
  const card=page.locator('.pet-entry').first();await card.scrollIntoViewIfNeeded();
  await card.locator('.pet-entry__details-toggle').click();await page.waitForTimeout(300);
  if(width>=1024)await card.locator('.pet-entry__details-toggle').hover();
  await card.locator('.pet-entry__body').screenshot({path:`${out}/card-expanded-${width}.png`});
  await page.locator('.pets-meeting').scrollIntoViewIfNeeded();await page.locator('.pets-meeting img').evaluate(e=>e.decode());
  await page.locator('.pets-meeting').screenshot({path:`${out}/meeting-${width}.png`});
  const padding=await page.locator('.pets-catalog').evaluate(e=>({top:getComputedStyle(e).paddingTop,bottom:getComputedStyle(e).paddingBottom}));assert.equal(padding.top,padding.bottom);
  await page.getByRole('button',{name:'Подобрать питомца',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Тест подбора питомца'});await dialog.waitFor();
  await dialog.getByRole('heading',{name:'Вопрос 1 из 4'}).waitFor();await page.waitForTimeout(300);
  await dialog.screenshot({path:`${out}/quiz-step1-${width}.png`});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const dialogBounds=await dialog.boundingBox();assert.ok(dialogBounds.x>=0&&dialogBounds.x+dialogBounds.width<=width);
  let axe=[];
  if([320,390,1440].includes(width)){
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
   axe=await page.evaluate(async()=>{const r=await window.axe.run(document.querySelector('dialog'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});assert.deepEqual(axe,[]);
   await dialog.locator('label').filter({hasText:'Кошку'}).click();assert.equal(await dialog.getByLabel('Кошку',{exact:true}).isChecked(),true);
   for(let step=2;step<=4;step++){await dialog.getByRole('button',{name:'Дальше',exact:true}).click();await page.waitForTimeout(260);await dialog.screenshot({path:`${out}/quiz-step${step}-${width}.png`});}
   await dialog.getByRole('button',{name:'Показать питомцев'}).click();await page.waitForTimeout(300);
   assert.equal(await dialog.locator('.pets-quiz__results li').count(),3);
   await dialog.screenshot({path:`${out}/quiz-results-${width}.png`});
   await page.keyboard.press('Escape');
  }else await dialog.getByRole('button',{name:'Закрыть тест'}).click();
  await page.waitForTimeout(280);assert.equal(await dialog.isVisible(),false);
  assert.equal(await page.getByRole('button',{name:'Подобрать питомца',exact:true}).evaluate(e=>e===document.activeElement),true);
  assert.deepEqual(errors,[]);results.push({width,height,padding,scroll,axe,errors});await fs.writeFile(`${out}/report.json`,JSON.stringify(results,null,2));console.log('PASS',width);await page.close();
 }
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(base+'/pets',{waitUntil:'networkidle'});
 assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 await p.locator('.pets-cover .pets-button').click();await p.waitForTimeout(50);assert.ok(Math.abs(await p.locator('#pets-catalog').evaluate(e=>e.getBoundingClientRect().top)-24)<5);
 await p.close();console.log('PASS reduced motion');
}finally{await browser.close();}
