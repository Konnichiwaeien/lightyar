import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3000';
const out=process.env.PET_PROFILE_OUTPUT||'../tmp/pet-detail-redesign';
await fs.mkdir(out,{recursive:true});
const route=process.env.PET_PROFILE_ROUTE||'/pets/uvpj4x6wdj2urazegzoxcqtf';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1024,1440,1920,2560]){
  await page.setViewportSize({width,height:1000});await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});await page.locator('#pet-name:visible').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>{const image=document.querySelector('.pet-gallery__image');return image?.complete && image.naturalWidth>0},null,{timeout:60000});
  await page.screenshot({path:`${out}/hero-${width}.png`});
  await page.locator('.pet-profile__hero').screenshot({path:`${out}/hero-full-${width}.png`});
  for(const [name,selector] of [['meeting','#meet-pet'],['related','.pet-profile__related']]){
   await page.locator(selector).scrollIntoViewIfNeeded();
   await page.waitForFunction(selector=>[...document.querySelectorAll(`${selector} img`)].every(img=>img.complete&&img.naturalWidth>0),selector,{timeout:60000});
   await page.waitForTimeout(250);await page.locator(selector).screenshot({path:`${out}/${name}-${width}.png`});
  }
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,sections:[...document.querySelectorAll('.pet-profile__section')].map(e=>{const s=getComputedStyle(e);return [s.paddingTop,s.paddingBottom]})}));
  assert.ok(metrics.scroll<=width,`overflow ${width}`);assert.equal(metrics.h1,1);metrics.sections.forEach(p=>assert.equal(p[0],p[1]));
  if([320,390,1440].includes(width)){
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
   metrics.axe=await page.evaluate(async()=>{const result=await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
  }
  report.push(metrics);await fs.writeFile(out+'/report.json',JSON.stringify({report,errors},null,2));
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});
 const favorite=page.locator('.pet-profile__favorite');await favorite.click();await page.waitForFunction(()=>document.querySelector('.pet-profile__favorite')?.getAttribute('aria-pressed')==='true');await page.reload({waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>document.querySelector('.pet-profile__favorite')?.getAttribute('aria-pressed')==='true');await favorite.click();
 if(await page.getByRole('button',{name:'Следующее фото',exact:true}).count()){
  await page.getByRole('button',{name:'Следующее фото',exact:true}).click();assert.match(await page.locator('.pet-gallery__image').getAttribute('alt'),/Фото 2/);
  await page.getByRole('button',{name:'Следующее фото',exact:true}).press('ArrowLeft');assert.match(await page.locator('.pet-gallery__image').getAttribute('alt'),/Фото 1/);
 }
 await page.getByRole('button',{name:'Открыть фото целиком'}).click();await page.locator('dialog .swiper-slide-active img').evaluate(e=>e.decode().catch(()=>{}));await page.screenshot({path:out+'/gallery-open.png'});assert.ok(await page.locator('dialog').isVisible());await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'hidden'});assert.equal(await page.locator('dialog').isVisible(),false);assert.equal(await page.getByRole('button',{name:'Открыть фото целиком'}).evaluate(e=>e===document.activeElement),true);
 await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});await page.evaluate(()=>document.querySelector('a[href="#meet-pet"]').click());await page.waitForTimeout(120);const middle=await page.evaluate(()=>scrollY);await page.waitForTimeout(1800);const end=await page.evaluate(()=>scrollY);assert.ok(middle>0&&end>middle+50,`smooth scroll ${middle} -> ${end}`);
 assert.match(await page.title(),/Альва/);assert.match(await page.locator('link[rel="canonical"]').getAttribute('href'),new RegExp(new URL(page.url()).pathname));
 const structured=await page.locator('script[type="application/ld+json"]').allTextContents();assert.ok(structured.some(t=>JSON.parse(t)['@graph']?.some(x=>x['@type']==='BreadcrumbList')));
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.pet-gallery__image').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.goto(base+'/pets',{waitUntil:'domcontentloaded',timeout:60000});assert.equal(await page.locator('.pets-cover__note').count(),0);
 // Missing and unavailable CMS responses are covered separately by the isolated state script.
 assert.deepEqual(errors,[]);assert.ok(report.every(r=>!r.axe||r.axe.length===0),'Axe violations');await fs.writeFile(out+'/report.json',JSON.stringify({report,interactions:'passed',errors},null,2));console.log(JSON.stringify({report,interactions:'passed',errors},null,2));
}finally{await browser.close()}
