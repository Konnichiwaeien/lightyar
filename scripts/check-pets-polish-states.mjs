import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3003';
const out='../tmp/pets-interaction-qa';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try {
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto(base+'/pets',{waitUntil:'networkidle'});
  await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
  if(width===390)await page.getByRole('button',{name:/Фильтры и порядок/}).click();
  const violations=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
  assert.deepEqual(violations,[]);
  if(width===390) {
   await page.getByRole('combobox',{name:'Размер',exact:true}).selectOption('small');
   await page.waitForURL(/size=small/);await page.waitForLoadState('networkidle');
   await page.getByRole('button',{name:/Фильтры и порядок/}).click();
   assert.match(await page.getByRole('button',{name:/Фильтры и порядок/}).innerText(),/1/);
   await page.getByRole('button',{name:/Фильтры и порядок/}).click();
   assert.equal(await page.getByRole('combobox',{name:'Размер',exact:true}).inputValue(),'small');
  }
  if(width===1440) {
   for(const [name,selector] of [['search','.pets-search__submit'],['meeting','.pets-meeting__button'],['card','.pet-entry__cta'],['details','.pet-entry__details-toggle']]) {
    const target=page.locator(selector).first();await target.scrollIntoViewIfNeeded();
    const initial=await target.boundingBox();await target.hover();await page.waitForTimeout(260);
    await target.screenshot({path:`${out}/${name}-hover.png`});
    assert.ok(Math.abs((await target.boundingBox()).width-initial.width)<1);
    await page.keyboard.press('Tab');await target.focus();await page.waitForTimeout(150);
    const style=await target.evaluate(e=>({outline:getComputedStyle(e).outlineStyle,transition:getComputedStyle(e).transitionDuration}));
    assert.equal(style.outline,'solid');
    await target.screenshot({path:`${out}/${name}-focus.png`});
    await target.hover();await page.mouse.down();await page.waitForTimeout(120);
    await target.screenshot({path:`${out}/${name}-pressed.png`});
    await page.mouse.move(1,1);await page.mouse.up();
   }
   await page.locator('.pets-catalog').evaluate(e=>window.scrollTo({top:e.offsetTop-120,behavior:'instant'}));await page.waitForTimeout(300);
   await page.screenshot({path:`${out}/catalog-spacing.png`});
   await page.locator('.pets-pagination').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
   await page.screenshot({path:`${out}/pagination-spacing.png`});
  }
  const launcher=page.getByRole('button',{name:'Подобрать питомца',exact:true});await launcher.click();
  const dialog=page.getByRole('dialog');await dialog.getByRole('heading',{name:'Вопрос 1 из 4'}).waitFor();
  await page.keyboard.press('Tab');
  assert.equal(await dialog.getByLabel('Пока не знаю',{exact:true}).evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('ArrowRight');assert.equal(await dialog.getByLabel('Собаку',{exact:true}).isChecked(),true);
  await dialog.screenshot({path:`${out}/quiz-keyboard-${width}.png`});
  await page.keyboard.press('Escape');await page.waitForTimeout(300);assert.equal(await dialog.isVisible(),false);
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await launcher.click();await dialog.getByRole('heading',{name:'Вопрос 1 из 4'}).waitFor();
  assert.equal(await dialog.getByLabel('Пока не знаю',{exact:true}).isChecked(),true);
  await page.mouse.click(2,2);await page.waitForTimeout(300);assert.equal(await dialog.isVisible(),false);
  report.push({width,violations,keyboard:true,reopen:true,backdrop:true});await page.close();
 }
 await fs.writeFile(`${out}/states-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
} finally {await browser.close();}
